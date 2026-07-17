import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function SWOTAnalysis({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");
  const [report, setReport] = useState("");

  const generateSWOT = () => {
    if (!idea.trim()) return;
    const result = `📋 SWOT ANALYSIS — ${idea}

✅ STRENGTHS
• Innovative AI-powered solution
• Scalable business model
• Low operational costs
• Easy to use for non-technical users

⚠️ WEAKNESSES
• Limited brand awareness initially
• Requires early customer education
• Dependent on third-party APIs
• Small initial team capacity

🚀 OPPORTUNITIES
• Rapidly growing AI market
• Remote-first business trend
• Global SaaS demand
• Underserved niche segments

⚡ THREATS
• Established competitors with larger budgets
• Rapid technology changes
• High customer acquisition costs
• Potential market saturation

💡 VOXORA RECOMMENDATION
Focus on your strongest competitive advantage and build in public to gain early traction. Validate with 10 paying customers before scaling.`;
    setReport(result);
    addActivity({
      type: "swot_generated",
      title: "SWOT Analysis Generated",
      description: `SWOT analysis generated for "${idea}".`,
      category: "Research",
      icon: "📋",
    });
  };

  const saveSWOT = () => {
    if (!report) return;
    saveProject({
      id: Date.now().toString(),
      title: `SWOT Analysis — ${idea}`,
      category: "SWOT Analysis",
      createdAt: new Date().toISOString(),
      notes: report,
    });
    addActivity({
      type: "swot_completed",
      title: "SWOT Analysis Saved",
      description: `SWOT analysis for "${idea}" saved to projects.`,
      category: "Research",
      icon: "📋",
    });
    showToast("📋 SWOT Analysis saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📋 SWOT Analysis</h1>
      <p className="workspace-subtitle">Analyze strengths, weaknesses, opportunities, and threats.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your startup or product idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateSWOT()}
        />
        <button className="workspace-btn" onClick={generateSWOT} disabled={!idea.trim()}>
          📋 Generate SWOT
        </button>
      </div>

      {report && (
        <div className="workspace-results">
          <div className="report-box">{report}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveSWOT}>
            💾 Save SWOT Analysis
          </button>
        </div>
      )}

      {!report && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📋</div>
          <p>Enter your idea above to generate a full SWOT analysis.</p>
        </div>
      )}
    </div>
  );
}
