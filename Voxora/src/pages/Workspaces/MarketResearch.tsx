import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";

interface MarketResearchProps {
  setWorkspace: (workspace: string) => void;
}

export default function MarketResearch({
  setWorkspace,
}: MarketResearchProps) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();

  const [idea, setIdea] = useState("");
  const [report, setReport] = useState("");

  const generateResearch = () => {
    if (!idea.trim()) return;

    const result = `
📊 MARKET RESEARCH REPORT

💡 Product
${idea}

🌍 Target Market
• Entrepreneurs
• Startups
• Small Businesses
• Freelancers

📈 Market Demand
Growing demand for AI-powered productivity and business tools.

🎯 Target Audience
• Ages 18–45
• Tech-savvy users
• Business owners
• Digital creators

🔥 Market Trends
• Artificial Intelligence
• SaaS Products
• Automation
• Remote Work
• Creator Economy

⚠ Challenges
• Strong competition
• Customer trust
• User acquisition
• Pricing pressure

🚀 Opportunities
• AI-first experiences
• Emerging markets
• Mobile accessibility
• Personalized recommendations

✅ Voxora Recommendation

Focus on solving one important customer problem better than competitors before expanding features.
`;

    setReport(result);
  };

  const saveResearch = () => {
    if (!report) return;

    saveProject({
      id: Date.now().toString(),
      title: `Market Research - ${idea}`,
      category: "Market Research",
      createdAt: new Date().toISOString(),
      notes: report,
    });

    addActivity(
      `📊 Market Research created: ${idea}`
    );

    alert("✅ Market Research saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>📊 Market Research</h1>

      <p>
        Research your market before building your product.
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

      <button onClick={generateResearch}>
        📊 Generate Market Research
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

          <button onClick={saveResearch}>
            💾 Save Research
          </button>
        </>
      )}
    </div>
  );
}