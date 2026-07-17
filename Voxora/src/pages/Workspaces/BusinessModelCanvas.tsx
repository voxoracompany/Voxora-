import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function BusinessModelCanvas({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");
  const [canvas, setCanvas] = useState("");

  const generateCanvas = () => {
    if (!idea.trim()) return;
    const report = `📊 BUSINESS MODEL CANVAS — ${idea}

🎯 VALUE PROPOSITION
Deliver a simple, powerful solution that solves a critical customer problem faster and cheaper than alternatives.

👥 CUSTOMER SEGMENTS
• Early-stage entrepreneurs and solo founders
• Small and medium businesses (SMB)
• Content creators and digital marketers
• Innovation teams at larger companies

📢 CHANNELS
• Organic social media (LinkedIn, X, TikTok)
• SEO-driven content marketing
• Product-led growth (free tier → paid)
• Partnership and affiliate programs

❤️ CUSTOMER RELATIONSHIPS
• Self-serve onboarding (under 5 minutes)
• In-app AI assistance
• Community forum and knowledge base
• Personalized upgrade recommendations

💰 REVENUE STREAMS
• Monthly SaaS subscription ($29–$99/month)
• Annual plans (20% discount)
• Enterprise custom pricing
• API access for developers

🛠 KEY ACTIVITIES
• Product development and AI integration
• Content marketing and SEO
• Customer success and support
• Partnership development

🤝 KEY PARTNERS
• AI API providers (OpenAI, Anthropic)
• Payment processors (Stripe)
• Cloud infrastructure (AWS, Vercel)
• Distribution partners

📦 KEY RESOURCES
• AI technology and proprietary models
• Engineering and product team
• Customer data and usage insights

💸 COST STRUCTURE
• Cloud hosting and infrastructure
• AI API usage costs
• Marketing and paid acquisition
• Team salaries and operations

✅ VOXORA RECOMMENDATION
Start with one customer segment and validate demand before expanding. Aim for 10 paying customers before building new features.`;
    setCanvas(report);
    addActivity({
      type: "canvas_generated",
      title: "Business Model Canvas Generated",
      description: `Business model canvas generated for "${idea}".`,
      category: "Research",
      icon: "📊",
    });
  };

  const saveCanvas = () => {
    if (!canvas) return;
    saveProject({
      id: Date.now().toString(),
      title: `Business Model — ${idea}`,
      category: "Business Model",
      createdAt: new Date().toISOString(),
      notes: canvas,
    });
    addActivity({
      type: "canvas_created",
      title: "Business Model Canvas Saved",
      description: `Business model canvas for "${idea}" saved to projects.`,
      category: "Research",
      icon: "📊",
    });
    showToast("📊 Business Model Canvas saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📊 Business Model Canvas</h1>
      <p className="workspace-subtitle">Build a complete business model for your startup idea.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your business idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateCanvas()}
        />
        <button className="workspace-btn" onClick={generateCanvas} disabled={!idea.trim()}>
          📊 Generate Business Model
        </button>
      </div>

      {canvas && (
        <div className="workspace-results">
          <div className="report-box">{canvas}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveCanvas}>
            💾 Save Business Model
          </button>
        </div>
      )}

      {!canvas && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter your business idea above to generate a full Business Model Canvas.</p>
        </div>
      )}
    </div>
  );
}
