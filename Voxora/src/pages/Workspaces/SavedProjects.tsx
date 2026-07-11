import { useProjects } from "../../context/ProjectContext";

const SavedProjects = () => {
  const { projects } = useProjects();

  return (
    <div>
      <h1>Saved Projects</h1>
      <p>Your saved Voxora ideas:</p>

      {projects.length === 0 ? (
        <p>No saved projects yet.</p>
      ) : (
        projects.map((project, index) => (
          <div key={index}>
            <p>{project}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SavedProjects;