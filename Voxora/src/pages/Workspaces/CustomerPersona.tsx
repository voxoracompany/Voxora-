import "./CustomerPersona.css";
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface CustomerPersonaProps {
  setWorkspace: (workspace: string) => void;
}

export default function CustomerPersona({
  setWorkspace,
}: CustomerPersonaProps) {
  const { saveProject } = useProjects();

  const [idea, setIdea] = useState("");
  const [persona, setPersona] = useState("");

  const generatePersona = () => {
    if (!idea.trim()) return;

    const report = `
👤 CUSTOMER PERSONA

💡 Product Idea
${idea}

👤 Persona Name
Alex Johnson

🎯 Age
25–40

💼 Occupation
Young Professional / Entrepreneur

📍 Location
Urban Areas

🎯 Goals
• Save time
• Increase productivity
• Grow income
• Find simple solutions

😖 Pain Points
• Too many complicated tools
• Limited budget
• Lack of trustworthy solutions
• Poor customer support

💡 Motivations
• Convenience
• Better results
• Affordable pricing
• Ease of use

📱 Preferred Platforms
• LinkedIn
• YouTube
• Instagram
• Google Search

🛒 Buying Behaviour
• Reads reviews before purchasing
• Compares alternatives
• Prefers free trials

✅ Voxora Recommendation

Build your first version around solving one major problem for this customer instead of trying to satisfy everyone.
`;

    setPersona(report);
  };

  const savePersona = () => {
    if (!persona) return;

    saveProject({
      id: Date.now().toString(),
      title: `Customer Persona - ${idea}`,
      category: "Customer Persona",
      createdAt: new Date().toISOString(),
      notes: persona,
    });

    alert("✅ Customer Persona saved!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1 className="persona-title">
  👤 Customer Persona Generator
</h1>

      <p>
        Discover your ideal customer before building your product.
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

      <button onClick={generatePersona}>
        👤 Generate Persona
      </button>

      {persona && (
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
            {persona}
          </div>

          <br />

          <button onClick={savePersona}>
            💾 Save Persona
          </button>
        </>
      )}
    </div>
  );
}