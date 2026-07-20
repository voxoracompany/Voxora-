import { useActivity } from "../../context/ActivityContext";
import { useState }    from "react";
import { useProjects } from "../../context/ProjectContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function CompetitorAnalysis({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [idea, setIdea]         = useState("");
  const [analysis, setAnalysis] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("competitor");

  const generateAnalysis = async () => {
    if (!idea.trim()) return;
    const output = await analyze(idea, "competitor");
    if (!output) return;
    setAnalysis(output);
    addActivity({
      type: "competitor_generated",
      title: "Competitor Analysis Generated",
      description: `Competitor analysis generated for "${idea}".`,
      category: "Research", icon: "🏆",
    });
  };

  const saveAnalysis = () => {
    if (!analysis) return;
    saveProject({
      id: Date.now().toString(),
      title: `Competitor Analysis — ${idea}`,
      category: "Competitor Analysis",
      createdAt: new Date().toISOString(),
      notes: analysis,
    });
    addActivity({
      type: "competitor_completed",
      title: "Competitor Analysis Saved",
      description: `Competitor analysis for "${idea}" saved to projects.`,
      category: "Research", icon: "🏆",
    });
    showToast("🏆 Competitor Analysis saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🏆 Competitor Analysis</h1>
      <p className="workspace-subtitle">Analyze competitors before building your product.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateAnalysis()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateAnalysis} disabled={!idea.trim() || isLoading}>
          {isLoading ? "⏳ Analyzing…" : "🔍 Analyze Competitors"}
        </button>
      </div>

      {analysis && (
        <div className="workspace-results">
          <div className="report-box">{analysis}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveAnalysis}>
            💾 Save Analysis
          </button>
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🏆</div>
          <p>Enter your idea above to generate a comprehensive competitor analysis.</p>
        </div>
      )}
    </div>
  );
}
