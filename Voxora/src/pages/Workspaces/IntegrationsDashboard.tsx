// ── V8.3 Integrations Dashboard ───────────────────────────────────────────────
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { WebhookManager } from "../../services/integrations/WebhookManager";
import type { IntegrationStats, SyncEvent } from "../../services/integrations/IntegrationTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = React.memo(function StatCard({
  icon, label, value, sub, color, onClick,
}: {
  icon: string; label: string; value: string | number;
  sub?: string; color?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-card, #fff)",
        border: "1.5px solid var(--border, #e5e7eb)",
        borderRadius: 16, padding: "20px 22px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.18s, border-color 0.18s",
        flex: "1 1 160px", minWidth: 0,
      }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(108,99,255,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? "#111827" }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  );
});

// ── Health Badge ──────────────────────────────────────────────────────────────
const HEALTH_COLOR: Record<string, string> = {
  healthy: "#10b981", degraded: "#f59e0b", down: "#ef4444", unknown: "#9ca3af",
};

// ── Activity Row ──────────────────────────────────────────────────────────────
const ActivityRow = React.memo(function ActivityRow({ ev }: { ev: SyncEvent }) {
  const TYPE_ICON: Record<string, string> = {
    connect: "🔗", disconnect: "🔌", sync: "🔄", error: "❌", webhook: "📡", retry: "🔁",
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: "var(--bg-card, #fff)",
      border: "1.5px solid var(--border, #e5e7eb)",
      borderRadius: 12,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[ev.type] ?? "📋"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{ev.integrationName}</div>
        <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ev.message}
        </div>
      </div>
      {ev.durationMs && (
        <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{ev.durationMs}ms</span>
      )}
      <span style={{
        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, flexShrink: 0,
        background: ev.status === "success" ? "#d1fae5" : ev.status === "failed" ? "#fee2e2" : "#fef9c3",
        color: ev.status === "success" ? "#059669" : ev.status === "failed" ? "#dc2626" : "#92400e",
      }}>{ev.status.toUpperCase()}</span>
      <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>{formatRelative(ev.timestamp)}</span>
    </div>
  );
});

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntegrationsDashboard({ setWorkspace }: Props) {
  const [stats, setStats]       = useState<IntegrationStats | null>(null);
  const [whStats, setWhStats]   = useState({ totalDeliveries: 0, failedDeliveries: 0, pendingRetries: 0, successRate: 1 });
  const [health, setHealth]     = useState<ReturnType<typeof IntegrationService.getAllHealth>>([]);
  const [apiUsage, setApiUsage] = useState<ReturnType<typeof IntegrationService.getApiUsage>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setStats(IntegrationService.getStats());
    setWhStats(WebhookManager.getStats());
    setHealth(IntegrationService.refreshAllHealth());
    setApiUsage(IntegrationService.getApiUsage());
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const syncSuccessRate = useMemo(() => {
    if (!stats) return "–";
    const total = stats.successfulSyncs + stats.failedSyncs;
    if (total === 0) return "–";
    return `${Math.round((stats.successfulSyncs / total) * 100)}%`;
  }, [stats]);

  const totalApiCalls = useMemo(() =>
    apiUsage.reduce((a, u) => a + u.callsTotal, 0)
  , [apiUsage]);

  if (!stats) return null;

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="workspace-title">📊 Integrations Dashboard</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
            Real-time overview of all connected apps, syncs, webhooks, and health.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="workspace-btn" onClick={refresh}
            style={{ padding: "8px 18px", fontSize: 13 }}>
            🔄 Refresh
          </button>
          <button className="workspace-btn" onClick={() => setWorkspace("integrationsHub")}
            style={{ padding: "8px 18px", fontSize: 13 }}>
            🔌 Manage
          </button>
          <button className="workspace-btn" onClick={() => setWorkspace("intMonitoring")}
            style={{ padding: "8px 18px", fontSize: 13, background: "#6C63FF", color: "#fff", border: "none" }}>
            📡 Monitoring →
          </button>
        </div>
      </div>

      {/* KPI Row 1 — Integrations */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Connected Apps & Syncs
      </h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard
          icon="🔌" label="Connected Apps" value={stats.connected}
          sub={`${stats.total} total integrations`} color="#6C63FF"
          onClick={() => setWorkspace("integrationsHub")}
        />
        <StatCard
          icon="✅" label="Successful Syncs" value={stats.successfulSyncs}
          sub={`${syncSuccessRate} success rate`} color="#10b981"
          onClick={() => setWorkspace("intMonitoring")}
        />
        <StatCard
          icon="❌" label="Failed Syncs" value={stats.failedSyncs}
          sub={stats.failedSyncs > 0 ? "Check monitoring for details" : "All syncs healthy"}
          color={stats.failedSyncs > 0 ? "#ef4444" : "#10b981"}
          onClick={() => setWorkspace("intMonitoring")}
        />
        <StatCard
          icon="⚡" label="Total API Calls" value={totalApiCalls}
          sub={`${apiUsage.length} providers active`} color="#f59e0b"
          onClick={() => setWorkspace("intMonitoring")}
        />
      </div>

      {/* KPI Row 2 — Webhooks */}
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
        Webhooks
      </h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard
          icon="📡" label="Webhook Deliveries" value={whStats.totalDeliveries}
          sub={`${Math.round(whStats.successRate * 100)}% success rate`} color="#6C63FF"
          onClick={() => setWorkspace("intWebhooks")}
        />
        <StatCard
          icon="🔴" label="Failed Deliveries" value={whStats.failedDeliveries}
          sub={whStats.failedDeliveries > 0 ? "Retries queued automatically" : "No failures"}
          color={whStats.failedDeliveries > 0 ? "#ef4444" : "#10b981"}
          onClick={() => setWorkspace("intWebhooks")}
        />
        <StatCard
          icon="🔁" label="Pending Retries" value={whStats.pendingRetries}
          sub="Queued for automatic retry" color="#f59e0b"
          onClick={() => setWorkspace("intWebhooks")}
        />
        <StatCard
          icon="⚙️" label="Errored Integrations" value={stats.errored}
          sub={stats.errored > 0 ? "Action required" : "All healthy"}
          color={stats.errored > 0 ? "#ef4444" : "#10b981"}
          onClick={() => setWorkspace("integrationsHub")}
        />
      </div>

      {/* Provider Health */}
      {health.length > 0 && (
        <div style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 16, padding: "20px 22px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>💚 Provider Health</h2>
            <button className="workspace-btn" onClick={() => setWorkspace("intMonitoring")}
              style={{ padding: "5px 14px", fontSize: 12 }}>View Details →</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {health.map(h => (
              <div key={h.integrationId} style={{
                background: "#f8fafc", border: "1.5px solid #e5e7eb", borderRadius: 10,
                padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, minWidth: 180,
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: HEALTH_COLOR[h.status] ?? "#9ca3af", flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{h.integrationName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {h.latencyMs}ms · {h.uptimePercent}% uptime
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Usage */}
      {apiUsage.length > 0 && (
        <div style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 16, padding: "20px 22px", marginBottom: 24,
        }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>⚡ API Usage</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {apiUsage.map(u => (
              <div key={u.integrationId} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 14px", background: "#f8fafc", borderRadius: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{u.integrationName}</div>
                  {u.lastCallAt && (
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Last call {formatRelative(u.lastCallAt)}</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#6C63FF" }}>{u.callsTotal}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>total calls</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{u.callsToday}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>today</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sync Activity */}
      <div style={{
        background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
        borderRadius: 16, padding: "20px 22px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🕐 Recent Sync Activity</h2>
          <button className="workspace-btn" onClick={() => setWorkspace("intMonitoring")}
            style={{ padding: "5px 14px", fontSize: 12 }}>Full History →</button>
        </div>
        {stats.recentEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <p style={{ margin: 0 }}>No sync activity yet. Connect an integration to get started.</p>
            <button className="workspace-btn" onClick={() => setWorkspace("integrationsHub")}
              style={{ marginTop: 16, padding: "8px 20px" }}>
              🔌 Connect Integrations
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.recentEvents.map(ev => <ActivityRow key={ev.id} ev={ev} />)}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { icon: "🔌", label: "Manage Integrations", ws: "integrationsHub" },
          { icon: "🔗", label: "Webhook Manager",     ws: "intWebhooks" },
          { icon: "📡", label: "Monitoring",          ws: "intMonitoring" },
          { icon: "⚙️", label: "Settings",            ws: "intSettings" },
        ].map(a => (
          <button
            key={a.ws}
            onClick={() => setWorkspace(a.ws)}
            style={{
              padding: "14px 18px", borderRadius: 12, border: "1.5px solid var(--border, #e5e7eb)",
              background: "var(--bg-card, #fff)", cursor: "pointer", fontSize: 14,
              fontWeight: 600, color: "#374151", textAlign: "left",
              transition: "background 0.15s, border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 20, marginRight: 10 }}>{a.icon}</span>{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
