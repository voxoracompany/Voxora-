/**
 * Voxora Performance Monitor — V8.0
 *
 * Collects Web Vitals (FCP, LCP, CLS, TTFB, FID/INP) via PerformanceObserver,
 * tracks route navigation timing, and provides a queryable metrics store.
 *
 * Usage:
 *   import { PerformanceMonitor } from './PerformanceMonitor';
 *   PerformanceMonitor.init();
 *   PerformanceMonitor.markRouteChange('/dashboard');
 */

export interface WebVitalMetric {
  name: 'FCP' | 'LCP' | 'CLS' | 'TTFB' | 'FID' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface RouteMetric {
  path: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface PerformanceSnapshot {
  vitals: WebVitalMetric[];
  routes: RouteMetric[];
  memory: { usedJsHeapMB: number; totalJsHeapMB: number } | null;
  connectionType: string;
  devicePixelRatio: number;
  capturedAt: number;
}

// ─── Rating thresholds (per Google Web Vitals) ────────────────────────────────
const THRESHOLDS: Record<string, [number, number]> = {
  FCP:  [1800, 3000],
  LCP:  [2500, 4000],
  CLS:  [0.1,  0.25],
  TTFB: [800,  1800],
  FID:  [100,  300],
  INP:  [200,  500],
};

function rate(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value <= t[0]) return 'good';
  if (value <= t[1]) return 'needs-improvement';
  return 'poor';
}

// ─── Internal stores ──────────────────────────────────────────────────────────
const _vitals: WebVitalMetric[] = [];
const _routes: RouteMetric[] = [];
let _routeStart = 0;
let _initialized = false;

function addVital(name: WebVitalMetric['name'], value: number) {
  // Replace if already recorded (LCP can update multiple times)
  const existing = _vitals.findIndex(v => v.name === name);
  const metric: WebVitalMetric = { name, value, rating: rate(name, value), timestamp: Date.now() };
  if (existing >= 0) { _vitals[existing] = metric; } else { _vitals.push(metric); }

  if (import.meta.env.DEV) {
    console.debug(`[Voxora/Perf] ${name}: ${value.toFixed(2)} (${metric.rating})`);
  }
}

// ─── PerformanceObserver setup ────────────────────────────────────────────────
function observePaint() {
  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          addVital('FCP', entry.startTime);
        }
      }
    });
    obs.observe({ type: 'paint', buffered: true });
  } catch { /* not supported */ }
}

function observeLCP() {
  try {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) addVital('LCP', last.startTime);
    });
    obs.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* not supported */ }
}

function observeCLS() {
  let clsValue = 0;
  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const lsEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!lsEntry.hadRecentInput) {
          clsValue += lsEntry.value ?? 0;
          addVital('CLS', clsValue);
        }
      }
    });
    obs.observe({ type: 'layout-shift', buffered: true });
  } catch { /* not supported */ }
}

function observeNavigation() {
  try {
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const nav = entry as PerformanceNavigationTiming;
        if (nav.responseStart && nav.requestStart) {
          addVital('TTFB', nav.responseStart - nav.requestStart);
        }
      }
    });
    obs.observe({ type: 'navigation', buffered: true });
  } catch { /* not supported */ }
}

function observeInteraction() {
  try {
    // FID
    const fidObs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { processingStart?: number };
        if (e.processingStart) {
          addVital('FID', e.processingStart - entry.startTime);
        }
      }
    });
    fidObs.observe({ type: 'first-input', buffered: true });
  } catch { /* not supported */ }

  try {
    // INP (Chrome 96+)
    const inpObs = new PerformanceObserver((list) => {
      let maxInp = 0;
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { duration?: number };
        maxInp = Math.max(maxInp, e.duration ?? 0);
      }
      if (maxInp > 0) addVital('INP', maxInp);
    });
    inpObs.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
  } catch { /* not supported */ }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const PerformanceMonitor = {
  /** Initialise all observers. Call once at app startup. */
  init(): void {
    if (_initialized || typeof window === 'undefined') return;
    _initialized = true;

    observePaint();
    observeLCP();
    observeCLS();
    observeNavigation();
    observeInteraction();

    // Capture route start for initial load
    _routeStart = performance.now();
  },

  /** Call when a route change begins (before content loads). */
  markRouteChange(path: string): void {
    const now = performance.now();
    // Close previous route
    if (_routeStart > 0 && _routes.length > 0) {
      const last = _routes[_routes.length - 1];
      if (!last.endMs) {
        last.endMs = now;
        last.durationMs = now - last.startMs;
      }
    }
    _routeStart = now;
    _routes.push({ path, startMs: now, endMs: 0, durationMs: 0 });
    if (_routes.length > 50) _routes.shift();
  },

  /** Call when a route's content is ready (e.g. in component mount). */
  markRouteReady(path: string): void {
    const route = [..._routes].reverse().find(r => r.path === path);
    if (route && !route.endMs) {
      route.endMs = performance.now();
      route.durationMs = route.endMs - route.startMs;
      if (import.meta.env.DEV) {
        console.debug(`[Voxora/Perf] Route ${path} ready in ${route.durationMs.toFixed(0)}ms`);
      }
    }
  },

  /** Get all collected vitals. */
  getVitals(): WebVitalMetric[] {
    return [..._vitals];
  },

  /** Get recent route metrics. */
  getRoutes(): RouteMetric[] {
    return [..._routes];
  },

  /** Get a full snapshot including memory and connection info. */
  getSnapshot(): PerformanceSnapshot {
    let memory: PerformanceSnapshot['memory'] = null;
    try {
      const mem = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
      if (mem) {
        memory = {
          usedJsHeapMB: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          totalJsHeapMB: Math.round(mem.totalJSHeapSize / 1024 / 1024),
        };
      }
    } catch { /* not available */ }

    const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    const connectionType = conn?.effectiveType ?? 'unknown';

    return {
      vitals: this.getVitals(),
      routes: this.getRoutes(),
      memory,
      connectionType,
      devicePixelRatio: window.devicePixelRatio,
      capturedAt: Date.now(),
    };
  },

  /** Returns true if all measured vitals are 'good'. */
  isHealthy(): boolean {
    const vitals = this.getVitals();
    return vitals.length === 0 || vitals.every(v => v.rating === 'good');
  },
};
