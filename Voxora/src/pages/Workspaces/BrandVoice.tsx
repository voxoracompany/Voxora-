import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function BrandVoice({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [brand,  setBrand]  = useState("");
  const [result, setResult] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("brandVoice");

  const generate = async () => {
    if (!brand.trim()) return;
    const out = await analyze(brand, "brandVoice");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "brand_voice_generated",
      title: "Brand Voice Framework Generated",
      description: `Brand voice and messaging created for "${brand}".`,
      category: "Marketing", icon: "🎙️",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Brand Voice — ${brand}`,
      category: "Brand Strategy",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("🎙️ Brand voice framework saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>🎙️ Brand Voice Analyzer</h1>
      <p className="workspace-subtitle">Define your brand personality, tone of voice, taglines, and messaging framework.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your brand name or product..."
          value={brand}
          onChange={e => setBrand(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!brand.trim() || isLoading}>
          {isLoading ? "⏳ Analyzing…" : "🎙️ Define Brand Voice"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Brand Voice</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🎙️</div>
          <p>Enter your brand to generate a complete voice, tone, messaging, and tagline framework.</p>
        </div>
      )}
    </div>
  );
}
