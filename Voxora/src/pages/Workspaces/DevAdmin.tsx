import { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import "./DevAdmin.css";

interface Props {
  setWorkspace: (w: string) => void;
}

const APP_VERSION = "2.1.0";
const BUILD_NUMBER = "20260719";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getStorageUsage(): { total: number; breakdown: { key: string; size: number }[] } {
  const keys = [
    "voxora-projects",
    "voxora-favorites",
    "voxora-pinned",
    "voxora-activities",
    "voxora-chat",
    "voxora-name",
    "voxora-goal",
    "voxora-theme",
    "voxora-accent",
    "voxora-fontsize",
    "voxora-chat-count",
  ];
  const breakdown = keys.map((key) => {
    const val = localStorage.getItem(key) || "";
    return { key, size: new Blob([val]).size };
  });
  const total = breakdown.reduce((sum, b) => sum + b.size, 0);
  return { total, breakdown };
}

export default function DevAdmin({ setWorkspace }: Props) {
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();
  const [cleared, setCleared] = useState(false);

  const storage = useMemo(() => getStorageUsage(), []);

  const systemInfo = {
    appVersion: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    buildDate: "July 19, 2026",
    environment: "production",
    platform: navigator.platform,
    userAgent: navigator.userAgent.slice(0, 80) + "…",
    language: navigator.language,
    online: navigator.onLine ? "Online" : "Offline",
    storageTotal: formatBytes(storage.total),
    totalProjects: projects.length,
    totalActivities: activities.length,
    totalFavorites: favorites.length,
    totalPinned: pinned.length,
    chatMessages: (() => {
      try {
        const msgs = JSON.parse(localStorage.getItem("voxora-chat") || "[]");
        return Array.isArray(msgs) ? msgs.length : 0;
      } catch {
        return 0;
      }
    })(),
    chatSessions: Number(localStorage.getItem("voxora-chat-count")) || 0,
  };

  const handleClearCache = () => {
    localStorage.removeItem("voxora-chat");
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="admin-header">
        <h1>🛠️ Developer Panel</h1>
        <p className="workspace-subtitle">Internal diagnostic information. Not for general use.</p>
        <div className="admin-badge">🔒 Developer Only</div>
      </div>

      {/* App Info */}
      <div className="admin-card">
        <h3>📦 Application</h3>
        <div className="admin-metrics">
          {[
            { label: "App Version", val: systemInfo.appVersion },
            { label: "Build Number", val: systemInfo.buildNumber },
            { label: "Build Date", val: systemInfo.buildDate },
            { label: "Environment", val: systemInfo.environment },
            { label: "Status", val: systemInfo.online },
            { label: "Language", val: systemInfo.language },
          ].map((m) => (
            <div key={m.label} className="admin-metric">
              <div className="admin-metric-val">{m.val}</div>
              <div className="admin-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Stats */}
      <div className="admin-card">
        <h3>📊 Data Statistics</h3>
        <div className="admin-metrics">
          {[
            { label: "Total Projects", val: String(systemInfo.totalProjects), icon: "📁" },
            { label: "Total Activities", val: String(systemInfo.totalActivities), icon: "🕒" },
            { label: "Favorites", val: String(systemInfo.totalFavorites), icon: "⭐" },
            { label: "Pinned", val: String(systemInfo.totalPinned), icon: "📌" },
            { label: "AI Sessions", val: String(systemInfo.chatSessions), icon: "🤖" },
            { label: "Chat Messages", val: String(systemInfo.chatMessages), icon: "💬" },
          ].map((m) => (
            <div key={m.label} className="admin-metric">
              <div className="admin-metric-icon">{m.icon}</div>
              <div className="admin-metric-val">{m.val}</div>
              <div className="admin-metric-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="admin-card">
        <h3>💾 Storage Usage — {systemInfo.storageTotal} total</h3>
        <div className="admin-storage-bars">
          {storage.breakdown.filter(b => b.size > 0).map((b) => {
            const pct = storage.total > 0 ? Math.round((b.size / storage.total) * 100) : 0;
            return (
              <div key={b.key} className="admin-storage-row">
                <span className="admin-storage-key">{b.key.replace("voxora-", "")}</span>
                <div className="admin-storage-bar-wrap">
                  <div className="admin-storage-bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="admin-storage-size">{formatBytes(b.size)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw system info */}
      <div className="admin-card">
        <h3>🖥️ Environment</h3>
        <div className="admin-rows">
          <div className="admin-row"><strong>Platform:</strong> {systemInfo.platform}</div>
          <div className="admin-row"><strong>User Agent:</strong> <span className="admin-small">{systemInfo.userAgent}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-card">
        <h3>⚙️ Actions</h3>
        <div className="admin-actions">
          <button
            className="admin-action-btn"
            onClick={handleClearCache}
          >
            {cleared ? "✅ Cleared!" : "🗑️ Clear Chat Cache"}
          </button>
          <button
            className="admin-action-btn"
            onClick={() => {
              const data = {
                version: APP_VERSION,
                exportedAt: new Date().toISOString(),
                raw: {
                  projects: localStorage.getItem("voxora-projects"),
                  activities: localStorage.getItem("voxora-activities"),
                  favorites: localStorage.getItem("voxora-favorites"),
                  pinned: localStorage.getItem("voxora-pinned"),
                }
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `voxora-debug-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            📥 Export Debug Dump
          </button>
          <button
            className="admin-action-btn"
            onClick={() => window.location.reload()}
          >
            🔄 Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
