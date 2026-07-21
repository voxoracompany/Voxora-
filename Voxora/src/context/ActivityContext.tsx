// ── V5.3 Activity Context — Cloud-backed with offline fallback ────────────────
// Data flow:
//   1. Immediately render from localStorage (zero-latency first paint).
//   2. On mount, hydrate from the backend provider (local or cloud).
//   3. Every write is persisted to localStorage AND enqueued to SyncManager.

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getBackendProvider } from "../services/backend/BackendService";
import { syncManager } from "../services/backend/SyncManager";

export type ActivityCategory = "Projects" | "AI" | "Research" | "Roadmaps" | "Favorites" | "General";

export type Activity = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  category: string;
  icon: string;
  projectId?: string;
};

type ActivityContextType = {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const STORAGE_KEY = "voxora-activities";
const MAX_ACTIVITIES = 500;

function safeLoadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((a): a is Activity =>
        a &&
        typeof a === "object" &&
        typeof a.id === "string" &&
        typeof a.title === "string" &&
        typeof a.timestamp === "string"
      )
      .slice(0, MAX_ACTIVITIES);
  } catch {
    console.warn("[Voxora] Failed to parse activities from localStorage. Resetting.");
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function sanitizeActivity(raw: unknown): Activity | null {
  if (!raw || typeof raw !== "object") return null;
  const a = raw as Record<string, unknown>;
  if (typeof a.id !== "string" || typeof a.title !== "string" || typeof a.timestamp !== "string") return null;
  return {
    id: String(a.id).slice(0, 100),
    type: typeof a.type === "string" ? a.type.slice(0, 50) : "general",
    title: String(a.title).slice(0, 200),
    description: typeof a.description === "string" ? a.description.slice(0, 500) : "",
    timestamp: String(a.timestamp),
    category: typeof a.category === "string" ? a.category.slice(0, 50) : "General",
    icon: typeof a.icon === "string" ? a.icon.slice(0, 10) : "📌",
    projectId: typeof a.projectId === "string" ? a.projectId.slice(0, 100) : undefined,
  };
}

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(safeLoadActivities);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Cloud hydration on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) { setIsHydrated(true); return; }
    let cancelled = false;

    (async () => {
      try {
        const provider = await getBackendProvider();
        const cloudRecords = await provider.getCollection(user.id, "activityHistory");

        if (cancelled || cloudRecords.length === 0) return;

        const cloudActivities = cloudRecords
          .map(r => sanitizeActivity(r.data))
          .filter((a): a is Activity => a !== null)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, MAX_ACTIVITIES);

        if (!cancelled && cloudActivities.length > 0) {
          // Merge: cloud records take precedence; keep any local-only items
          setActivities(prev => {
            const cloudIds = new Set(cloudActivities.map(a => a.id));
            const localOnly = prev.filter(a => !cloudIds.has(a.id));
            const merged = [...cloudActivities, ...localOnly]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, MAX_ACTIVITIES);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch { /* quota */ }
            return merged;
          });
        }
      } catch (e) {
        console.warn("[Voxora] Cloud hydration failed for activities, using local data:", e);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.id]);

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
    } catch (e) {
      console.warn("[Voxora] Could not save activities:", e);
    }
  }, [activities, isHydrated]);

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      title: String(activity.title || "").slice(0, 200),
      description: String(activity.description || "").slice(0, 500),
      type: String(activity.type || "general").slice(0, 50),
      category: String(activity.category || "General").slice(0, 50),
      icon: String(activity.icon || "📌").slice(0, 10),
      projectId: activity.projectId ? String(activity.projectId).slice(0, 100) : undefined,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, MAX_ACTIVITIES));
    syncManager.enqueue("activityHistory", "upsert", newActivity.id, newActivity);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) throw new Error("useActivity must be used inside ActivityProvider");
  return context;
};
