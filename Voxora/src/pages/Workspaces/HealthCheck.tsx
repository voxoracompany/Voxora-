// ── V5.9 Health Check Dashboard ───────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { useAIContext }  from "../../context/AIContext";
import { useCloud }      from "../../context/CloudContext";
import { useAuth }       from "../../context/AuthContext";
import { MonitoringService } from "../../services/admin/MonitoringService";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { AutomationEngine } from "../../services/automation/AutomationEngine";
import { isPaymentConfigured } from "../../services/payment/PaymentService";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

type HealthStatus = "healthy" | "warning" | "offline";

interface HealthItem {
  id: string;
  icon: string;
  name: string;
  status: HealthStatus;
  detail: string;
  action?: string;
  actionLabel?: string;
}

function statusColor(s: HealthStatus): string {
  return s === "healthy" ? "#10b981" : s === "warning" ? "#f59e0b" : "#ef4444";
}
function statusIcon(s: HealthStatus): string {
  return s === "healthy" ? "🟢" : s === "warning" ? "🟡" : "🔴";
}
function statusLabel(s: HealthStatus): string {
  return s === "healthy" ? "Healthy" : s === "warning" ? "Warning" : "Offline";
}

export default function HealthCheck({ setWorkspace }: Props) {
  const { health, activeProvider, isDemoMode } = useAIContext();
  const { status: cloudStatus }  = useCloud();
  const { user } = useAuth();
  const [refreshed, setRefreshed] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => setRefreshed((n) => n + 1), 15000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const metrics = useMemo(() => MonitoringService.getMetrics(), [refreshed]);
  const intStats  = useMemo(() => IntegrationService.getStats(), [refreshed]);
  const autoStats = useMemo(() => AutomationEngine.getStats(), [refreshed]);

  const items: HealthItem[] = useMemo(() => {
    // Firebase / Auth
    const firebaseStatus: HealthStatus =
      user !== null ? "healthy"
      : cloudStatus.isOnline ? "healthy"
      : "warning";

    // Gemini / AI Engine
    const aiProvider = health.find((h) => h.provider === activeProvider);
    const aiStatus: HealthStatus = isDemoMode ? "warning"
      : aiProvider?.status === "healthy" ? "healthy"
      : aiProvider?.status === "degraded" ? "warning"
      : "offline";

    // AI Engine (request manager)
    const aiEngineStatus: HealthStatus = isDemoMode ? "warning" : aiStatus;

    // Memory Engine
    const memUsed = metrics.memoryUsage;
    const memStatus: HealthStatus = memUsed < 70 ? "healthy" : memUsed < 90 ? "warning" : "offline";

    // Integrations
    const intStatus: HealthStatus =
      intStats.connected === 0 ? "warning"
      : intStats.connected > 0 ? "healthy"
      : "offline";

    // Automation
    const autoStatus: HealthStatus =
      autoStats.active > 0 ? "healthy"
      : autoStats.total === 0 ? "warning"
      : "healthy";

    // Payments
    const payStatus: HealthStatus = isPaymentConfigured() ? "healthy" : "warning";

    // Auth
    const authStatus: HealthStatus = user !== null ? "healthy" : "warning";

    return [
      {
        id: "firebase",
        icon: "🔥",
        name: "Firebase",
        status: firebaseStatus,
        detail: firebaseStatus === "healthy"
          ? `Connected · ${cloudStatus.isOnline ? "Online" : "Local mode"}`
          : "Firebase not configured — running in local demo mode",
        action: "accountSettings",
        actionLabel: "Settings",
      },
      {
        id: "gemini",
        icon: "♊",
        name: "Gemini AI",
        status: aiStatus,
        detail: isDemoMode
          ? "Demo mode — add Gemini API key to enable live AI"
          : `Provider: ${activeProvider} · Status: ${aiProvider?.status ?? "unknown"}`,
        action: "intGemini",
        actionLabel: "Configure",
      },
      {
        id: "aiEngine",
        icon: "🧠",
        name: "AI Engine",
        status: aiEngineStatus,
        detail: isDemoMode
          ? "Running in demo mode with mock responses"
          : `Active: ${activeProvider} · ${health.length} provider(s) monitored`,
        action: "aiSettings",
        actionLabel: "AI Settings",
      },
      {
        id: "memory",
        icon: "🗄️",
        name: "Memory Engine",
        status: memStatus,
        detail: `Storage: ${MonitoringService.formatBytes(metrics.storageUsed)} · ${memUsed}% used`,
        action: "aiMemorySettings",
        actionLabel: "Manage Memory",
      },
      {
        id: "integrations",
        icon: "🔌",
        name: "Integrations",
        status: intStatus,
        detail: `${intStats.connected} of ${intStats.available} integrations connected`,
        action: "integrationsHub",
        actionLabel: "Integrations Hub",
      },
      {
        id: "automation",
        icon: "⚡",
        name: "Automation",
        status: autoStatus,
        detail: `${autoStats.total} rules · ${autoStats.active} active · ${autoStats.totalExecutions} executions`,
        action: "automation",
        actionLabel: "Automation Engine",
      },
      {
        id: "payments",
        icon: "💳",
        name: "Payments",
        status: payStatus,
        detail: payStatus === "healthy"
          ? "Payment provider configured"
          : "No payment provider configured — Stripe/Paystack not set up",
        action: "billing",
        actionLabel: "Billing",
      },
      {
        id: "auth",
        icon: "🔐",
        name: "Authentication",
        status: authStatus,
        detail: authStatus === "healthy"
          ? `Signed in · ${user?.email ?? "Demo user"}`
          : "Not authenticated",
        action: "securitySettings",
        actionLabel: "Security",
      },
    ];
  }, [health, activeProvider, isDemoMode, cloudStatus, user, metrics, intStats, autoStats, refreshed]);

  const healthy  = items.filter((i) => i.status === "healthy").length;
  const warnings = items.filter((i) => i.status === "warning").length;
  const offline  = items.filter((i) => i.status === "offline").length;
  const overallStatus: HealthStatus = offline > 0 ? "offline" : warnings > 0 ? "warning" : "healthy";

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>🏥 Health Check</h1>
          <span className="admin-badge admin-badge--blue">V5.9</span>
          <span className="admin-badge" style={{ background: `${statusColor(overallStatus)}18`, color: statusColor(overallStatus), borderColor: `${statusColor(overallStatus)}40` }}>
            {statusIcon(overallStatus)} {statusLabel(overallStatus)}
          </span>
          {autoRefresh && <span className="admin-badge admin-badge--green">🔄 Auto-refresh</span>}
        </div>
        <p className="workspace-subtitle">System-wide health status for all Voxora services.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="admin-action-btn" onClick={() => setRefreshed((n) => n + 1)}>🔄 Refresh</button>
          <button
            className={`admin-action-btn ${autoRefresh ? "admin-action-btn--primary" : ""}`}
            onClick={() => setAutoRefresh((v) => !v)}
          >
            {autoRefresh ? "⏸ Stop Auto" : "▶ Auto-refresh"}
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))" }}>
        {[
          { icon: "📡", label: "Services Checked", value: items.length, color: "#6C63FF" },
          { icon: "🟢", label: "Healthy", value: healthy, color: "#10b981" },
          { icon: "🟡", label: "Warnings", value: warnings, color: "#f59e0b" },
          { icon: "🔴", label: "Offline", value: offline, color: "#ef4444" },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Health Items */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderBottom: i < items.length - 1 ? "1px solid var(--border,#f1f5f9)" : undefined,
              background: item.status === "offline"
                ? "rgba(239,68,68,0.03)"
                : item.status === "warning"
                ? "rgba(245,158,11,0.03)"
                : "transparent",
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary,#1e293b)" }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", marginTop: 2 }}>{item.detail}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{statusIcon(item.status)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: statusColor(item.status) }}>{statusLabel(item.status)}</span>
              </div>
              {item.action && (
                <button
                  className="admin-action-btn"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => setWorkspace(item.action!)}
                >
                  {item.actionLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Service Details from MonitoringService */}
      <div className="admin-card">
        <h3>🔧 Service Latency Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {metrics.services.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, minWidth: 24 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary,#64748b)" }}>
                  Latency: {s.latency}ms · Uptime: {s.uptime}%
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: `${MonitoringService.statusColor(s.status)}18`,
                color: MonitoringService.statusColor(s.status),
                textTransform: "capitalize",
              }}>
                {s.status}
              </span>
              <div style={{ width: 80, height: 4, background: "var(--border,#f1f5f9)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, (s.latency / 600) * 100)}%`,
                  height: "100%",
                  background: s.latency < 200 ? "#10b981" : s.latency < 400 ? "#f59e0b" : "#ef4444",
                  borderRadius: 4,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
