// ── V4.8 Webhooks ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

interface WebhookEvent {
  id: string;
  type: string;
  direction: "incoming" | "outgoing";
  status: "success" | "failed" | "pending";
  timestamp: string;
  payload: string;
}

const MOCK_EVENTS: WebhookEvent[] = [
  { id: "wh-1", type: "project.created",     direction: "outgoing", status: "success", timestamp: new Date(Date.now() - 5 * 60000).toISOString(),  payload: '{"event":"project.created","data":{"title":"Market Research"}}' },
  { id: "wh-2", type: "ai.session.complete",  direction: "outgoing", status: "success", timestamp: new Date(Date.now() - 18 * 60000).toISOString(), payload: '{"event":"ai.session.complete","data":{"workspace":"assistant"}}' },
  { id: "wh-3", type: "external.trigger",     direction: "incoming", status: "success", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), payload: '{"source":"zapier","action":"sync_projects"}' },
  { id: "wh-4", type: "team.goal.updated",    direction: "outgoing", status: "failed",  timestamp: new Date(Date.now() - 90 * 60000).toISOString(), payload: '{"event":"team.goal.updated","error":"timeout"}' },
  { id: "wh-5", type: "export.complete",      direction: "outgoing", status: "success", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),payload: '{"event":"export.complete","format":"pdf"}' },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function IntWebhooks({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [incomingUrl] = useState(() => `https://voxora.app/api/webhooks/incoming/${Math.random().toString(36).slice(2, 10)}`);
  const [outgoingUrl, setOutgoingUrl] = useState(() => localStorage.getItem("voxora-webhook-outgoing") || "");
  const [secret, setSecret] = useState(() => localStorage.getItem("voxora-webhook-secret") || "");
  const [events, setEvents] = useState<WebhookEvent[]>(MOCK_EVENTS);
  const [activeTab, setActiveTab] = useState<"config" | "logs">("config");
  const [testing, setTesting] = useState(false);

  const save = () => {
    localStorage.setItem("voxora-webhook-outgoing", outgoingUrl);
    localStorage.setItem("voxora-webhook-secret", secret);
    addActivity({ type: "integration_saved", title: "Webhooks Configured", description: "Outgoing webhook URL updated.", category: "Integrations", icon: "🔗" });
    showToast("✅ Webhook configuration saved!");
  };

  const testOutgoing = () => {
    if (!outgoingUrl.trim()) { showToast("Enter an outgoing webhook URL first.", "error"); return; }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const newEvent: WebhookEvent = {
        id: `wh-${Date.now()}`,
        type: "webhook.test",
        direction: "outgoing",
        status: "success",
        timestamp: new Date().toISOString(),
        payload: '{"event":"webhook.test","data":{"source":"voxora","test":true}}',
      };
      setEvents(prev => [newEvent, ...prev]);
      showToast("🔗 Outgoing webhook test sent (simulated).");
    }, 1500);
  };

  const copyIncoming = () => {
    navigator.clipboard.writeText(incomingUrl).then(() => showToast("📋 Incoming URL copied!"));
  };

  const clearLogs = () => {
    setEvents([]);
    showToast("🗑️ Event logs cleared.");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 800 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #1e3a5f, #7c3aed)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🔗</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Webhooks</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Configure incoming and outgoing webhooks for real-time event-driven integrations.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#f3f4f6", borderRadius: 12, padding: 4 }}>
        {(["config", "logs"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
            background: activeTab === tab ? "#fff" : "transparent",
            color: activeTab === tab ? "#111827" : "#6b7280",
            boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
          }}>
            {tab === "config" ? "⚙️ Configuration" : "📋 Event Logs"}
          </button>
        ))}
      </div>

      {activeTab === "config" && (
        <>
          {/* Incoming */}
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>📥 Incoming Webhook</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#047857" }}>
              Use this URL to send events from external services into Voxora.
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="workspace-input"
                value={incomingUrl}
                readOnly
                style={{ flex: 1, background: "#fff", fontSize: 12, fontFamily: "monospace" }}
              />
              <button className="workspace-btn" onClick={copyIncoming} style={{ flexShrink: 0, padding: "10px 16px", fontSize: 13 }}>
                📋 Copy
              </button>
            </div>
          </div>

          {/* Outgoing */}
          <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#1e40af" }}>📤 Outgoing Webhook</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#1d4ed8" }}>
              Voxora will POST events to this URL when things happen in your workspace.
            </p>
            <div className="workspace-form">
              <input
                className="workspace-input"
                placeholder="https://your-server.com/webhook"
                value={outgoingUrl}
                onChange={e => setOutgoingUrl(e.target.value)}
              />
              <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Webhook Secret (optional)</label>
              <input
                className="workspace-input"
                type="password"
                placeholder="whsec_…"
                value={secret}
                onChange={e => setSecret(e.target.value)}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <button className="workspace-btn" onClick={testOutgoing} disabled={testing} style={{ background: "#1d4ed8" }}>
                  {testing ? "Sending…" : "🧪 Test Outgoing"}
                </button>
                <button className="workspace-btn" onClick={save}>💾 Save</button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "logs" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
              📋 Event Logs <span style={{ fontSize: 13, fontWeight: 400, color: "#6b7280" }}>({events.length} events)</span>
            </div>
            <button className="workspace-btn" onClick={clearLogs}
              style={{ padding: "6px 14px", fontSize: 12, background: "#ef4444" }}>
              🗑️ Clear Logs
            </button>
          </div>

          {events.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <p>No webhook events yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.map(evt => (
                <div key={evt.id} style={{
                  background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12,
                  padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>{evt.direction === "incoming" ? "📥" : "📤"}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", fontFamily: "monospace" }}>
                      {evt.type}
                    </span>
                    <span style={{
                      marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                      background: evt.status === "success" ? "#d1fae5" : evt.status === "failed" ? "#fee2e2" : "#fef9c3",
                      color: evt.status === "success" ? "#065f46" : evt.status === "failed" ? "#991b1b" : "#78350f",
                    }}>
                      {evt.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{timeAgo(evt.timestamp)}</span>
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: "monospace", color: "#6b7280",
                    background: "#f9fafb", borderRadius: 6, padding: "6px 10px",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {evt.payload}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
