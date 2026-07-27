// ── V8.3 Integrations Monitoring ─────────────────────────────────────────────
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { WebhookManager } from "../../services/integrations/WebhookManager";
import type { SyncEvent, ProviderHealth } from "../../services/integrations/IntegrationTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type Tab = "health" | "syncHistory" | "failures" | "retries" | "apiUsage";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "health",      label: "Provider Health",    icon: "💚" },
  { id: "syncHistory", label: "Sync History",        icon: "🕐" },
  { id: "failures",    label: "Failure Log",         icon: "❌" },
  { id: "retries",     label: "Retry Statistics",    icon: "🔁" },
  { id: "apiUsage",    label: "API Usage",           icon: "⚡" },
];

const HEALTH_COLOR: Record<string, string> = {
  healthy: "#10b981", degraded: "#f59e0b", down: "#ef4444", unknown: "#9ca3af",
};
const HEALTH_BG: Record<string, string> = {
  healthy: "#d1fae5", degraded: "#fef3c7", down: "#fee2e2", unknown: "#f1f5f9",
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Health Table ───────────────────────────────────────────────────────────────
const HealthTab = React.memo(function HealthTab({ health, onRefresh }: {
  health: ProviderHealth[]; onRefresh: () => void;
}) {
  if (health.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
        <p>No connected integrations. Connect one to monitor health.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <button className="workspace-btn" onClick={onRefresh} style={{ padding: "6px 14px", fontSize: 12 }}>
          🔄 Refresh Health
        </button>
      </div>
      {health.map(h => (
        <div key={h.integrationId} style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 14, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{h.integrationName}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Last checked {formatRelative(h.lastChecked)}</div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
            background: HEALTH_BG[h.status], color: HEALTH_COLOR[h.status],
            textTransform: "capitalize",
          }}>{h.status}</span>
          <div style={{ textAlign: "right", minWidth: 80 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{h.latencyMs}ms</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>latency</div>
          </div>
          <div style={{ textAlign: "right", minWidth: 80 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{h.uptimePercent}%</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>uptime</div>
          </div>
          {h.errorMessage && (
            <div style={{
              width: "100%", fontSize: 12, color: "#dc2626",
              background: "#fee2e2", borderRadius: 8, padding: "6px 12px",
            }}>
              ⚠️ {h.errorMessage}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// ── Sync History Table ─────────────────────────────────────────────────────────
const SyncHistoryTab = React.memo(function SyncHistoryTab({ events }: { events: SyncEvent[] }) {
  const TYPE_ICON: Record<string, string> = {
    connect: "🔗", disconnect: "🔌", sync: "🔄", error: "❌", webhook: "📡", retry: "🔁",
  };
  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <p>No sync history yet.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {events.map(ev => (
        <div key={ev.id} style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 12, padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICON[ev.type] ?? "📋"}</span>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.integrationName}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{ev.message}</div>
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "capitalize" }}>{ev.type}</span>
          {ev.durationMs && (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{ev.durationMs}ms</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
            background: ev.status === "success" ? "#d1fae5" : ev.status === "failed" ? "#fee2e2" : "#fef9c3",
            color: ev.status === "success" ? "#059669" : ev.status === "failed" ? "#dc2626" : "#92400e",
          }}>{ev.status.toUpperCase()}</span>
          <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>{formatRelative(ev.timestamp)}</span>
        </div>
      ))}
    </div>
  );
});

// ── Failure Log ────────────────────────────────────────────────────────────────
const FailuresTab = React.memo(function FailuresTab({ events }: { events: SyncEvent[] }) {
  if (events.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <p>No failures recorded. All syncs are healthy!</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 12,
        padding: "12px 16px", marginBottom: 8, fontSize: 13, color: "#dc2626",
      }}>
        ⚠️ {events.length} failure{events.length !== 1 ? "s" : ""} recorded. Auto-retry is enabled.
      </div>
      {events.map(ev => (
        <div key={ev.id} style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid #fecaca",
          borderRadius: 12, padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>❌</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{ev.integrationName}</div>
              <div style={{ fontSize: 12, color: "#dc2626" }}>{ev.message}</div>
            </div>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatRelative(ev.timestamp)}</span>
          </div>
          {ev.retryAttempt !== undefined && ev.retryAttempt > 0 && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              🔁 Retry attempt #{ev.retryAttempt}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

// ── Retry Statistics ───────────────────────────────────────────────────────────
const RetriesTab = React.memo(function RetriesTab({
  retryMetrics, webhookQueue,
}: {
  retryMetrics: ReturnType<typeof IntegrationService.getAllRetryMetrics>;
  webhookQueue: ReturnType<typeof WebhookManager.getRetryQueue>;
}) {
  const totalRetries    = retryMetrics.reduce((a, m) => a + m.totalRetries, 0);
  const successRetries  = retryMetrics.reduce((a, m) => a + m.successfulRetries, 0);
  const failedRetries   = retryMetrics.reduce((a, m) => a + m.failedRetries, 0);
  const retryRate       = totalRetries > 0 ? Math.round((successRetries / totalRetries) * 100) : 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { label: "Total Retries", value: totalRetries, color: "#6C63FF" },
          { label: "Successful", value: successRetries, color: "#10b981" },
          { label: "Failed", value: failedRetries, color: "#ef4444" },
          { label: "Success Rate", value: `${retryRate}%`, color: retryRate >= 80 ? "#10b981" : "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{
            flex: "1 1 120px", background: "var(--bg-card, #fff)",
            border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14,
            padding: "16px 18px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-Integration */}
      {retryMetrics.filter(m => m.totalRetries > 0).length > 0 && (
        <div style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 14, padding: "18px 20px",
        }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Per-Integration Retry Breakdown</h3>
          {retryMetrics.filter(m => m.totalRetries > 0).map(m => (
            <div key={m.integrationId} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "10px 0", borderBottom: "1px solid #f1f5f9",
            }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{m.integrationId}</div>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Total: {m.totalRetries}</span>
              <span style={{ fontSize: 12, color: "#10b981" }}>OK: {m.successfulRetries}</span>
              <span style={{ fontSize: 12, color: "#ef4444" }}>Fail: {m.failedRetries}</span>
              {m.lastRetryAt && (
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{formatRelative(m.lastRetryAt)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Webhook Retry Queue */}
      <div style={{
        background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
        borderRadius: 14, padding: "18px 20px",
      }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>
          Webhook Retry Queue ({webhookQueue.length})
        </h3>
        {webhookQueue.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No pending webhook retries.</p>
        ) : (
          webhookQueue.map(item => (
            <div key={item.deliveryId} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 0", borderBottom: "1px solid #f1f5f9",
            }}>
              <span style={{ fontSize: 16 }}>🔁</span>
              <div style={{ flex: 1, fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>Attempt #{item.attempt}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Delivery: {item.deliveryId}</div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Scheduled {formatRelative(item.scheduledAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

// ── API Usage Tab ──────────────────────────────────────────────────────────────
const ApiUsageTab = React.memo(function ApiUsageTab({
  usage,
}: { usage: ReturnType<typeof IntegrationService.getApiUsage> }) {
  const total = usage.reduce((a, u) => a + u.callsTotal, 0);
  if (usage.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
        <p>No API calls recorded yet. Connect and sync an integration.</p>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        background: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: 12,
        padding: "12px 18px", fontSize: 13, color: "#5b21b6", marginBottom: 4,
      }}>
        ⚡ Total API calls across all integrations: <strong>{total}</strong>
      </div>
      {usage.sort((a, b) => b.callsTotal - a.callsTotal).map(u => {
        const pct = total > 0 ? Math.round((u.callsTotal / total) * 100) : 0;
        return (
          <div key={u.integrationId} style={{
            background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
            borderRadius: 12, padding: "14px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{u.integrationName}</div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#6C63FF" }}>{u.callsTotal}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}> total</span>
              </div>
              <div style={{ textAlign: "right", minWidth: 60 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{u.callsToday}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}> today</span>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "#6C63FF", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#9ca3af" }}>
              <span>{pct}% of total</span>
              {u.lastCallAt && <span>Last call {formatRelative(u.lastCallAt)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntegrationsMonitoring({ setWorkspace }: Props) {
  const [tab, setTab]             = useState<Tab>("health");
  const [health, setHealth]       = useState<ProviderHealth[]>([]);
  const [events, setEvents]       = useState<SyncEvent[]>([]);
  const [failures, setFailures]   = useState<SyncEvent[]>([]);
  const [retryMetrics, setRetryMetrics] = useState<ReturnType<typeof IntegrationService.getAllRetryMetrics>>([]);
  const [apiUsage, setApiUsage]   = useState<ReturnType<typeof IntegrationService.getApiUsage>>([]);
  const [webhookQueue, setWebhookQueue] = useState<ReturnType<typeof WebhookManager.getRetryQueue>>([]);

  const loadAll = useCallback(() => {
    setHealth(IntegrationService.refreshAllHealth());
    setEvents(IntegrationService.getEvents(100));
    setFailures(IntegrationService.getFailedEvents(50));
    setRetryMetrics(IntegrationService.getAllRetryMetrics());
    setApiUsage(IntegrationService.getApiUsage());
    setWebhookQueue(WebhookManager.getRetryQueue());
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleClearFailures = useCallback(() => {
    IntegrationService.clearEvents();
    loadAll();
  }, [loadAll]);

  const summary = useMemo(() => ({
    healthy:  health.filter(h => h.status === "healthy").length,
    degraded: health.filter(h => h.status === "degraded").length,
    down:     health.filter(h => h.status === "down").length,
  }), [health]);

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="workspace-title">📡 Integrations Monitoring</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
            Provider health · Retry statistics · Failure logs · Sync history
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="workspace-btn" onClick={loadAll} style={{ padding: "8px 18px", fontSize: 13 }}>
            🔄 Refresh
          </button>
          <button className="workspace-btn" onClick={() => setWorkspace("intDashboard")}
            style={{ padding: "8px 18px", fontSize: 13 }}>
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* Health Summary Pills */}
      {health.length > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: `${summary.healthy} Healthy`,  color: "#10b981", bg: "#d1fae5" },
            { label: `${summary.degraded} Degraded`, color: "#f59e0b", bg: "#fef3c7" },
            { label: `${summary.down} Down`,         color: "#ef4444", bg: "#fee2e2" },
            { label: `${failures.length} Failures`,  color: "#dc2626", bg: "#fee2e2" },
          ].map(p => (
            <span key={p.label} style={{
              fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
              background: p.bg, color: p.color,
            }}>{p.label}</span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 16px", borderRadius: 10, border: "1.5px solid",
              borderColor: tab === t.id ? "#6C63FF" : "var(--border, #e5e7eb)",
              background: tab === t.id ? "#ede9fe" : "var(--bg-card, #fff)",
              color: tab === t.id ? "#6C63FF" : "#374151",
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "health" && <HealthTab health={health} onRefresh={() => setHealth(IntegrationService.refreshAllHealth())} />}
      {tab === "syncHistory" && <SyncHistoryTab events={events} />}
      {tab === "failures" && (
        <div>
          {failures.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <button className="workspace-btn" onClick={handleClearFailures}
                style={{ padding: "6px 14px", fontSize: 12, background: "#ef4444", color: "#fff", border: "none" }}>
                🗑️ Clear All Events
              </button>
            </div>
          )}
          <FailuresTab events={failures} />
        </div>
      )}
      {tab === "retries" && <RetriesTab retryMetrics={retryMetrics} webhookQueue={webhookQueue} />}
      {tab === "apiUsage" && <ApiUsageTab usage={apiUsage} />}
    </div>
  );
}
