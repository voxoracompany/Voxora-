import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function CustomerPersona({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [product, setProduct] = useState("");
  const [persona, setPersona] = useState("");

  const generatePersona = () => {
    if (!product.trim()) return;
    const result = `👤 CUSTOMER PERSONA — ${product}

📋 PERSONA PROFILE

Name: Alex Chen
Age: 28–38
Role: Founder / Product Manager / Indie Hacker
Location: Urban, tech-forward city or remote
Income: $60,000–$150,000/year

🎯 GOALS & MOTIVATIONS
• Build and launch a product faster
• Validate ideas without wasting months
• Grow a sustainable, profitable business
• Achieve financial independence through entrepreneurship

😤 PAIN POINTS
• Too many tools, not enough integration
• Analysis paralysis — too much data, too little insight
• Spending time on admin instead of building
• Validating ideas is slow and expensive
• Hard to get honest customer feedback

📱 BEHAVIOR & PREFERENCES
• Active on LinkedIn, Twitter/X, and indie hacker forums
• Reads newsletters, listens to startup podcasts
• Prefers self-serve SaaS (hates sales calls)
• Will pay for tools that clearly save time
• Trusts peer recommendations over ads

💬 WHAT THEY SAY
"I need to move fast. I can't afford to build the wrong thing."
"I want tools that think like a founder, not an enterprise."
"If I can't get value in the first 5 minutes, I'm gone."

💡 HOW ${product.toUpperCase()} HELPS ALEX
• Instant AI-generated insights (no setup required)
• Clear action plans, not just data dumps
• Saves 5–10 hours per week on research and strategy`;
    setPersona(result);
    addActivity({
      type: "persona_generated",
      title: "Customer Persona Created",
      description: `Customer persona generated for "${product}".`,
      category: "Research",
      icon: "👤",
    });
  };

  const savePersona = () => {
    if (!persona) return;
    saveProject({
      id: Date.now().toString(),
      title: `Customer Persona — ${product}`,
      category: "Customer Research",
      createdAt: new Date().toISOString(),
      notes: persona,
    });
    showToast("👤 Customer persona saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>👤 Customer Persona</h1>
      <p className="workspace-subtitle">Generate your ideal customer profile.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or service..."
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generatePersona()}
        />
        <button className="workspace-btn" onClick={generatePersona} disabled={!product.trim()}>
          👤 Generate Persona
        </button>
      </div>

      {persona && (
        <div className="workspace-results">
          <div className="report-box">{persona}</div>
          <button className="workspace-btn workspace-save-btn" onClick={savePersona}>
            💾 Save Persona
          </button>
        </div>
      )}

      {!persona && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">👤</div>
          <p>Enter your product above to generate a detailed customer persona.</p>
        </div>
      )}
    </div>
  );
}
