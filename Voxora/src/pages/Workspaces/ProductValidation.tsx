import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function ProductValidation({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [idea, setIdea]     = useState("");
  const [report, setReport] = useState("");
  const { validate, isLoading, isDemoMode } = useAI("validation");

  const generateValidation = async () => {
    if (!idea.trim()) return;
    const output = await validate(idea);
    if (!output) return;
    setReport(output);
    addActivity({
      type: "validation_generated",
      title: "Product Validation Generated",
      description: `Validation framework generated for "${idea}".`,
      category: "Research", icon: "📈",
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

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateValidation()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateValidation} disabled={!idea.trim() || isLoading}>
          {isLoading ? "⏳ Validating…" : "📈 Validate Idea"}
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

      {!report && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📈</div>
          <p>Enter your idea above to generate a full product validation framework.</p>
        </div>
      )}
    </div>
  );
}
