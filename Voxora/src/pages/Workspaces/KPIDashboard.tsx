// ── V4.5 KPI Dashboard ────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

interface KPI { id: string; label: string; icon: string; value: string; unit: string; trend: "up" | "down" | "neutral"; }

const DEFAULT_KPIS: KPI[] = [
  { id: "revenue_growth",  label: "Revenue Growth",        icon: "💰", value: "", unit: "%",    trend: "up" },
  { id: "customer_growth", label: "Customer Growth",       icon: "👥", value: "", unit: "%",    trend: "up" },
  { id: "active_users",    label: "Active Users",          icon: "🟢", value: "", unit: "",     trend: "neutral" },
  { id: "conversion_rate", label: "Conversion Rate",       icon: "🔄", value: "", unit: "%",    trend: "up" },
  { id: "churn_rate",      label: "Churn Rate",            icon: "📉", value: "", unit: "%",    trend: "down" },
  { id: "ltv",             label: "Customer Lifetime Value",icon:"💎",  value: "", unit: "$",    trend: "up" },
  { id: "cac",             label: "CAC",                   icon: "🎯", value: "", unit: "$",    trend: "down" },
  { id: "mrr",             label: "MRR",                   icon: "📆", value: "", unit: "$",    trend: "up" },
  { id: "arr",             label: "ARR",                   icon: "📅", value: "", unit: "$",    trend: "up" },
];

const TREND_MAP = { up: { icon: "↑", color: "#10b981" }, down: { icon: "↓", color: "#ef4444" }, neutral: { icon: "→", color: "#6b7280" } };

export default function KPIDashboard({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [kpis, setKpis] = useState<KPI[]>(DEFAULT_KPIS);

  const update = (id: string, field: keyof KPI, val: string) =>
    setKpis(prev => prev.map(k => k.id === id ? { ...k, [field]: val } : k));

  const save = () => {
    addActivity({ type: "kpi_updated", title: "KPI Dashboard Updated", description: "Business KPIs tracked and saved.", category: "Growth Studio", icon: "📊" });
    showToast("📊 KPIs saved!");
  };

  const filled = kpis.filter(k => k.value.trim()).length;

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>📊 KPI Dashboard</h1>
      <p className="workspace-subtitle">Track your most important business metrics in one place.</p>

      {/* Summary bar */}
      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">📌</div><p className="stat-value">{filled}</p><h3 className="stat-label">KPIs Tracked</h3></div>
        <div className="stat-card"><div className="stat-icon">📊</div><p className="stat-value">{DEFAULT_KPIS.length}</p><h3 className="stat-label">Total KPIs</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{Math.round((filled / DEFAULT_KPIS.length) * 100)}%</p><h3 className="stat-label">Completion</h3></div>
        <div className="stat-card"><div className="stat-icon">📅</div><p className="stat-value">Now</p><h3 className="stat-label">Last Updated</h3></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        {kpis.map(k => {
          const t = TREND_MAP[k.trend];
          return (
            <div key={k.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{k.icon}</span>
                <select
                  value={k.trend}
                  onChange={e => update(k.id, "trend", e.target.value)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "3px 8px", fontSize: 12, color: t.color, fontWeight: 700, background: "#fafafa" }}
                >
                  <option value="up">↑ Up</option>
                  <option value="down">↓ Down</option>
                  <option value="neutral">→ Flat</option>
                </select>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{k.label}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {k.unit === "$" && <span style={{ fontSize: 16, color: "#374151", fontWeight: 700 }}>$</span>}
                <input
                  className="workspace-input"
                  style={{ fontSize: 22, fontWeight: 800, color: "#111827", border: "none", padding: "4px 0", background: "transparent", width: "100%" }}
                  placeholder="0"
                  value={k.value}
                  onChange={e => update(k.id, "value", e.target.value)}
                />
                {k.unit && k.unit !== "$" && <span style={{ fontSize: 16, color: "#6b7280" }}>{k.unit}</span>}
              </div>
              <div style={{ marginTop: 8, height: 4, background: "#f3f4f6", borderRadius: 4 }}>
                <div style={{ height: 4, width: k.value ? "70%" : "0%", background: t.color, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </div>

      <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save KPIs</button>
    </div>
  );
}
