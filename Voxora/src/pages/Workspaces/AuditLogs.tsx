// ── V5.8 Audit Logs ───────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { AuditLogService }  from "../../services/admin/AuditLogService";
import type { AuditEvent, AuditEventType } from "../../services/admin/AdminTypes";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

const EVENT_TYPES: { value: AuditEventType | "all"; label: string }[] = [
  { value: "all",              label: "All Events"       },
  { value: "login",            label: "Login"            },
  { value: "logout",           label: "Logout"           },
  { value: "ai_request",       label: "AI Requests"      },
  { value: "project_create",   label: "Project Create"   },
  { value: "project_delete",   label: "Project Delete"   },
  { value: "billing_change",   label: "Billing Change"   },
  { value: "integration_event","label": "Integration"    },
  { value: "automation_event", label: "Automation"       },
  { value: "settings_change",  label: "Settings Change"  },
  { value: "user_role_change", label: "Role Change"      },
  { value: "user_suspend",     label: "User Suspend"     },
  { value: "user_delete",      label: "User Delete"      },
  { value: "feature_flag_change", label: "Feature Flags" },
];

const SEVERITY_COLORS: Record<AuditEvent["severity"], string> = {
  info:     "#6366f1",
  warning:  "#f59e0b",
  critical: "#ef4444",
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

export default function AuditLogs({ setWorkspace }: Props) {
  // Seed demo data
  useMemo(() => AuditLogService.seed(), []);

  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<AuditEventType | "all">("all");
  const [sevFilter, setSevFilter]   = useState<AuditEvent["severity"] | "all">("all");
  const [toast, setToast]           = useState("");

  const allEvents = useMemo(() => AuditLogService.getAll(), [toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allEvents.filter((e) => {
      const matchQ   = !q || e.description.toLowerCase().includes(q) || e.userName.toLowerCase().includes(q) || e.type.includes(q);
      const matchT   = typeFilter === "all" || e.type === typeFilter;
      const matchS   = sevFilter  === "all" || e.severity === sevFilter;
      return matchQ && matchT && matchS;
    });
  }, [allEvents, search, typeFilter, sevFilter]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const downloadJSON = () => {
    const blob = new Blob([AuditLogService.exportJSON()], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `voxora-audit-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast("📥 Exported JSON");
  };

  const downloadCSV = () => {
    const blob = new Blob([AuditLogService.exportCSV()], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `voxora-audit-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast("📊 Exported CSV");
  };

  const handleClear = () => {
    AuditLogService.clear();
    showToast("🗑️ Audit log cleared");
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>📋 Audit Logs</h1>
          <span className="admin-badge admin-badge--blue">V5.8</span>
        </div>
        <p className="workspace-subtitle">Complete record of platform events and user actions.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button className="admin-action-btn admin-action-btn--primary" onClick={downloadJSON}>📥 Export JSON</button>
          <button className="admin-action-btn admin-action-btn--primary" onClick={downloadCSV}>📊 Export CSV</button>
          <button className="admin-action-btn" onClick={handleClear}>🗑️ Clear Log</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-grid">
        {[
          { icon: "📋", label: "Total Events",    value: String(allEvents.length) },
          { icon: "🔴", label: "Critical",        value: String(allEvents.filter(e => e.severity === "critical").length) },
          { icon: "🟡", label: "Warnings",        value: String(allEvents.filter(e => e.severity === "warning").length)  },
          { icon: "🔵", label: "Info",            value: String(allEvents.filter(e => e.severity === "info").length)     },
          { icon: "🔍", label: "Filtered",        value: String(filtered.length) },
          { icon: "👤", label: "Users Tracked",   value: "1" },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value">{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-filter-row">
          <input
            className="admin-search-input"
            placeholder="🔍  Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="admin-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select className="admin-select" value={sevFilter} onChange={(e) => setSevFilter(e.target.value as any)}>
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", margin: "8px 0 0" }}>
          Showing {filtered.length} of {allEvents.length} events
        </p>
      </div>

      {/* Events List */}
      <div className="admin-card">
        {filtered.length === 0 ? (
          <p className="admin-empty-text">No events match your filters.</p>
        ) : (
          <div className="admin-rows">
            {filtered.map((e) => (
              <div key={e.id} className="admin-event-row">
                <span style={{ fontSize: 20, minWidth: 26 }}>{e.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="admin-event-desc">{e.description}</div>
                  <div className="admin-event-meta">
                    {e.userName} · <span style={{ fontFamily: "monospace", fontSize: 11 }}>{e.type.replace(/_/g, " ")}</span>
                    {e.metadata && Object.entries(e.metadata).map(([k, v]) => (
                      <span key={k} style={{ marginLeft: 8 }}>{k}: {v}</span>
                    ))}
                  </div>
                </div>
                <span
                  className={`admin-severity admin-severity--${e.severity}`}
                  style={{ background: SEVERITY_COLORS[e.severity] + "22", color: SEVERITY_COLORS[e.severity], border: `1px solid ${SEVERITY_COLORS[e.severity]}44` }}
                >
                  {e.severity}
                </span>
                <div style={{ textAlign: "right", minWidth: 60 }}>
                  <div className="admin-event-time">{timeAgo(e.timestamp)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary,#94a3b8)" }}>
                    {new Date(e.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
