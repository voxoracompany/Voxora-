// ── V4.8 Integrations Studio Hub ─────────────────────────────────────────────
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "intOpenAI",      icon: "🧠", label: "OpenAI",           desc: "Connect OpenAI GPT-4 — manage API key, test connection, and check provider status." },
  { id: "intGemini",      icon: "♊", label: "Google Gemini",    desc: "Connect Google Gemini — configure API key, select model provider, and test connection." },
  { id: "intAnthropic",   icon: "🤖", label: "Anthropic Claude", desc: "Connect Anthropic Claude — API key management, connection testing, and status." },
  { id: "intGoogleDrive", icon: "🗂️", label: "Google Drive",     desc: "Export and import project data directly to and from Google Drive." },
  { id: "intDropbox",     icon: "📦", label: "Dropbox",          desc: "Sync and backup Voxora projects to your Dropbox account." },
  { id: "intNotion",      icon: "📄", label: "Notion",           desc: "Connect your Notion workspace and export pages from Voxora." },
  { id: "intSlack",       icon: "💬", label: "Slack",            desc: "Send Voxora notifications and updates directly to Slack channels." },
  { id: "intZapier",      icon: "⚡", label: "Zapier",           desc: "Automate workflows with Zapier webhooks and triggers." },
  { id: "intWebhooks",    icon: "🔗", label: "Webhooks",         desc: "Configure incoming/outgoing webhooks and view event logs." },
  { id: "intSettings",    icon: "⚙️", label: "Integration Settings", desc: "Enable or disable integrations, check sync status, and view sync logs." },
];

const STATS = [
  { label: "Integrations", val: "10",   icon: "🔌" },
  { label: "AI Providers", val: "3",    icon: "🧠" },
  { label: "Cloud Sync",   val: "Yes",  icon: "☁️" },
  { label: "Webhooks",     val: "Yes",  icon: "🔗" },
];

const CONNECTED = [
  { name: "OpenAI",      status: "configured", icon: "🧠", color: "#10a37f" },
  { name: "Gemini",      status: "configured", icon: "♊", color: "#4285f4" },
  { name: "Anthropic",   status: "configured", icon: "🤖", color: "#d4a024" },
  { name: "Google Drive",status: "available",  icon: "🗂️", color: "#34a853" },
  { name: "Dropbox",     status: "available",  icon: "📦", color: "#0061ff" },
  { name: "Notion",      status: "available",  icon: "📄", color: "#000" },
  { name: "Slack",       status: "available",  icon: "💬", color: "#4a154b" },
  { name: "Zapier",      status: "available",  icon: "⚡", color: "#ff4a00" },
];

export default function IntegrationsHub({ setWorkspace }: Props) {
  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #7c3aed 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Integrations Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 520 }}>
          Connect Voxora to your favourite tools — AI providers, cloud storage, productivity apps, and automation platforms. One hub for all your integrations.
        </p>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Connected Apps overview */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔌 Integration Status</h2>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 12, marginBottom: 32,
      }}>
        {CONNECTED.map(app => (
          <div key={app.name} style={{
            background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14,
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: 26 }}>{app.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{app.name}</div>
              <div style={{
                fontSize: 11, fontWeight: 600, marginTop: 3,
                color: app.status === "configured" ? "#10b981" : "#6b7280",
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                {app.status === "configured" ? "✅ Configured" : "○ Available"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Integration Tools</h2>
      <div className="cards" style={{ marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card"
            style={{ cursor: "pointer" }}
            onClick={() => setWorkspace(t.id)}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>{t.label}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{t.desc}</p>
            <button
              className="workspace-btn"
              style={{ marginTop: 14, width: "100%", fontSize: 13 }}
              onClick={e => { e.stopPropagation(); setWorkspace(t.id); }}
            >
              Open →
            </button>
          </div>
        ))}
      </div>

      {/* Health summary */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        border: "1.5px solid #bbf7d0", borderRadius: 16,
        padding: "20px 24px",
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#065f46" }}>
          ✅ Integration Health
        </h3>
        <p style={{ margin: 0, fontSize: 14, color: "#047857", lineHeight: 1.6 }}>
          All core AI providers are configured and ready. Cloud storage and productivity integrations are available to connect. Webhook infrastructure is active and ready to receive events.
        </p>
      </div>
    </div>
  );
}
