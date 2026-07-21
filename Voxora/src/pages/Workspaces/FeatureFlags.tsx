// ── V5.8 Feature Flags ────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { FeatureFlagService } from "../../services/admin/FeatureFlagService";
import { AuditLogService }    from "../../services/admin/AuditLogService";
import type { FeatureFlag }   from "../../services/admin/AdminTypes";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

const CATEGORY_LABELS: Record<FeatureFlag["category"], string> = {
  ai:           "🤖 AI",
  backend:      "🔥 Backend",
  payments:     "💳 Payments",
  integrations: "🔌 Integrations",
  platform:     "⚙️ Platform",
};

export default function FeatureFlags({ setWorkspace }: Props) {
  const [tick, setTick]               = useState(0);
  const [toast, setToast]             = useState("");
  const [catFilter, setCatFilter]     = useState<FeatureFlag["category"] | "all">("all");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const flags = useMemo(() => FeatureFlagService.getAll(), [tick]);

  const filtered = useMemo(() =>
    catFilter === "all" ? flags : flags.filter((f) => f.category === catFilter),
    [flags, catFilter],
  );

  const handleToggle = (flag: FeatureFlag) => {
    const newVal = FeatureFlagService.toggle(flag.id);
    AuditLogService.log(
      "feature_flag_change",
      `Feature flag "${flag.name}" ${newVal ? "enabled" : "disabled"}`,
    );
    showToast(`${newVal ? "✅ Enabled" : "❌ Disabled"}: ${flag.name}`);
    setTick((v) => v + 1);
  };

  const handleReset = () => {
    FeatureFlagService.reset();
    AuditLogService.log("feature_flag_change", "All feature flags reset to defaults");
    showToast("🔄 Flags reset to defaults");
    setTick((v) => v + 1);
  };

  const enabledCount  = flags.filter((f) => f.enabled).length;
  const disabledCount = flags.length - enabledCount;

  const grouped = useMemo(() => {
    const cats = (["ai","backend","payments","integrations","platform"] as FeatureFlag["category"][]);
    return cats.map((cat) => ({
      cat,
      flags: filtered.filter((f) => f.category === cat),
    })).filter((g) => g.flags.length > 0);
  }, [filtered]);

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>🚩 Feature Flags</h1>
          <span className="admin-badge admin-badge--blue">V5.8</span>
        </div>
        <p className="workspace-subtitle">Enable or disable platform features. Changes persist locally.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="admin-action-btn" onClick={handleReset}>🔄 Reset to Defaults</button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-kpi-grid">
        {[
          { icon: "🚩", label: "Total Flags",  value: String(flags.length) },
          { icon: "✅", label: "Enabled",      value: String(enabledCount) },
          { icon: "❌", label: "Disabled",     value: String(disabledCount) },
          { icon: "🤖", label: "AI Flags",     value: String(flags.filter(f => f.category === "ai").length) },
          { icon: "🔌", label: "Integration",  value: String(flags.filter(f => f.category === "integrations").length) },
          { icon: "⚙️", label: "Platform",     value: String(flags.filter(f => f.category === "platform").length) },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value">{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="admin-card">
        <div className="admin-filter-row">
          <select className="admin-select" value={catFilter} onChange={(e) => setCatFilter(e.target.value as any)}>
            <option value="all">All Categories</option>
            {(Object.entries(CATEGORY_LABELS) as [FeatureFlag["category"], string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Flags by category */}
      {grouped.map(({ cat, flags: catFlags }) => (
        <div key={cat} className="admin-card">
          <h3>{CATEGORY_LABELS[cat]}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {catFlags.map((flag) => (
              <div key={flag.id} className="admin-flag-row">
                <span style={{ fontSize: 24, minWidth: 32 }}>{flag.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    {flag.name}
                    {!flag.enabled && (
                      <span className="admin-badge" style={{ fontSize: 10 }}>Disabled</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", marginTop: 2 }}>
                    {flag.description}
                  </div>
                </div>
                {/* Toggle */}
                <button
                  className={`admin-toggle ${flag.enabled ? "admin-toggle--on" : "admin-toggle--off"}`}
                  onClick={() => handleToggle(flag)}
                  aria-label={`${flag.enabled ? "Disable" : "Enable"} ${flag.name}`}
                  title={flag.enabled ? "Click to disable" : "Click to enable"}
                >
                  <span className="admin-toggle-thumb" />
                </button>
                <span style={{ fontSize: 12, fontWeight: 600, color: flag.enabled ? "#10b981" : "#94a3b8", minWidth: 52, textAlign: "right" }}>
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Warning for maintenance mode */}
      {flags.find((f) => f.id === "maintenance_mode")?.enabled && (
        <div className="admin-card" style={{ border: "2px solid #ef4444", background: "#fef2f2" }}>
          <h3 style={{ color: "#ef4444" }}>⚠️ Maintenance Mode Active</h3>
          <p style={{ fontSize: 13, color: "#991b1b", margin: 0 }}>
            Maintenance mode is currently <strong>enabled</strong> (demo). In production, this would display a maintenance page to users.
            <button style={{ marginLeft: 12, color: "#ef4444", border: "none", background: "none", cursor: "pointer", fontWeight: 700 }}
              onClick={() => { FeatureFlagService.set("maintenance_mode", false); setTick(v => v + 1); showToast("🔧 Maintenance mode disabled"); }}>
              Disable →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
