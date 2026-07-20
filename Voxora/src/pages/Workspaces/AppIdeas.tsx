import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

const AppIdeas = ({ setWorkspace }: { setWorkspace: (workspace: string) => void }) => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const { analyze, isLoading, isDemoMode } = useAI("apps");

  const generateIdeas = async () => {
    if (!topic.trim()) return;
    const output = await analyze(topic, "apps");
    if (!output) return;
    setResult(output);
    addActivity({
      type: "app_ideas_generated",
      title: "App Ideas Generated",
      description: `Generated app ideas for: "${topic}".`,
      category: "AI", icon: "💡",
    });
  };

  const saveIdeas = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `App Ideas — ${topic}`,
      category: "App Ideas",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("💾 App ideas saved to projects!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>💡 App Ideas</h1>
      <p className="workspace-subtitle">Discover and create new app concepts with Voxora AI.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter a problem space or market (e.g. remote work, fitness, finance)..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateIdeas()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateIdeas} disabled={!topic.trim() || isLoading}>
          {isLoading ? "⏳ Generating…" : "💡 Generate App Ideas"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveIdeas}>
            💾 Save Ideas
          </button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">💡</div>
          <p>Enter a problem space above to generate app concepts.</p>
        </div>
      )}
    </div>
  );
};

export default AppIdeas;
