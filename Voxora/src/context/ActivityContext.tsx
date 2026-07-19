import React, { createContext, useContext, useState, useEffect } from "react";

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

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const [activities, setActivities] = useState<Activity[]>(safeLoadActivities);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
    } catch (e) {
      console.warn("[Voxora] Could not save activities:", e);
    }
  }, [activities]);

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
