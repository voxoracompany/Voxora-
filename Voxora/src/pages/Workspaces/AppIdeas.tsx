import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

const AppIdeas = () => {
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const { saveProject } = useProjects();

  const generateIdeas = () => {
    if (!topic) return;

    setIdeas([
      `${topic} Mobile App Concept`,
      `${topic} Productivity App`,
      `${topic} AI-Powered App Idea`,
    ]);
  };

  return (
    <div>
      <h1>App Ideas</h1>
      <p>Discover new app concepts with Voxora AI.</p>

      <input
        type="text"
        placeholder="Enter an app category..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <button onClick={generateIdeas}>
        Generate App Ideas
      </button>

      <h3>Generated App Ideas:</h3>

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

export default AppIdeas;