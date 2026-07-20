import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function MarketResearch({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [market, setMarket] = useState("");
  const [report, setReport] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("market");

  const generateResearch = async () => {
    if (!market.trim()) return;
    const output = await analyze(market, "market");
    if (!output) return;
    setReport(output);
    addActivity({
      type: "market_research",
      title: "Market Research Generated",
      description: `Market research generated for the "${market}" market.`,
      category: "Research", icon: "📊",
    });
  };

  const saveReport = () => {
    if (!report) return;
    saveProject({
      id: Date.now().toString(),
      title: `Market Research — ${market}`,
      category: "Market Research",
      createdAt: new Date().toISOString(),
      notes: report,
    });
    showToast("📊 Market research saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📊 Market Research</h1>
      <p className="workspace-subtitle">Research your market before building your product.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your market or industry..."
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateResearch()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateResearch} disabled={!market.trim() || isLoading}>
          {isLoading ? "⏳ Researching…" : "📊 Generate Market Research"}
        </button>
      </div>

      {report && (
        <div className="workspace-results">
          <div className="report-box">{report}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveReport}>
            💾 Save Research
          </button>
        </div>
      )}

      {!report && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter a market or industry above to generate a comprehensive research report.</p>
        </div>
      )}
    </div>
  );
}
