import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function StartupIdeas({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const generateIdeas = () => {
    if (!topic.trim()) return;
    setIdeas([
      `Startup solving ${topic} challenges with AI automation`,
      `Digital platform helping businesses streamline ${topic}`,
      `AI-powered SaaS company focused on ${topic} analytics`,
      `Marketplace connecting ${topic} professionals with clients`,
      `B2B tool that reduces ${topic} costs by 50%`,
    ]);
    addActivity({
      type: "startup_ideas_generated",
      title: "Startup Ideas Generated",
      description: `Generated 5 startup concepts for "${topic}".`,
      category: "AI",
      icon: "🚀",
    });
  };

  const saveIdea = (idea: string) => {
    saveProject({
      id: Date.now().toString(),
      title: idea,
      category: "Startup Idea",
      createdAt: new Date().toISOString(),
      notes: "",
    });
    showToast(`🚀 Startup idea saved!`);
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🚀 Startup Ideas Generator</h1>
      <p className="workspace-subtitle">Create new business concepts with Voxora AI.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter a market, industry, or problem..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateIdeas()}
        />
        <button className="workspace-btn" onClick={generateIdeas} disabled={!topic.trim()}>
          🚀 Generate Ideas
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="workspace-results">
          <h3>Generated Startup Ideas</h3>
          <div className="idea-list">
            {ideas.map((idea, i) => (
              <div key={i} className="idea-card">
                <span className="idea-text">{idea}</span>
                <button className="idea-save-btn" onClick={() => saveIdea(idea)}>💾 Save</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {ideas.length === 0 && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🚀</div>
          <p>Enter a market or problem above to generate startup ideas.</p>
        </div>
      )}
    </div>
  );
}
