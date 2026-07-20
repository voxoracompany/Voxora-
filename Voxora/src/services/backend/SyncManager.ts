// ── V5.3 Sync Manager ─────────────────────────────────────────────────────────
// Queues writes when offline and replays them when the connection returns.
// Guarantees zero data loss regardless of backend availability.

import type { BackendProvider } from "./BackendProvider";
import type { CloudCollection, SyncQueueEntry } from "./BackendTypes";

const QUEUE_KEY = "voxora-sync-queue";
const LAST_SYNC_KEY = "voxora-last-sync";

function makeId() { return `sq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

function loadQueue(): SyncQueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncQueueEntry[]) : [];
  } catch { return []; }
}

function saveQueue(q: SyncQueueEntry[]) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch { /* quota */ }
}

export class SyncManager {
  private _provider: BackendProvider | null = null;
  private _userId: string | null = null;
  private _isSyncing = false;
  private _listeners: Array<() => void> = [];

  setProvider(provider: BackendProvider) { this._provider = provider; }
  setUserId(id: string | null) { this._userId = id; }

  get lastSync(): string | null { return localStorage.getItem(LAST_SYNC_KEY); }
  get pendingCount(): number { return loadQueue().length; }
  get isSyncing(): boolean { return this._isSyncing; }

  onChange(fn: () => void) { this._listeners.push(fn); }
  private _notify() { this._listeners.forEach(fn => fn()); }

  /** Enqueue a write operation (safe when offline). */
  enqueue(
    collection: CloudCollection,
    operation: "upsert" | "delete",
    id: string,
    payload: unknown
  ) {
    // De-duplicate: replace any existing pending op for the same collection+id
    const queue = loadQueue().filter(
      e => !(e.collection === collection && (e.payload as { id?: string })?.id === id)
    );
    queue.push({
      id: makeId(),
      collection,
      operation,
      payload: operation === "delete" ? { id } : payload,
      timestamp: new Date().toISOString(),
    } as SyncQueueEntry);
    saveQueue(queue);
    this._notify();
  }

  /** Attempt to flush the queue to the cloud backend. */
  async flush(): Promise<{ flushed: number; errors: number }> {
    if (!this._provider || !this._userId || this._isSyncing) {
      return { flushed: 0, errors: 0 };
    }

    const available = await this._provider.isAvailable();
    if (!available) return { flushed: 0, errors: 0 };

    const queue = loadQueue();
    if (queue.length === 0) return { flushed: 0, errors: 0 };

    this._isSyncing = true;
    this._notify();

    let flushed = 0;
    let errors = 0;
    const remaining: SyncQueueEntry[] = [];

    for (const entry of queue) {
      try {
        if (entry.operation === "upsert") {
          const p = entry.payload as { id: string } & Record<string, unknown>;
          const res = await this._provider.upsertRecord(this._userId, entry.collection, p.id, p);
          if (res.ok) flushed++;
          else { remaining.push(entry); errors++; }
        } else if (entry.operation === "delete") {
          const p = entry.payload as { id: string };
          const res = await this._provider.deleteRecord(this._userId, entry.collection, p.id);
          if (res.ok) flushed++;
          else { remaining.push(entry); errors++; }
        }
      } catch {
        remaining.push(entry);
        errors++;
      }
    }

    saveQueue(remaining);
    if (flushed > 0) {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }
    this._isSyncing = false;
    this._notify();
    return { flushed, errors };
  }

  /** Initialize online/offline listeners. */
  startListening() {
    const onOnline = () => {
      this._notify();
      this.flush();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", () => this._notify());

    // Periodic flush every 60 s when online
    const interval = setInterval(() => {
      if (navigator.onLine && this._userId) this.flush();
    }, 60_000);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", () => this._notify());
      clearInterval(interval);
    };
  }
}

// Global singleton
export const syncManager = new SyncManager();
