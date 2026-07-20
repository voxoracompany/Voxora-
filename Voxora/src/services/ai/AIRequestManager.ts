// ── V5.1 AI Engine — Central AI Request Manager ──────────────────────────────
// Manages in-flight requests, deduplication, concurrency limiting, and request IDs.
// All AIService calls flow through this layer.

export type RequestStatus = 'pending' | 'running' | 'done' | 'error' | 'cancelled';

export interface ManagedRequest<T> {
  id:        string;
  key:       string;   // dedup key
  status:    RequestStatus;
  workspace: string;
  createdAt: number;
  promise:   Promise<T>;
}

type RequestFn<T> = () => Promise<T>;

const MAX_CONCURRENT = 3;
const DEDUP_WINDOW   = 500; // ms — same key within this window → reuse promise

// ── Request ID generator ──────────────────────────────────────────────────────
let _seq = 0;
function nextId(): string {
  return `req_${Date.now()}_${(++_seq).toString(36)}`;
}

// ── Manager state ─────────────────────────────────────────────────────────────
const _inFlight:  Map<string, ManagedRequest<unknown>> = new Map();  // id → request
const _dedupMap:  Map<string, { id: string; at: number }> = new Map(); // key → last request
const _queue:     Array<() => void> = [];
let   _running = 0;

// ── Internal scheduling ───────────────────────────────────────────────────────
function drain(): void {
  while (_running < MAX_CONCURRENT && _queue.length > 0) {
    const next = _queue.shift()!;
    next();
  }
}

function makeKey(prompt: string, workspace: string): string {
  // Normalise whitespace for dedup comparison
  return `${workspace}|${prompt.replace(/\s+/g, ' ').trim().slice(0, 200)}`;
}

// ── Public API ────────────────────────────────────────────────────────────────
export const AIRequestManager = {

  /**
   * Enqueue an AI request.
   * - Deduplicates identical (prompt, workspace) pairs within DEDUP_WINDOW ms.
   * - Respects MAX_CONCURRENT concurrency limit.
   * Returns the managed request (with .promise to await the result).
   */
  enqueue<T>(
    prompt:    string,
    workspace: string,
    fn:        RequestFn<T>,
  ): ManagedRequest<T> {
    const key     = makeKey(prompt, workspace);
    const now     = Date.now();
    const lastReq = _dedupMap.get(key);

    // Deduplication: if same key was issued within DEDUP_WINDOW, return existing
    if (lastReq && now - lastReq.at < DEDUP_WINDOW) {
      const existing = _inFlight.get(lastReq.id) as ManagedRequest<T> | undefined;
      if (existing && (existing.status === 'pending' || existing.status === 'running')) {
        return existing;
      }
    }

    const id = nextId();

    const promise = new Promise<T>((resolve, reject) => {
      const run = async () => {
        _running++;
        const req = _inFlight.get(id) as ManagedRequest<T> | undefined;
        if (req) (req as { status: RequestStatus }).status = 'running';

        try {
          const result = await fn();
          const r = _inFlight.get(id) as ManagedRequest<T> | undefined;
          if (r) (r as { status: RequestStatus }).status = 'done';
          resolve(result);
        } catch (err) {
          const r = _inFlight.get(id) as ManagedRequest<T> | undefined;
          if (r) (r as { status: RequestStatus }).status = 'error';
          reject(err);
        } finally {
          _running--;
          _inFlight.delete(id);
          drain();
        }
      };

      if (_running < MAX_CONCURRENT) {
        run();
      } else {
        _queue.push(run);
      }
    });

    const managed: ManagedRequest<T> = {
      id, key, workspace,
      status:    'pending',
      createdAt: now,
      promise,
    };

    _inFlight.set(id, managed as ManagedRequest<unknown>);
    _dedupMap.set(key, { id, at: now });

    return managed;
  },

  /** Cancel a pending (not yet started) request. Running requests cannot be cancelled. */
  cancel(id: string): void {
    const req = _inFlight.get(id);
    if (req && req.status === 'pending') {
      (req as { status: RequestStatus }).status = 'cancelled';
      _inFlight.delete(id);
    }
  },

  /** Snapshot of currently tracked requests (for debugging/analytics). */
  getInFlight(): ManagedRequest<unknown>[] {
    return [..._inFlight.values()];
  },

  /** Current concurrency usage. */
  getConcurrencyInfo(): { running: number; queued: number; max: number } {
    return { running: _running, queued: _queue.length, max: MAX_CONCURRENT };
  },

  /** Clear all pending queued requests (does not affect in-flight). */
  clearQueue(): void {
    _queue.length = 0;
  },
};
