// ── V4.8 Slack Integration ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const NOTIFICATION_TYPES = [
  { id: "new_project",  label: "New Project Created",    default: true },
  { id: "ai_session",   label: "AI Session Completed",   default: false },
  { id: "team_update",  label: "Team Updates",           default: true },
  { id: "goal_update",  label: "Goal Progress Updates",  default: true },
  { id: "export",       label: "Export Completed",       default: false },
  { id: "weekly_brief", label: "Weekly Brief",           default: true },
];

export default function IntSlack({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem("voxora-slack-webhook") || "");
  const [channel, setChannel] = useState(() => localStorage.getItem("voxora-slack-channel") || "#general");
  const [enabled, setEnabled] = useState(() => localStorage.getItem("voxora-int-slack-enabled") !== "false");
  const [notifications, setNotifications] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("voxora-slack-notifications");
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(NOTIFICATION_TYPES.map(n => [n.id, n.default]));
  });
  const [testing, setTesting] = useState(false);

  const toggleNotification = (id: string) => {
    setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const save = () => {
    if (!webhookUrl.trim()) { showToast("Enter your Slack webhook URL.", "error"); return; }
    localStorage.setItem("voxora-slack-webhook", webhookUrl);
    localStorage.setItem("voxora-slack-channel", channel);
    localStorage.setItem("voxora-int-slack-enabled", String(enabled));
    localStorage.setItem("voxora-slack-notifications", JSON.stringify(notifications));
    addActivity({ type: "integration_saved", title: "Slack Integration Saved", description: `Channel: ${channel}`, category: "Integrations", icon: "💬" });
    showToast("✅ Slack integration saved!");
  };

  const sendTest = () => {
    if (!webhookUrl.trim()) { showToast("Enter a webhook URL first.", "error"); return; }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      showToast("💬 Test notification sent to Slack (simulated).");
    }, 1500);
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #2d0b4e, #4a154b)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>💬</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Slack Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Send Voxora notifications, updates, and team briefs directly to your Slack channels.
        </p>
      </div>

      {/* Enable toggle */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
        padding: "14px 18px", background: "#f9fafb", borderRadius: 12, border: "1.5px solid #e5e7eb",
      }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Slack Notifications</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Receive Voxora updates in Slack</div>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          style={{
            width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
            background: enabled ? "#6C63FF" : "#d1d5db", transition: "background 0.2s",
            position: "relative",
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: enabled ? 20 : 3,
            width: 18, height: 18, borderRadius: "50%", background: "#fff",
            transition: "left 0.2s", display: "block",
          }} />
        </button>
      </div>

      <div className="workspace-form">
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Slack Webhook URL</label>
        <input
          className="workspace-input"
          type="password"
          placeholder="https://hooks.slack.com/services/…"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Default Channel</label>
        <input
          className="workspace-input"
          placeholder="#general"
          value={channel}
          onChange={e => setChannel(e.target.value)}
        />
      </div>

      {/* Notification toggles */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "24px 0 12px" }}>🔔 Notification Types</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {NOTIFICATION_TYPES.map(n => (
          <div key={n.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", background: "#f9fafb", borderRadius: 10, border: "1.5px solid #e5e7eb",
          }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{n.label}</span>
            <button
              onClick={() => toggleNotification(n.id)}
              style={{
                width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                background: notifications[n.id] ? "#6C63FF" : "#d1d5db", transition: "background 0.2s",
                position: "relative", flexShrink: 0,
              }}
            >
              <span style={{
                position: "absolute", top: 2, left: notifications[n.id] ? 18 : 2,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", display: "block",
              }} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" onClick={sendTest} disabled={testing} style={{ background: "#4a154b" }}>
          {testing ? "Sending…" : "🧪 Send Test Message"}
        </button>
        <button className="workspace-btn" onClick={save}>💾 Save Integration</button>
      </div>
    </div>
  );
}
