import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface BusinessModelCanvasProps {
  setWorkspace: (workspace: string) => void;
}

export default function BusinessModelCanvas({
  setWorkspace,
}: BusinessModelCanvasProps) {
  const { saveProject } = useProjects();

  const [idea, setIdea] = useState("");
  const [canvas, setCanvas] = useState("");

  const generateCanvas = () => {
    if (!idea.trim()) return;

    const report = `
📊 BUSINESS MODEL CANVAS

💡 Business Idea
${idea}

🎯 Value Proposition
Deliver a simple and valuable solution that solves an important customer problem.

👥 Customer Segments
• Entrepreneurs
• Startups
• Small Businesses
• Content Creators

📢 Channels
• Social Media
• Website
• Email Marketing
• Partnerships

❤️ Customer Relationships
• Community Support
• AI Assistance
• Personalized Recommendations

💰 Revenue Streams
• Monthly Subscription
• Premium Features
• Enterprise Plans

🛠 Key Activities
• Product Development
• Marketing
• Customer Support

🤝 Key Partners
• Payment Providers
• AI Providers
• Marketing Platforms

📦 Key Resources
• AI Technology
• Development Team
• Customer Data

💸 Cost Structure
• Hosting
• AI APIs
• Marketing
• Operations

✅ Voxora Recommendation
Start with one customer segment and validate demand before expanding.
`;

    setCanvas(report);
  };

  const saveCanvas = () => {
    if (!canvas) return;

    saveProject({
      id: Date.now().toString(),
      title: `Business Model - ${idea}`,
      category: "Business Model",
      createdAt: new Date().toISOString(),
      notes: canvas,
    });

    alert("✅ Business Model saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setWorkspace("dashboard")}>
        ← Back to Dashboard
      </button>

      <h1>📊 Business Model Canvas</h1>

      <p>
        Build a complete business model for your startup idea.
      </p>

      <input
        type="text"
        placeholder="Enter your business idea..."
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

      <button onClick={generateCanvas}>
        📊 Generate Business Model
      </button>

      {canvas && (
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
            {canvas}
          </div>

          <br />

          <button onClick={saveCanvas}>
            💾 Save Business Model
          </button>
        </>
      )}
    </div>
  );
}