// ── V5.8 Admin Dashboard ──────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useProjects }      from "../../context/ProjectContext";
import { useActivity }      from "../../context/ActivityContext";
import { useSubscription }  from "../../context/SubscriptionContext";
import { AIUsage }          from "../../services/ai/AIUsage";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { MonitoringService }  from "../../services/admin/MonitoringService";
import { AuditLogService }    from "../../services/admin/AuditLogService";
import { NotificationService } from "../../services/admin/NotificationService";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminDashboard({ setWorkspace }: Props) {
  const { projects }            = useProjects();
  const { activities }          = useActivity();
  const { currentPlan, subscription } = useSubscription();
  const [refreshed, setRefreshed] = useState(false);

  // Seed demo data on first open
  useMemo(() => {
    AuditLogService.seed();
    NotificationService.seed();
  }, []);

  const metrics    = useMemo(() => MonitoringService.getMetrics(), []);
  const intStats   = useMemo(() => IntegrationService.getStats(), []);
  const auditEvents = useMemo(() => AuditLogService.getAll().slice(0, 5), []);
  const notifications = useMemo(() => NotificationService.getUnread().slice(0, 4), []);
  const unreadCount   = useMemo(() => NotificationService.getUnreadCount(), []);

  const overallHealth = metrics.services.every((s) => s.status === "operational")
    ? "operational"
    : metrics.services.some((s) => s.status === "down")
    ? "down"
    : "degraded";

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  const subBreakdown = {
    free:       currentPlan.id === "free" ? 1 : 0,
    pro:        currentPlan.id === "pro"  ? 1 : 0,
    enterprise: currentPlan.id === "enterprise" ? 1 : 0,
  };

  const cards = [
    { icon: "👥", label: "Total Users",   value: "1 (Demo)",     action: "userManagement" },
    { icon: "🟢", label: "Active Users",  value: "1",             action: "systemMonitoring" },
    { icon: "🆕", label: "New Users",     value: "1",             action: "userManagement" },
    { icon: "📁", label: "Projects",      value: String(projects.length), action: "saved" },
    { icon: "🤖", label: "AI Requests",   value: String(AIUsage.getTodayCount()) + " today", action: "systemMonitoring" },
    { icon: "💳", label: "Plan",          value: currentPlan.name, action: "billing" },
    { icon: "🗄️", label: "Storage Used",  value: MonitoringService.formatBytes(metrics.storageUsed), action: "systemMonitoring" },
    { icon: "🔌", label: "Integrations",  value: `${intStats.connected} connected`, action: "integrationsHub" },
    { icon: MonitoringService.statusIcon(overallHealth as any), label: "System Health", value: overallHealth, action: "systemMonitoring" },
    { icon: "📊", label: "Subscription",  value: `${subscription.status}`, action: "billing" },
  ];

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>🏛️ Admin Dashboard</h1>
          <span className="admin-badge admin-badge--blue">V5.8</span>
        </div>
        <p className="workspace-subtitle">Complete overview of your Voxora platform.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => setWorkspace("userManagement")}>👥 User Management</button>
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => setWorkspace("systemMonitoring")}>📡 System Monitoring</button>
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => setWorkspace("auditLogs")}>📋 Audit Logs</button>
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => setWorkspace("notificationCenter")}>🔔 Notifications {unreadCount > 0 && <span className="admin-badge-pill">{unreadCount}</span>}</button>
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => setWorkspace("featureFlags")}>🚩 Feature Flags</button>
          <button className="admin-action-btn" onClick={handleRefresh}>{refreshed ? "✅ Refreshed" : "🔄 Refresh"}</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        {cards.map((c) => (
          <div
            key={c.label}
            className="admin-kpi-card"
            onClick={() => setWorkspace(c.action)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setWorkspace(c.action)}
          >
            <div className="admin-kpi-icon">{c.icon}</div>
            <div className="admin-kpi-value">{c.value}</div>
            <div className="admin-kpi-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Subscription Breakdown */}
      <div className="admin-card">
        <h3>📊 Subscription Breakdown</h3>
        <div className="admin-sub-bars">
          {[
            { tier: "Free",       count: subBreakdown.free,       color: "#94a3b8" },
            { tier: "Pro",        count: subBreakdown.pro,        color: "#6C63FF" },
            { tier: "Enterprise", count: subBreakdown.enterprise, color: "#f59e0b" },
          ].map((s) => (
            <div key={s.tier} className="admin-sub-row">
              <span className="admin-sub-tier">{s.tier}</span>
              <div className="admin-storage-bar-wrap" style={{ flex: 1 }}>
                <div className="admin-storage-bar" style={{ width: s.count > 0 ? "100%" : "2px", background: s.color }} />
              </div>
              <span className="admin-sub-count">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Summary */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>💚 System Health</h3>
          <button className="admin-link-btn" onClick={() => setWorkspace("systemMonitoring")}>View All →</button>
        </div>
        <div className="admin-service-grid">
          {metrics.services.slice(0, 6).map((s) => (
            <div key={s.name} className="admin-service-card">
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span className="admin-service-name">{s.name}</span>
              <span className="admin-status-dot" style={{ background: MonitoringService.statusColor(s.status) }} />
              <span className="admin-service-status" style={{ color: MonitoringService.statusColor(s.status) }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>📋 Recent Audit Events</h3>
          <button className="admin-link-btn" onClick={() => setWorkspace("auditLogs")}>View All →</button>
        </div>
        {auditEvents.length === 0 ? (
          <p className="admin-empty-text">No audit events yet.</p>
        ) : (
          <div className="admin-rows">
            {auditEvents.map((e) => (
              <div key={e.id} className="admin-event-row">
                <span style={{ fontSize: 18 }}>{e.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="admin-event-desc">{e.description}</div>
                  <div className="admin-event-meta">{e.userName} · {e.type.replace(/_/g, " ")}</div>
                </div>
                <span className={`admin-severity admin-severity--${e.severity}`}>{e.severity}</span>
                <span className="admin-event-time">{timeAgo(e.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>🔔 Notifications {unreadCount > 0 && <span className="admin-badge-pill">{unreadCount}</span>}</h3>
          <button className="admin-link-btn" onClick={() => setWorkspace("notificationCenter")}>View All →</button>
        </div>
        {notifications.length === 0 ? (
          <p className="admin-empty-text">No unread notifications.</p>
        ) : (
          <div className="admin-rows">
            {notifications.map((n) => (
              <div key={n.id} className="admin-event-row">
                <span style={{ fontSize: 18 }}>{NotificationService.iconFor(n.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="admin-event-desc">{n.title}</div>
                  <div className="admin-event-meta">{n.message}</div>
                </div>
                <span className={`admin-notif-type admin-notif-type--${n.type}`}>{n.type}</span>
                <span className="admin-event-time">{timeAgo(n.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Shortcuts */}
      <div className="admin-card">
        <h3>⚡ Admin Shortcuts</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "👥 User Management",    ws: "userManagement"    },
            { label: "📡 System Monitoring",  ws: "systemMonitoring"  },
            { label: "📋 Audit Logs",         ws: "auditLogs"         },
            { label: "🔔 Notification Center",ws: "notificationCenter"},
            { label: "🚩 Feature Flags",      ws: "featureFlags"      },
            { label: "⚙️ Settings",            ws: "settings"          },
            { label: "💳 Billing",            ws: "billing"           },
            { label: "🛠️ Dev Panel",           ws: "admin"             },
          ].map((s) => (
            <button key={s.ws} className="admin-action-btn" onClick={() => setWorkspace(s.ws)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>🕒 Recent Activity</h3>
          <button className="admin-link-btn" onClick={() => setWorkspace("activity")}>View All →</button>
        </div>
        {activities.length === 0 ? (
          <p className="admin-empty-text">No activity yet.</p>
        ) : (
          <div className="admin-rows">
            {activities.slice(0, 5).map((a) => (
              <div key={a.id} className="admin-event-row">
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="admin-event-desc">{a.title}</div>
                  <div className="admin-event-meta">{a.description}</div>
                </div>
                <span className="admin-event-time">{timeAgo(a.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
