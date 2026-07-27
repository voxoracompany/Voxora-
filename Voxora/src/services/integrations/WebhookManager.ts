// ── V8.3 WebhookManager ───────────────────────────────────────────────────────
import type {
  WebhookEndpoint, WebhookDelivery, WebhookRetryItem,
  WebhookDirection, WebhookStatus, DeliveryStatus,
} from "./IntegrationTypes";

// ── Storage Keys ───────────────────────────────────────────────────────────────
const ENDPOINTS_KEY = "voxora-webhook-endpoints-v1";
const DELIVERIES_KEY = "voxora-webhook-deliveries-v1";
const RETRY_KEY      = "voxora-webhook-retry-queue-v1";
const MAX_DELIVERIES = 200;
const MAX_QUEUE      = 50;

// ── Safe Storage ───────────────────────────────────────────────────────────────
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}
function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ── ID Generator ───────────────────────────────────────────────────────────────
function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Loaders ────────────────────────────────────────────────────────────────────
function loadEndpoints(): WebhookEndpoint[] {
  return safeGet<WebhookEndpoint[]>(ENDPOINTS_KEY, []);
}
function saveEndpoints(list: WebhookEndpoint[]): void {
  safeSet(ENDPOINTS_KEY, list);
}

function loadDeliveries(): WebhookDelivery[] {
  return safeGet<WebhookDelivery[]>(DELIVERIES_KEY, []);
}
function saveDeliveries(list: WebhookDelivery[]): void {
  safeSet(DELIVERIES_KEY, list.slice(0, MAX_DELIVERIES));
}

function loadQueue(): WebhookRetryItem[] {
  return safeGet<WebhookRetryItem[]>(RETRY_KEY, []);
}
function saveQueue(list: WebhookRetryItem[]): void {
  safeSet(RETRY_KEY, list.slice(0, MAX_QUEUE));
}

// ── Validation ─────────────────────────────────────────────────────────────────
export function validateWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateSecret(secret: string): boolean {
  return secret.length >= 8;
}

export function validateApiKey(key: string): boolean {
  if (!key || key.trim().length < 8) return false;
  const lower = key.toLowerCase();
  return !["placeholder", "your-api-key", "test", "secret"].includes(lower);
}

// ── Sanitise Payload ───────────────────────────────────────────────────────────
function sanitisePayload(payload: string): string {
  // Remove any embedded scripts or dangerous HTML (webhook payloads should be JSON)
  return payload.replace(/<script[^>]*>.*?<\/script>/gi, "").slice(0, 4000);
}

// ── Seed Demo Endpoints ────────────────────────────────────────────────────────
function getSeedEndpoints(): WebhookEndpoint[] {
  const now = new Date().toISOString();
  return [
    {
      id: "wh-ep-incoming-demo",
      name: "Voxora Incoming Endpoint",
      direction: "incoming",
      url: `https://voxora.app/api/webhooks/incoming/demo-${Math.random().toString(36).slice(2, 10)}`,
      secret: "",
      apiKey: "",
      status: "active",
      createdAt: now,
      updatedAt: now,
      eventTypes: ["external.trigger", "zapier.action", "github.push"],
      deliveryCount: 3,
      failureCount: 0,
      lastDeliveryAt: new Date(Date.now() - 45 * 60000).toISOString(),
    },
  ];
}

function getSeedDeliveries(): WebhookDelivery[] {
  return [
    {
      id: "wh-del-1", webhookId: "wh-ep-incoming-demo", webhookName: "Voxora Incoming Endpoint",
      direction: "incoming", eventType: "external.trigger", status: "success", statusCode: 200,
      requestPayload: '{"source":"zapier","action":"sync_projects"}',
      responsePayload: '{"ok":true}',
      durationMs: 142, timestamp: new Date(Date.now() - 45 * 60000).toISOString(), retryAttempt: 0,
    },
    {
      id: "wh-del-2", webhookId: "wh-ep-incoming-demo", webhookName: "Voxora Incoming Endpoint",
      direction: "incoming", eventType: "github.push", status: "success", statusCode: 200,
      requestPayload: '{"ref":"refs/heads/main","commits":3}',
      responsePayload: '{"ok":true}',
      durationMs: 98, timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), retryAttempt: 0,
    },
    {
      id: "wh-del-3", webhookId: "wh-ep-demo-out", webhookName: "Outgoing Alerts",
      direction: "outgoing", eventType: "team.goal.updated", status: "failed", statusCode: 503,
      requestPayload: '{"event":"team.goal.updated","error":"timeout"}',
      durationMs: 5012, timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      retryAttempt: 1, errorMessage: "Service unavailable (simulated)",
      nextRetryAt: new Date(Date.now() + 5 * 60000).toISOString(),
    },
  ];
}

// ── WebhookManager ─────────────────────────────────────────────────────────────
export const WebhookManager = {

  // ── Endpoints ──────────────────────────────────────────────────────────────

  getEndpoints(): WebhookEndpoint[] {
    let eps = loadEndpoints();
    if (eps.length === 0) {
      eps = getSeedEndpoints();
      saveEndpoints(eps);
    }
    return eps;
  },

  getEndpoint(id: string): WebhookEndpoint | undefined {
    return this.getEndpoints().find(e => e.id === id);
  },

  getIncoming(): WebhookEndpoint[] {
    return this.getEndpoints().filter(e => e.direction === "incoming");
  },

  getOutgoing(): WebhookEndpoint[] {
    return this.getEndpoints().filter(e => e.direction === "outgoing");
  },

  addEndpoint(params: {
    name: string;
    direction: WebhookDirection;
    url?: string;
    secret?: string;
    apiKey?: string;
    eventTypes?: string[];
  }): WebhookEndpoint {
    const now = new Date().toISOString();
    const ep: WebhookEndpoint = {
      id: uid("wh-ep"),
      name: params.name.slice(0, 100).replace(/<[^>]*>/g, ""),
      direction: params.direction,
      url: params.url ?? "",
      secret: params.secret ?? "",
      apiKey: params.apiKey ?? "",
      status: "active",
      createdAt: now,
      updatedAt: now,
      eventTypes: params.eventTypes ?? [],
      deliveryCount: 0,
      failureCount: 0,
    };
    const list = this.getEndpoints();
    list.push(ep);
    saveEndpoints(list);
    return ep;
  },

  updateEndpoint(id: string, updates: Partial<Omit<WebhookEndpoint, "id" | "createdAt">>): WebhookEndpoint | null {
    const list = loadEndpoints();
    const idx  = list.findIndex(e => e.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, id, updatedAt: new Date().toISOString() };
    saveEndpoints(list);
    return list[idx];
  },

  deleteEndpoint(id: string): void {
    const list = loadEndpoints().filter(e => e.id !== id);
    saveEndpoints(list);
  },

  setStatus(id: string, status: WebhookStatus): void {
    this.updateEndpoint(id, { status });
  },

  // ── Deliveries ─────────────────────────────────────────────────────────────

  getDeliveries(limit = 100): WebhookDelivery[] {
    let del = loadDeliveries();
    if (del.length === 0) {
      del = getSeedDeliveries();
      saveDeliveries(del);
    }
    return del.slice(0, limit);
  },

  getDeliveriesByEndpoint(webhookId: string, limit = 50): WebhookDelivery[] {
    return this.getDeliveries().filter(d => d.webhookId === webhookId).slice(0, limit);
  },

  getFailedDeliveries(limit = 50): WebhookDelivery[] {
    return this.getDeliveries().filter(d => d.status === "failed").slice(0, limit);
  },

  logDelivery(params: {
    webhookId: string;
    webhookName: string;
    direction: WebhookDirection;
    eventType: string;
    status: DeliveryStatus;
    statusCode?: number;
    requestPayload: string;
    responsePayload?: string;
    durationMs?: number;
    errorMessage?: string;
    retryAttempt?: number;
    nextRetryAt?: string;
  }): WebhookDelivery {
    const delivery: WebhookDelivery = {
      id: uid("wh-del"),
      ...params,
      requestPayload: sanitisePayload(params.requestPayload),
      responsePayload: params.responsePayload ? sanitisePayload(params.responsePayload) : undefined,
      timestamp: new Date().toISOString(),
      retryAttempt: params.retryAttempt ?? 0,
    };
    const list = loadDeliveries();
    saveDeliveries([delivery, ...list]);

    // Update endpoint stats
    const eps = loadEndpoints();
    const idx = eps.findIndex(e => e.id === params.webhookId);
    if (idx !== -1) {
      eps[idx].deliveryCount += 1;
      if (params.status === "failed") eps[idx].failureCount += 1;
      eps[idx].lastDeliveryAt = delivery.timestamp;
      saveEndpoints(eps);
    }

    // Queue retry for failed deliveries
    if (params.status === "failed" && (params.retryAttempt ?? 0) < 3) {
      this.enqueueRetry({
        deliveryId: delivery.id,
        webhookId: params.webhookId,
        attempt: (params.retryAttempt ?? 0) + 1,
        payload: params.requestPayload,
      });
    }

    return delivery;
  },

  clearDeliveries(): void {
    saveDeliveries([]);
  },

  // ── Retry Queue ────────────────────────────────────────────────────────────

  getRetryQueue(): WebhookRetryItem[] {
    return loadQueue();
  },

  enqueueRetry(params: { deliveryId: string; webhookId: string; attempt: number; payload: string }): WebhookRetryItem {
    const item: WebhookRetryItem = {
      ...params,
      scheduledAt: new Date(Date.now() + params.attempt * 60000).toISOString(),
      payload: sanitisePayload(params.payload),
    };
    const q = loadQueue();
    saveQueue([item, ...q]);
    return item;
  },

  dequeueRetry(deliveryId: string): void {
    saveQueue(loadQueue().filter(i => i.deliveryId !== deliveryId));
  },

  clearRetryQueue(): void {
    saveQueue([]);
  },

  // ── Simulate Outgoing Delivery ─────────────────────────────────────────────

  async testOutgoing(endpointId: string): Promise<WebhookDelivery> {
    const ep = this.getEndpoint(endpointId);
    const name = ep?.name ?? "Outgoing Webhook";

    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    const success    = Math.random() > 0.1;
    const durationMs = Math.floor(Math.random() * 300) + 80;

    return this.logDelivery({
      webhookId: endpointId,
      webhookName: name,
      direction: "outgoing",
      eventType: "webhook.test",
      status: success ? "success" : "failed",
      statusCode: success ? 200 : 503,
      requestPayload: JSON.stringify({ event: "webhook.test", source: "voxora", test: true }),
      responsePayload: success ? '{"ok":true}' : undefined,
      durationMs,
      errorMessage: success ? undefined : "Service unavailable (simulated)",
    });
  },

  // ── Stats ──────────────────────────────────────────────────────────────────

  getStats(): {
    totalEndpoints: number;
    activeEndpoints: number;
    totalDeliveries: number;
    successDeliveries: number;
    failedDeliveries: number;
    pendingRetries: number;
    successRate: number;
  } {
    const endpoints  = this.getEndpoints();
    const deliveries = this.getDeliveries();
    const queue      = this.getRetryQueue();
    const success    = deliveries.filter(d => d.status === "success").length;
    const failed     = deliveries.filter(d => d.status === "failed").length;
    return {
      totalEndpoints:   endpoints.length,
      activeEndpoints:  endpoints.filter(e => e.status === "active").length,
      totalDeliveries:  deliveries.length,
      successDeliveries: success,
      failedDeliveries: failed,
      pendingRetries:   queue.length,
      successRate:      deliveries.length > 0 ? success / deliveries.length : 1,
    };
  },
};
