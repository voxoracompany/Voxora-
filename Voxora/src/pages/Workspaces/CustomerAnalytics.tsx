// ── V4.6 Customer Analytics ───────────────────────────────────────────────────
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{v}</span>
          <div style={{ width: "100%", background: "#f3f4f6", borderRadius: "4px 4px 0 0", height: 80, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${(v / max) * 100}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: v > 0 ? 3 : 0 }} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function CustomerAnalytics({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [totalCustomers, setTotalCustomers]   = useState("248");
  const [newThisMonth,   setNewThisMonth]     = useState("32");
  const [churnRate,      setChurnRate]        = useState("3.2");
  const [retentionRate,  setRetentionRate]    = useState("96.8");
  const [ltv,            setLtv]             = useState("1200");
  const [cac,            setCac]             = useState("85");
  const [monthlyGrowth]  = useState([180,195,201,215,222,230,235,241,244,246,247,248]);

  const ltvCacRatio = cac !== "0" ? (Number(ltv) / Number(cac)).toFixed(1) : "—";

  const exportCSV = () => {
    const csv = [
      "Metric,Value",
      `Total Customers,${totalCustomers}`,
      `New This Month,${newThisMonth}`,
      `Churn Rate,${churnRate}%`,
      `Retention Rate,${retentionRate}%`,
      `LTV,$${ltv}`,
      `CAC,$${cac}`,
      `LTV:CAC Ratio,${ltvCacRatio}`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "customer-analytics.csv"; a.click();
    showToast("📥 Customer data exported!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>👥 Customer Analytics</h1>
      <p className="workspace-subtitle">Track customer growth, retention, churn, acquisition, and lifetime value.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">👥</div><p className="stat-value">{totalCustomers}</p><h3 className="stat-label">Total Customers</h3></div>
        <div className="stat-card"><div className="stat-icon">🆕</div><p className="stat-value">{newThisMonth}</p><h3 className="stat-label">New This Month</h3></div>
        <div className="stat-card"><div className="stat-icon">📉</div><p className="stat-value">{churnRate}%</p><h3 className="stat-label">Churn Rate</h3></div>
        <div className="stat-card"><div className="stat-icon">🔄</div><p className="stat-value">{retentionRate}%</p><h3 className="stat-label">Retention</h3></div>
        <div className="stat-card"><div className="stat-icon">💎</div><p className="stat-value">${ltv}</p><h3 className="stat-label">LTV</h3></div>
        <div className="stat-card"><div className="stat-icon">🎯</div><p className="stat-value">{ltvCacRatio}x</p><h3 className="stat-label">LTV:CAC</h3></div>
      </div>

      {/* Growth Chart */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "22px 24px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📈 Customer Growth (12 months)</h3>
        <BarChart data={monthlyGrowth} labels={["J","F","M","A","M","J","J","A","S","O","N","D"]} color="#10b981" />
      </div>

      {/* Edit Metrics */}
      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>✏️ Update Customer Metrics</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            ["Total Customers", totalCustomers, setTotalCustomers, ""],
            ["New This Month", newThisMonth, setNewThisMonth, ""],
            ["Churn Rate (%)", churnRate, setChurnRate, ""],
            ["Retention Rate (%)", retentionRate, setRetentionRate, ""],
            ["Lifetime Value ($)", ltv, setLtv, "$"],
            ["Customer Acquisition Cost ($)", cac, setCac, "$"],
          ].map(([label, val, setter]: any) => (
            <div key={label as string}>
              <label style={{ fontSize: 12, color: "#6b7280", fontWeight: 700, display: "block", marginBottom: 4 }}>{label as string}</label>
              <input className="workspace-input" style={{ fontSize: 14, padding: "10px 12px" }} value={val as string} onChange={e => (setter as Function)(e.target.value)} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" onClick={exportCSV}>📥 Export CSV</button>
        <button className="workspace-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => showToast("👥 Customer data saved!")}>💾 Save</button>
      </div>
    </div>
  );
}
