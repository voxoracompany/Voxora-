// ── V8.3 Integration Types ────────────────────────────────────────────────────

export type IntegrationStatus = "connected" | "disconnected" | "error" | "syncing" | "available";
export type IntegrationCategory = "storage" | "productivity" | "communication" | "automation" | "developer" | "calendar";
export type SyncFrequency = "realtime" | "hourly" | "daily" | "manual";
export type HealthStatus = "healthy" | "degraded" | "down" | "unknown";
export type NotificationLevel = "all" | "errors_only" | "none";

// ── Config ─────────────────────────────────────────────────────────────────────
export interface IntegrationConfig {
  apiKey?: string;
  clientId?: string;
  webhookUrl?: string;
  syncFrequency?: SyncFrequency;
  retryAttempts?: number;
  [key: string]: string | number | undefined;
}

// ── Events / Sync ──────────────────────────────────────────────────────────────
export interface SyncEvent {
  id: string;
  integrationId: string;
  integrationName: string;
  type: "sync" | "connect" | "disconnect" | "error" | "webhook" | "retry";
  status: "success" | "failed" | "pending";
  message: string;
  timestamp: string;
  durationMs?: number;
  retryAttempt?: number;
}

// ── Health ─────────────────────────────────────────────────────────────────────
export interface ProviderHealth {
  integrationId: string;
  integrationName: string;
  status: HealthStatus;
  latencyMs: number;
  lastChecked: string;
  errorMessage?: string;
  uptimePercent: number;
}

// ── Retry Metrics ──────────────────────────────────────────────────────────────
export interface RetryMetrics {
  integrationId: string;
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  lastRetryAt?: string;
  avgRetryDelayMs: number;
}

// ── Sync Metrics ───────────────────────────────────────────────────────────────
export interface SyncMetrics {
  integrationId: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncAt?: string;
  avgSyncDurationMs: number;
  successRate: number; // 0–1
}

// ── Notification Preferences ───────────────────────────────────────────────────
export interface NotificationPreferences {
  level: NotificationLevel;
  onConnect: boolean;
  onDisconnect: boolean;
  onSyncFail: boolean;
  onWebhookFail: boolean;
  onHealthDegraded: boolean;
}

// ── Integration Preferences ────────────────────────────────────────────────────
export interface IntegrationPreferences {
  defaultSyncFrequency: SyncFrequency;
  defaultRetryAttempts: number;
  autoReconnect: boolean;
  logRetention: number; // days
  notifications: NotificationPreferences;
}

// ── Core Integration ───────────────────────────────────────────────────────────
export interface Integration {
  id: string;
  name: string;
  icon: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  config: IntegrationConfig;
  connectedAt?: string;
  lastSync?: string;
  syncCount: number;
  isDemo: boolean;
  health?: HealthStatus;
  retryCount?: number;
  errorMessage?: string;
}

// ── Provider Interface (Firebase-ready) ────────────────────────────────────────
export interface IntegrationProvider {
  id: string;
  connect(config: IntegrationConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  sync(): Promise<SyncEvent>;
  getStatus(): IntegrationStatus;
  getHealth?(): Promise<ProviderHealth>;
  // Firebase: override these in a FirebaseIntegrationProvider
  saveToCloud?(userId: string, data: Integration): Promise<void>;
  loadFromCloud?(userId: string): Promise<Integration | null>;
}

// ── Webhook Types ──────────────────────────────────────────────────────────────
export type WebhookDirection = "incoming" | "outgoing";
export type WebhookStatus = "active" | "inactive" | "paused";
export type DeliveryStatus = "success" | "failed" | "pending" | "retrying";

export interface WebhookEndpoint {
  id: string;
  name: string;
  direction: WebhookDirection;
  url: string;
  secret?: string;      // HMAC signing secret
  apiKey?: string;      // Bearer / API-key auth placeholder
  status: WebhookStatus;
  createdAt: string;
  updatedAt: string;
  eventTypes: string[];
  deliveryCount: number;
  failureCount: number;
  lastDeliveryAt?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  webhookName: string;
  direction: WebhookDirection;
  eventType: string;
  status: DeliveryStatus;
  statusCode?: number;
  requestPayload: string;
  responsePayload?: string;
  durationMs?: number;
  timestamp: string;
  retryAttempt: number;
  nextRetryAt?: string;
  errorMessage?: string;
}

export interface WebhookRetryItem {
  deliveryId: string;
  webhookId: string;
  attempt: number;
  scheduledAt: string;
  payload: string;
}

// ── Aggregate Stats ────────────────────────────────────────────────────────────
export interface IntegrationStats {
  total: number;
  connected: number;
  available: number;
  errored: number;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  webhookDeliveries: number;
  webhookFailures: number;
  recentEvents: SyncEvent[];
  apiUsage: ApiUsageStat[];
}

export interface ApiUsageStat {
  integrationId: string;
  integrationName: string;
  callsToday: number;
  callsThisWeek: number;
  callsTotal: number;
  lastCallAt?: string;
}
