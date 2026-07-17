import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface AppIdeasProps {
  setWorkspace: (workspace: string) => void;
}

export default function AppIdeas({
  setWorkspace,
}: AppIdeasProps) {
  const { saveProject } = useProjects();

  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const generateIdeas = () => {
    if (!topic.trim()) return;

    setIdeas([
      `AI app for solving ${topic} problems`,
      `Mobile platform that helps users with ${topic}`,
      `Smart assistant focused on ${topic}`,
    ]);
  };

  const saveIdea = (idea: string) => {
    console.log("Saving idea:", idea);

    saveProject({
      id: Date.now().toString(),
      title: `💡 ${idea}`,
      category: "App Idea",
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

      <h1>App Ideas Generator</h1>

      <p>
        Discover new application concepts with Voxora AI.
      </p>

      <input
        type="text"
        placeholder="Enter a topic or problem..."
        value={topic}
        onChange={(e) =>
          setTopic(e.target.value)
        }
      />

      <button onClick={generateIdeas}>
        Generate Ideas
      </button>

      {ideas.length > 0 && (
        <div>
          <h2>
            Generated Ideas
          </h2>

          {ideas.map((idea, index) => (
            <div key={index}>
              <p>
                {idea}
              </p>

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