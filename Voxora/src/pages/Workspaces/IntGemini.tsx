// ── V4.8 Google Gemini Integration ───────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

export default function IntGemini({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem("voxora-gemini-key-hint") || "");
  const [model, setModel] = useState(() => localStorage.getItem("voxora-gemini-model") || "gemini-1.5-pro");
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [enabled, setEnabled] = useState(() => localStorage.getItem("voxora-int-gemini-enabled") !== "false");

  const save = () => {
    if (!apiKey.trim()) { showToast("Enter your Gemini API key.", "error"); return; }
    localStorage.setItem("voxora-gemini-key-hint", apiKey.slice(0, 8) + "…");
    localStorage.setItem("voxora-gemini-model", model);
    localStorage.setItem("voxora-int-gemini-enabled", String(enabled));
    addActivity({ type: "integration_saved", title: "Gemini Integration Saved", description: `Model: ${model}`, category: "Integrations", icon: "♊" });
    showToast("✅ Google Gemini integration saved!");
  };

  const testConnection = () => {
    if (!apiKey.trim()) { showToast("Enter an API key first.", "error"); return; }
    setStatus("testing");
    setTimeout(() => {
      setStatus("ok");
      showToast("✅ Gemini connection test successful (simulated).");
    }, 1500);
  };

  const statusBadge: Record<string, { label: string; color: string }> = {
    idle:    { label: "Not tested",   color: "#6b7280" },
    testing: { label: "Testing…",     color: "#f59e0b" },
    ok:      { label: "Connected ✅", color: "#10b981" },
    fail:    { label: "Failed ❌",    color: "#ef4444" },
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("integrationsHub")}>← Back to Integrations</button>

      <div style={{
        background: "linear-gradient(135deg, #1e3a8a, #4285f4)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>♊</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Google Gemini Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Connect Google Gemini to use Gemini Pro and Ultra models inside Voxora's AI workspaces.
        </p>
      </div>

      {/* Status row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
        padding: "14px 18px", background: "#f9fafb", borderRadius: 12, border: "1.5px solid #e5e7eb",
      }}>
        <span style={{ fontSize: 22 }}>📡</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Provider Status</div>
          <div style={{ fontSize: 13, color: statusBadge[status].color, fontWeight: 600 }}>
            {statusBadge[status].label}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Enabled</span>
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
      </div>

      <div className="workspace-form">
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
          API Key
          <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>(stored locally)</span>
        </label>
        <input
          className="workspace-input"
          type="password"
          placeholder="AIza…"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Provider / Model</label>
        <select
          className="workspace-input"
          value={model}
          onChange={e => setModel(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="gemini-1.5-pro">Gemini 1.5 Pro (recommended)</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash (fast)</option>
          <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
          <option value="gemini-ultra">Gemini Ultra</option>
        </select>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="workspace-btn" onClick={testConnection} disabled={status === "testing"}
            style={{ background: "#1d4ed8" }}>
            {status === "testing" ? "Testing…" : "🔌 Test Connection"}
          </button>
          <button className="workspace-btn" onClick={save}>
            💾 Save Integration
          </button>
        </div>
      </div>

      <div style={{
        background: "#eff6ff", border: "1.5px solid #bfdbfe",
        borderRadius: 14, padding: "18px 20px", marginTop: 8,
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#1e40af" }}>ℹ️ How to get your API key</h3>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#1d4ed8", lineHeight: 1.8 }}>
          <li>Go to <strong>aistudio.google.com</strong></li>
          <li>Click <strong>Get API key</strong></li>
          <li>Create a key in a new or existing Google Cloud project</li>
          <li>Copy and paste it above</li>
        </ol>
      </div>
    </div>
  );
}
