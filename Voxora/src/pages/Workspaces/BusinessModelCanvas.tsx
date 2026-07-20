import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function BusinessModelCanvas({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [idea, setIdea]     = useState("");
  const [canvas, setCanvas] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("business");

  const generateCanvas = async () => {
    if (!idea.trim()) return;
    const output = await analyze(idea, "business");
    if (!output) return;
    setCanvas(output);
    addActivity({
      type: "canvas_generated",
      title: "Business Model Canvas Generated",
      description: `Business model canvas generated for "${idea}".`,
      category: "Research", icon: "📊",
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
      category: "Research", icon: "📊",
    });
    showToast("📊 Business Model Canvas saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📊 Business Model Canvas</h1>
      <p className="workspace-subtitle">Build a complete business model for your startup idea.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your business idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateCanvas()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateCanvas} disabled={!idea.trim() || isLoading}>
          {isLoading ? "⏳ Building…" : "📊 Generate Business Model"}
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

      {!canvas && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter your business idea above to generate a full Business Model Canvas.</p>
        </div>
      )}
    </div>
  );
}
