import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function GrowthOpportunity({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [business, setBusiness] = useState("");
  const [result,   setResult]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("growthOpportunity");

  const generate = async () => {
    if (!business.trim()) return;
    const out = await analyze(business, "growthOpportunity");
    if (!out) return;
    setResult(out);
    addActivity({ type: "growth_opportunity_found", title: "Growth Opportunities Found", description: `Opportunities identified for "${business}".`, category: "Growth Studio", icon: "🔭" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title: `Growth Opportunities — ${business}`, category: "Growth Opportunity", createdAt: new Date().toISOString(), notes: result });
    showToast("🔭 Opportunities saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🔭 Growth Opportunity Finder</h1>
      <p className="workspace-subtitle">Discover market, product, customer, and revenue growth opportunities for your business.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Describe your business or product..." value={business}
          onChange={e => setBusiness(e.target.value)} onKeyDown={e => e.key === "Enter" && generate()} disabled={isLoading} />
        <button className="workspace-btn" onClick={generate} disabled={!business.trim() || isLoading}>
          {isLoading ? "⏳ Finding Opportunities…" : "🔭 Find Growth Opportunities"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Opportunities</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🔭</div>
          <p>Describe your business to uncover market, product, customer, and revenue growth opportunities.</p>
        </div>
      )}
    </div>
  );
}
