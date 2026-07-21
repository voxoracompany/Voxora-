// ── V5.7 Integration Service ──────────────────────────────────────────────────
import type { Integration, IntegrationConfig, IntegrationStatus, SyncEvent } from "./IntegrationTypes";
import { getDefaultIntegrations } from "./IntegrationRegistry";

const STORAGE_KEY = "voxora-integrations-v1";
const EVENTS_KEY  = "voxora-integration-events-v1";
const MAX_EVENTS  = 100;

function loadIntegrations(): Integration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Integration[];
  } catch { /* ignore */ }
  return getDefaultIntegrations();
}

function saveIntegrations(list: Integration[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadEvents(): SyncEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) return JSON.parse(raw) as SyncEvent[];
  } catch { /* ignore */ }
  return [];
}

function saveEvents(events: SyncEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}

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

export const IntegrationService = {
  /** Return all integrations (merged with defaults for any new ones). */
  getAll(): Integration[] {
    const saved = loadIntegrations();
    const defaults = getDefaultIntegrations();
    // ensure new defaults not in saved are included
    const ids = new Set(saved.map(i => i.id));
    const merged = [...saved, ...defaults.filter(d => !ids.has(d.id))];
    return merged;
  },

  getById(id: string): Integration | undefined {
    return this.getAll().find(i => i.id === id);
  },

  getConnected(): Integration[] {
    return this.getAll().filter(i => i.status === "connected");
  },

  /** Connect an integration (demo mode — no real API call). */
  async connect(id: string, config: IntegrationConfig = {}): Promise<boolean> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return false;

    list[idx] = {
      ...list[idx],
      status: "connected",
      config: { ...list[idx].config, ...config },
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      syncCount: (list[idx].syncCount ?? 0) + 1,
      isDemo: true,
    };
    saveIntegrations(list);

    pushEvent({
      integrationId: id,
      integrationName: list[idx].name,
      type: "connect",
      status: "success",
      message: `Connected to ${list[idx].name} (Demo Mode).`,
    });
    return true;
  },

  /** Disconnect an integration. */
  async disconnect(id: string): Promise<void> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return;

    const name = list[idx].name;
    list[idx] = { ...list[idx], status: "available", config: {}, connectedAt: undefined, lastSync: undefined, isDemo: true };
    saveIntegrations(list);

    pushEvent({ integrationId: id, integrationName: name, type: "disconnect", status: "success", message: `Disconnected from ${name}.` });
  },

  /** Simulate a sync. */
  async sync(id: string): Promise<SyncEvent> {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return pushEvent({ integrationId: id, integrationName: id, type: "sync", status: "failed", message: "Integration not found." });

    if (list[idx].status !== "connected") {
      return pushEvent({ integrationId: id, integrationName: list[idx].name, type: "sync", status: "failed", message: `${list[idx].name} is not connected.` });
    }

    list[idx] = { ...list[idx], status: "syncing" };
    saveIntegrations(list);

    // Simulate async delay
    await new Promise(r => setTimeout(r, 800));

    list[idx] = {
      ...list[idx],
      status: "connected",
      lastSync: new Date().toISOString(),
      syncCount: (list[idx].syncCount ?? 0) + 1,
    };
    saveIntegrations(list);

    return pushEvent({
      integrationId: id,
      integrationName: list[idx].name,
      type: "sync",
      status: "success",
      message: `Synced ${list[idx].name} successfully.`,
    });
  },

  /** Update integration config. */
  updateConfig(id: string, config: IntegrationConfig): void {
    const list = this.getAll();
    const idx  = list.findIndex(i => i.id === id);
    if (idx === -1) return;
    list[idx] = { ...list[idx], config: { ...list[idx].config, ...config } };
    saveIntegrations(list);
  },

  getStatus(id: string): IntegrationStatus {
    return this.getById(id)?.status ?? "available";
  },

  getEvents(limit = 20): SyncEvent[] {
    return loadEvents().slice(0, limit);
  },

  getEventsByIntegration(id: string, limit = 10): SyncEvent[] {
    return loadEvents().filter(e => e.integrationId === id).slice(0, limit);
  },

  getStats() {
    const all = this.getAll();
    return {
      total: all.length,
      connected: all.filter(i => i.status === "connected").length,
      available: all.filter(i => i.status === "available").length,
      recentEvents: loadEvents().slice(0, 5),
    };
  },
};
