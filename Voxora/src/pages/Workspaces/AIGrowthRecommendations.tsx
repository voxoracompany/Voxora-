import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function AIGrowthRecommendations({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [business, setBusiness] = useState("");
  const [stage,    setStage]    = useState("early-stage");
  const [result,   setResult]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("aiGrowthRecommendations");

  const generate = async () => {
    if (!business.trim()) return;
    const prompt = `Business: ${business}. Stage: ${stage}. Provide actionable growth recommendations.`;
    const out = await analyze(prompt, "aiGrowthRecommendations");
    if (!out) return;
    setResult(out);
    addActivity({ type: "growth_recommendations_generated", title: "AI Growth Recommendations", description: `Recommendations for "${business}".`, category: "Growth Studio", icon: "🤖" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title: `AI Growth Recommendations — ${business}`, category: "Growth Recommendations", createdAt: new Date().toISOString(), notes: result });
    showToast("🤖 Recommendations saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🤖 AI Growth Recommendations</h1>
      <p className="workspace-subtitle">Get AI-powered, actionable recommendations to accelerate your business growth.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Describe your business, product, and current challenges..."
          value={business} onChange={e => setBusiness(e.target.value)} disabled={isLoading} />
        <select className="workspace-input" value={stage} onChange={e => setStage(e.target.value)} disabled={isLoading}>
          <option value="pre-launch">Pre-Launch</option>
          <option value="early-stage">Early Stage (0–$10k MRR)</option>
          <option value="growth">Growth ($10k–$100k MRR)</option>
          <option value="scale">Scale ($100k+ MRR)</option>
        </select>
        <button className="workspace-btn" onClick={generate} disabled={!business.trim() || isLoading}>
          {isLoading ? "⏳ Generating Recommendations…" : "🤖 Get AI Recommendations"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Recommendations</button>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🤖</div>
          <p>Describe your business and select your growth stage to get personalized AI recommendations for accelerating growth.</p>
        </div>
      )}
    </div>
  );
}
