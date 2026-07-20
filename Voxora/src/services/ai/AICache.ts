// ── V5.1 AI Engine — AI Cache Layer ──────────────────────────────────────────
// Local localStorage-backed response cache with TTL and LRU eviction.
// Avoids duplicate requests for identical prompt+provider+workspace combos.

import type { AIResponse, AIProviderName } from './types/AITypes';

const CACHE_KEY     = 'voxora-ai-cache';
const MAX_ENTRIES   = 100;
// Mock responses cached longer (they're free); real provider responses shorter TTL
const TTL_MOCK_MS   = 5 * 60 * 1000;   // 5 min
const TTL_REAL_MS   = 30 * 60 * 1000;  // 30 min

export interface CacheEntry {
  key:       string;
  response:  AIResponse;
  createdAt: number;
  expiresAt: number;
  hits:      number;
}

export interface CacheStats {
  totalEntries: number;
  hits:         number;
  misses:       number;
  hitRate:      number;  // 0–1
}

// ── Simple hash for cache key ─────────────────────────────────────────────────
function hashKey(prompt: string, workspace: string, provider: AIProviderName): string {
  // Deterministic string, short enough for localStorage key
  const raw = `${provider}|${workspace}|${prompt.slice(0, 500)}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return `c_${Math.abs(hash).toString(36)}`;
}

// ── Persistence ───────────────────────────────────────────────────────────────
function loadCache(): Map<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    const entries: CacheEntry[] = JSON.parse(raw);
    return new Map(entries.map(e => [e.key, e]));
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, CacheEntry>): void {
  try {
    // Sort by most recently used (hits desc, then createdAt desc), keep MAX_ENTRIES
    const entries = [...cache.values()]
      .sort((a, b) => b.hits - a.hits || b.createdAt - a.createdAt)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full — clear cache gracefully
    try { localStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
  }
}

// ── Stats counters (session-only, not persisted) ──────────────────────────────
let sessionHits   = 0;
let sessionMisses = 0;

// ── AICache API ───────────────────────────────────────────────────────────────
export const AICache = {

  /** Look up a cached response. Returns null on miss or expiry. */
  get(
    prompt:    string,
    workspace: string,
    provider:  AIProviderName,
  ): AIResponse | null {
    const cache = loadCache();
    const key   = hashKey(prompt, workspace, provider);
    const entry = cache.get(key);

    if (!entry || Date.now() > entry.expiresAt) {
      sessionMisses++;
      if (entry) { cache.delete(key); saveCache(cache); }
      return null;
    }

    // Update hit count and re-save (LRU touch)
    entry.hits++;
    cache.set(key, entry);
    saveCache(cache);
    sessionHits++;
    return entry.response;
  },

  /** Store a response in the cache. */
  set(
    prompt:    string,
    workspace: string,
    provider:  AIProviderName,
    response:  AIResponse,
  ): void {
    const cache = loadCache();
    const key   = hashKey(prompt, workspace, provider);
    const ttl   = provider === 'mock' ? TTL_MOCK_MS : TTL_REAL_MS;
    const now   = Date.now();

    cache.set(key, {
      key,
      response,
      createdAt: now,
      expiresAt: now + ttl,
      hits: 0,
    });
    saveCache(cache);
  },

  /** Invalidate all entries for a given provider (call after switching provider). */
  invalidateProvider(provider: AIProviderName): void {
    const cache = loadCache();
    for (const [key, entry] of cache) {
      if (entry.response.provider === provider) cache.delete(key);
    }
    saveCache(cache);
  },

  /** Clear all cached entries. */
  clear(): void {
    localStorage.removeItem(CACHE_KEY);
    sessionHits   = 0;
    sessionMisses = 0;
  },

  /** Session-level cache statistics. */
  getStats(): CacheStats {
    const total = sessionHits + sessionMisses;
    return {
      totalEntries: loadCache().size,
      hits:         sessionHits,
      misses:       sessionMisses,
      hitRate:      total === 0 ? 0 : sessionHits / total,
    };
  },
};
