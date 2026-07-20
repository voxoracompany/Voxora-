import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function ContentCalendar({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [topic,  setTopic]  = useState("");
  const [result, setResult] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("contentCalendar");

  const generate = async () => {
    if (!topic.trim()) return;
    const out = await analyze(topic, "contentCalendar");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "content_calendar_generated",
      title: "Content Calendar Generated",
      description: `4-week content calendar created for "${topic}".`,
      category: "Marketing", icon: "📅",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Content Calendar — ${topic}`,
      category: "Content Marketing",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📅 Content calendar saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>📅 Content Calendar</h1>
      <p className="workspace-subtitle">Build a complete 4-week content marketing plan with AI.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your brand, product, or content niche..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!topic.trim() || isLoading}>
          {isLoading ? "⏳ Planning…" : "📅 Build Content Calendar"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Calendar</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📅</div>
          <p>Enter your brand or niche to generate a 4-week content calendar across all channels.</p>
        </div>
      )}
    </div>
  );
}
