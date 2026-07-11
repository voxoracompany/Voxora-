import { createContext, useContext, useState } from "react";

type ProjectContextType = {
  projects: string[];
  saveProject: (project: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<string[]>([]);

  const saveProject = (project: string) => {
    setProjects((prev) => [...prev, project]);
  };

  return (
    <ProjectContext.Provider value={{ projects, saveProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useProjects must be used inside ProjectProvider"
    );
  }

  return context;
};