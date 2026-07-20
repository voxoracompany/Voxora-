import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function EmailCampaign({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [subject, setSubject] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("emailCampaign");

  const generate = async () => {
    if (!subject.trim()) return;
    const out = await analyze(subject, "emailCampaign");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "email_campaign_generated",
      title: "Email Campaign Generated",
      description: `3-email drip campaign created for "${subject}".`,
      category: "Marketing", icon: "📧",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Email Campaign — ${subject}`,
      category: "Email Marketing",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📧 Email campaign saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>📧 Email Campaign Generator</h1>
      <p className="workspace-subtitle">Generate a high-converting 3-email drip campaign with AI.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product, service, or launch topic..."
          value={subject}
          onChange={e => setSubject(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!subject.trim() || isLoading}>
          {isLoading ? "⏳ Writing…" : "📧 Generate Campaign"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Campaign</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📧</div>
          <p>Enter your product or campaign topic to generate a complete 3-email drip sequence.</p>
        </div>
      )}
    </div>
  );
}
