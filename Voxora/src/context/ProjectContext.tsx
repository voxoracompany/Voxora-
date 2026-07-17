import { useActivity } from "./ActivityContext";
import React, { createContext, useContext, useState, useEffect } from "react";

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
  updateNotes: (id: string, notes: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("voxora-projects");
    return saved ? JSON.parse(saved) : [];
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
    localStorage.setItem("voxora-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("voxora-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("voxora-pinned", JSON.stringify(pinned));
  }, [pinned]);

  const saveProject = (project: Project) => {
    const isUpdate = projects.some((p) => p.id === project.id);
    setProjects((prev) =>
      isUpdate ? prev.map((p) => (p.id === project.id ? project : p)) : [...prev, project]
    );
    addActivity({
      type: isUpdate ? "project_updated" : "project_created",
      title: isUpdate ? "Project Updated" : "Project Saved",
      description: `"${project.title}" was ${isUpdate ? "updated" : "saved"} in ${project.category}.`,
      category: "Projects",
      icon: isUpdate ? "✏️" : "✅",
      projectId: project.id,
    });
  };

  const deleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setFavorites((prev) => prev.filter((fid) => fid !== id));
    setPinned((prev) => prev.filter((pid) => pid !== id));
    if (project) {
      addActivity({
        type: "project_deleted",
        title: "Project Deleted",
        description: `"${project.title}" was permanently deleted.`,
        category: "Projects",
        icon: "🗑️",
        projectId: id,
      });
    }
  };

  const favoriteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    const isFav = favorites.includes(id);
    setFavorites((prev) =>
      isFav ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    addActivity({
      type: isFav ? "project_unfavorited" : "project_favorited",
      title: isFav ? "Removed from Favorites" : "Added to Favorites",
      description: project
        ? `"${project.title}" was ${isFav ? "removed from" : "added to"} favorites.`
        : `A project was ${isFav ? "removed from" : "added to"} favorites.`,
      category: "Favorites",
      icon: isFav ? "💔" : "⭐",
      projectId: id,
    });
  };

  const pinProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    const isPinned = pinned.includes(id);
    setPinned((prev) =>
      isPinned ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
    addActivity({
      type: isPinned ? "project_unpinned" : "project_pinned",
      title: isPinned ? "Project Unpinned" : "Project Pinned",
      description: project
        ? `"${project.title}" was ${isPinned ? "unpinned" : "pinned"}.`
        : `A project was ${isPinned ? "unpinned" : "pinned"}.`,
      category: "Projects",
      icon: isPinned ? "📍" : "📌",
      projectId: id,
    });
  };

  const updateNotes = (id: string, notes: string) => {
    const project = projects.find((p) => p.id === id);
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p))
    );
    if (project) {
      addActivity({
        type: "project_updated",
        title: "Notes Updated",
        description: `Notes updated for "${project.title}".`,
        category: "Projects",
        icon: "📝",
        projectId: id,
      });
    }
  };

  return (
    <ProjectContext.Provider
      value={{ projects, saveProject, deleteProject, favoriteProject, pinProject, updateNotes, favorites, pinned }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProjects must be used inside ProjectProvider");
  return context;
};
