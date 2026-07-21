// ── V5.9 Error Reporting ──────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import {
  ErrorReportingService,
  type ErrorCategory,
  type ErrorSeverity,
  type VoxoraError,
} from "../../services/admin/ErrorReportingService";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "Just now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SEV_COLOR: Record<ErrorSeverity, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

const CAT_ICON: Record<ErrorCategory, string> = {
  runtime: "⚙️",
  api: "🌐",
  ai: "🤖",
  firebase: "🔥",
  integration: "🔌",
  unknown: "❓",
};

const CATEGORIES: ErrorCategory[] = ["runtime", "api", "ai", "firebase", "integration", "unknown"];
const SEVERITIES: ErrorSeverity[] = ["critical", "high", "medium", "low"];

export default function ErrorReporting({ setWorkspace }: Props) {
  const [errors, setErrors] = useState<VoxoraError[]>([]);
  const [filterCat, setFilterCat] = useState<ErrorCategory | "all">("all");
  const [filterSev, setFilterSev] = useState<ErrorSeverity | "all">("all");
  const [filterResolved, setFilterResolved] = useState<"all" | "open" | "resolved">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    ErrorReportingService.seed();
    setErrors(ErrorReportingService.getAll());
  }, []);

  const refresh = () => setErrors(ErrorReportingService.getAll());

  const stats = useMemo(() => ErrorReportingService.getStats(), [errors]);

  const filtered = useMemo(() => errors.filter((e) => {
    if (filterCat !== "all" && e.category !== filterCat) return false;
    if (filterSev !== "all" && e.severity !== filterSev) return false;
    if (filterResolved === "open" && e.resolved) return false;
    if (filterResolved === "resolved" && !e.resolved) return false;
    return true;
  }), [errors, filterCat, filterSev, filterResolved]);

  const resolve = (id: string) => {
    ErrorReportingService.resolve(id);
    refresh();
  };
  const del = (id: string) => {
    ErrorReportingService.deleteError(id);
    refresh();
  };
  const clearResolved = () => {
    ErrorReportingService.clearResolved();
    refresh();
  };

  const exportJSON = () => {
    const blob = new Blob([ErrorReportingService.exportAsJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `voxora-errors-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const blob = new Blob([ErrorReportingService.exportAsCSV()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `voxora-errors-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>🚨 Error Reporting</h1>
          <span className="admin-badge admin-badge--blue">V5.9</span>
          {stats.unresolved > 0 && (
            <span className="admin-badge admin-badge--red">{stats.unresolved} Open</span>
          )}
        </div>
        <p className="workspace-subtitle">Centralized error history, filtering, and export.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button className="admin-action-btn" onClick={refresh}>🔄 Refresh</button>
          <button className="admin-action-btn" onClick={clearResolved}>✅ Clear Resolved</button>
          <button className="admin-action-btn" onClick={exportJSON}>📥 Export JSON</button>
          <button className="admin-action-btn" onClick={exportCSV}>📊 Export CSV</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-grid">
        {[
          { icon: "📋", label: "Total Errors", value: stats.total, color: "#6C63FF" },
          { icon: "🔴", label: "Unresolved", value: stats.unresolved, color: "#ef4444" },
          { icon: "🔥", label: "Critical", value: stats.bySeverity.critical, color: "#ef4444" },
          { icon: "🟠", label: "High", value: stats.bySeverity.high, color: "#f97316" },
          { icon: "🟡", label: "Medium", value: stats.bySeverity.medium, color: "#f59e0b" },
          { icon: "🟢", label: "Low", value: stats.bySeverity.low, color: "#10b981" },
          { icon: "🤖", label: "AI Errors", value: stats.byCategory.ai, color: "#6C63FF" },
          { icon: "🔌", label: "Integration", value: stats.byCategory.integration, color: "#6C63FF" },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary,#64748b)" }}>Filter:</span>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value as ErrorCategory | "all")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid var(--border,#e2e8f0)", fontSize: 13, background: "var(--bg-card,#fff)", color: "var(--text-primary,#1e293b)" }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
          </select>
          <select
            value={filterSev}
            onChange={(e) => setFilterSev(e.target.value as ErrorSeverity | "all")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid var(--border,#e2e8f0)", fontSize: 13, background: "var(--bg-card,#fff)", color: "var(--text-primary,#1e293b)" }}
          >
            <option value="all">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value as "all" | "open" | "resolved")}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1.5px solid var(--border,#e2e8f0)", fontSize: 13, background: "var(--bg-card,#fff)", color: "var(--text-primary,#1e293b)" }}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary,#64748b)" }}>{filtered.length} results</span>
        </div>
      </div>

      {/* Error List */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>No errors found</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary,#64748b)", marginTop: 4 }}>
              {stats.total === 0 ? "No errors have been reported yet." : "No errors match the current filters."}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((e, i) => (
              <div
                key={e.id}
                style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border,#f1f5f9)" : undefined,
                  padding: "14px 18px",
                  background: e.resolved ? "transparent" : "rgba(239,68,68,0.02)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 20, marginTop: 1 }}>{CAT_ICON[e.category]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          background: `${SEV_COLOR[e.severity]}18`, color: SEV_COLOR[e.severity],
                          textTransform: "uppercase", letterSpacing: 0.4,
                        }}
                      >{e.severity}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary,#94a3b8)", textTransform: "uppercase" }}>{e.category}</span>
                      {e.source && <span style={{ fontSize: 10, color: "var(--text-secondary,#94a3b8)" }}>· {e.source}</span>}
                      {e.resolved && <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700 }}>✓ Resolved</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary,#1e293b)", marginBottom: 2 }}>{e.message}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary,#94a3b8)" }}>{timeAgo(e.timestamp)}</div>
                    {expanded === e.id && e.stack && (
                      <pre style={{ fontSize: 11, marginTop: 8, background: "var(--bg-secondary,#f8fafc)", borderRadius: 8, padding: 10, overflow: "auto", maxHeight: 120, color: "var(--text-primary,#374151)" }}>{e.stack}</pre>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    {e.stack && (
                      <button className="admin-icon-btn" title="Toggle stack" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>🔍</button>
                    )}
                    {!e.resolved && (
                      <button className="admin-icon-btn admin-icon-btn--ok" title="Mark resolved" onClick={() => resolve(e.id)}>✓</button>
                    )}
                    <button className="admin-icon-btn admin-icon-btn--danger" title="Delete" onClick={() => del(e.id)}>🗑</button>
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
