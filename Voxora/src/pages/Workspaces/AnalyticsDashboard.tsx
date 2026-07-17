import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import "./AnalyticsDashboard.css";

interface AnalyticsDashboardProps {
  setWorkspace: (workspace: string) => void;
}

function getWeekStart(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AnalyticsDashboard({ setWorkspace }: AnalyticsDashboardProps) {
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();

  const stats = useMemo(() => {
    const weekStart = getWeekStart();
    const aiSessions = Number(localStorage.getItem("voxora-chat-count")) || 0;

    const savedIdeas = projects.filter((p) =>
      ["App Idea", "Startup Idea", "AI Content"].includes(p.category)
    ).length;

    const projectsThisWeek = projects.filter(
      (p) => new Date(p.createdAt) >= weekStart
    ).length;

    const totalNotes = projects.filter((p) => p.notes && p.notes.trim().length > 0).length;

    // Most used workspace from activity categories
    const categoryCounts: Record<string, number> = {};
    activities.forEach((a) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });
    const mostUsed =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return {
      totalProjects: projects.length,
      aiSessions,
      savedIdeas,
      favoriteProjects: favorites.length,
      pinnedProjects: pinned.length,
      totalActivities: activities.length,
      projectsThisWeek,
      mostUsedWorkspace: mostUsed,
      totalNotes,
    };
  }, [projects, favorites, pinned, activities]);

  const recentActivities = activities.slice(0, 5);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  return (
    <div className="analytics-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <p className="analytics-subtitle">Live insights calculated from your Voxora data.</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-icon">📁</div>
          <div className="analytics-card-value">{stats.totalProjects}</div>
          <div className="analytics-card-label">Total Projects</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">🤖</div>
          <div className="analytics-card-value">{stats.aiSessions}</div>
          <div className="analytics-card-label">AI Sessions</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">💡</div>
          <div className="analytics-card-value">{stats.savedIdeas}</div>
          <div className="analytics-card-label">Saved Ideas</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">⭐</div>
          <div className="analytics-card-value">{stats.favoriteProjects}</div>
          <div className="analytics-card-label">Favorite Projects</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">📌</div>
          <div className="analytics-card-value">{stats.pinnedProjects}</div>
          <div className="analytics-card-label">Pinned Projects</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">🔔</div>
          <div className="analytics-card-value">{stats.totalActivities}</div>
          <div className="analytics-card-label">Total Activities</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">📅</div>
          <div className="analytics-card-value">{stats.projectsThisWeek}</div>
          <div className="analytics-card-label">Created This Week</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon">📝</div>
          <div className="analytics-card-value">{stats.totalNotes}</div>
          <div className="analytics-card-label">Projects with Notes</div>
        </div>
      </div>

      <div className="analytics-row">
        <div className="analytics-panel">
          <h2>🏆 Most Active Area</h2>
          {stats.totalActivities === 0 ? (
            <p className="analytics-empty">No activity recorded yet.</p>
          ) : (
            <div className="analytics-highlight">{stats.mostUsedWorkspace}</div>
          )}
        </div>

        <div className="analytics-panel">
          <h2>📂 Projects by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="analytics-empty">No projects yet.</p>
          ) : (
            <div className="category-breakdown">
              {categoryBreakdown.map(([cat, count]) => (
                <div key={cat} className="category-row">
                  <span className="category-name">{cat}</span>
                  <div className="category-bar-wrap">
                    <div
                      className="category-bar"
                      style={{ width: `${Math.round((count / stats.totalProjects) * 100)}%` }}
                    />
                  </div>
                  <span className="category-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="analytics-panel analytics-panel-full">
        <h2>🕒 Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p className="analytics-empty">No activity recorded yet.</p>
        ) : (
          <div className="analytics-activity-list">
            {recentActivities.map((a) => (
              <div key={a.id} className="analytics-activity-item">
                <span className="analytics-activity-icon">{a.icon}</span>
                <div className="analytics-activity-body">
                  <span className="analytics-activity-title">{a.title}</span>
                  <span className="analytics-activity-desc">{a.description}</span>
                </div>
                <span className="analytics-activity-time">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
