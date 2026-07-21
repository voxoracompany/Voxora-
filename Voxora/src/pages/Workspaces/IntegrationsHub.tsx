// ── V5.7 Integrations Hub (live IntegrationService) ──────────────────────────
import { useState, useEffect, useCallback } from "react";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { CATEGORY_LABELS } from "../../services/integrations/IntegrationRegistry";
import type { Integration, IntegrationCategory } from "../../services/integrations/IntegrationTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const STATUS_COLOR: Record<string, string> = {
  connected:    "#10b981",
  disconnected: "#6b7280",
  error:        "#ef4444",
  syncing:      "#f59e0b",
  available:    "#6b7280",
};

const STATUS_LABEL: Record<string, string> = {
  connected:    "Connected",
  disconnected: "Disconnected",
  error:        "Error",
  syncing:      "Syncing…",
  available:    "Available",
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

// ── Integration Card ──────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onSync,
  syncing,
  connecting,
}: {
  integration: Integration;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
  syncing: boolean;
  connecting: boolean;
}) {
  const isConnected = integration.status === "connected";

  return (
    <div style={{
      background: "var(--bg-card, #fff)",
      border: `1.5px solid ${isConnected ? "#bbf7d0" : "var(--border, #e5e7eb)"}`,
      borderRadius: 16, padding: "20px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      transition: "border-color 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{integration.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{integration.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: STATUS_COLOR[integration.status], flexShrink: 0,
            }} />
            <span style={{
              fontSize: 11, fontWeight: 600, color: STATUS_COLOR[integration.status],
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{STATUS_LABEL[integration.status]}</span>
            {integration.isDemo && (
              <span style={{ fontSize: 10, background: "#ede9fe", color: "#6c63ff", borderRadius: 6, padding: "1px 6px", fontWeight: 700 }}>Demo</span>
            )}
          </div>
        </div>
        <span style={{
          fontSize: 11, background: "#f1f5f9", color: "#64748b",
          borderRadius: 8, padding: "2px 8px", fontWeight: 600,
        }}>{CATEGORY_LABELS[integration.category as IntegrationCategory]}</span>
      </div>

      {/* Description */}
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
        {integration.description}
      </p>

      {/* Meta */}
      {isConnected && (
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#9ca3af", marginBottom: 14, flexWrap: "wrap" }}>
          {integration.connectedAt && <span>🔗 Connected {formatRelative(integration.connectedAt)}</span>}
          {integration.lastSync   && <span>🔄 Synced {formatRelative(integration.lastSync)}</span>}
          {integration.syncCount  > 0 && <span>📊 {integration.syncCount} syncs</span>}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!isConnected ? (
          <button
            onClick={() => onConnect(integration.id)}
            disabled={connecting}
            style={{
              flex: 1, padding: "8px 14px", borderRadius: 9, border: "none",
              background: connecting ? "#e5e7eb" : "#6c63ff", color: connecting ? "#9ca3af" : "#fff",
              fontSize: 13, fontWeight: 700, cursor: connecting ? "not-allowed" : "pointer",
            }}
          >{connecting ? "Connecting…" : "Connect"}</button>
        ) : (
          <>
            <button
              onClick={() => onSync(integration.id)}
              disabled={syncing}
              style={{
                flex: 1, padding: "8px 14px", borderRadius: 9, border: "1.5px solid #10b981",
                background: "transparent", color: "#10b981", fontSize: 13, fontWeight: 700,
                cursor: syncing ? "not-allowed" : "pointer", opacity: syncing ? 0.6 : 1,
              }}
            >{syncing ? "Syncing…" : "Sync"}</button>
            <button
              onClick={() => onDisconnect(integration.id)}
              style={{
                flex: 1, padding: "8px 14px", borderRadius: 9, border: "1.5px solid #fee2e2",
                background: "transparent", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >Disconnect</button>
          </>
        )}
        <button
          style={{
            padding: "8px 14px", borderRadius: 9, border: "1.5px solid #e5e7eb",
            background: "transparent", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >Configure</button>
      </div>

      {/* Status indicator */}
      {isConnected && (
        <div style={{
          marginTop: 12, fontSize: 12, color: "#059669",
          background: "#f0fdf4", borderRadius: 8, padding: "6px 10px",
        }}>
          ✅ Active — {integration.isDemo ? "Demo mode. Connect credentials to go live." : "Live connection."}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<IntegrationCategory, string> = {
  storage: "☁️", productivity: "🧑‍💼", communication: "💬",
  automation: "⚡", developer: "🐙", calendar: "📅",
};

export default function IntegrationsHub({ setWorkspace }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncingId,    setSyncingId]    = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [toast,        setToast]        = useState("");
  const [filter,       setFilter]       = useState<IntegrationCategory | "all">("all");
  const stats = IntegrationService.getStats();
  const events = IntegrationService.getEvents(6);

  const refresh = useCallback(() => {
    setIntegrations(IntegrationService.getAll());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleConnect = async (id: string) => {
    setConnectingId(id);
    await IntegrationService.connect(id);
    setConnectingId(null);
    refresh();
    showToast("Integration connected (Demo Mode).");
  };

  const handleDisconnect = async (id: string) => {
    await IntegrationService.disconnect(id);
    refresh();
    showToast("Integration disconnected.");
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    await IntegrationService.sync(id);
    setSyncingId(null);
    refresh();
    showToast("Sync complete.");
  };

  const categories: (IntegrationCategory | "all")[] = [
    "all", "storage", "productivity", "communication", "automation", "developer", "calendar",
  ];

  const filtered = filter === "all" ? integrations : integrations.filter(i => i.category === filter);

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1e293b", color: "#fff",
          borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        }}>{toast}</div>
      )}

      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #7c3aed 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>Integrations Hub</h1>
          <span style={{ fontSize: 12, background: "#6c63ff", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>V5.7</span>
        </div>
        <p style={{ margin: "0 0 0", fontSize: 16, opacity: 0.9, maxWidth: 560 }}>
          Connect Voxora to your favourite tools — cloud storage, productivity apps, communication platforms, and automation services. All in demo mode until you add credentials.
        </p>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {[
          { icon: "🔌", val: stats.total,      label: "Available" },
          { icon: "✅", val: stats.connected,   label: "Connected" },
          { icon: "○",  val: stats.available,   label: "Not Connected" },
          { icon: "🔄", val: events.filter(e => e.type === "sync").length, label: "Recent Syncs" },
          { icon: "🟢", val: stats.connected > 0 ? "Healthy" : "None", label: "Health" },
          { icon: "🧪", val: "Demo",            label: "Mode" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ fontSize: 20 }}>{s.icon}</div>
            <p className="stat-value" style={{ fontSize: 14 }}>{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Demo notice */}
      <div style={{
        background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
        border: "1.5px solid #c4b5fd", borderRadius: 14,
        padding: "14px 18px", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>🧪</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#4c1d95" }}>Demo Integration Mode</div>
          <div style={{ fontSize: 13, color: "#6d28d9", marginTop: 2 }}>
            No credentials required — connect, sync, and disconnect integrations to simulate the full workflow. Add real API keys in Integration Settings to go live.
          </div>
        </div>
        <button
          onClick={() => setWorkspace("intSettings")}
          style={{
            marginLeft: "auto", padding: "8px 16px", borderRadius: 9, border: "none",
            background: "#6c63ff", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}
        >Settings →</button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 16px", borderRadius: 20,
              border: `1.5px solid ${filter === cat ? "#6c63ff" : "#e5e7eb"}`,
              background: filter === cat ? "#6c63ff" : "transparent",
              color: filter === cat ? "#fff" : "#374151",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            {cat === "all" ? "All" : `${CATEGORY_ICONS[cat as IntegrationCategory]} ${CATEGORY_LABELS[cat as IntegrationCategory]}`}
          </button>
        ))}
      </div>

      {/* Integration cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        gap: 16, marginBottom: 36,
      }}>
        {filtered.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            syncing={syncingId === integration.id}
            connecting={connectingId === integration.id}
          />
        ))}
      </div>

      {/* Recent Activity */}
      {events.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🔄 Recent Sync Activity</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {events.map(ev => (
              <div key={ev.id} style={{
                background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
                borderRadius: 12, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <span style={{ fontSize: 20 }}>
                  {ev.type === "connect" ? "🔗" : ev.type === "disconnect" ? "🔌" : ev.type === "sync" ? "🔄" : "📡"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.integrationName}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{ev.message}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: ev.status === "success" ? "#d1fae5" : "#fee2e2",
                  color: ev.status === "success" ? "#059669" : "#dc2626",
                }}>{ev.status}</span>
                <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
                  {formatRelative(ev.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Automation CTA */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        borderRadius: 16, padding: "24px 28px", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>⚡ Ready to Automate?</h3>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>
            Build workflows that trigger automatically when integrations sync or events occur.
          </p>
        </div>
        <button
          onClick={() => setWorkspace("automation")}
          style={{
            padding: "12px 24px", borderRadius: 12, border: "none",
            background: "#6c63ff", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >Open Automation Engine →</button>
      </div>
    </div>
  );
}
