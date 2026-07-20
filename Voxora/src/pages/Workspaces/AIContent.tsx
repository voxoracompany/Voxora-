import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

const AIContent = ({ setWorkspace }: { setWorkspace: (workspace: string) => void }) => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const { brainstorm, isLoading, isDemoMode } = useAI("content");

  const generateIdeas = async () => {
    if (!topic.trim()) return;
    const output = await brainstorm(topic);
    if (!output) return;
    setResult(output);
    addActivity({
      type: "ai_content_generated",
      title: "AI Content Ideas Generated",
      description: `Generated content ideas for topic: "${topic}".`,
      category: "AI", icon: "✍️",
    });
  };

  const saveIdeas = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `AI Content Ideas — ${topic}`,
      category: "AI Content",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("💾 Content ideas saved to projects!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>✍️ AI Content Ideas</h1>
      <p className="workspace-subtitle">Generate creative content concepts with Voxora AI.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your topic (e.g. productivity, crypto, fitness)..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateIdeas()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generateIdeas} disabled={!topic.trim() || isLoading}>
          {isLoading ? "⏳ Generating…" : "✨ Generate Ideas"}
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
          <div className="workspace-empty-icon">✍️</div>
          <p>Enter a topic above and generate instant AI content ideas.</p>
        </div>
      )}
    </div>
  );
};

export default AIContent;
