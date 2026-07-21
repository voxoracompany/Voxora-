// ── V5.7 GitHub Provider (Placeholder) ───────────────────────────────────────
import type { IntegrationConfig, IntegrationProvider, IntegrationStatus, SyncEvent } from "../IntegrationTypes";

export class GitHubProvider implements IntegrationProvider {
  readonly id = "github";
  private status: IntegrationStatus = "available";

  async connect(_config: IntegrationConfig): Promise<boolean> {
    // TODO: Implement GitHub OAuth App — https://docs.github.com/en/apps/oauth-apps
    // Required scopes: repo, read:user
    // Config: clientId, clientSecret, accessToken
    this.status = "connected";
    return true;
  }

  async disconnect(): Promise<void> {
    // TODO: Revoke GitHub OAuth token via DELETE /applications/{client_id}/token
    this.status = "available";
  }

  async sync(): Promise<SyncEvent> {
    // TODO: Fetch linked repo metadata, open issues count, latest commit
    return {
      id: `gh-${Date.now()}`,
      integrationId: this.id,
      integrationName: "GitHub",
      type: "sync",
      status: "success",
      message: "GitHub repository synced (demo).",
      timestamp: new Date().toISOString(),
    };
  }

  getStatus(): IntegrationStatus { return this.status; }
}
