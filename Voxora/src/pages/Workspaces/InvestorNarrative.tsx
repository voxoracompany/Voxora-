import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function InvestorNarrative({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [startup, setStartup] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("investorNarrative");

  const generate = async () => {
    if (!startup.trim()) return;
    const out = await analyze(startup, "investorNarrative");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "investor_narrative_generated",
      title: "Investor Narrative Generated",
      description: `Investor narrative crafted for "${startup}".`,
      category: "Investor Studio", icon: "📖",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Investor Narrative — ${startup}`,
      category: "Investor Narrative",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📖 Investor narrative saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("investorHub")}>← Back to Investor Studio</button>
      <h1>📖 Investor Narrative</h1>
      <p className="workspace-subtitle">Craft the founding story, market insight, vision, and belief statement that makes investors say yes.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your startup name or product..."
          value={startup}
          onChange={e => setStartup(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!startup.trim() || isLoading}>
          {isLoading ? "⏳ Crafting…" : "📖 Build Investor Narrative"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Narrative</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📖</div>
          <p>Enter your startup to craft a compelling investor narrative — the story that comes before the deck.</p>
        </div>
      )}
    </div>
  );
}
