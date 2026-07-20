import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function MonthlyGrowthReport({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [business, setBusiness] = useState("");
  const [metrics,  setMetrics]  = useState("");
  const [result,   setResult]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("monthlyGrowthReport");

  const generate = async () => {
    if (!business.trim()) return;
    const prompt = `Business: ${business}. Key metrics this month: ${metrics || "general monthly review"}`;
    const out = await analyze(prompt, "monthlyGrowthReport");
    if (!out) return;
    setResult(out);
    addActivity({ type: "monthly_report_generated", title: "Monthly Growth Report Generated", description: `Monthly report for "${business}".`, category: "Growth Studio", icon: "📈" });
  };

  const save = () => {
    if (!result) return;
    const month = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    saveProject({ id: Date.now().toString(), title: `Monthly Report — ${business} — ${month}`, category: "Monthly Report", createdAt: new Date().toISOString(), notes: result });
    showToast("📈 Monthly report saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>📈 Monthly Growth Report</h1>
      <p className="workspace-subtitle">Generate a structured monthly growth report with AI-powered analysis and recommendations.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Business name..." value={business}
          onChange={e => setBusiness(e.target.value)} disabled={isLoading} />
        <textarea className="workspace-textarea"
          placeholder="Key metrics and highlights this month (e.g. revenue, customers, major wins, challenges)..."
          value={metrics} onChange={e => setMetrics(e.target.value)} disabled={isLoading} rows={4} />
        <button className="workspace-btn" onClick={generate} disabled={!business.trim() || isLoading}>
          {isLoading ? "⏳ Generating Report…" : "📈 Generate Monthly Report"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Report</button>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📈</div>
          <p>Enter your business name and monthly metrics to generate a complete growth report with analysis and next-month recommendations.</p>
        </div>
      )}
    </div>
  );
}
