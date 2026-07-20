import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function TermSheetGuide({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [startup, setStartup] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("termSheet");

  const generate = async () => {
    if (!startup.trim()) return;
    const out = await analyze(startup, "termSheet");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "term_sheet_guide_generated",
      title: "Term Sheet Guide Generated",
      description: `Term sheet guide created for "${startup}".`,
      category: "Investor Studio", icon: "📋",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Term Sheet Guide — ${startup}`,
      category: "Term Sheet",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📋 Term sheet guide saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("investorHub")}>← Back to Investor Studio</button>
      <h1>📋 Term Sheet Guide</h1>
      <p className="workspace-subtitle">Understand every clause in plain English — what to accept, what to negotiate, and what to reject.</p>

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
          {isLoading ? "⏳ Explaining…" : "📋 Generate Term Sheet Guide"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Guide</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📋</div>
          <p>Generate a plain-English guide to every critical term sheet clause — before your first term sheet arrives.</p>
        </div>
      )}
    </div>
  );
}
