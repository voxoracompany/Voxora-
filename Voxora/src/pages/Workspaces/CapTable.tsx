import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function CapTable({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [startup, setStartup] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("capTable");

  const generate = async () => {
    if (!startup.trim()) return;
    const out = await analyze(startup, "capTable");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "cap_table_generated",
      title: "Cap Table Plan Generated",
      description: `Cap table structure planned for "${startup}".`,
      category: "Investor Studio", icon: "📊",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Cap Table Plan — ${startup}`,
      category: "Cap Table",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📊 Cap table plan saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("investorHub")}>← Back to Investor Studio</button>
      <h1>📊 Cap Table Planner</h1>
      <p className="workspace-subtitle">Model founder dilution, ESOP structure, and founder payout at different exit sizes.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your startup name or company..."
          value={startup}
          onChange={e => setStartup(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!startup.trim() || isLoading}>
          {isLoading ? "⏳ Modeling…" : "📊 Plan Cap Table"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Cap Table Plan</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter your startup to model equity splits, ESOP, dilution scenarios, and founder payout at exit.</p>
        </div>
      )}
    </div>
  );
}
