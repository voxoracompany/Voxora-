// ── V4.8 Dropbox Integration ─────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

export default function IntDropbox({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const { projects } = useProjects();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [folder, setFolder] = useState("/Voxora");
  const [connected] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      addActivity({ type: "export", title: "Dropbox Export", description: `${projects.length} projects exported (simulated).`, category: "Integrations", icon: "📦" });
      showToast("📦 Export to Dropbox simulated. Connect your Dropbox account to enable live sync.");
    }, 1800);
  };

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      showToast("📦 Import from Dropbox simulated. Connect your Dropbox account to enable live sync.");
    }, 1800);
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #1e3a8a, #0061ff)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>📦</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Dropbox Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Sync and backup your Voxora workspace data to Dropbox automatically.
        </p>
      </div>

      {/* Connection status */}
      <div style={{
        padding: "14px 18px", background: connected ? "#f0fdf4" : "#fef9c3",
        border: `1.5px solid ${connected ? "#bbf7d0" : "#fde68a"}`,
        borderRadius: 12, marginBottom: 24, display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>{connected ? "✅" : "⚠️"}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
            {connected ? "Connected to Dropbox" : "Not Connected"}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {connected ? "Dropbox is linked and ready to sync." : "Connect your Dropbox account to enable cloud backup."}
          </div>
        </div>
        <button className="workspace-btn" style={{ marginLeft: "auto", fontSize: 13, padding: "8px 16px", background: "#0061ff" }}
          onClick={() => showToast("Dropbox OAuth flow would open here. Configure your Dropbox App credentials to enable.")}>
          {connected ? "Reconnect" : "🔗 Connect Dropbox"}
        </button>
      </div>

      <div className="workspace-form" style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Dropbox Folder Path</label>
        <input
          className="workspace-input"
          value={folder}
          onChange={e => setFolder(e.target.value)}
          placeholder="/Voxora"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
          padding: "24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📤</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>Export to Dropbox</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
            Back up all {projects.length} projects to Dropbox.
          </p>
          <button className="workspace-btn" style={{ width: "100%", fontSize: 13, background: "#0061ff" }}
            onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "📤 Export Now"}
          </button>
        </div>
        <div style={{
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
          padding: "24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📥</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>Import from Dropbox</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
            Restore a Voxora backup from your Dropbox.
          </p>
          <button className="workspace-btn" style={{ width: "100%", fontSize: 13, background: "#059669" }}
            onClick={handleImport} disabled={importing}>
            {importing ? "Importing…" : "📥 Import Now"}
          </button>
        </div>
      </div>

      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
          <strong>Note:</strong> Live Dropbox sync requires a Dropbox app with Files permission.
          Export/import currently runs in simulation mode. Configure your Dropbox App key in Integration Settings to enable real sync.
        </p>
      </div>
    </div>
  );
}
