// ── V8.3 Integration Settings ────────────────────────────────────────────────
import React, { useState, useCallback, useMemo } from "react";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import type { SyncFrequency, IntegrationPreferences, NotificationPreferences } from "../../services/integrations/IntegrationTypes";
import "./Workspace.css";
import "./Settings.css";

interface Props { setWorkspace: (w: string) => void }

type Tab = "accounts" | "sync" | "retries" | "notifications" | "oauth" | "preferences";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "accounts",      label: "Connected Accounts",     icon: "🔌" },
  { id: "sync",          label: "Sync Frequency",         icon: "🔄" },
  { id: "retries",       label: "Retry Attempts",         icon: "🔁" },
  { id: "notifications", label: "Notifications",          icon: "🔔" },
  { id: "oauth",         label: "OAuth Connections",      icon: "🔐" },
  { id: "preferences",   label: "Preferences",            icon: "⚙️" },
];

const FREQ_OPTIONS: { value: SyncFrequency; label: string; desc: string }[] = [
  { value: "realtime", label: "Realtime",    desc: "Sync immediately on every event" },
  { value: "hourly",   label: "Hourly",      desc: "Sync once per hour automatically" },
  { value: "daily",    label: "Daily",       desc: "Sync once per day at midnight" },
  { value: "manual",   label: "Manual only", desc: "Sync only when you click the button" },
];

const STATUS_COLOR: Record<string, string> = {
  connected: "#10b981", available: "#9ca3af", error: "#ef4444",
  syncing: "#f59e0b", disconnected: "#6b7280",
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

// ── Toggle ─────────────────────────────────────────────────────────────────────
const Toggle = React.memo(function Toggle({
  value, onChange, label, desc,
}: { value: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: value ? "#6C63FF" : "#d1d5db",
          transition: "background 0.2s", position: "relative", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.18s", display: "block",
        }} />
      </button>
    </div>
  );
});

// ── Panel Wrapper ──────────────────────────────────────────────────────────────
const Panel = React.memo(function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
      borderRadius: 16, padding: "20px 22px", marginBottom: 16,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>{title}</h3>
      {children}
    </div>
  );
});

// ── Connected Accounts Tab ─────────────────────────────────────────────────────
const AccountsTab = React.memo(function AccountsTab({
  onNavigate,
}: { onNavigate: (ws: string) => void }) {
  const all = IntegrationService.getAll();
  const connected = all.filter(i => i.status === "connected");
  const metrics   = IntegrationService.getAllSyncMetrics();
  const metricsMap = Object.fromEntries(metrics.map(m => [m.integrationId, m]));

  return (
    <div>
      {connected.length === 0 ? (
        <Panel title="Connected Accounts">
          <div style={{ textAlign: "center", padding: "32px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
            <p>No integrations connected yet.</p>
            <button className="workspace-btn" onClick={() => onNavigate("integrationsHub")}
              style={{ padding: "8px 20px", marginTop: 8 }}>
              Connect Integrations →
            </button>
          </div>
        </Panel>
      ) : (
        <Panel title={`Connected Accounts (${connected.length})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {connected.map(i => {
              const m = metricsMap[i.id];
              const rate = m && m.totalSyncs > 0
                ? `${Math.round(m.successRate * 100)}% success rate`
                : "No syncs yet";
              return (
                <div key={i.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", background: "#f8fafc", borderRadius: 12,
                  border: "1.5px solid #e5e7eb",
                }}>
                  <span style={{ fontSize: 26 }}>{i.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>
                      {i.lastSync ? `Last sync ${formatRelative(i.lastSync)}` : "Never synced"} · {rate}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: STATUS_COLOR[i.status] ?? "#9ca3af",
                    }} />
                    <span style={{ fontSize: 12, color: STATUS_COLOR[i.status], fontWeight: 600, textTransform: "capitalize" }}>
                      {i.status}
                    </span>
                  </div>
                  {i.syncCount > 0 && (
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{i.syncCount} syncs</span>
                  )}
                  <button className="workspace-btn" onClick={() => onNavigate("integrationsHub")}
                    style={{ padding: "5px 12px", fontSize: 12 }}>
                    Manage →
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* All integrations overview */}
      <Panel title="All Integrations">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {all.map(i => (
            <div key={i.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 14px", background: "#f8fafc", borderRadius: 10,
              border: `1.5px solid ${i.status === "connected" ? "#bbf7d0" : "#e5e7eb"}`,
            }}>
              <span style={{ fontSize: 18 }}>{i.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</span>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: STATUS_COLOR[i.status] ?? "#9ca3af",
              }} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
});

// ── Sync Frequency Tab ─────────────────────────────────────────────────────────
const SyncTab = React.memo(function SyncTab({ prefs, onChange }: {
  prefs: IntegrationPreferences;
  onChange: (p: Partial<IntegrationPreferences>) => void;
}) {
  const connected = IntegrationService.getConnected();
  const [perInteg, setPerInteg] = useState<Record<string, SyncFrequency>>(() =>
    Object.fromEntries(connected.map(i => [i.id, (i.config.syncFrequency as SyncFrequency) ?? prefs.defaultSyncFrequency]))
  );

  const handlePerChange = (id: string, val: SyncFrequency) => {
    setPerInteg(prev => ({ ...prev, [id]: val }));
    IntegrationService.updateConfig(id, { syncFrequency: val });
  };

  return (
    <div>
      <Panel title="Default Sync Frequency">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {FREQ_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => onChange({ defaultSyncFrequency: opt.value })} style={{
              padding: "14px 16px", borderRadius: 12, textAlign: "left",
              border: `2px solid ${prefs.defaultSyncFrequency === opt.value ? "#6C63FF" : "#e5e7eb"}`,
              background: prefs.defaultSyncFrequency === opt.value ? "#ede9fe" : "var(--bg-card, #fff)",
              cursor: "pointer",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: prefs.defaultSyncFrequency === opt.value ? "#6C63FF" : "#111827" }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </Panel>

      {connected.length > 0 && (
        <Panel title="Per-Integration Sync Frequency">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {connected.map(i => (
              <div key={i.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", background: "#f8fafc", borderRadius: 12,
              }}>
                <span style={{ fontSize: 22 }}>{i.icon}</span>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <select
                  value={perInteg[i.id] ?? prefs.defaultSyncFrequency}
                  onChange={e => handlePerChange(i.id, e.target.value as SyncFrequency)}
                  style={{
                    padding: "7px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                    fontSize: 13, background: "#fff", cursor: "pointer",
                  }}
                >
                  {FREQ_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
});

// ── Retry Attempts Tab ─────────────────────────────────────────────────────────
const RetriesTab = React.memo(function RetriesTab({ prefs, onChange }: {
  prefs: IntegrationPreferences;
  onChange: (p: Partial<IntegrationPreferences>) => void;
}) {
  return (
    <div>
      <Panel title="Retry Configuration">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            Max Retry Attempts: <span style={{ color: "#6C63FF", fontWeight: 800 }}>{prefs.defaultRetryAttempts}</span>
          </label>
          <input
            type="range" min={0} max={5} step={1}
            value={prefs.defaultRetryAttempts}
            onChange={e => onChange({ defaultRetryAttempts: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "#6C63FF" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            <span>0 (no retry)</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>
        </div>
        <Toggle
          value={prefs.autoReconnect}
          onChange={v => onChange({ autoReconnect: v })}
          label="Auto-Reconnect"
          desc="Automatically reconnect integrations that become disconnected"
        />
      </Panel>

      <Panel title="Log Retention">
        <div>
          <label style={{ display: "block", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            Keep logs for: <span style={{ color: "#6C63FF", fontWeight: 800 }}>{prefs.logRetention} days</span>
          </label>
          <input
            type="range" min={7} max={90} step={7}
            value={prefs.logRetention}
            onChange={e => onChange({ logRetention: Number(e.target.value) })}
            style={{ width: "100%", accentColor: "#6C63FF" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            <span>7d</span><span>30d</span><span>60d</span><span>90d</span>
          </div>
        </div>
      </Panel>
    </div>
  );
});

// ── Notifications Tab ──────────────────────────────────────────────────────────
const NotificationsTab = React.memo(function NotificationsTab({ notif, onChange }: {
  notif: NotificationPreferences;
  onChange: (n: Partial<NotificationPreferences>) => void;
}) {
  return (
    <div>
      <Panel title="Notification Level">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {([
            { value: "all",         label: "All Events",   desc: "Connect, sync, failures" },
            { value: "errors_only", label: "Errors Only",  desc: "Failures and alerts only" },
            { value: "none",        label: "Silent",       desc: "No notifications" },
          ] as const).map(opt => (
            <button key={opt.value} onClick={() => onChange({ level: opt.value })} style={{
              flex: "1 1 140px", padding: "12px 14px", borderRadius: 12, textAlign: "left",
              border: `2px solid ${notif.level === opt.value ? "#6C63FF" : "#e5e7eb"}`,
              background: notif.level === opt.value ? "#ede9fe" : "var(--bg-card, #fff)",
              cursor: "pointer",
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: notif.level === opt.value ? "#6C63FF" : "#111827" }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Event Triggers">
        <Toggle value={notif.onConnect}        onChange={v => onChange({ onConnect: v })}        label="On Connect"         desc="Notify when an integration is connected" />
        <Toggle value={notif.onDisconnect}     onChange={v => onChange({ onDisconnect: v })}     label="On Disconnect"      desc="Notify when an integration disconnects" />
        <Toggle value={notif.onSyncFail}       onChange={v => onChange({ onSyncFail: v })}       label="On Sync Failure"    desc="Notify when a sync operation fails" />
        <Toggle value={notif.onWebhookFail}    onChange={v => onChange({ onWebhookFail: v })}    label="On Webhook Failure" desc="Notify when a webhook delivery fails" />
        <Toggle value={notif.onHealthDegraded} onChange={v => onChange({ onHealthDegraded: v })} label="On Health Degraded" desc="Notify when a provider's health degrades" />
      </Panel>
    </div>
  );
});

// ── OAuth Tab ──────────────────────────────────────────────────────────────────
const OAuthTab = React.memo(function OAuthTab({ onNavigate }: { onNavigate: (ws: string) => void }) {
  const OAUTH_INTEGRATIONS = [
    { id: "googleDrive", name: "Google Drive",     icon: "🗂️", scope: "drive.file, drive.readonly", provider: "Google" },
    { id: "googleCal",   name: "Google Calendar",  icon: "📅", scope: "calendar.events, calendar.readonly", provider: "Google" },
    { id: "notion",      name: "Notion",            icon: "📄", scope: "read_content, update_content", provider: "Notion" },
    { id: "slack",       name: "Slack",             icon: "💬", scope: "channels:read, chat:write", provider: "Slack" },
    { id: "github",      name: "GitHub",            icon: "🐙", scope: "repo, read:user", provider: "GitHub" },
    { id: "dropbox",     name: "Dropbox",           icon: "📦", scope: "files.content.read, files.content.write", provider: "Dropbox" },
  ];

  const all = IntegrationService.getAll();
  const statusMap = Object.fromEntries(all.map(i => [i.id, i.status]));

  return (
    <div>
      <Panel title="OAuth Connections">
        <div style={{
          background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 10,
          padding: "12px 16px", fontSize: 13, color: "#92400e", marginBottom: 16,
        }}>
          🔐 OAuth connections are available in production with real API keys configured.
          In Demo Mode, connections are simulated and no data leaves your device.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {OAUTH_INTEGRATIONS.map(o => {
            const status = statusMap[o.id] ?? "available";
            const isConn = status === "connected";
            return (
              <div key={o.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", background: "#f8fafc", borderRadius: 12,
                border: `1.5px solid ${isConn ? "#bbf7d0" : "#e5e7eb"}`,
              }}>
                <span style={{ fontSize: 24 }}>{o.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    Provider: {o.provider} · Scopes: <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 5px", borderRadius: 4 }}>{o.scope}</code>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                  background: isConn ? "#d1fae5" : "#f1f5f9",
                  color: isConn ? "#059669" : "#6b7280",
                }}>
                  {isConn ? "Connected" : "Not Connected"}
                </span>
                <button className="workspace-btn" onClick={() => onNavigate("integrationsHub")}
                  style={{ padding: "5px 12px", fontSize: 12 }}>
                  {isConn ? "Manage" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
});

// ── Preferences Tab ────────────────────────────────────────────────────────────
const PreferencesTab = React.memo(function PreferencesTab({ prefs, onChange }: {
  prefs: IntegrationPreferences;
  onChange: (p: Partial<IntegrationPreferences>) => void;
}) {
  return (
    <div>
      <Panel title="Integration Preferences">
        <Toggle
          value={prefs.autoReconnect}
          onChange={v => onChange({ autoReconnect: v })}
          label="Auto-Reconnect"
          desc="Automatically reconnect integrations that become unavailable"
        />
        <div style={{ paddingTop: 12, marginTop: 4 }}>
          <label style={{ fontWeight: 600, fontSize: 14, display: "block", marginBottom: 8 }}>
            Default Sync Frequency
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FREQ_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => onChange({ defaultSyncFrequency: opt.value })} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 13,
                border: `2px solid ${prefs.defaultSyncFrequency === opt.value ? "#6C63FF" : "#e5e7eb"}`,
                background: prefs.defaultSyncFrequency === opt.value ? "#ede9fe" : "#fff",
                color: prefs.defaultSyncFrequency === opt.value ? "#6C63FF" : "#374151",
                fontWeight: prefs.defaultSyncFrequency === opt.value ? 700 : 500,
                cursor: "pointer",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Data Management">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 0", borderBottom: "1px solid #f1f5f9",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Export Integration Config</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Download your integration settings as JSON</div>
            </div>
            <button className="workspace-btn" onClick={() => {
              const data = { integrations: IntegrationService.getAll(), prefs };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href = url; a.download = "voxora-integrations.json"; a.click();
              URL.revokeObjectURL(url);
            }} style={{ padding: "6px 14px", fontSize: 12 }}>
              📥 Export
            </button>
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 0",
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#dc2626" }}>Reset All Integrations</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Disconnect all and clear local data</div>
            </div>
            <button className="workspace-btn" onClick={() => {
              if (window.confirm("This will disconnect all integrations and clear local data. Continue?")) {
                localStorage.removeItem("voxora-integrations-v2");
                localStorage.removeItem("voxora-integration-events-v2");
                localStorage.removeItem("voxora-integration-health-v1");
                localStorage.removeItem("voxora-integration-metrics-v1");
                window.location.reload();
              }
            }} style={{ padding: "6px 14px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
              🗑️ Reset
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
});

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IntegrationSettings({ setWorkspace }: Props) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();

  const [tab, setTab] = useState<Tab>("accounts");
  const [prefs, setPrefs] = useState<IntegrationPreferences>(() => IntegrationService.getPreferences());

  const handlePrefsChange = useCallback((updates: Partial<IntegrationPreferences>) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    IntegrationService.savePreferences(next);
    showToast("✅ Settings saved.");
    addActivity({ type: "settings_saved", title: "Integration Settings", description: "Preferences updated.", category: "Integrations", icon: "⚙️" });
  }, [prefs, showToast, addActivity]);

  const handleNotifChange = useCallback((updates: Partial<NotificationPreferences>) => {
    const next: IntegrationPreferences = { ...prefs, notifications: { ...prefs.notifications, ...updates } };
    setPrefs(next);
    IntegrationService.savePreferences(next);
    showToast("✅ Notification preferences saved.");
  }, [prefs, showToast]);

  const notif = useMemo(() => prefs.notifications, [prefs]);

  return (
    <div className="workspace-container" style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="workspace-title">⚙️ Integration Settings</h1>
          <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>
            Manage accounts, sync frequency, retries, notifications, OAuth, and preferences.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="workspace-btn" onClick={() => setWorkspace("intDashboard")}
            style={{ padding: "8px 16px", fontSize: 13 }}>
            📊 Dashboard
          </button>
          <button className="workspace-btn" onClick={() => setWorkspace("integrationsHub")}
            style={{ padding: "8px 16px", fontSize: 13, background: "#6C63FF", color: "#fff", border: "none" }}>
            🔌 Manage Integrations
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", borderRadius: 10, border: "1.5px solid",
            borderColor: tab === t.id ? "#6C63FF" : "var(--border, #e5e7eb)",
            background: tab === t.id ? "#ede9fe" : "var(--bg-card, #fff)",
            color: tab === t.id ? "#6C63FF" : "#374151",
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer",
            transition: "all 0.15s",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "accounts"      && <AccountsTab onNavigate={setWorkspace} />}
      {tab === "sync"          && <SyncTab prefs={prefs} onChange={handlePrefsChange} />}
      {tab === "retries"       && <RetriesTab prefs={prefs} onChange={handlePrefsChange} />}
      {tab === "notifications" && <NotificationsTab notif={notif} onChange={handleNotifChange} />}
      {tab === "oauth"         && <OAuthTab onNavigate={setWorkspace} />}
      {tab === "preferences"   && <PreferencesTab prefs={prefs} onChange={handlePrefsChange} />}
    </div>
  );
}
