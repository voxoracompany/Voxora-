import { useState, useMemo } from "react";
import { useActivity } from "../../context/ActivityContext";
import type { ActivityCategory } from "../../context/ActivityContext";
import "./ActivityCenter.css";

interface ActivityCenterProps {
  setWorkspace: (workspace: string) => void;
}

const FILTERS: { label: string; value: ActivityCategory | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Projects", value: "Projects" },
  { label: "AI", value: "AI" },
  { label: "Research", value: "Research" },
  { label: "Roadmaps", value: "Roadmaps" },
  { label: "Favorites", value: "Favorites" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ActivityCenter({ setWorkspace }: ActivityCenterProps) {
  const { activities, clearActivities } = useActivity();
  const [filter, setFilter] = useState<ActivityCategory | "All">("All");

  const filtered = useMemo(() => {
    if (filter === "All") return activities;
    return activities.filter((a) => a.category === filter);
  }, [activities, filter]);

  return (
    <div className="ac-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="ac-header">
        <div>
          <h1>🔔 Activity Center</h1>
          <p className="ac-subtitle">A log of every action you've taken in Voxora.</p>
        </div>
        {activities.length > 0 && (
          <button className="ac-clear-btn" onClick={clearActivities}>
            🗑 Clear All
          </button>
        )}
      </div>

      <div className="ac-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`ac-filter-btn ${filter === f.value ? "active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ac-empty">
          <div className="ac-empty-icon">📭</div>
          <h3>No activity yet</h3>
          <p>
            {filter === "All"
              ? "Start creating projects, running analyses, or using AI tools to see your activity here."
              : `No ${filter} activity recorded yet.`}
          </p>
          <button className="ac-cta-btn" onClick={() => setWorkspace("dashboard")}>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="ac-list">
          <p className="ac-count">{filtered.length} {filter === "All" ? "total" : filter.toLowerCase()} activities</p>
          {filtered.map((activity) => (
            <div key={activity.id} className="ac-item">
              <div className="ac-item-icon">{activity.icon}</div>
              <div className="ac-item-body">
                <div className="ac-item-title">{activity.title}</div>
                <div className="ac-item-desc">{activity.description}</div>
              </div>
              <div className="ac-item-time">{timeAgo(activity.timestamp)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
