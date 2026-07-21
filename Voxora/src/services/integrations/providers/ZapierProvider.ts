// ── V5.7 Zapier Provider (Placeholder) ───────────────────────────────────────
import type { IntegrationConfig, IntegrationProvider, IntegrationStatus, SyncEvent } from "../IntegrationTypes";

export class ZapierProvider implements IntegrationProvider {
  readonly id = "zapier";
  private status: IntegrationStatus = "available";

  async connect(_config: IntegrationConfig): Promise<boolean> {
    // TODO: Register Zapier webhook URL; Zapier uses webhook triggers (no OAuth needed)
    // Config: webhookUrl required
    this.status = "connected";
    return true;
  }

  async disconnect(): Promise<void> {
    // TODO: Delete registered webhook from Zapier
    this.status = "available";
  }

  async sync(): Promise<SyncEvent> {
    // TODO: POST trigger payload to Zapier webhook URL
    return {
      id: `zapier-${Date.now()}`,
      integrationId: this.id,
      integrationName: "Zapier",
      type: "webhook",
      status: "success",
      message: "Zapier webhook triggered (demo).",
      timestamp: new Date().toISOString(),
    };
  }

  getStatus(): IntegrationStatus { return this.status; }
}
