// ── V5.8 System Monitoring ────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useAIContext }  from "../../context/AIContext";
import { useCloud }      from "../../context/CloudContext";
import { MonitoringService } from "../../services/admin/MonitoringService";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import type { SystemMetrics, ServiceStatus } from "../../services/admin/AdminTypes";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

function formatUptime(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

function formatLatency(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "Just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export default function SystemMonitoring({ setWorkspace }: Props) {
  const { health, activeProvider, isDemoMode } = useAIContext();
  const { status: cloudStatus } = useCloud();
  const [metrics, setMetrics] = useState<SystemMetrics>(() => MonitoringService.getMetrics());
  const [live, setLive] = useState(false);

  // Auto-refresh every 10s when live mode on
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setMetrics(MonitoringService.getMetrics()), 10000);
    return () => clearInterval(id);
  }, [live]);

  const intStats = useMemo(() => IntegrationService.getStats(), []);

  const overallHealth: ServiceStatus = metrics.services.every((s) => s.status === "operational")
    ? "operational"
    : metrics.services.some((s) => s.status === "down")
    ? "down"
    : "degraded";

  const kpis = [
    { icon: "🖥️", label: "CPU Usage (demo)",    value: `${metrics.cpuUsage}%`,  bar: metrics.cpuUsage,    color: metrics.cpuUsage > 80 ? "#ef4444" : "#6C63FF" },
    { icon: "💾", label: "Memory Usage",         value: `${metrics.memoryUsage}%`, bar: metrics.memoryUsage, color: metrics.memoryUsage > 80 ? "#ef4444" : "#6C63FF" },
    { icon: "🗄️", label: "Storage Used",         value: MonitoringService.formatBytes(metrics.storageUsed), bar: Math.min(100, (metrics.storageUsed / (5 * 1024 * 1024)) * 100), color: "#059669" },
    { icon: "📡", label: "API Requests",         value: String(metrics.apiRequests),  bar: null, color: "#6C63FF" },
    { icon: "🤖", label: "AI Requests",          value: String(metrics.aiRequests),   bar: null, color: "#6C63FF" },
    { icon: "👥", label: "Active Users",          value: String(metrics.activeUsers),  bar: null, color: "#6C63FF" },
    { icon: "🔌", label: "Integrations",          value: `${intStats.connected}/${intStats.available}`, bar: null, color: "#6C63FF" },
    {
      icon: MonitoringService.statusIcon(overallHealth),
      label: "Overall Health",
      value: overallHealth,
      bar: null,
      color: MonitoringService.statusColor(overallHealth),
    },
  ];

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>📡 System Monitoring</h1>
          <span className="admin-badge admin-badge--blue">V5.8</span>
          <span
            className={`admin-badge ${live ? "admin-badge--green" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setLive((v) => !v)}
          >
            {live ? "🟢 Live" : "⚫ Static"}
          </span>
        </div>
        <p className="workspace-subtitle">
          Real-time system health and resource metrics.
          {live && " — Auto-refreshing every 10s."}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="admin-action-btn" onClick={() => setMetrics(MonitoringService.getMetrics())}>🔄 Refresh</button>
          <button className={`admin-action-btn ${live ? "admin-action-btn--primary" : ""}`} onClick={() => setLive((v) => !v)}>
            {live ? "⏸ Pause Live" : "▶ Start Live"}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="admin-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
            {k.bar !== null && (
              <div className="admin-kpi-bar-wrap">
                <div className="admin-kpi-bar" style={{ width: `${k.bar}%`, background: k.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Services */}
      <div className="admin-card">
        <h3>🔧 Service Status</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {metrics.services.map((s) => (
            <div key={s.name} className="admin-service-detail-row">
              <span style={{ fontSize: 22, minWidth: 28 }}>{s.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary,#64748b)" }}>
                  Latency: {formatLatency(s.latency)} · Uptime: {formatUptime(s.uptime)} · Checked: {timeAgo(s.lastChecked)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="admin-status-dot" style={{ background: MonitoringService.statusColor(s.status), width: 10, height: 10 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: MonitoringService.statusColor(s.status), textTransform: "capitalize" }}>
                  {s.status}
                </span>
              </div>
              <div className="admin-latency-bar-wrap">
                <div
                  className="admin-storage-bar"
                  style={{
                    width: `${Math.min(100, (s.latency / 600) * 100)}%`,
                    background: s.latency < 200 ? "#10b981" : s.latency < 400 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Provider Status */}
      <div className="admin-card">
        <h3>🤖 AI Provider Status</h3>
        {isDemoMode && (
          <div className="admin-demo-banner">⚡ Demo Mode — AI providers show simulated status. Add API keys in AI Settings to go live.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {health.length === 0 ? (
            <p className="admin-empty-text">No provider health data available.</p>
          ) : (
            health.map((h) => (
              <div key={h.provider} className="admin-service-detail-row">
                <span style={{ fontSize: 22, minWidth: 28 }}>🤖</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>
                    {h.provider} {h.provider === activeProvider && <span className="admin-badge admin-badge--purple">Active</span>}
                  </div>
                  {h.latencyMs !== undefined && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary,#64748b)" }}>
                      Latency: {formatLatency(h.latencyMs)} · Checked: {h.lastChecked ? timeAgo(new Date(h.lastChecked).toISOString()) : "—"}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="admin-status-dot" style={{ background: h.status === "healthy" ? "#10b981" : h.status === "degraded" ? "#f59e0b" : "#ef4444", width: 10, height: 10 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: h.status === "healthy" ? "#10b981" : h.status === "degraded" ? "#f59e0b" : "#ef4444", textTransform: "capitalize" }}>
                    {isDemoMode ? "Demo" : h.status}
                  </span>
                </div>
              </div>
            ))
          )}
          {health.length === 0 && (
            <div className="admin-service-detail-row">
              <span style={{ fontSize: 22, minWidth: 28 }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{activeProvider}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary,#64748b)" }}>Demo Mode</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>Demo</span>
            </div>
          )}
        </div>
      </div>

      {/* Cloud & Backend */}
      <div className="admin-card">
        <h3>☁️ Cloud & Backend</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Provider",       value: cloudStatus.provider === "firebase" ? "Firebase" : "Local Demo" },
            { label: "Online Status",  value: cloudStatus.isOnline ? "Online" : "Offline" },
            { label: "Demo Mode",      value: cloudStatus.isDemo ? "Yes" : "No" },
            { label: "Syncing",        value: cloudStatus.isSyncing ? "In Progress" : "Idle" },
            { label: "Pending Changes",value: String(cloudStatus.pendingChanges) },
            { label: "Storage Used",   value: MonitoringService.formatBytes(cloudStatus.storageUsed) },
            { label: "Last Sync",      value: cloudStatus.lastSync ? timeAgo(cloudStatus.lastSync) : "Never" },
          ].map((f) => (
            <div key={f.label} className="admin-field">
              <div className="admin-field-label">{f.label}</div>
              <div className="admin-field-value">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Info */}
      <div className="admin-card">
        <h3>🖥️ Environment</h3>
        <div className="admin-rows">
          <div className="admin-row"><strong>Platform:</strong> {navigator.platform}</div>
          <div className="admin-row"><strong>Language:</strong> {navigator.language}</div>
          <div className="admin-row"><strong>Online:</strong> {navigator.onLine ? "✅ Online" : "❌ Offline"}</div>
          <div className="admin-row"><strong>Updated:</strong> {timeAgo(metrics.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}
