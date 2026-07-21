// ── V5.7 Integration Registry ─────────────────────────────────────────────────
import type { Integration, IntegrationCategory } from "./IntegrationTypes";

const DEFAULT_INTEGRATIONS: Omit<Integration, "status" | "config" | "connectedAt" | "lastSync" | "syncCount" | "isDemo">[] = [
  { id: "googleDrive",  name: "Google Drive",      icon: "🗂️", category: "storage",       description: "Export and import project data directly to and from Google Drive." },
  { id: "dropbox",      name: "Dropbox",            icon: "📦", category: "storage",       description: "Sync and backup Voxora projects to your Dropbox account." },
  { id: "notion",       name: "Notion",             icon: "📄", category: "productivity",  description: "Connect your Notion workspace and export pages from Voxora." },
  { id: "slack",        name: "Slack",              icon: "💬", category: "communication", description: "Send Voxora notifications and updates directly to Slack channels." },
  { id: "zapier",       name: "Zapier",             icon: "⚡", category: "automation",    description: "Automate workflows with Zapier webhooks and triggers." },
  { id: "webhooks",     name: "Webhooks",           icon: "🔗", category: "developer",     description: "Configure incoming/outgoing webhooks and view event logs." },
  { id: "googleCal",   name: "Google Calendar",    icon: "📅", category: "calendar",      description: "Sync milestones and deadlines to Google Calendar." },
  { id: "outlook",      name: "Microsoft Outlook",  icon: "📧", category: "calendar",      description: "Integrate Voxora events with Microsoft Outlook calendar." },
  { id: "github",       name: "GitHub",             icon: "🐙", category: "developer",     description: "Link GitHub repositories to Voxora projects and track commits." },
];

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  storage: "Cloud Storage",
  productivity: "Productivity",
  communication: "Communication",
  automation: "Automation",
  developer: "Developer Tools",
  calendar: "Calendar",
};

export function getDefaultIntegrations(): Integration[] {
  return DEFAULT_INTEGRATIONS.map(d => ({
    ...d,
    status: "available" as const,
    config: {},
    syncCount: 0,
    isDemo: true,
  }));
}
