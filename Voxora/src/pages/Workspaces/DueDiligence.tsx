import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function DueDiligence({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [startup, setStartup] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("dueDiligence");

  const generate = async () => {
    if (!startup.trim()) return;
    const out = await analyze(startup, "dueDiligence");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "due_diligence_generated",
      title: "Due Diligence Checklist Generated",
      description: `Due diligence checklist prepared for "${startup}".`,
      category: "Investor Studio", icon: "✅",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Due Diligence — ${startup}`,
      category: "Due Diligence",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("✅ Due diligence checklist saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("investorHub")}>← Back to Investor Studio</button>
      <h1>✅ Due Diligence Checklist</h1>
      <p className="workspace-subtitle">Prepare everything investors will ask for — before your first meeting.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your startup or company name..."
          value={startup}
          onChange={e => setStartup(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!startup.trim() || isLoading}>
          {isLoading ? "⏳ Building…" : "✅ Generate DD Checklist"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Checklist</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">✅</div>
          <p>Generate a complete investor due diligence checklist across business, team, product, financials, and traction.</p>
        </div>
      )}
    </div>
  );
}
