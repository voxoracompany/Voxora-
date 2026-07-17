import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

const AIContent = ({
  setWorkspace,
}: {
  setWorkspace: (workspace: string) => void;
}) => {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const { saveProject } = useProjects();

  const generateIdeas = () => {
    if (!topic.trim()) return;

    setIdeas([
      `${topic} - Beginner Guide`,
      `${topic} - Top 10 Strategies`,
      `${topic} - Common Mistakes to Avoid`,
    ]);
  };

  const saveIdea = (idea: string) => {
    saveProject({
      id: Date.now().toString(),
      title: `✍️ ${idea}`,
      category: "AI Content",
      createdAt: new Date().toLocaleString(),
      notes: "",
    });
  };

  return (
    <div>
      <button
        onClick={() => setWorkspace("dashboard")}
      >
        ← Back to Dashboard
      </button>

      <h1>AI Content Ideas</h1>

      <p>
        Generate and save creative content ideas with Voxora AI.
      </p>

      <input
        type="text"
        placeholder="Enter your topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={generateIdeas}>
        Generate Ideas
      </button>

      {ideas.length > 0 && (
        <>
          <h3>Generated Ideas:</h3>

          {ideas.map((idea, index) => (
            <div key={index}>
              <p>{idea}</p>

              <button
                onClick={() => saveIdea(idea)}
              >
                Save Project
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AIContent;