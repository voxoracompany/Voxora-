// ── V8.3 Webhook Manager ─────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { WebhookManager, validateWebhookUrl, validateSecret, validateApiKey } from "../../services/integrations/WebhookManager";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import type { WebhookEndpoint, WebhookDelivery } from "../../services/integrations/IntegrationTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type Tab = "incoming" | "outgoing" | "history" | "queue";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DIRECTION_ICON = { incoming: "📥", outgoing: "📤" } as const;
const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  success:  { bg: "#d1fae5", color: "#065f46" },
  failed:   { bg: "#fee2e2", color: "#991b1b" },
  pending:  { bg: "#fef9c3", color: "#78350f" },
  retrying: { bg: "#ede9fe", color: "#5b21b6" },
};

// ── Endpoint Card ──────────────────────────────────────────────────────────────
const EndpointCard = React.memo(function EndpointCard({
  ep, onDelete, onToggle, onTest,
}: {
  ep: WebhookEndpoint;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onTest?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(ep.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [ep.url]);

  return (
    <div style={{
      background: "var(--bg-card, #fff)",
      border: `1.5px solid ${ep.status === "active" ? "#bbf7d0" : "#e5e7eb"}`,
      borderRadius: 14, padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 22, marginTop: 2 }}>{DIRECTION_ICON[ep.direction]}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{ep.name}</div>
          <div style={{
            fontSize: 12, fontFamily: "monospace", color: "#6C63FF",
            background: "#ede9fe", borderRadius: 6, padding: "3px 8px",
            marginTop: 4, display: "inline-block", maxWidth: "100%",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{ep.url || "No URL configured"}</div>
          {ep.eventTypes.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {ep.eventTypes.map(t => (
                <span key={t} style={{
                  fontSize: 11, background: "#f1f5f9", color: "#64748b",
                  borderRadius: 6, padding: "2px 8px", fontWeight: 600,
                }}>{t}</span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#9ca3af", marginTop: 8, flexWrap: "wrap" }}>
            <span>📦 {ep.deliveryCount} deliveries</span>
            {ep.failureCount > 0 && <span style={{ color: "#ef4444" }}>❌ {ep.failureCount} failures</span>}
            {ep.lastDeliveryAt && <span>🕐 Last {timeAgo(ep.lastDeliveryAt)}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
            background: ep.status === "active" ? "#d1fae5" : "#f1f5f9",
            color: ep.status === "active" ? "#059669" : "#6b7280",
          }}>{ep.status}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <button className="workspace-btn" onClick={copyUrl}
          style={{ padding: "5px 12px", fontSize: 12 }}>
          {copied ? "✅ Copied!" : "📋 Copy URL"}
        </button>
        <button className="workspace-btn" onClick={() => onToggle(ep.id)}
          style={{ padding: "5px 12px", fontSize: 12 }}>
          {ep.status === "active" ? "⏸ Pause" : "▶ Activate"}
        </button>
        {onTest && (
          <button className="workspace-btn" onClick={() => onTest(ep.id)}
            style={{ padding: "5px 12px", fontSize: 12, background: "#6C63FF", color: "#fff", border: "none" }}>
            🧪 Test
          </button>
        )}
        <button className="workspace-btn" onClick={() => onDelete(ep.id)}
          style={{ padding: "5px 12px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
});

// ── Delivery Row ───────────────────────────────────────────────────────────────
const DeliveryRow = React.memo(function DeliveryRow({ d }: { d: WebhookDelivery }) {
  const [expanded, setExpanded] = useState(false);
  const badge = STATUS_BADGE[d.status] ?? { bg: "#f1f5f9", color: "#6b7280" };
  return (
    <div style={{
      background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
      borderRadius: 12, overflow: "hidden",
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", cursor: "pointer" }}
        onClick={() => setExpanded(v => !v)}
      >
        <span style={{ fontSize: 16 }}>{DIRECTION_ICON[d.direction]}</span>
        <span style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace", flex: 1 }}>{d.eventType}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{d.webhookName}</span>
        {d.statusCode && <span style={{ fontSize: 12, color: "#6b7280" }}>{d.statusCode}</span>}
        {d.durationMs && <span style={{ fontSize: 11, color: "#9ca3af" }}>{d.durationMs}ms</span>}
        {d.retryAttempt > 0 && (
          <span style={{ fontSize: 11, color: "#8b5cf6" }}>retry #{d.retryAttempt}</span>
        )}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
          background: badge.bg, color: badge.color,
        }}>{d.status.toUpperCase()}</span>
        <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>{timeAgo(d.timestamp)}</span>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 16px", background: "#fafafa" }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>REQUEST</div>
            <pre style={{
              margin: 0, fontSize: 11, fontFamily: "monospace", color: "#374151",
              background: "#f1f5f9", borderRadius: 8, padding: "8px 12px",
              overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
            }}>{d.requestPayload}</pre>
          </div>
          {d.responsePayload && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>RESPONSE</div>
              <pre style={{
                margin: 0, fontSize: 11, fontFamily: "monospace", color: "#059669",
                background: "#f0fdf4", borderRadius: 8, padding: "8px 12px",
                overflow: "auto", whiteSpace: "pre-wrap",
              }}>{d.responsePayload}</pre>
            </div>
          )}
          {d.errorMessage && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "8px 12px" }}>
              ⚠️ {d.errorMessage}
            </div>
          )}
          {d.nextRetryAt && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#8b5cf6" }}>
              🔁 Next retry: {timeAgo(d.nextRetryAt)}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ── Add Endpoint Form ──────────────────────────────────────────────────────────
function AddEndpointForm({
  direction, onAdd, onClose,
}: {
  direction: "incoming" | "outgoing";
  onAdd: (ep: WebhookEndpoint) => void;
  onClose: () => void;
}) {
  const [name, setName]     = useState("");
  const [url, setUrl]       = useState("");
  const [secret, setSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [events, setEvents] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (direction === "outgoing") {
      if (!url.trim()) { e.url = "URL is required for outgoing webhooks."; }
      else if (!validateWebhookUrl(url)) { e.url = "Enter a valid http/https URL."; }
    }
    if (secret && !validateSecret(secret)) { e.secret = "Secret must be at least 8 characters."; }
    if (apiKey && !validateApiKey(apiKey)) { e.apiKey = "API key looks invalid (must be ≥ 8 chars, not a placeholder)."; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const ep = WebhookManager.addEndpoint({
      name: name.trim(),
      direction,
      url: url.trim(),
      secret: secret.trim(),
      apiKey: apiKey.trim(),
      eventTypes: events.split(",").map(s => s.trim()).filter(Boolean),
    });
    onAdd(ep);
  };

  const field = (label: string, placeholder: string, value: string, onChange: (v: string) => void, err?: string, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${err ? "#fca5a5" : "#e5e7eb"}`,
          fontSize: 13, outline: "none", background: "var(--bg-card, #fff)", boxSizing: "border-box",
        }}
      />
      {err && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{err}</div>}
    </div>
  );

  return (
    <div style={{
      background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
      borderRadius: 16, padding: "22px 24px", marginBottom: 20,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>
        {direction === "incoming" ? "📥 Add Incoming Endpoint" : "📤 Add Outgoing Webhook"}
      </h3>
      {field("Name *", "e.g. Zapier Trigger", name, setName, errors.name)}
      {direction === "outgoing" && field("Destination URL *", "https://hooks.example.com/…", url, setUrl, errors.url)}
      {field("Signing Secret (optional)", "At least 8 characters — stored locally", secret, setSecret, errors.secret, "password")}
      {field("API Key / Bearer Token (optional)", "Placeholder — not sent over the network in demo mode", apiKey, setApiKey, errors.apiKey, "password")}
      {field("Event Types (comma-separated)", "project.created, sync.complete", events, setEvents)}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button className="workspace-btn" onClick={handleSubmit}
          style={{ padding: "8px 20px", background: "#6C63FF", color: "#fff", border: "none" }}>
          ✅ Add Endpoint
        </button>
        <button className="workspace-btn" onClick={onClose}
          style={{ padding: "8px 20px" }}>Cancel</button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntWebhooks({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();

  const [tab, setTab]               = useState<Tab>("incoming");
  const [incoming, setIncoming]     = useState<WebhookEndpoint[]>([]);
  const [outgoing, setOutgoing]     = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [queue, setQueue]           = useState(WebhookManager.getRetryQueue());
  const [addingIncoming, setAddingIncoming] = useState(false);
  const [addingOutgoing, setAddingOutgoing] = useState(false);
  const [testingId, setTestingId]   = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "success" | "failed">("all");

  const reload = useCallback(() => {
    setIncoming(WebhookManager.getIncoming());
    setOutgoing(WebhookManager.getOutgoing());
    setDeliveries(WebhookManager.getDeliveries(100));
    setQueue(WebhookManager.getRetryQueue());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleDelete = useCallback((id: string) => {
    WebhookManager.deleteEndpoint(id);
    reload();
    showToast("🗑️ Webhook endpoint deleted.");
  }, [reload, showToast]);

  const handleToggle = useCallback((id: string) => {
    const ep = WebhookManager.getEndpoint(id);
    if (!ep) return;
    WebhookManager.setStatus(id, ep.status === "active" ? "paused" : "active");
    reload();
    showToast(`${ep.status === "active" ? "⏸ Paused" : "▶ Activated"} webhook.`);
  }, [reload, showToast]);

  const handleTest = useCallback(async (id: string) => {
    setTestingId(id);
    try {
      const d = await WebhookManager.testOutgoing(id);
      reload();
      if (d.status === "success") {
        showToast("✅ Test delivery sent successfully!");
        addActivity({ type: "webhook_test", title: "Webhook Test", description: "Outgoing test sent.", category: "Integrations", icon: "🔗" });
      } else {
        showToast("⚠️ Test delivery failed (simulated). Check delivery history.", "error");
      }
    } finally {
      setTestingId(null);
    }
  }, [reload, showToast, addActivity]);

  const handleAddEndpoint = useCallback((ep: WebhookEndpoint) => {
    reload();
    setAddingIncoming(false);
    setAddingOutgoing(false);
    showToast(`✅ Endpoint "${ep.name}" added.`);
    addActivity({ type: "webhook_added", title: "Webhook Added", description: `${ep.direction} endpoint: ${ep.name}`, category: "Integrations", icon: "🔗" });
  }, [reload, showToast, addActivity]);

  const handleClearHistory = useCallback(() => {
    WebhookManager.clearDeliveries();
    reload();
    showToast("🗑️ Delivery history cleared.");
  }, [reload, showToast]);

  const handleClearQueue = useCallback(() => {
    WebhookManager.clearRetryQueue();
    reload();
    showToast("🗑️ Retry queue cleared.");
  }, [reload, showToast]);

  const filteredDeliveries = useMemo(() => {
    if (historyFilter === "all") return deliveries;
    return deliveries.filter(d => d.status === historyFilter);
  }, [deliveries, historyFilter]);

  const stats = useMemo(() => WebhookManager.getStats(), [deliveries]);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "incoming", label: `Incoming (${incoming.length})`, icon: "📥" },
    { id: "outgoing", label: `Outgoing (${outgoing.length})`, icon: "📤" },
    { id: "history",  label: `History (${deliveries.length})`, icon: "📋" },
    { id: "queue",    label: `Retry Queue (${queue.length})`, icon: "🔁" },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="workspace-title">🔗 Webhook Manager</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
            Manage incoming and outgoing webhooks, delivery history, and retry queue.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="workspace-btn" onClick={reload} style={{ padding: "8px 16px", fontSize: 13 }}>🔄 Refresh</button>
          <button className="workspace-btn" onClick={() => setWorkspace("intDashboard")}
            style={{ padding: "8px 16px", fontSize: 13, background: "#6C63FF", color: "#fff", border: "none" }}>
            📊 Dashboard
          </button>
        </div>
      </div>

      {/* Stats Pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: `${stats.totalDeliveries} Deliveries`, color: "#6C63FF", bg: "#ede9fe" },
          { label: `${stats.successDeliveries} Success`,  color: "#059669", bg: "#d1fae5" },
          { label: `${stats.failedDeliveries} Failed`,    color: "#dc2626", bg: "#fee2e2" },
          { label: `${Math.round(stats.successRate * 100)}% Rate`, color: stats.successRate >= 0.9 ? "#059669" : "#f59e0b", bg: "#fef3c7" },
        ].map(p => (
          <span key={p.label} style={{
            fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
            background: p.bg, color: p.color,
          }}>{p.label}</span>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", borderRadius: 10, border: "1.5px solid",
            borderColor: tab === t.id ? "#6C63FF" : "var(--border, #e5e7eb)",
            background: tab === t.id ? "#ede9fe" : "var(--bg-card, #fff)",
            color: tab === t.id ? "#6C63FF" : "#374151",
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* ── Incoming Tab ── */}
      {tab === "incoming" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Receive events from external services. Copy the URL and paste it into the source system.
            </p>
            <button className="workspace-btn" onClick={() => setAddingIncoming(v => !v)}
              style={{ padding: "7px 16px", fontSize: 13, background: "#6C63FF", color: "#fff", border: "none" }}>
              + Add Endpoint
            </button>
          </div>
          {addingIncoming && (
            <AddEndpointForm direction="incoming" onAdd={handleAddEndpoint} onClose={() => setAddingIncoming(false)} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {incoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p>No incoming endpoints. Add one to start receiving events.</p>
              </div>
            ) : (
              incoming.map(ep => (
                <EndpointCard key={ep.id} ep={ep} onDelete={handleDelete} onToggle={handleToggle} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Outgoing Tab ── */}
      {tab === "outgoing" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Push events from Voxora to external services. Configure your destination URL and credentials.
            </p>
            <button className="workspace-btn" onClick={() => setAddingOutgoing(v => !v)}
              style={{ padding: "7px 16px", fontSize: 13, background: "#6C63FF", color: "#fff", border: "none" }}>
              + Add Webhook
            </button>
          </div>
          {addingOutgoing && (
            <AddEndpointForm direction="outgoing" onAdd={handleAddEndpoint} onClose={() => setAddingOutgoing(false)} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {outgoing.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p>No outgoing webhooks. Add one to start pushing events.</p>
              </div>
            ) : (
              outgoing.map(ep => (
                <EndpointCard
                  key={ep.id} ep={ep} onDelete={handleDelete} onToggle={handleToggle}
                  onTest={testingId === null ? handleTest : undefined}
                />
              ))
            )}
          </div>
          {testingId && (
            <div style={{ textAlign: "center", padding: "16px", color: "#6C63FF", fontSize: 14, fontWeight: 600 }}>
              🧪 Sending test delivery…
            </div>
          )}
        </div>
      )}

      {/* ── History Tab ── */}
      {tab === "history" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["all", "success", "failed"] as const).map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} style={{
                  padding: "5px 14px", borderRadius: 8, border: "1.5px solid",
                  borderColor: historyFilter === f ? "#6C63FF" : "#e5e7eb",
                  background: historyFilter === f ? "#ede9fe" : "#fff",
                  color: historyFilter === f ? "#6C63FF" : "#374151",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>
            {deliveries.length > 0 && (
              <button className="workspace-btn" onClick={handleClearHistory}
                style={{ padding: "5px 14px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                🗑️ Clear History
              </button>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredDeliveries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
                <p>No delivery history{historyFilter !== "all" ? ` for "${historyFilter}"` : ""}.</p>
              </div>
            ) : (
              filteredDeliveries.map(d => <DeliveryRow key={d.id} d={d} />)
            )}
          </div>
        </div>
      )}

      {/* ── Retry Queue Tab ── */}
      {tab === "queue" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
              Failed deliveries are automatically queued for retry (up to 3 attempts).
            </p>
            {queue.length > 0 && (
              <button className="workspace-btn" onClick={handleClearQueue}
                style={{ padding: "5px 14px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                🗑️ Clear Queue
              </button>
            )}
          </div>
          {queue.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p>No pending retries. All deliveries are healthy.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {queue.map(item => (
                <div key={item.deliveryId} style={{
                  background: "var(--bg-card, #fff)", border: "1.5px solid #e9d5ff",
                  borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>🔁</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Attempt #{item.attempt}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>Delivery: {item.deliveryId}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#8b5cf6" }}>
                    Scheduled {timeAgo(item.scheduledAt)}
                  </div>
                  <button className="workspace-btn" onClick={() => { WebhookManager.dequeueRetry(item.deliveryId); reload(); }}
                    style={{ padding: "4px 10px", fontSize: 11 }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
