// ── V5.7 Google Calendar Integration ─────────────────────────────────────────
import { useState } from "react";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

export default function IntGoogleCal({ setWorkspace }: Props) {
  const [status, setStatus] = useState(IntegrationService.getStatus("googleCal"));
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const handleConnect = async () => {
    setLoading(true);
    await IntegrationService.connect("googleCal");
    setStatus(IntegrationService.getStatus("googleCal"));
    setLoading(false);
    showToast("Google Calendar connected (Demo Mode).");
  };

  const handleDisconnect = async () => {
    await IntegrationService.disconnect("googleCal");
    setStatus(IntegrationService.getStatus("googleCal"));
    showToast("Google Calendar disconnected.");
  };

  const handleSync = async () => {
    setLoading(true);
    await IntegrationService.sync("googleCal");
    setStatus(IntegrationService.getStatus("googleCal"));
    setLoading(false);
    showToast("Google Calendar synced.");
  };

  const isConnected = status === "connected";

  return (
    <div className="workspace-container" style={{ maxWidth: 680 }}>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1e293b", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999 }}>{toast}</div>
      )}
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations Hub</button>

      <div style={{ background: "linear-gradient(135deg, #1a73e8, #0d47a1)", borderRadius: 20, padding: "36px 32px", marginBottom: 28, color: "#fff" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>📅</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Google Calendar</h1>
        <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: 15 }}>
          Sync Voxora milestones, deadlines, and project events to your Google Calendar.
        </p>
      </div>

      <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: isConnected ? "#10b981" : "#6b7280", flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: 15 }}>Status: {isConnected ? "Connected" : "Not Connected"}</span>
          {isConnected && <span style={{ fontSize: 11, background: "#d1fae5", color: "#059669", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>✅ Active</span>}
        </div>

        <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#0369a1" }}>
            <strong>Demo Mode:</strong> Simulate connecting without real credentials. Add your Google OAuth client credentials in Integration Settings to go live.
          </p>
        </div>

        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>What gets synced:</h3>
        {["Business milestones → Calendar events", "Project deadlines → Reminders", "Meeting notes → Google Meet links", "Weekly reviews → Recurring blocks"].map(f => (
          <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, fontSize: 13 }}>
            <span>✅</span><span>{f}</span>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          {!isConnected ? (
            <button onClick={handleConnect} disabled={loading} className="workspace-btn" style={{ flex: 1 }}>
              {loading ? "Connecting…" : "Connect Google Calendar"}
            </button>
          ) : (
            <>
              <button onClick={handleSync} disabled={loading} className="workspace-btn" style={{ flex: 1 }}>
                {loading ? "Syncing…" : "Sync Now"}
              </button>
              <button onClick={handleDisconnect} style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #fee2e2", background: "transparent", color: "#ef4444", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
