// ── V4.8 Integration Settings ────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";
import "./Settings.css";

interface Props { setWorkspace: (w: string) => void }

interface IntegrationConfig {
  id: string;
  name: string;
  icon: string;
  category: string;
  storageKey: string;
  description: string;
}

const INTEGRATIONS: IntegrationConfig[] = [
  { id: "openai",       name: "OpenAI",            icon: "🧠", category: "AI Provider",    storageKey: "voxora-int-openai-enabled",    description: "GPT-4 and GPT-4o AI models" },
  { id: "gemini",       name: "Google Gemini",      icon: "♊", category: "AI Provider",    storageKey: "voxora-int-gemini-enabled",    description: "Gemini Pro and Ultra models" },
  { id: "anthropic",    name: "Anthropic Claude",   icon: "🤖", category: "AI Provider",    storageKey: "voxora-int-anthropic-enabled", description: "Claude Opus, Sonnet, and Haiku" },
  { id: "googledrive",  name: "Google Drive",       icon: "🗂️", category: "Cloud Storage",  storageKey: "voxora-int-gdrive-enabled",    description: "Cloud file export and import" },
  { id: "dropbox",      name: "Dropbox",            icon: "📦", category: "Cloud Storage",  storageKey: "voxora-int-dropbox-enabled",   description: "Dropbox backup and restore" },
  { id: "notion",       name: "Notion",             icon: "📄", category: "Productivity",   storageKey: "voxora-int-notion-enabled",    description: "Notion workspace export" },
  { id: "slack",        name: "Slack",              icon: "💬", category: "Communication",  storageKey: "voxora-int-slack-enabled",     description: "Slack notifications and alerts" },
  { id: "zapier",       name: "Zapier",             icon: "⚡", category: "Automation",     storageKey: "voxora-int-zapier-enabled",    description: "Zapier webhook automation" },
  { id: "webhooks",     name: "Webhooks",           icon: "🔗", category: "Automation",     storageKey: "voxora-int-webhooks-enabled",  description: "Custom incoming/outgoing webhooks" },
  // V5.7 additions
  { id: "googleCal",    name: "Google Calendar",    icon: "📅", category: "Calendar",       storageKey: "voxora-int-gcal-enabled",      description: "Sync milestones and deadlines" },
  { id: "outlook",      name: "Microsoft Outlook",  icon: "📧", category: "Calendar",       storageKey: "voxora-int-outlook-enabled",   description: "Outlook calendar and tasks" },
  { id: "github",       name: "GitHub",             icon: "🐙", category: "Developer Tools", storageKey: "voxora-int-github-enabled",   description: "Link repos to Voxora projects" },
];

const MOCK_SYNC_LOG = [
  { time: "Just now",  action: "OpenAI model updated to GPT-4o",           status: "success" },
  { time: "5m ago",    action: "Zapier webhook test fired",                 status: "success" },
  { time: "23m ago",   action: "Slack notification sent — Team Brief",      status: "success" },
  { time: "1h ago",    action: "Anthropic Claude model saved",              status: "success" },
  { time: "2h ago",    action: "Google Drive export — 5 projects",          status: "success" },
  { time: "Yesterday", action: "Outgoing webhook failed — timeout",         status: "failed"  },
];

function lastSync(id: string): string {
  const saved = localStorage.getItem(`voxora-int-${id}-lastsync`);
  return saved ? new Date(saved).toLocaleString() : "Never";
}

export default function IntegrationSettings({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      INTEGRATIONS.map(i => [i.id, localStorage.getItem(i.storageKey) !== "false"])
    )
  );
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  const toggle = (id: string) => {
    const next = !enabled[id];
    setEnabled(prev => ({ ...prev, [id]: next }));
    const integration = INTEGRATIONS.find(i => i.id === id)!;
    localStorage.setItem(integration.storageKey, String(next));
    addActivity({
      type: "settings_updated",
      title: `${integration.name} ${next ? "Enabled" : "Disabled"}`,
      description: `Integration toggled via Integration Settings.`,
      category: "Integrations",
      icon: integration.icon,
    });
    showToast(`${integration.icon} ${integration.name} ${next ? "enabled" : "disabled"}.`);
  };

  const categories = [...new Set(INTEGRATIONS.map(i => i.category))];

  return (
    <div className="workspace-container" style={{ maxWidth: 800 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #0f172a, #4c1d95)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>⚙️</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Integration Settings</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Enable or disable integrations, view connection status, last sync time, and sync logs.
        </p>
      </div>

      {/* Summary stats */}
      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon">🔌</div>
          <p className="stat-value">{Object.values(enabled).filter(Boolean).length}</p>
          <h3 className="stat-label">Active</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏸️</div>
          <p className="stat-value">{Object.values(enabled).filter(v => !v).length}</p>
          <h3 className="stat-label">Disabled</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <p className="stat-value">3</p>
          <h3 className="stat-label">AI Providers</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">☁️</div>
          <p className="stat-value">2</p>
          <h3 className="stat-label">Cloud Sync</h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f3f4f6", borderRadius: 12, padding: 4 }}>
        {(["overview", "logs"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
            background: activeTab === tab ? "#fff" : "transparent",
            color: activeTab === tab ? "#111827" : "#6b7280",
            boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
          }}>
            {tab === "overview" ? "🔌 Integrations" : "📋 Sync Logs"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                {cat}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {INTEGRATIONS.filter(i => i.category === cat).map(integration => (
                  <div key={integration.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px", background: "#fff",
                    border: `1.5px solid ${enabled[integration.id] ? "#c4b5fd" : "#e5e7eb"}`,
                    borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{ fontSize: 28 }}>{integration.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{integration.name}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{integration.description}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                        Last sync: {lastSync(integration.id)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                        background: enabled[integration.id] ? "#ede9fe" : "#f3f4f6",
                        color: enabled[integration.id] ? "#6C63FF" : "#9ca3af",
                      }}>
                        {enabled[integration.id] ? "ACTIVE" : "DISABLED"}
                      </span>
                      <button
                        onClick={() => toggle(integration.id)}
                        style={{
                          width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                          background: enabled[integration.id] ? "#6C63FF" : "#d1d5db",
                          transition: "background 0.2s", position: "relative", flexShrink: 0,
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 3, left: enabled[integration.id] ? 20 : 3,
                          width: 18, height: 18, borderRadius: "50%", background: "#fff",
                          transition: "left 0.2s", display: "block",
                        }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MOCK_SYNC_LOG.map((log, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "13px 16px", background: "#fff",
              border: "1.5px solid #e5e7eb", borderRadius: 12,
            }}>
              <span style={{ fontSize: 16 }}>{log.status === "success" ? "✅" : "❌"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{log.action}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{log.time}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                background: log.status === "success" ? "#d1fae5" : "#fee2e2",
                color: log.status === "success" ? "#065f46" : "#991b1b",
              }}>
                {log.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
