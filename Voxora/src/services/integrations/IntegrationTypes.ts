// ── V5.7 Integration Types ────────────────────────────────────────────────────

export type IntegrationStatus = "connected" | "disconnected" | "error" | "syncing" | "available";
export type IntegrationCategory = "storage" | "productivity" | "communication" | "automation" | "developer" | "calendar";
export type SyncFrequency = "realtime" | "hourly" | "daily" | "manual";

export interface IntegrationConfig {
  apiKey?: string;
  clientId?: string;
  webhookUrl?: string;
  syncFrequency?: SyncFrequency;
  [key: string]: string | undefined;
}

export interface SyncEvent {
  id: string;
  integrationId: string;
  integrationName: string;
  type: "sync" | "connect" | "disconnect" | "error" | "webhook";
  status: "success" | "failed" | "pending";
  message: string;
  timestamp: string;
}

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
}

export interface IntegrationProvider {
  id: string;
  connect(config: IntegrationConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  sync(): Promise<SyncEvent>;
  getStatus(): IntegrationStatus;
}
