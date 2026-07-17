import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function ProductValidation({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [idea, setIdea] = useState("");
  const [report, setReport] = useState("");

  const generateValidation = () => {
    if (!idea.trim()) return;
    const result = `📈 PRODUCT VALIDATION — ${idea}

✅ VALIDATION CHECKLIST

1. Problem Clarity
   → Does the problem exist for a real group of people? YES
   → Can customers articulate the pain clearly? LIKELY

2. Market Demand
   → Are people searching for solutions? YES
   → Are they paying for alternatives? LIKELY

3. Willingness to Pay
   → Would customers pay for a better solution? HIGH PROBABILITY
   → Estimated price sensitivity: $29–$99/month range

4. Competition Check
   → Competing solutions exist (validates market)
   → No dominant AI-native player in this niche
   → Differentiation opportunity: AI automation + simplicity

5. Early Adopter Identification
   → Target: Early-stage founders, product managers, solopreneurs
   → Where they live: LinkedIn, Reddit, X, indie hacker communities

📋 VALIDATION ACTION PLAN

Week 1-2: Problem Interviews
• Talk to 20 potential customers
• Ask: "How do you currently solve this problem?"
• Do NOT pitch your product yet

Week 3-4: Landing Page Test
• Build a simple landing page
• Describe the solution clearly
• Add email capture + CTA button
• Run a small paid ad ($100–$200)

Week 5-6: Pre-sell or Waitlist
• Offer early access pricing
• Target: 10 paying customers or 100 waitlist signups
• If achieved → BUILD. If not → ITERATE.

💡 VOXORA VERDICT
${idea} shows early-stage validation potential. Run customer interviews before writing any code.`;
    setReport(result);
    addActivity({
      type: "validation_generated",
      title: "Product Validation Generated",
      description: `Validation framework generated for "${idea}".`,
      category: "Research",
      icon: "📈",
    });
  };

  const saveReport = () => {
    if (!report) return;
    saveProject({
      id: Date.now().toString(),
      title: `Product Validation — ${idea}`,
      category: "Product Validation",
      createdAt: new Date().toISOString(),
      notes: report,
    });
    showToast("📈 Product validation saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📈 Product Validation</h1>
      <p className="workspace-subtitle">Validate your startup or product idea before building.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateValidation()}
        />
        <button className="workspace-btn" onClick={generateValidation} disabled={!idea.trim()}>
          📈 Validate Idea
        </button>
      </div>

      {report && (
        <div className="workspace-results">
          <div className="report-box">{report}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveReport}>
            💾 Save Validation
          </button>
        </div>
      )}

      {!report && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📈</div>
          <p>Enter your idea above to generate a full product validation framework.</p>
        </div>
      )}
    </div>
  );
}
