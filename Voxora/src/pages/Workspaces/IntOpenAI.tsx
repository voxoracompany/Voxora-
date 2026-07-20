// ── V4.8 OpenAI Integration ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

export default function IntOpenAI({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [apiKey, setApiKey] = useState(() => localStorage.getItem("voxora-openai-key-hint") || "");
  const [model, setModel] = useState(() => localStorage.getItem("voxora-openai-model") || "gpt-4o");
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [enabled, setEnabled] = useState(() => localStorage.getItem("voxora-int-openai-enabled") !== "false");

  const save = () => {
    if (!apiKey.trim()) { showToast("Enter your OpenAI API key.", "error"); return; }
    localStorage.setItem("voxora-openai-key-hint", apiKey.slice(0, 8) + "…");
    localStorage.setItem("voxora-openai-model", model);
    localStorage.setItem("voxora-int-openai-enabled", String(enabled));
    addActivity({ type: "integration_saved", title: "OpenAI Integration Saved", description: `Model: ${model}`, category: "Integrations", icon: "🧠" });
    showToast("✅ OpenAI integration saved!");
  };

  const testConnection = () => {
    if (!apiKey.trim()) { showToast("Enter an API key first.", "error"); return; }
    setStatus("testing");
    setTimeout(() => {
      setStatus("ok");
      showToast("✅ OpenAI connection test successful (simulated).");
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
        background: "linear-gradient(135deg, #064e3b, #10a37f)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🧠</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>OpenAI Integration</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.9 }}>
          Connect your OpenAI account to enable GPT-4, GPT-4o, and other models across Voxora.
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
          <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>
            (stored locally — never sent to Voxora servers)
          </span>
        </label>
        <input
          className="workspace-input"
          type="password"
          placeholder="sk-…"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Model</label>
        <select
          className="workspace-input"
          value={model}
          onChange={e => setModel(e.target.value)}
          style={{ cursor: "pointer" }}
        >
          <option value="gpt-4o">GPT-4o (recommended)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>

        <div style={{ display: "flex", gap: 12 }}>
          <button className="workspace-btn" onClick={testConnection} disabled={status === "testing"}
            style={{ background: "#0f766e" }}>
            {status === "testing" ? "Testing…" : "🔌 Test Connection"}
          </button>
          <button className="workspace-btn" onClick={save}>
            💾 Save Integration
          </button>
        </div>
      </div>

      {/* Info panel */}
      <div style={{
        background: "#f0fdf4", border: "1.5px solid #bbf7d0",
        borderRadius: 14, padding: "18px 20px", marginTop: 8,
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#065f46" }}>ℹ️ How to get your API key</h3>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: "#047857", lineHeight: 1.8 }}>
          <li>Go to <strong>platform.openai.com</strong></li>
          <li>Navigate to <strong>API Keys</strong> in your account</li>
          <li>Click <strong>Create new secret key</strong></li>
          <li>Copy and paste it above</li>
        </ol>
      </div>
    </div>
  );
}
