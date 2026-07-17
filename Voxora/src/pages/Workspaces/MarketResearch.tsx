import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function MarketResearch({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [market, setMarket] = useState("");
  const [report, setReport] = useState("");

  const generateResearch = () => {
    if (!market.trim()) return;
    const result = `📊 MARKET RESEARCH — ${market}

📈 MARKET SIZE & GROWTH
• Total Addressable Market (TAM): Large and expanding globally
• Growing at an estimated 15–25% CAGR
• Driven by digital transformation and AI adoption

🎯 TARGET SEGMENTS
• Small businesses and startups (high volume, lower ARPU)
• Mid-market companies (best growth segment)
• Enterprise clients (high ARPU, long sales cycle)

📊 KEY MARKET TRENDS
• Increasing demand for AI-powered automation
• Shift from manual workflows to intelligent systems
• Growing preference for no-code / low-code solutions
• Remote-first business operations becoming standard

🏆 COMPETITIVE LANDSCAPE
• 3–5 established players with significant market share
• Many underfunded niche competitors
• Consolidation happening through M&A
• Whitespace exists for AI-native vertical solutions

⚡ MARKET OPPORTUNITIES
• Underserved SMB segment with limited AI tools
• International markets with low competition
• Workflow automation for non-technical users
• Integration with existing business software

⚠️ MARKET RISKS
• High customer acquisition costs
• Long enterprise sales cycles
• Fast-moving technology landscape
• Regulatory changes affecting AI usage

💡 VOXORA RECOMMENDATION
Focus on the SMB segment initially — they adopt fast, pay reliably, and generate strong word-of-mouth when delighted.`;
    setReport(result);
    addActivity({
      type: "market_research",
      title: "Market Research Generated",
      description: `Market research generated for the "${market}" market.`,
      category: "Research",
      icon: "📊",
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

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your market or industry..."
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateResearch()}
        />
        <button className="workspace-btn" onClick={generateResearch} disabled={!market.trim()}>
          📊 Generate Market Research
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

      {!report && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter a market or industry above to generate a comprehensive research report.</p>
        </div>
      )}
    </div>
  );
}
