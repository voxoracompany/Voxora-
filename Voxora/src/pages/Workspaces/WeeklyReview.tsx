import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function WeeklyReview({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [business, setBusiness] = useState("");
  const [context,  setContext]  = useState("");
  const [result,   setResult]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("weeklyReview");

  const generate = async () => {
    if (!business.trim()) return;
    const prompt = `Business: ${business}. Week context: ${context || "general weekly review"}`;
    const out = await analyze(prompt, "weeklyReview");
    if (!out) return;
    setResult(out);
    addActivity({ type: "weekly_review_generated", title: "Weekly Review Generated", description: `Weekly review for "${business}".`, category: "Growth Studio", icon: "📋" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title: `Weekly Review — ${business} — ${new Date().toLocaleDateString()}`, category: "Weekly Review", createdAt: new Date().toISOString(), notes: result });
    showToast("📋 Weekly review saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>📋 Weekly Review</h1>
      <p className="workspace-subtitle">Generate your AI-powered weekly business review with insights and action items.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Business name..." value={business}
          onChange={e => setBusiness(e.target.value)} disabled={isLoading} />
        <textarea className="workspace-textarea" placeholder="What happened this week? Key wins, challenges, metrics... (optional)"
          value={context} onChange={e => setContext(e.target.value)} disabled={isLoading} rows={3} />
        <button className="workspace-btn" onClick={generate} disabled={!business.trim() || isLoading}>
          {isLoading ? "⏳ Generating Review…" : "📋 Generate Weekly Review"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Review</button>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📋</div>
          <p>Enter your business name and an optional weekly context to generate a structured review with AI insights.</p>
        </div>
      )}
    </div>
  );
}
