import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";

interface SWOTAnalysisProps {
  setWorkspace: (workspace: string) => void;
}

export default function SWOTAnalysis({
  setWorkspace,
}: SWOTAnalysisProps) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();

  const [idea, setIdea] = useState("");
  const [report, setReport] = useState("");

  const generateSWOT = () => {
    if (!idea.trim()) return;

    const result = `
📋 SWOT ANALYSIS

💡 Product
${idea}

✅ Strengths
• Innovative solution
• AI-powered workflow
• Easy to use
• Scalable business model

⚠ Weaknesses
• Limited brand awareness
• Small initial budget
• Early-stage product

🚀 Opportunities
• Growing AI market
• Remote work trend
• SaaS demand
• Global customer reach

⚡ Threats
• Strong competitors
• Rapid technology changes
• Customer acquisition costs
• Market saturation

💡 Voxora Recommendation

Focus on your strongest competitive advantage and continuously improve based on customer feedback.
`;

    setReport(result);
  };

  const saveSWOT = () => {
    if (!report) return;

    saveProject({
      id: Date.now().toString(),
      title: `SWOT Analysis - ${idea}`,
      category: "SWOT Analysis",
      createdAt: new Date().toISOString(),
      notes: report,
    });

    addActivity(
      `📋 SWOT Analysis created: ${idea}`
    );

    alert("✅ SWOT Analysis saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>📋 SWOT Analysis</h1>

      <p>
        Analyze your business strengths, weaknesses, opportunities and threats.
      </p>

      <input
        type="text"
        placeholder="Enter your startup or product idea..."
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

      <button onClick={generateSWOT}>
        📋 Generate SWOT
      </button>

      {report && (
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
            {report}
          </div>

          <br />

          <button onClick={saveSWOT}>
            💾 Save SWOT Analysis
          </button>
        </>
      )}
    </div>
  );
}