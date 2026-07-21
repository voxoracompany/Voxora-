// ── V5.8 Notification Center ──────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { NotificationService } from "../../services/admin/NotificationService";
import { AuditLogService }     from "../../services/admin/AuditLogService";
import type { Notification, NotificationType } from "../../services/admin/AdminTypes";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

const TYPE_COLORS: Record<NotificationType, string> = {
  success: "#10b981",
  warning: "#f59e0b",
  error:   "#ef4444",
  info:    "#6366f1",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationCenter({ setWorkspace }: Props) {
  useMemo(() => NotificationService.seed(), []);

  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [showRead, setShowRead]     = useState(true);
  const [tick, setTick]             = useState(0);
  const refresh = () => setTick((v) => v + 1);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => NotificationService.getAll(), [tick]);

  const filtered = useMemo(() => {
    return all.filter((n) => {
      const matchType = typeFilter === "all" || n.type === typeFilter;
      const matchRead = showRead || !n.read;
      return matchType && matchRead;
    });
  }, [all, typeFilter, showRead]);

  const unreadCount = all.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    NotificationService.markRead(id);
    AuditLogService.log("settings_change", "Notification marked as read");
    refresh();
  };

  const handleMarkAllRead = () => {
    NotificationService.markAllRead();
    AuditLogService.log("settings_change", "All notifications marked as read");
    refresh();
  };

  const handleArchive = (id: string) => {
    NotificationService.archive(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    NotificationService.delete(id);
    refresh();
  };

  // Demo: add a test notification
  const [testType, setTestType] = useState<NotificationType>("info");

  const addTest = () => {
    NotificationService.add(
      testType,
      `Test ${testType} notification`,
      `This is a demo ${testType} notification from V5.8 Admin.`,
      "Test",
    );
    AuditLogService.log("settings_change", `Test notification sent: ${testType}`);
    refresh();
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>🔔 Notification Center</h1>
          <span className="admin-badge admin-badge--blue">V5.8</span>
          {unreadCount > 0 && <span className="admin-badge admin-badge--red">{unreadCount} unread</span>}
        </div>
        <p className="workspace-subtitle">Manage system and application notifications.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="admin-action-btn admin-action-btn--primary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            ✅ Mark All Read
          </button>
          <button className="admin-action-btn" onClick={() => { NotificationService.clear(); refresh(); }}>🗑️ Clear All</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-grid">
        {[
          { icon: "🔔", label: "Total",   value: String(all.length) },
          { icon: "📬", label: "Unread",  value: String(unreadCount) },
          { icon: "✅", label: "Success", value: String(all.filter(n => n.type === "success").length) },
          { icon: "⚠️", label: "Warnings",value: String(all.filter(n => n.type === "warning").length) },
          { icon: "❌", label: "Errors",  value: String(all.filter(n => n.type === "error").length)   },
          { icon: "ℹ️", label: "Info",    value: String(all.filter(n => n.type === "info").length)    },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value">{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Test Notification */}
      <div className="admin-card">
        <h3>🧪 Send Test Notification</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {(["success","warning","error","info"] as NotificationType[]).map((t) => (
            <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}>
              <input type="radio" name="testType" value={t} checked={testType === t} onChange={() => setTestType(t)} />
              <span style={{ color: TYPE_COLORS[t], fontWeight: 600 }}>{NotificationService.iconFor(t)} {t}</span>
            </label>
          ))}
          <button className="admin-action-btn admin-action-btn--primary" onClick={addTest}>Send</button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-filter-row">
          <select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
            <option value="all">All Types</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="info">Info</option>
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={showRead} onChange={(e) => setShowRead(e.target.checked)} />
            Show read
          </label>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", margin: "8px 0 0" }}>
          Showing {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Notification List */}
      <div className="admin-card">
        {filtered.length === 0 ? (
          <p className="admin-empty-text">No notifications to display.</p>
        ) : (
          <div className="admin-rows">
            {filtered.map((n: Notification) => (
              <div
                key={n.id}
                className={`admin-notif-row${n.read ? " admin-notif-row--read" : ""}`}
              >
                <span style={{ fontSize: 22, minWidth: 26 }}>{NotificationService.iconFor(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read ? 400 : 700, fontSize: 13, color: n.read ? "var(--text-secondary,#64748b)" : "var(--text-primary,#1e293b)" }}>
                    {n.title}
                    {n.source && <span style={{ fontSize: 11, color: "var(--text-secondary,#94a3b8)", marginLeft: 8 }}>{n.source}</span>}
                  </div>
                  <div className="admin-event-meta">{n.message}</div>
                </div>
                <span
                  className="admin-notif-type"
                  style={{ background: TYPE_COLORS[n.type] + "22", color: TYPE_COLORS[n.type], border: `1px solid ${TYPE_COLORS[n.type]}44` }}
                >
                  {n.type}
                </span>
                <span className="admin-event-time">{timeAgo(n.timestamp)}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {!n.read && (
                    <button className="admin-icon-btn" onClick={() => handleMarkRead(n.id)} title="Mark read">✅</button>
                  )}
                  <button className="admin-icon-btn" onClick={() => handleArchive(n.id)} title="Archive">📦</button>
                  <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDelete(n.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
