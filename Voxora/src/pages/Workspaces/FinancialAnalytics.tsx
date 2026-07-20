// ── V4.6 Financial Analytics ──────────────────────────────────────────────────
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function BarChart({ data, labels, color, prefix }: { data: number[]; labels: string[]; color: string; prefix?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{prefix}{v >= 1000 ? (v/1000).toFixed(1)+"k" : v}</span>
          <div style={{ width: "100%", background: "#f3f4f6", borderRadius: "4px 4px 0 0", height: 88, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${Math.max((v / max) * 100, 0)}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: v > 0 ? 3 : 0 }} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

const Q_LABELS = ["Q1","Q2","Q3","Q4"];

export default function FinancialAnalytics({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState({
    revenue: "22500", expenses: "14800", profit: "7700",
    cashFlow: "5200", burnRate: "9600", runway: "18",
    breakEvenProgress: "72",
    quarterlyRevenue: ["38000","52000","67000","82000"],
    quarterlyExpenses: ["28000","36000","44000","52000"],
  });

  const profitMargin = metrics.revenue !== "0"
    ? Math.round((Number(metrics.profit) / Number(metrics.revenue)) * 100) : 0;

  const update = (k: string, v: string) => setMetrics(p => ({ ...p, [k]: v }));
  const updateQ = (type: "quarterlyRevenue" | "quarterlyExpenses", i: number, v: string) =>
    setMetrics(p => { const arr = [...p[type]]; arr[i] = v; return { ...p, [type]: arr }; });

  const exportCSV = () => {
    const rows = [
      ["Monthly Revenue", `$${metrics.revenue}`],
      ["Monthly Expenses", `$${metrics.expenses}`],
      ["Net Profit", `$${metrics.profit}`],
      ["Cash Flow", `$${metrics.cashFlow}`],
      ["Burn Rate", `$${metrics.burnRate}`],
      ["Runway", `${metrics.runway} months`],
      ["Break-Even Progress", `${metrics.breakEvenProgress}%`],
      ["Profit Margin", `${profitMargin}%`],
    ];
    const csv = ["Metric,Value", ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "financial-analytics.csv"; a.click();
    showToast("📥 Financial data exported!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>📊 Financial Analytics</h1>
      <p className="workspace-subtitle">Profit, expenses, cash flow, burn rate, and break-even progress.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">💰</div><p className="stat-value">${(Number(metrics.revenue)/1000).toFixed(1)}k</p><h3 className="stat-label">Monthly Revenue</h3></div>
        <div className="stat-card"><div className="stat-icon">💸</div><p className="stat-value">${(Number(metrics.expenses)/1000).toFixed(1)}k</p><h3 className="stat-label">Expenses</h3></div>
        <div className="stat-card"><div className="stat-icon">📈</div><p className="stat-value">${(Number(metrics.profit)/1000).toFixed(1)}k</p><h3 className="stat-label">Net Profit</h3></div>
        <div className="stat-card"><div className="stat-icon">🔥</div><p className="stat-value">${(Number(metrics.burnRate)/1000).toFixed(1)}k</p><h3 className="stat-label">Burn Rate</h3></div>
        <div className="stat-card"><div className="stat-icon">🛬</div><p className="stat-value">{metrics.runway}mo</p><h3 className="stat-label">Runway</h3></div>
        <div className="stat-card"><div className="stat-icon">📊</div><p className="stat-value">{profitMargin}%</p><h3 className="stat-label">Profit Margin</h3></div>
      </div>

      {/* Break-Even Progress */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>⚖️ Break-Even Progress</h3>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>{metrics.breakEvenProgress}%</span>
        </div>
        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 8 }}>
          <div style={{ height: 12, width: `${metrics.breakEvenProgress}%`, background: "linear-gradient(90deg, #6C63FF, #10b981)", borderRadius: 8, transition: "width 0.4s" }} />
        </div>
        <input type="range" min={0} max={100} value={metrics.breakEvenProgress}
          onChange={e => update("breakEvenProgress", e.target.value)}
          style={{ width: "100%", marginTop: 8, accentColor: "#6C63FF" }} />
      </div>

      {/* Quarterly Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>💰 Quarterly Revenue</h3>
          <BarChart data={metrics.quarterlyRevenue.map(Number)} labels={Q_LABELS} color="#6C63FF" prefix="$" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {metrics.quarterlyRevenue.map((v, i) => (
              <div key={i}><label style={{ fontSize: 11, color: "#6b7280" }}>{Q_LABELS[i]}</label>
                <input className="workspace-input" style={{ fontSize: 12, padding: "6px 8px" }} value={v} onChange={e => updateQ("quarterlyRevenue", i, e.target.value)} /></div>
            ))}
          </div>
        </div>
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 22px" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>💸 Quarterly Expenses</h3>
          <BarChart data={metrics.quarterlyExpenses.map(Number)} labels={Q_LABELS} color="#ef4444" prefix="$" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            {metrics.quarterlyExpenses.map((v, i) => (
              <div key={i}><label style={{ fontSize: 11, color: "#6b7280" }}>{Q_LABELS[i]}</label>
                <input className="workspace-input" style={{ fontSize: 12, padding: "6px 8px" }} value={v} onChange={e => updateQ("quarterlyExpenses", i, e.target.value)} /></div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit core metrics */}
      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>✏️ Update Monthly Metrics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[["Revenue ($)", "revenue"], ["Expenses ($)", "expenses"], ["Net Profit ($)", "profit"],
            ["Cash Flow ($)", "cashFlow"], ["Burn Rate ($)", "burnRate"], ["Runway (months)", "runway"]
          ].map(([label, key]) => (
            <div key={key}><label style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, display: "block", marginBottom: 4 }}>{label}</label>
              <input className="workspace-input" style={{ fontSize: 13, padding: "8px 10px" }} value={(metrics as any)[key]} onChange={e => update(key, e.target.value)} /></div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" onClick={exportCSV}>📥 Export CSV</button>
        <button className="workspace-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => showToast("📊 Financial data saved!")}>💾 Save</button>
      </div>
    </div>
  );
}
