import { useActivity } from "../../context/ActivityContext";
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function CompetitorAnalysis({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");
  const [analysis, setAnalysis] = useState("");

  const generateAnalysis = () => {
    if (!idea.trim()) return;
    const report = `🏆 COMPETITOR ANALYSIS — ${idea}

🎯 DIRECT COMPETITORS
• Established Player A — strong brand, high pricing
• Player B — good UX, limited features
• Player C — wide feature set, poor support

✅ COMPETITOR STRENGTHS
• Strong brand recognition
• Large existing customer base
• Well-funded marketing budgets

❌ COMPETITOR WEAKNESSES
• Expensive pricing tiers
• Complex onboarding experience
• Poor customer support response times
• Slow product iteration cycles

🚀 YOUR OPPORTUNITIES
• Simpler, more intuitive user experience
• AI-native workflow automation
• Competitive pricing (30-50% lower)
• Faster support response times
• Niche focus outperforming generalist tools

⚠️ THREATS TO MONITOR
• New market entrants with VC funding
• Feature copying by large incumbents
• Customer switching costs are low in SaaS
• Rapid technology shifts in AI

⭐ VOXORA RECOMMENDATION
Differentiate by solving one customer problem dramatically better than everyone else. Avoid competing on features — compete on outcomes and speed to value.`;
    setAnalysis(report);
    addActivity({
      type: "competitor_generated",
      title: "Competitor Analysis Generated",
      description: `Competitor analysis generated for "${idea}".`,
      category: "Research",
      icon: "🏆",
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
      category: "Research",
      icon: "🏆",
    });
    showToast("🏆 Competitor Analysis saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🏆 Competitor Analysis</h1>
      <p className="workspace-subtitle">Analyze competitors before building your product.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateAnalysis()}
        />
        <button className="workspace-btn" onClick={generateAnalysis} disabled={!idea.trim()}>
          🔍 Analyze Competitors
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

      {!analysis && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🏆</div>
          <p>Enter your idea above to generate a comprehensive competitor analysis.</p>
        </div>
      )}
    </div>
  );
}
