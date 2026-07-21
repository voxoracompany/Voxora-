// ── V5.3 Project Context — Cloud-backed with offline fallback ─────────────────
// Data flow:
//   1. Immediately render from localStorage (zero-latency first paint).
//   2. On mount, hydrate from the backend provider (local or cloud).
//   3. Every write is persisted to localStorage AND enqueued to SyncManager.
//   4. SyncManager flushes to the cloud backend when online.

import React, {
  createContext, useCallback, useContext, useEffect, useState,
} from "react";
import { useActivity } from "./ActivityContext";
import { useAuth } from "./AuthContext";
import { getBackendProvider } from "../services/backend/BackendService";
import { syncManager } from "../services/backend/SyncManager";

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
  isHydrated: boolean;
  saveProject: (project: Project) => { success: boolean; error?: string };
  deleteProject: (id: string) => void;
  favoriteProject: (id: string) => void;
  pinProject: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  duplicateProject: (id: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// ── Safe localStorage helpers ─────────────────────────────────────────────────
function safeLoadArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn(`[Voxora] Failed to parse localStorage key "${key}". Resetting.`);
    localStorage.removeItem(key);
    return [];
  }
}

function safeLoadStringArray(key: string): string[] {
  return safeLoadArray<string>(key).filter((v) => typeof v === "string");
}

function sanitizeProject(p: unknown): Project | null {
  if (!p || typeof p !== "object") return null;
  const obj = p as Record<string, unknown>;
  if (typeof obj.id !== "string" || !obj.id) return null;
  return {
    id: String(obj.id).slice(0, 100),
    title: typeof obj.title === "string" ? obj.title.slice(0, 200) : "Untitled",
    category: typeof obj.category === "string" ? obj.category.slice(0, 100) : "General",
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString(),
    notes: typeof obj.notes === "string" ? obj.notes.slice(0, 50000) : "",
  };
}

function validateProject(project: Project): { valid: boolean; error?: string } {
  const title = project.title?.trim();
  if (!title) return { valid: false, error: "Project title cannot be empty." };
  if (title.length > 200) return { valid: false, error: "Title is too long (max 200 characters)." };
  if (!project.category?.trim()) return { valid: false, error: "Category is required." };
  return { valid: true };
}

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // ── Initial state from localStorage (immediate render) ────────────────────
  const [projects, setProjects] = useState<Project[]>(() =>
    safeLoadArray<Project>("voxora-projects")
      .map(sanitizeProject)
      .filter((p): p is Project => p !== null)
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    safeLoadStringArray("voxora-favorites")
  );
  const [pinned, setPinned] = useState<string[]>(() =>
    safeLoadStringArray("voxora-pinned")
  );
  const [isHydrated, setIsHydrated] = useState(false);

  const { addActivity } = useActivity();

  // ── Cloud hydration on mount ───────────────────────────────────────────────
  // Loads authoritative data from the backend provider (local or cloud).
  // For LocalBackendProvider this reads the per-user namespaced store and
  // merges any legacy data. For Firebase/Supabase it fetches real cloud data.
  useEffect(() => {
    if (!user?.id) { setIsHydrated(true); return; }
    let cancelled = false;

    (async () => {
      try {
        const provider = await getBackendProvider();

        // Load projects from cloud/local backend
        const cloudProjects = await provider.getCollection(user.id, "projects");
        // Load favorites from cloud/local backend
        const cloudFavs = await provider.getCollection(user.id, "favorites");
        // Load pins from cloud/local backend
        const cloudPins = await provider.getCollection(user.id, "pins");

        if (cancelled) return;

        // Hydrate projects — merge cloud records into local state
        if (cloudProjects.length > 0) {
          const hydrated = cloudProjects
            .map(r => sanitizeProject(r.data))
            .filter((p): p is Project => p !== null);
          // Merge: cloud is authoritative for ids it knows; keep local-only items
          setProjects(prev => {
            const cloudIds = new Set(hydrated.map(p => p.id));
            const localOnly = prev.filter(p => !cloudIds.has(p.id));
            const merged = [...hydrated, ...localOnly];
            try { localStorage.setItem("voxora-projects", JSON.stringify(merged)); } catch { /* quota */ }
            return merged;
          });
        }

        // Hydrate favorites
        if (cloudFavs.length > 0) {
          const favRecord = cloudFavs.find(r => (r.data as { id?: string })?.id === "favorites-list");
          if (favRecord) {
            const items = (favRecord.data as { items?: string[] })?.items ?? [];
            if (Array.isArray(items)) {
              setFavorites(items.filter(v => typeof v === "string"));
            }
          }
        }

        // Hydrate pins
        if (cloudPins.length > 0) {
          const pinRecord = cloudPins.find(r => (r.data as { id?: string })?.id === "pins-list");
          if (pinRecord) {
            const items = (pinRecord.data as { items?: string[] })?.items ?? [];
            if (Array.isArray(items)) {
              setPinned(items.filter(v => typeof v === "string"));
            }
          }
        }
      } catch (e) {
        console.warn("[Voxora] Cloud hydration failed for projects, using local data:", e);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Persist to localStorage (primary offline store) ──────────────────────
  useEffect(() => {
    if (!isHydrated) return; // avoid overwriting during hydration
    try { localStorage.setItem("voxora-projects", JSON.stringify(projects)); } catch (e) {
      console.warn("[Voxora] Could not save projects:", e);
    }
  }, [projects, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem("voxora-favorites", JSON.stringify(favorites)); } catch (e) {
      console.warn("[Voxora] Could not save favorites:", e);
    }
  }, [favorites, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try { localStorage.setItem("voxora-pinned", JSON.stringify(pinned)); } catch (e) {
      console.warn("[Voxora] Could not save pinned:", e);
    }
  }, [pinned, isHydrated]);

  // ── Cloud sync helpers ────────────────────────────────────────────────────
  const cloudUpsertProject = useCallback((p: Project) => {
    syncManager.enqueue("projects", "upsert", p.id, p);
  }, []);

  const cloudUpsertFavorites = useCallback((ids: string[]) => {
    syncManager.enqueue("favorites", "upsert", "favorites-list", { id: "favorites-list", items: ids });
  }, []);

  const cloudUpsertPins = useCallback((ids: string[]) => {
    syncManager.enqueue("pins", "upsert", "pins-list", { id: "pins-list", items: ids });
  }, []);

  // ── CRUD operations ───────────────────────────────────────────────────────
  const saveProject = (project: Project): { success: boolean; error?: string } => {
    const validation = validateProject(project);
    if (!validation.valid) return { success: false, error: validation.error };

    const sanitized = sanitizeProject(project);
    if (!sanitized) return { success: false, error: "Invalid project data." };

    const isUpdate = projects.some((p) => p.id === sanitized.id);

    if (!isUpdate) {
      const duplicate = projects.find(
        (p) =>
          p.title.trim().toLowerCase() === sanitized.title.trim().toLowerCase() &&
          p.category === sanitized.category
      );
      if (duplicate) {
        return { success: false, error: `A project named "${sanitized.title}" already exists in ${sanitized.category}.` };
      }
    }

    setProjects((prev) =>
      isUpdate ? prev.map((p) => (p.id === sanitized.id ? sanitized : p)) : [...prev, sanitized]
    );
    cloudUpsertProject(sanitized);

    addActivity({
      type: isUpdate ? "project_updated" : "project_created",
      title: isUpdate ? "Project Updated" : "Project Saved",
      description: `"${sanitized.title}" was ${isUpdate ? "updated" : "saved"} in ${sanitized.category}.`,
      category: "Projects",
      icon: isUpdate ? "✏️" : "✅",
      projectId: sanitized.id,
    });

    return { success: true };
  };

  const deleteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setFavorites((prev) => prev.filter((fid) => fid !== id));
    setPinned((prev) => prev.filter((pid) => pid !== id));
    syncManager.enqueue("projects", "delete", id, { id });
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

  const duplicateProject = (id: string) => {
    const original = projects.find((p) => p.id === id);
    if (!original) return;
    const copy: Project = {
      ...original,
      id: `${Date.now()}_copy`,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, copy]);
    cloudUpsertProject(copy);
    addActivity({
      type: "project_created",
      title: "Project Duplicated",
      description: `"${original.title}" was duplicated.`,
      category: "Projects",
      icon: "📋",
      projectId: copy.id,
    });
  };

  const favoriteProject = (id: string) => {
    const project = projects.find((p) => p.id === id);
    const isFav = favorites.includes(id);
    const next = isFav ? favorites.filter((pid) => pid !== id) : [...favorites, id];
    setFavorites(next);
    cloudUpsertFavorites(next);
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
    const next = isPinned ? pinned.filter((pid) => pid !== id) : [...pinned, id];
    setPinned(next);
    cloudUpsertPins(next);
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
    const trimmed = notes.slice(0, 50000);
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, notes: trimmed } : p));
      const updated = next.find(p => p.id === id);
      if (updated) cloudUpsertProject(updated);
      return next;
    });
  };

  return (
    <ProjectContext.Provider
      value={{
        projects, favorites, pinned, isHydrated,
        saveProject, deleteProject, favoriteProject, pinProject, updateNotes, duplicateProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProjects must be inside ProjectProvider");
  return context;
};
