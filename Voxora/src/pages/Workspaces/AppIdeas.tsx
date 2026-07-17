import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function AppIdeas({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const generateIdeas = () => {
    if (!topic.trim()) return;
    setIdeas([
      `AI-powered app that solves ${topic} problems automatically`,
      `Mobile platform helping users track and improve ${topic}`,
      `Smart assistant focused on ${topic} optimization`,
      `Community app connecting people around ${topic}`,
      `Analytics dashboard for ${topic} insights`,
    ]);
    addActivity({
      type: "app_ideas_generated",
      title: "App Ideas Generated",
      description: `Generated 5 app ideas for "${topic}".`,
      category: "AI",
      icon: "💡",
    });
  };

  const saveIdea = (idea: string) => {
    saveProject({
      id: Date.now().toString(),
      title: idea,
      category: "App Idea",
      createdAt: new Date().toISOString(),
      notes: "",
    });
    showToast(`💾 App idea saved!`);
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>💡 App Ideas Generator</h1>
      <p className="workspace-subtitle">Discover new application concepts with Voxora AI.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter a topic or problem to solve..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generateIdeas()}
        />
        <button className="workspace-btn" onClick={generateIdeas} disabled={!topic.trim()}>
          ✨ Generate Ideas
        </button>
      </div>

      {ideas.length > 0 && (
        <div className="workspace-results">
          <h3>Generated App Ideas</h3>
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
          <div className="workspace-empty-icon">💡</div>
          <p>Enter a topic or problem above to generate innovative app ideas.</p>
        </div>
      )}
    </div>
  );
}
