import { useActivity } from "../../context/ActivityContext";
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface CompetitorAnalysisProps {
  setWorkspace: (workspace: string) => void;
}

export default function CompetitorAnalysis({
  setWorkspace,
}: CompetitorAnalysisProps) {
    const { saveProject } = useProjects();
    const { addActivity } = useActivity();
  
  const [idea, setIdea] = useState("");
  
  const [analysis, setAnalysis] = useState("");

  const generateAnalysis = () => {
    if (!idea.trim()) return;

    const report = `
🏆 COMPETITOR ANALYSIS

💡 Product
${idea}

🎯 Direct Competitors
• Competitor A
• Competitor B
• Competitor C

✅ Strengths
• Strong brand
• Large customer base
• Good marketing

❌ Weaknesses
• Expensive pricing
• Poor customer support
• Complicated onboarding

🚀 Opportunities
• Simpler user experience
• AI automation
• Lower pricing
• Faster customer support

⚠ Threats
• New market entrants
• Rapid technology changes
• Customer switching

⭐ Voxora Recommendation

Differentiate by solving one customer problem better than everyone else instead of copying competitors.
`;

    setAnalysis(report);
  };

  const saveAnalysis = () => {
    if (!analysis) return;

    saveProject({
      id: Date.now().toString(),
      title: `Competitor Analysis - ${idea}`,
      category: "Competitor Analysis",
      createdAt: new Date().toISOString(),
      notes: analysis,
    });

    addActivity(
  `📊 Business Model Canvas created: ${idea}`
);
    
    addActivity(
  `🏆 Competitor Analysis created: ${idea}`
);
    
alert("✅ Competitor Analysis saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>🏆 Competitor Analysis</h1>

      <p>
        Analyze competitors before building your product.
      </p>

      <input
        type="text"
        placeholder="Enter your product or startup idea..."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
        }}
      />

      <br />
      <br />

      <button onClick={generateAnalysis}>
        🔍 Analyze Competitors
      </button>

      {analysis && (
        <>
          <div
            style={{
              marginTop: "30px",
              padding: "20px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              whiteSpace: "pre-wrap",
            }}
          >
            {analysis}
          </div>

          <br />

          <button onClick={saveAnalysis}>
            💾 Save Analysis
          </button>
        </>
      )}
    </div>
  );
}