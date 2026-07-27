/**
 * SafeStorage — V9.0
 * Typed, validated, and error-safe wrappers around localStorage.
 * - Never throws.
 * - Validates keys to prevent injection.
 * - Enforces per-entry size limits.
 * - Gracefully degrades on quota exceeded (prunes oldest entries).
 */

import { validateStorageKey, validateJsonSize } from '../validation/InputValidator';
import { ProductionLogger } from '../logging/ProductionLogger';

const MAX_ENTRY_BYTES = 2 * 1024 * 1024; // 2 MB per entry
const NAMESPACE = 'voxora';

function ns(key: string): string {
  return key.startsWith(NAMESPACE + '-') ? key : `${NAMESPACE}-${key}`;
}

export const SafeStorage = {
  /**
   * Get a value by key. Returns `null` on miss or parse error.
   */
  get<T = unknown>(rawKey: string): T | null {
    const keyCheck = validateStorageKey(rawKey.replace(/^voxora-/, ''));
    if (!keyCheck.ok) {
      ProductionLogger.warn(`SafeStorage.get: invalid key — ${keyCheck.error}`, 'SafeStorage');
      return null;
    }
    try {
      const raw = localStorage.getItem(rawKey);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      ProductionLogger.warn(`SafeStorage.get: parse error for "${rawKey}"`, 'SafeStorage', e);
      return null;
    }
  },

  /**
   * Set a value by key. Returns false if quota exceeded or key invalid.
   */
  set(rawKey: string, value: unknown): boolean {
    try {
      const serialised = JSON.stringify(value);

      // Check size
      const sizeCheck = validateJsonSize(serialised, MAX_ENTRY_BYTES);
      if (!sizeCheck.ok) {
        ProductionLogger.warn(`SafeStorage.set: value too large for "${rawKey}" — ${sizeCheck.error}`, 'SafeStorage');
        return false;
      }

      localStorage.setItem(rawKey, serialised);
      return true;
    } catch (e) {
      // QuotaExceededError — try to free space
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        ProductionLogger.warn('SafeStorage.set: quota exceeded — attempting prune', 'SafeStorage');
        this._pruneOldest(3);
        try {
          localStorage.setItem(rawKey, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }
      ProductionLogger.error(`SafeStorage.set error for "${rawKey}"`, 'SafeStorage', e);
      return false;
    }
  },

  /**
   * Remove a key. Silent on miss.
   */
  remove(key: string): void {
    try { localStorage.removeItem(key); } catch { /* silent */ }
  },

  /**
   * Safely check whether a key exists.
   */
  has(key: string): boolean {
    try { return localStorage.getItem(key) !== null; } catch { return false; }
  },

  /**
   * Get all Voxora-namespaced keys.
   */
  getVoxoraKeys(): string[] {
    try {
      return Object.keys(localStorage).filter(k => k.startsWith(NAMESPACE + '-'));
    } catch { return []; }
  },

  /**
   * Estimate total storage used by all Voxora keys (bytes).
   */
  estimateUsage(): number {
    try {
      return this.getVoxoraKeys().reduce((sum, k) => {
        const v = localStorage.getItem(k) ?? '';
        return sum + k.length + v.length;
      }, 0);
    } catch { return 0; }
  },

  /**
   * Remove the N oldest Voxora entries (by alphabetic key order as fallback).
   * Called when quota is exceeded.
   */
  _pruneOldest(n: number): void {
    const keys = this.getVoxoraKeys();
    // Skip critical keys
    const skip = new Set(['voxora-auth-history', 'voxora-subscription', 'voxora-ai-settings']);
    const prunable = keys.filter(k => !skip.has(k));
    prunable.slice(0, n).forEach(k => {
      try { localStorage.removeItem(k); } catch { /* silent */ }
    });
    ProductionLogger.info(`SafeStorage: pruned ${Math.min(n, prunable.length)} entries`, 'SafeStorage');
  },

  /** Convenience: namespace-prefix a key for use with get/set. */
  key: ns,
};

// ── Standalone utility exports (used across Workspace pages) ──────────────────

/** HTML-escape a string to prevent XSS when injecting into innerHTML. */
export function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Read a JSON value from localStorage, returning `fallback` on miss or error. */
export function readJson<T = unknown>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a JSON-serialisable value to localStorage. Silent on error. */
export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* silent */ }
}

/** Write a plain string value to localStorage. Silent on error. */
export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch { /* silent */ }
}

/** Trigger a file download in the browser. */
export function downloadBlob(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Voxora backup shape — minimal required fields. */
interface VoxoraBackup {
  version: string;
  exportedAt: string;
  projects?: unknown;
  profile?: {
    name?: unknown;
    goal?: unknown;
    theme?: unknown;
    accent?: unknown;
    fontsize?: unknown;
  };
  favorites?: unknown;
  pinned?: unknown;
  activities?: unknown;
  chat?: unknown;
  chatCount?: unknown;
}

/** Type-guard: verify an imported backup has the expected shape. */
export function validateBackup(data: unknown): data is VoxoraBackup {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return typeof d['version'] === 'string' && typeof d['exportedAt'] === 'string';
}
