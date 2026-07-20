// ── V4.8 Zapier Integration ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const ZAP_IDEAS = [
  "New Voxora project → Create Trello card",
  "New Voxora project → Send email notification",
  "AI session complete → Log to Google Sheets",
  "Team goal created → Post to Slack",
  "Weekly review done → Create Notion page",
  "New milestone → Add to Airtable",
];

export default function IntZapier({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem("voxora-zapier-webhook") || "");
  const [label, setLabel] = useState(() => localStorage.getItem("voxora-zapier-label") || "Voxora Zap");
  const [enabled, setEnabled] = useState(() => localStorage.getItem("voxora-int-zapier-enabled") !== "false");
  const [testing, setTesting] = useState(false);

  const save = () => {
    if (!webhookUrl.trim()) { showToast("Enter your Zapier webhook URL.", "error"); return; }
    localStorage.setItem("voxora-zapier-webhook", webhookUrl);
    localStorage.setItem("voxora-zapier-label", label);
    localStorage.setItem("voxora-int-zapier-enabled", String(enabled));
    addActivity({ type: "integration_saved", title: "Zapier Integration Saved", description: label, category: "Integrations", icon: "⚡" });
    showToast("✅ Zapier integration saved!");
  };

  const testWebhook = () => {
    if (!webhookUrl.trim()) { showToast("Enter a webhook URL first.", "error"); return; }
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      showToast("⚡ Zapier webhook test sent (simulated).");
    }, 1500);
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #7c1c00, #ff4a00)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>⚡</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Zapier Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Automate Voxora workflows by connecting to 6,000+ apps via Zapier webhooks.
        </p>
      </div>

      {/* Enable */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
        padding: "14px 18px", background: "#f9fafb", borderRadius: 12, border: "1.5px solid #e5e7eb",
      }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Zapier Automation</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Trigger Zaps from Voxora events</div>
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
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Zap Label</label>
        <input
          className="workspace-input"
          placeholder="Voxora Zap"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Webhook URL</label>
        <input
          className="workspace-input"
          type="password"
          placeholder="https://hooks.zapier.com/hooks/catch/…"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
        />

        <div style={{ display: "flex", gap: 12 }}>
          <button className="workspace-btn" onClick={testWebhook} disabled={testing} style={{ background: "#ff4a00" }}>
            {testing ? "Sending…" : "🧪 Test Webhook"}
          </button>
          <button className="workspace-btn" onClick={save}>💾 Save Integration</button>
        </div>
      </div>

      {/* Zap ideas */}
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: "28px 0 12px" }}>💡 Automation Ideas</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {ZAP_IDEAS.map((idea, i) => (
          <div key={i} style={{
            padding: "12px 16px", background: "#fff7ed", borderRadius: 10,
            border: "1.5px solid #fed7aa", fontSize: 13, color: "#9a3412",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>⚡</span> {idea}
          </div>
        ))}
      </div>

      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#374151" }}>ℹ️ Setup Instructions</h3>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#6b7280", lineHeight: 1.8 }}>
          <li>Go to <strong>zapier.com</strong> and create a new Zap</li>
          <li>Select <strong>Webhooks by Zapier</strong> as the trigger</li>
          <li>Choose <strong>Catch Hook</strong> and copy the webhook URL</li>
          <li>Paste it above and define your action</li>
        </ol>
      </div>
    </div>
  );
}
