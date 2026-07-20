// ── V4.8 Notion Integration ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

export default function IntNotion({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const { projects } = useProjects();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem("voxora-notion-key-hint") || "");
  const [workspace, setWorkspaceId] = useState(() => localStorage.getItem("voxora-notion-workspace") || "");
  const [exporting, setExporting] = useState(false);

  const save = () => {
    if (!apiKey.trim()) { showToast("Enter your Notion integration token.", "error"); return; }
    localStorage.setItem("voxora-notion-key-hint", apiKey.slice(0, 8) + "…");
    localStorage.setItem("voxora-notion-workspace", workspace);
    addActivity({ type: "integration_saved", title: "Notion Integration Saved", description: "Notion workspace connected.", category: "Integrations", icon: "📄" });
    showToast("✅ Notion integration saved!");
  };

  const exportPages = () => {
    if (!apiKey.trim()) { showToast("Save your Notion token first.", "error"); return; }
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      addActivity({ type: "export", title: "Notion Export", description: `${projects.length} projects exported to Notion (simulated).`, category: "Integrations", icon: "📄" });
      showToast("📄 Pages exported to Notion (simulated).");
    }, 2000);
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #1c1c1c, #4b4b4b)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>📄</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Notion Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Connect your Notion workspace and export Voxora projects as Notion pages.
        </p>
      </div>

      <div className="workspace-form">
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
          Integration Token
          <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>(stored locally)</span>
        </label>
        <input
          className="workspace-input"
          type="password"
          placeholder="secret_…"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Workspace ID (optional)</label>
        <input
          className="workspace-input"
          placeholder="your-workspace-id"
          value={workspace}
          onChange={e => setWorkspaceId(e.target.value)}
        />

        <button className="workspace-btn" onClick={save}>
          💾 Save Integration
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, marginTop: 24 }}>
        <div style={{
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
          padding: "24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🏠</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>Workspace</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
            View your connected Notion workspace and databases.
          </p>
          <button className="workspace-btn" style={{ width: "100%", fontSize: 13, background: "#374151" }}
            onClick={() => showToast("Notion workspace view requires a live integration token.")}>
            🏠 Open Workspace
          </button>
        </div>
        <div style={{
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
          padding: "24px 20px", textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📤</div>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>Export Pages</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>
            Export {projects.length} projects as Notion pages.
          </p>
          <button className="workspace-btn" style={{ width: "100%", fontSize: 13 }}
            onClick={exportPages} disabled={exporting}>
            {exporting ? "Exporting…" : "📤 Export to Notion"}
          </button>
        </div>
      </div>

      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 20px" }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#374151" }}>ℹ️ Setup Instructions</h3>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#6b7280", lineHeight: 1.8 }}>
          <li>Go to <strong>notion.so/my-integrations</strong></li>
          <li>Create a new integration and copy the <strong>Internal Integration Token</strong></li>
          <li>Share your Notion database with the integration</li>
          <li>Paste the token above and save</li>
        </ol>
      </div>
    </div>
  );
}
