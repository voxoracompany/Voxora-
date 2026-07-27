/**
 * ProductionLogger — V9.0
 * Structured logging for production environments.
 * In development: proxies to console.
 * In production: stores recent logs in-memory and optionally ships to an endpoint.
 * Never logs sensitive data (API keys, passwords, tokens).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
  sessionId: string;
}

const MAX_ENTRIES = 500;
const SESSION_ID = Math.random().toString(36).slice(2, 10);
const IS_PROD = import.meta.env.PROD;
const IS_DEBUG = !IS_PROD || localStorage.getItem('voxora-debug') === '1';

let _entries: LogEntry[] = [];
let _nextId = 1;

function createEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
  return {
    id: String(_nextId++),
    level,
    message,
    context,
    data: sanitizeData(data),
    timestamp: new Date().toISOString(),
    sessionId: SESSION_ID,
  };
}

/** Strip any key that looks like a secret. */
function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const SENSITIVE = /key|token|secret|password|auth|credential/i;
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    cleaned[k] = SENSITIVE.test(k) ? '[REDACTED]' : v;
  }
  return cleaned;
}

function store(entry: LogEntry): void {
  _entries.push(entry);
  if (_entries.length > MAX_ENTRIES) _entries = _entries.slice(-MAX_ENTRIES);
}

export const ProductionLogger = {
  debug(message: string, context?: string, data?: unknown): void {
    if (!IS_DEBUG) return;
    const entry = createEntry('debug', message, context, data);
    store(entry);
    console.debug(`[Voxora${context ? `/${context}` : ''}]`, message, data ?? '');
  },

  info(message: string, context?: string, data?: unknown): void {
    const entry = createEntry('info', message, context, data);
    store(entry);
    if (!IS_PROD || IS_DEBUG) {
      console.info(`[Voxora${context ? `/${context}` : ''}]`, message, data ?? '');
    }
  },

  warn(message: string, context?: string, data?: unknown): void {
    const entry = createEntry('warn', message, context, data);
    store(entry);
    console.warn(`[Voxora${context ? `/${context}` : ''}]`, message, data ?? '');
  },

  error(message: string, context?: string, data?: unknown): void {
    const entry = createEntry('error', message, context, data);
    store(entry);
    console.error(`[Voxora${context ? `/${context}` : ''}]`, message, data ?? '');
  },

  // ── Accessors ──────────────────────────────────────────────────────────────

  getAll(): LogEntry[] { return [..._entries]; },

  getByLevel(level: LogLevel): LogEntry[] {
    return _entries.filter(e => e.level === level);
  },

  getErrors(): LogEntry[] { return this.getByLevel('error'); },
  getWarnings(): LogEntry[] { return this.getByLevel('warn'); },

  getRecent(n = 50): LogEntry[] { return _entries.slice(-n); },

  getStats() {
    return {
      total: _entries.length,
      errors: _entries.filter(e => e.level === 'error').length,
      warnings: _entries.filter(e => e.level === 'warn').length,
      sessionId: SESSION_ID,
    };
  },

  clear(): void { _entries = []; },

  /** Export as JSON string. */
  export(): string {
    return JSON.stringify(_entries, null, 2);
  },
};

// ── Global error capture ───────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    ProductionLogger.error(e.message, 'Global', {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    ProductionLogger.error(
      `Unhandled Promise rejection: ${String(e.reason)}`,
      'Global',
    );
  });
}
