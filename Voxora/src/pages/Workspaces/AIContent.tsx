import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

const AIContent = () => {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const { saveProject } = useProjects();

  const generateIdeas = () => {
    if (!topic) return;

    setIdeas([
      `${topic} - Beginner Guide`,
      `${topic} - Top 10 Strategies`,
      `${topic} - Common Mistakes to Avoid`,
    ]);
  };

  return (
    <div>
      <h1>AI Content Ideas</h1>
      <p>Generate and save creative content ideas with Voxora AI.</p>

      <input
        type="text"
        placeholder="Enter your topic..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={generateIdeas}>
        Generate Ideas
      </button>

      <h3>Generated Ideas:</h3>

      {ideas.map((idea, index) => (
        <div key={index}>
          <p>{idea}</p>

          <button onClick={() => saveProject(idea)}>
            Save Project
          </button>
        </div>
      ))}
    </div>
  );
};

export default AIContent;