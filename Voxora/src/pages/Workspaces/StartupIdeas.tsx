import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface StartupIdeasProps {
  setWorkspace: (workspace: string) => void;
}

export default function StartupIdeas({
  setWorkspace,
}: StartupIdeasProps) {
  const { saveProject } = useProjects();

  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const generateIdeas = () => {
    if (!topic.trim()) return;

    setIdeas([
      `Startup solving ${topic} challenges`,
      `Digital platform helping businesses with ${topic}`,
      `AI-powered company focused on ${topic}`,
    ]);
  };

  const saveIdea = (idea: string) => {
    saveProject({
      id: Date.now().toString(),
      title: `🚀 ${idea}`,
      category: "Startup Idea",
      createdAt: new Date().toLocaleString(),
      notes: "",
    });
  };

  return (
    <div>
      <p
        onClick={() => setWorkspace("dashboard")}
        style={{ cursor: "pointer" }}
      >
        ← Back to Dashboard
      </p>

      <h1>Startup Ideas Generator</h1>

      <p>
        Create new business concepts with Voxora AI.
      </p>

      <input
        type="text"
        placeholder="Enter a market or problem..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={generateIdeas}>
        Generate Startup Ideas
      </button>

      {ideas.length > 0 && (
        <div>
          <h2>Generated Startup Ideas</h2>

          {ideas.map((idea, index) => (
            <div key={index}>
              <p>{idea}</p>

              <button
                onClick={() => saveIdea(idea)}
              >
                Save Idea
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}