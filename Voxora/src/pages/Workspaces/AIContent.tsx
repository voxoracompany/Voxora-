import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

const AIContent = ({ setWorkspace }: { setWorkspace: (workspace: string) => void }) => {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const generateIdeas = () => {
    if (!topic.trim()) return;
    setIdeas([
      `${topic} — Beginner's Complete Guide`,
      `${topic} — Top 10 Strategies That Actually Work`,
      `${topic} — Common Mistakes to Avoid`,
      `${topic} — Advanced Tips for Experts`,
      `${topic} — A Step-by-Step Tutorial`,
    ]);
    addActivity({
      type: "ai_content_generated",
      title: "AI Content Ideas Generated",
      description: `Generated 5 content ideas for topic: "${topic}".`,
      category: "AI",
      icon: "✍️",
    });
  };

  const saveIdea = (idea: string) => {
    saveProject({
      id: Date.now().toString(),
      title: idea,
      category: "AI Content",
      createdAt: new Date().toISOString(),
      notes: "",
    });
    showToast(`💾 "${idea}" saved to projects!`);
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>✍️ AI Content Ideas</h1>
      <p className="workspace-subtitle">Generate creative content concepts with Voxora AI.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your topic (e.g. productivity, crypto, fitness)..."
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
          <h3>Generated Ideas</h3>
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
          <div className="workspace-empty-icon">✍️</div>
          <p>Enter a topic above and generate instant AI content ideas.</p>
        </div>
      )}
    </div>
  );
};

export default AIContent;
