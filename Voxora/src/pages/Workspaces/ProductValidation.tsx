import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface ProductValidationProps {
  setWorkspace: (workspace: string) => void;
}

export default function ProductValidation({
  setWorkspace,
}: ProductValidationProps) {
  const { saveProject } = useProjects();

  const [idea, setIdea] = useState("");
  const [report, setReport] = useState("");

  const validateIdea = () => {
    if (!idea.trim()) return;

    const generatedReport = `
🚀 PRODUCT VALIDATION REPORT

💡 Business Idea
${idea}

🎯 Target Customers
• Early adopters
• Small businesses
• Professionals
• Students

😖 Customer Problems
• Existing solutions are expensive.
• Current products are difficult to use.
• Users want faster and simpler experiences.

💰 Revenue Model
• Monthly subscription
• Premium features
• Enterprise plan

🏆 Competitive Advantage
• Better user experience
• AI-powered insights
• Faster workflow

🚀 Recommended MVP
• User accounts
• Dashboard
• Search
• Notifications

📈 Go-To-Market Strategy
• Launch with a small audience.
• Collect customer feedback.
• Improve the product continuously.

⚠️ Risks
• Competition
• Customer acquisition
• Product-market fit

✅ Voxora Recommendation

Validate the problem with real customers before investing heavily in development.
`;

    setReport(generatedReport);
  };

  const saveValidation = () => {
    if (!report) return;

    saveProject({
      id: Date.now().toString(),
      title: `Validation - ${idea}`,
      category: "Product Validation",
      createdAt: new Date().toISOString(),
      notes: report,
    });

    alert("✅ Validation saved successfully!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>📈 Product Validation</h1>

      <p>
        Validate your startup idea before you
        start building.
      </p>

      <input
        type="text"
        placeholder="Enter your startup idea..."
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

      <button onClick={validateIdea}>
        🚀 Validate Idea
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

          <button onClick={saveValidation}>
            💾 Save Validation
          </button>
        </>
      )}
    </div>
  );
}