import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function GrowthPlanner({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [business, setBusiness] = useState("");
  const [goal,     setGoal]     = useState("");
  const [result,   setResult]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("growthPlanner");

  const generate = async () => {
    if (!business.trim()) return;
    const prompt = `Business: ${business}. Growth goal: ${goal || "general growth"}`;
    const out = await analyze(prompt, "growthPlanner");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "growth_plan_generated",
      title: "Growth Plan Generated",
      description: `Growth plan created for "${business}".`,
      category: "Growth Studio", icon: "🌱",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Growth Plan — ${business}`,
      category: "Growth Plan",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("🌱 Growth plan saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🌱 Business Growth Planner</h1>
      <p className="workspace-subtitle">Define growth goals, quarterly objectives, monthly milestones, and a weekly action plan.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your business or product name..."
          value={business}
          onChange={e => setBusiness(e.target.value)}
          disabled={isLoading}
        />
        <input
          className="workspace-input"
          placeholder="Primary growth goal (e.g. reach $10k MRR in 90 days)..."
          value={goal}
          onChange={e => setGoal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!business.trim() || isLoading}>
          {isLoading ? "⏳ Building Plan…" : "🌱 Generate Growth Plan"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Growth Plan</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🌱</div>
          <p>Enter your business and growth goal to generate a complete plan with quarterly objectives, monthly milestones, and weekly actions.</p>
        </div>
      )}
    </div>
  );
}
