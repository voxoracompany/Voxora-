// ── V5.1 AI Engine — Provider Health Monitor ─────────────────────────────────
// Tracks provider availability, latency, and error rate.
// Runs lightweight health checks and exposes a reactive status object.

import type { AIProviderName } from './types/AITypes';

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export interface ProviderHealth {
  provider:     AIProviderName;
  status:       HealthStatus;
  latencyMs:    number;    // rolling average of last N requests
  errorRate:    number;    // 0–1
  lastChecked:  number;    // epoch ms
  requestCount: number;
  errorCount:   number;
}

const ROLLING_WINDOW  = 10;   // last N requests for rolling avg
const DEGRADED_RATE   = 0.25; // ≥25% errors → degraded
const UNAVAIL_RATE    = 0.75; // ≥75% errors → unavailable
const CHECK_INTERVAL  = 60_000; // passive health check every 60s

type HealthListener = (health: ProviderHealth) => void;

// ── Per-provider rolling buffers ──────────────────────────────────────────────
const latencyBuffers: Map<AIProviderName, number[]> = new Map();
const errorBuffers:   Map<AIProviderName, boolean[]> = new Map();

function getLat(p: AIProviderName): number[] {
  if (!latencyBuffers.has(p)) latencyBuffers.set(p, []);
  return latencyBuffers.get(p)!;
}

function getErr(p: AIProviderName): boolean[] {
  if (!errorBuffers.has(p)) errorBuffers.set(p, []);
  return errorBuffers.get(p)!;
}

function push<T>(arr: T[], val: T, max: number): void {
  arr.push(val);
  if (arr.length > max) arr.shift();
}

function avg(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function errRate(arr: boolean[]): number {
  return arr.length === 0 ? 0 : arr.filter(Boolean).length / arr.length;
}

// ── Health state ──────────────────────────────────────────────────────────────
const healthMap: Map<AIProviderName, ProviderHealth> = new Map();
const listeners: Set<HealthListener> = new Set();

function defaultHealth(provider: AIProviderName): ProviderHealth {
  return { provider, status: 'unknown', latencyMs: 0, errorRate: 0, lastChecked: 0, requestCount: 0, errorCount: 0 };
}

function deriveStatus(rate: number): HealthStatus {
  if (rate >= UNAVAIL_RATE) return 'unavailable';
  if (rate >= DEGRADED_RATE) return 'degraded';
  return 'healthy';
}

function buildHealth(provider: AIProviderName): ProviderHealth {
  const current = healthMap.get(provider) ?? defaultHealth(provider);
  const lat  = getLat(provider);
  const err  = getErr(provider);
  const rate = errRate(err);
  const status = err.length === 0 ? 'unknown' : deriveStatus(rate);

  return {
    provider,
    status,
    latencyMs:    Math.round(avg(lat)),
    errorRate:    rate,
    lastChecked:  Date.now(),
    requestCount: current.requestCount,
    errorCount:   current.errorCount,
  };
}

function notify(health: ProviderHealth): void {
  for (const l of listeners) l(health);
}

// ── Passive check timer ───────────────────────────────────────────────────────
let _checkTimer: ReturnType<typeof setInterval> | null = null;

function ensureTimer(): void {
  if (_checkTimer !== null) return;
  _checkTimer = setInterval(() => {
    // Touch all known providers to keep lastChecked fresh
    for (const [p, h] of healthMap) {
      const updated = { ...h, lastChecked: Date.now() };
      healthMap.set(p, updated);
      notify(updated);
    }
  }, CHECK_INTERVAL);
}

// ── Public API ────────────────────────────────────────────────────────────────
export const AIHealthMonitor = {

  /** Call this after every successful AI request. */
  recordSuccess(provider: AIProviderName, latencyMs: number): void {
    ensureTimer();
    push(getLat(provider), latencyMs, ROLLING_WINDOW);
    push(getErr(provider), false,     ROLLING_WINDOW);
    const current = healthMap.get(provider) ?? defaultHealth(provider);
    const updated = { ...buildHealth(provider), requestCount: current.requestCount + 1, errorCount: current.errorCount };
    healthMap.set(provider, updated);
    notify(updated);
  },

  /** Call this after every failed AI request. */
  recordError(provider: AIProviderName, latencyMs = 0): void {
    ensureTimer();
    push(getLat(provider), latencyMs, ROLLING_WINDOW);
    push(getErr(provider), true,      ROLLING_WINDOW);
    const current = healthMap.get(provider) ?? defaultHealth(provider);
    const updated = { ...buildHealth(provider), requestCount: current.requestCount + 1, errorCount: current.errorCount + 1 };
    healthMap.set(provider, updated);
    notify(updated);
  },

  /** Get current health for a provider. */
  getHealth(provider: AIProviderName): ProviderHealth {
    return healthMap.get(provider) ?? defaultHealth(provider);
  },

  /** Get health snapshot for all known providers. */
  getAllHealth(): ProviderHealth[] {
    const all: AIProviderName[] = ['mock', 'openai', 'gemini', 'anthropic'];
    return all.map(p => healthMap.get(p) ?? defaultHealth(p));
  },

  /** Subscribe to health updates. Returns an unsubscribe function. */
  subscribe(listener: HealthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Reset health data for a provider (e.g. after switching keys). */
  reset(provider: AIProviderName): void {
    latencyBuffers.delete(provider);
    errorBuffers.delete(provider);
    healthMap.delete(provider);
    notify(defaultHealth(provider));
  },

  /** Destroy the background timer (call on unmount if needed). */
  destroy(): void {
    if (_checkTimer !== null) { clearInterval(_checkTimer); _checkTimer = null; }
  },
};
