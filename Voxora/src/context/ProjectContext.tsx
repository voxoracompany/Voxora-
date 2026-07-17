import { useActivity } from "./ActivityContext";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

export type Project = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  notes: string;
};
type ProjectContextType = {
 projects: Project[]; 
  favorites: string[];
pinned: string[];
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
favoriteProject: (id: string) => void;
pinProject: (id: string) => void;
updateNotes: (
  id: string,
  notes: string
) => void;
}

const ProjectContext = createContext<
  ProjectContextType | undefined
>(undefined);


export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [projects, setProjects] = useState<Project[]>(() => {
  
    const saved = localStorage.getItem("voxora-projects");

  return saved
    ? JSON.parse(saved)
    : [];
});

  const [favorites, setFavorites] = useState<string[]>(() => {
  
    const saved = localStorage.getItem("voxora-favorites");
  return saved ? JSON.parse(saved) : [];
});

const [pinned, setPinned] = useState<string[]>(() => {
  
    const saved = localStorage.getItem("voxora-pinned");
  return saved ? JSON.parse(saved) : [];
});

  const { addActivity } = useActivity();

useEffect(() => {
  localStorage.setItem(
    "voxora-projects",
    JSON.stringify(projects)
  );
}, [projects]);
  
useEffect(() => {
  localStorage.setItem(
    "voxora-favorites",
    JSON.stringify(favorites)
  );
}, [favorites]);

useEffect(() => {
  localStorage.setItem(
    "voxora-pinned",
    JSON.stringify(pinned)
  );
}, [pinned]);  

const saveProject = (project: Project) => {
  
    setProjects((prev) => [
    ...prev,
    project,
  ]);

  addActivity(
  `✅ Saved project: ${project.title}`
);

};


const deleteProject = (id: string) => {
  setProjects((prev) =>
    prev.filter(
      (project) => project.id !== id
    )
  );
};


  const favoriteProject = (id: string) => {
  setFavorites((prev) =>
    prev.includes(id)
      ? prev.filter((projectId) => projectId !== id)
      : [...prev, id]
  );

  addActivity(
    "⭐ Updated favorite project"
  );
};


  const pinProject = (id: string) => {
  setPinned((prev) =>
    prev.includes(id)
      ? prev.filter((projectId) => projectId !== id)
      : [...prev, id]
  );

  addActivity(
    "📌 Updated pinned project"
  );
};

const updateNotes = (
  id: string,
  notes: string
) => {
  setProjects((prev) =>
    prev.map((project) =>
      project.id === id
        ? {
            ...project,
            notes,
          }
        : project
    )
  );

  addActivity(
    "📝 Updated project notes"
  );
};
  return (
    <ProjectContext.Provider
      value={{
  projects,
  saveProject,
  deleteProject,
  favoriteProject,
  pinProject,
  updateNotes,
  favorites,
  pinned,
}}
    >
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