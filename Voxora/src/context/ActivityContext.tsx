import React, { createContext, useContext, useState, useCallback } from "react";

export type ActivityCategory = "Projects" | "AI" | "Research" | "Roadmaps" | "Favorites";

export type Activity = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
  category: ActivityCategory;
  icon: string;
};

type ActivityContextType = {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
  clearActivities: () => void;
};

const STORAGE_KEY = "voxora-activities";
const MAX_ACTIVITIES = 500;

function loadActivities(): Activity[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveActivities(activities: Activity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {}
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
  const [activities, setActivities] = useState<Activity[]>(loadActivities);

  const addActivity = useCallback((activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => {
      const updated = [newActivity, ...prev].slice(0, MAX_ACTIVITIES);
      saveActivities(updated);
      return updated;
    });
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
