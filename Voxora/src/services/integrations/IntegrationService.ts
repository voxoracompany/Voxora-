// ── V8.3 Integration Service ──────────────────────────────────────────────────
import type {
  Integration, IntegrationConfig, IntegrationStatus, SyncEvent,
  ProviderHealth, RetryMetrics, SyncMetrics, IntegrationStats,
  ApiUsageStat, IntegrationPreferences, NotificationPreferences,
  HealthStatus,
} from "./IntegrationTypes";
import { getDefaultIntegrations } from "./IntegrationRegistry";

// ── Storage Keys ───────────────────────────────────────────────────────────────
const STORAGE_KEY   = "voxora-integrations-v2";
const EVENTS_KEY    = "voxora-integration-events-v2";
const HEALTH_KEY    = "voxora-integration-health-v1";
const METRICS_KEY   = "voxora-integration-metrics-v1";
const API_USAGE_KEY = "voxora-integration-api-usage-v1";
const PREFS_KEY     = "voxora-integration-prefs-v1";
const MAX_EVENTS    = 200;

// ── Default Preferences ────────────────────────────────────────────────────────
const DEFAULT_PREFS: IntegrationPreferences = {
  defaultSyncFrequency: "hourly",
  defaultRetryAttempts: 3,
  autoReconnect: true,
  logRetention: 30,
  notifications: {
    level: "all",
    onConnect: true,
    onDisconnect: true,
    onSyncFail: true,
    onWebhookFail: true,
    onHealthDegraded: true,
  },
};

// ── Safe Storage Helpers ───────────────────────────────────────────────────────
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore storage quota errors */ }
}

// ── Internal Loaders ───────────────────────────────────────────────────────────
function loadIntegrations(): Integration[] {
  return safeGet<Integration[]>(STORAGE_KEY, []);
}

function saveIntegrations(list: Integration[]): void {
  safeSet(STORAGE_KEY, list);
}

function loadEvents(): SyncEvent[] {
  return safeGet<SyncEvent[]>(EVENTS_KEY, []);
}

function saveEvents(events: SyncEvent[]): void {
  safeSet(EVENTS_KEY, events.slice(0, MAX_EVENTS));
}

function loadHealthMap(): Record<string, ProviderHealth> {
  return safeGet<Record<string, ProviderHealth>>(HEALTH_KEY, {});
}

function saveHealthMap(map: Record<string, ProviderHealth>): void {
  safeSet(HEALTH_KEY, map);
}

function loadMetrics(): Record<string, SyncMetrics & RetryMetrics> {
  return safeGet<Record<string, SyncMetrics & RetryMetrics>>(METRICS_KEY, {});
}

function saveMetrics(map: Record<string, SyncMetrics & RetryMetrics>): void {
  safeSet(METRICS_KEY, map);
}

function loadApiUsage(): Record<string, ApiUsageStat> {
  return safeGet<Record<string, ApiUsageStat>>(API_USAGE_KEY, {});
}

function saveApiUsage(map: Record<string, ApiUsageStat>): void {
  safeSet(API_USAGE_KEY, map);
}

// ── Event Push ─────────────────────────────────────────────────────────────────
function pushEvent(event: Omit<SyncEvent, "id" | "timestamp">): SyncEvent {
  const events = loadEvents();
  const e: SyncEvent = {
    ...event,
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  saveEvents([e, ...events]);
  return e;
}

// ── Metric Helpers ─────────────────────────────────────────────────────────────
function getOrInitMetrics(id: string, name: string): SyncMetrics & RetryMetrics {
  const map = loadMetrics();
  if (!map[id]) {
    map[id] = {
      integrationId: id,
      totalSyncs: 0, successfulSyncs: 0, failedSyncs: 0,
      avgSyncDurationMs: 0, successRate: 1,
      totalRetries: 0, successfulRetries: 0, failedRetries: 0,
      avgRetryDelayMs: 500,
      // satisfy both interfaces
      lastSyncAt: undefined, lastRetryAt: undefined,
    } as SyncMetrics & RetryMetrics;
    saveMetrics(map);
  }
  // TypeScript: name is available on SyncMetrics
  void name;
  return map[id];
}

function updateSyncMetrics(id: string, success: boolean, durationMs: number): void {
  const map = loadMetrics();
  const m = map[id] ?? getOrInitMetrics(id, id);
  m.totalSyncs += 1;
  if (success) m.successfulSyncs += 1; else m.failedSyncs += 1;
  m.lastSyncAt = new Date().toISOString();
  m.avgSyncDurationMs = Math.round(
    (m.avgSyncDurationMs * (m.totalSyncs - 1) + durationMs) / m.totalSyncs
  );
  m.successRate = m.totalSyncs > 0 ? m.successfulSyncs / m.totalSyncs : 1;
  map[id] = m;
  saveMetrics(map);
}

function recordRetry(id: string, success: boolean): void {
  const map = loadMetrics();
  const m = map[id] ?? getOrInitMetrics(id, id);
  m.totalRetries += 1;
  if (success) m.successfulRetries += 1; else m.failedRetries += 1;
  m.lastRetryAt = new Date().toISOString();
  map[id] = m;
  saveMetrics(map);
}

function recordApiCall(id: string, name: string): void {
  const map = loadApiUsage();
  const u = map[id] ?? {
    integrationId: id, integrationName: name,
    callsToday: 0, callsThisWeek: 0, callsTotal: 0,
  };
  u.callsToday += 1;
  u.callsThisWeek += 1;
  u.callsTotal += 1;
  u.lastCallAt = new Date().toISOString();
  map[id] = u;
  saveApiUsage(map);
}

// ── Input Sanitisation ─────────────────────────────────────────────────────────
function sanitiseConfig(cfg: IntegrationConfig): IntegrationConfig {
  const out: IntegrationConfig = {};
  for (const [k, v] of Object.entries(cfg)) {
    if (typeof v === "string") {
      // Strip HTML/script tags from config values
      out[k] = v.replace(/<[^>]*>/g, "").slice(0, 500);
    } else if (typeof v === "number") {
      out[k] = v;
    }
  }
  return out;
}

// ── Validate API Key Format ────────────────────────────────────────────────────
export function validateApiKey(key: string): boolean {
  if (!key || key.trim().length < 8) return false;
  // Must not be obviously placeholder
  const lower = key.toLowerCase();
  if (lower === "your-api-key" || lower === "placeholder" || lower === "test") return false;
  return true;
}

// ── Simulate Provider Health Check ─────────────────────────────────────────────
function simulateHealth(integration: Integration): ProviderHealth {
  const isConnected = integration.status === "connected";
  const latencyMs   = isConnected ? Math.floor(Math.random() * 180) + 20 : 0;
  const status: HealthStatus = !isConnected
    ? "unknown"
    : latencyMs > 150 ? "degraded"
    : "healthy";
  return {
    integrationId:  integration.id,
    integrationName: integration.name,
    status,
    latencyMs,
    lastChecked: new Date().toISOString(),
    uptimePercent: isConnected ? Math.round(95 + Math.random() * 5) : 0,
  };
}

// ── IntegrationService ─────────────────────────────────────────────────────────
export const IntegrationService = {

  // ── Read ───────────────────────────────────────────────────────────────────

  getAll(): Integration[] {
    const saved    = loadIntegrations();
    const defaults = getDefaultIntegrations();
    const ids      = new Set(saved.map(i => i.id));
    return [...saved, ...defaults.filter(d => !ids.has(d.id))];
  },

  getById(id: string): Integration | undefined {
    return this.getAll().find(i => i.id === id);
  },

  getConnected(): Integration[] {
    return this.getAll().filter(i => i.status === "connected");
  },

  // ── Connect ────────────────────────────────────────────────────────────────

  async connect(id: string, config: IntegrationConfig = {}): Promise<boolean> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return false;

    const cleanCfg = sanitiseConfig(config);
    recordApiCall(id, list[idx].name);

    list[idx] = {
      ...list[idx],
      status: "connected",
      config: { ...list[idx].config, ...cleanCfg },
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      syncCount: (list[idx].syncCount ?? 0) + 1,
      isDemo: true,
      health: "healthy",
      retryCount: 0,
    };
    saveIntegrations(list);

    // Seed health record
    const hMap = loadHealthMap();
    hMap[id] = simulateHealth(list[idx]);
    saveHealthMap(hMap);

    pushEvent({
      integrationId: id,
      integrationName: list[idx].name,
      type: "connect",
      status: "success",
      message: `Connected to ${list[idx].name} (Demo Mode).`,
      durationMs: 200,
    });
    return true;
  },

  // ── Disconnect ─────────────────────────────────────────────────────────────

  async disconnect(id: string): Promise<void> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return;
    const name = list[idx].name;
    list[idx]  = {
      ...list[idx],
      status: "available",
      config: {},
      connectedAt: undefined,
      lastSync: undefined,
      isDemo: true,
      health: "unknown",
      retryCount: 0,
    };
    saveIntegrations(list);

    const hMap = loadHealthMap();
    if (hMap[id]) { hMap[id].status = "unknown"; saveHealthMap(hMap); }

    pushEvent({ integrationId: id, integrationName: name, type: "disconnect", status: "success", message: `Disconnected from ${name}.` });
  },

  // ── Sync ───────────────────────────────────────────────────────────────────

  async sync(id: string): Promise<SyncEvent> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) {
      return pushEvent({ integrationId: id, integrationName: id, type: "sync", status: "failed", message: "Integration not found." });
    }
    if (list[idx].status !== "connected") {
      return pushEvent({ integrationId: id, integrationName: list[idx].name, type: "sync", status: "failed", message: `${list[idx].name} is not connected.` });
    }

    const t0 = Date.now();
    list[idx] = { ...list[idx], status: "syncing" };
    saveIntegrations(list);
    recordApiCall(id, list[idx].name);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 400));

    const durationMs = Date.now() - t0;
    const success    = Math.random() > 0.08; // 92 % success in demo

    list[idx] = {
      ...list[idx],
      status: success ? "connected" : "error",
      lastSync: new Date().toISOString(),
      syncCount: (list[idx].syncCount ?? 0) + 1,
      health: success ? "healthy" : "degraded",
      retryCount: success ? 0 : (list[idx].retryCount ?? 0) + 1,
      errorMessage: success ? undefined : "Demo: simulated intermittent error.",
    };
    saveIntegrations(list);

    // Update health map
    const hMap = loadHealthMap();
    hMap[id]   = simulateHealth(list[idx]);
    saveHealthMap(hMap);

    // Update sync metrics
    updateSyncMetrics(id, success, durationMs);

    const evt = pushEvent({
      integrationId: id,
      integrationName: list[idx].name,
      type: "sync",
      status: success ? "success" : "failed",
      message: success
        ? `Synced ${list[idx].name} in ${durationMs}ms.`
        : `Sync failed for ${list[idx].name} (demo error).`,
      durationMs,
    });

    // Auto-retry on failure (demo)
    if (!success) {
      setTimeout(() => {
        recordRetry(id, true);
        const all = IntegrationService.getAll();
        const ri  = all.findIndex(i => i.id === id);
        if (ri !== -1 && all[ri].status === "error") {
          all[ri] = { ...all[ri], status: "connected", health: "healthy", retryCount: 0, errorMessage: undefined };
          saveIntegrations(all);
          pushEvent({
            integrationId: id, integrationName: all[ri].name,
            type: "retry", status: "success",
            message: `Auto-retry succeeded for ${all[ri].name}.`,
          });
        }
      }, 3000);
    }

    return evt;
  },

  // ── Config Update ──────────────────────────────────────────────────────────

  updateConfig(id: string, config: IntegrationConfig): void {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return;
    list[idx] = { ...list[idx], config: { ...list[idx].config, ...sanitiseConfig(config) } };
    saveIntegrations(list);
  },

  // ── Health ─────────────────────────────────────────────────────────────────

  getHealth(id: string): ProviderHealth | undefined {
    return loadHealthMap()[id];
  },

  getAllHealth(): ProviderHealth[] {
    const map = loadHealthMap();
    const all = this.getAll();
    return all
      .filter(i => i.status === "connected")
      .map(i => map[i.id] ?? simulateHealth(i));
  },

  refreshAllHealth(): ProviderHealth[] {
    const all  = this.getAll();
    const hMap = loadHealthMap();
    for (const i of all.filter(i => i.status === "connected")) {
      hMap[i.id] = simulateHealth(i);
    }
    saveHealthMap(hMap);
    return Object.values(hMap);
  },

  // ── Metrics ────────────────────────────────────────────────────────────────

  getSyncMetrics(id: string): SyncMetrics {
    return getOrInitMetrics(id, id);
  },

  getAllSyncMetrics(): SyncMetrics[] {
    return Object.values(loadMetrics());
  },

  getRetryMetrics(id: string): RetryMetrics {
    return getOrInitMetrics(id, id);
  },

  getAllRetryMetrics(): RetryMetrics[] {
    return Object.values(loadMetrics());
  },

  getApiUsage(): ApiUsageStat[] {
    return Object.values(loadApiUsage());
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  getStatus(id: string): IntegrationStatus {
    return this.getById(id)?.status ?? "available";
  },

  getEvents(limit = 50): SyncEvent[] {
    return loadEvents().slice(0, limit);
  },

  getEventsByIntegration(id: string, limit = 20): SyncEvent[] {
    return loadEvents().filter(e => e.integrationId === id).slice(0, limit);
  },

  getFailedEvents(limit = 50): SyncEvent[] {
    return loadEvents().filter(e => e.status === "failed").slice(0, limit);
  },

  clearEvents(): void {
    saveEvents([]);
  },

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): IntegrationStats {
    const all    = this.getAll();
    const events = loadEvents();
    const metrics = Object.values(loadMetrics());
    const usage   = Object.values(loadApiUsage());

    const totalSyncs      = metrics.reduce((a, m) => a + m.totalSyncs, 0);
    const successfulSyncs = metrics.reduce((a, m) => a + m.successfulSyncs, 0);
    const failedSyncs     = metrics.reduce((a, m) => a + m.failedSyncs, 0);

    // Webhook stats pulled from WebhookManager to avoid circular dep
    let webhookDeliveries = 0;
    let webhookFailures   = 0;
    try {
      const raw = localStorage.getItem("voxora-webhook-deliveries-v1");
      if (raw) {
        const deliveries = JSON.parse(raw) as Array<{ status: string }>;
        webhookDeliveries = deliveries.length;
        webhookFailures   = deliveries.filter(d => d.status === "failed").length;
      }
    } catch { /* ignore */ }

    return {
      total: all.length,
      connected: all.filter(i => i.status === "connected").length,
      available: all.filter(i => i.status === "available").length,
      errored:   all.filter(i => i.status === "error").length,
      totalSyncs,
      successfulSyncs,
      failedSyncs,
      webhookDeliveries,
      webhookFailures,
      recentEvents: events.slice(0, 10),
      apiUsage: usage,
    };
  },

  // ── Preferences ────────────────────────────────────────────────────────────

  getPreferences(): IntegrationPreferences {
    return safeGet<IntegrationPreferences>(PREFS_KEY, DEFAULT_PREFS);
  },

  savePreferences(prefs: Partial<IntegrationPreferences>): void {
    const current = this.getPreferences();
    safeSet(PREFS_KEY, { ...current, ...prefs });
  },

  saveNotificationPrefs(n: Partial<NotificationPreferences>): void {
    const prefs = this.getPreferences();
    safeSet(PREFS_KEY, {
      ...prefs,
      notifications: { ...prefs.notifications, ...n },
    });
  },

  // ── Firebase-ready stubs ───────────────────────────────────────────────────
  // Replace these with Firestore calls when firebase mode is active.

  async saveToCloud(_userId: string, _data: Integration): Promise<void> {
    // TODO: await setDoc(doc(db, `users/${_userId}/integrations/${_data.id}`), _data);
  },

  async loadFromCloud(_userId: string, _id: string): Promise<Integration | null> {
    // TODO: const snap = await getDoc(doc(db, `users/${_userId}/integrations/${_id}`));
    // return snap.exists() ? (snap.data() as Integration) : null;
    return null;
  },
};
