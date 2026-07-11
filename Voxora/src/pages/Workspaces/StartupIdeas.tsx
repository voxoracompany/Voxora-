import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

const StartupIdeas = () => {
  const [industry, setIndustry] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);
  const { saveProject } = useProjects();

  const generateIdeas = () => {
    if (!industry) return;

    setIdeas([
      `${industry} AI Startup Concept`,
      `${industry} Marketplace Startup`,
      `${industry} Future Technology Startup`,
    ]);
  };

  return (
    <div>
      <h1>Startup Ideas</h1>
      <p>Create and explore startup opportunities with Voxora AI.</p>

      <input
        type="text"
        placeholder="Enter an industry..."
        value={industry}
        onChange={(e) => setIndustry(e.target.value)}
      />

      <button onClick={generateIdeas}>
        Generate Startup Ideas
      </button>

      <h3>Generated Startup Ideas:</h3>

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

export default StartupIdeas;