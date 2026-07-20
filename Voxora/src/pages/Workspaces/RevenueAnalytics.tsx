// ── V4.6 Revenue Analytics ────────────────────────────────────────────────────
import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function BarChart({ data, color, unit }: { data: number[]; color: string; unit: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, padding: "0 4px" }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>{unit}{v >= 1000 ? (v/1000).toFixed(1)+"k" : v}</span>
          <div style={{ width: "100%", background: "#f3f4f6", borderRadius: "4px 4px 0 0", height: 100, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${(v / max) * 100}%`, background: color, borderRadius: "4px 4px 0 0", transition: "height 0.4s ease", minHeight: v > 0 ? 4 : 0 }} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{MONTHS[i % 12]}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueAnalytics({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [mrr, setMrr] = useState(["5000","6200","7800","8400","9100","11000","13500","15000","16200","18000","20000","22500"]);
  const [forecast, setForecast] = useState("28000");

  const mrrNums = mrr.map(v => Number(v) || 0);
  const arr = (mrrNums[mrrNums.length - 1] * 12).toLocaleString();
  const growth = mrrNums[0] > 0 ? Math.round(((mrrNums[11] - mrrNums[0]) / mrrNums[0]) * 100) : 0;
  const exportData = () => {
    const csv = ["Month,MRR", ...MONTHS.map((m,i) => `${m},$${mrrNums[i]}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "revenue-analytics.csv"; a.click();
    showToast("📥 Revenue data exported!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>💰 Revenue Analytics</h1>
      <p className="workspace-subtitle">Track revenue trends, monthly and annual revenue, forecast, and growth rates.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">📆</div><p className="stat-value">${(mrrNums[11]/1000).toFixed(1)}k</p><h3 className="stat-label">Current MRR</h3></div>
        <div className="stat-card"><div className="stat-icon">📅</div><p className="stat-value">${(Number(arr.replace(/,/g,""))/1000).toFixed(0)}k</p><h3 className="stat-label">ARR</h3></div>
        <div className="stat-card"><div className="stat-icon">📈</div><p className="stat-value">{growth}%</p><h3 className="stat-label">YoY Growth</h3></div>
        <div className="stat-card"><div className="stat-icon">🔮</div><p className="stat-value">${(Number(forecast)/1000).toFixed(1)}k</p><h3 className="stat-label">Forecast MRR</h3></div>
      </div>

      {/* Chart */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "22px 24px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📊 Monthly Revenue (MRR)</h3>
        <BarChart data={mrrNums} color="#6C63FF" unit="$" />
      </div>

      {/* Edit MRR inputs */}
      <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>✏️ Edit Monthly Revenue</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
          {MONTHS.map((m, i) => (
            <div key={m}>
              <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, display: "block", marginBottom: 4 }}>{m}</label>
              <input className="workspace-input" style={{ fontSize: 13, padding: "8px 10px" }}
                value={mrr[i]} onChange={e => setMrr(prev => { const n = [...prev]; n[i] = e.target.value; return n; })} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Next Month Forecast ($):</label>
          <input className="workspace-input" style={{ width: 140, fontSize: 13, padding: "8px 12px" }} value={forecast} onChange={e => setForecast(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" onClick={exportData}>📥 Export CSV</button>
        <button className="workspace-btn" style={{ background: "#f3f4f6", color: "#374151" }} onClick={() => showToast("📊 Revenue data updated!")}>💾 Save</button>
      </div>
    </div>
  );
}
