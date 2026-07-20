// ── V4.6 Trend Analysis ───────────────────────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function LineChart({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const max = Math.max(...data, 1);
  const w = 400; const h = 80; const pad = 10;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v / max) * (h - pad * 2));
    return `${x},${y}`;
  }).join(" ");
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80 }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - ((v / max) * (h - pad * 2));
          return <circle key={i} cx={x} cy={y} r={4} fill={color} />;
        })}
        {labels.map((l, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          return <text key={i} x={x} y={h - 1} textAnchor="middle" fontSize={9} fill="#9ca3af">{l}</text>;
        })}
      </svg>
    </div>
  );
}

export default function TrendAnalysis({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const { activities } = useActivity();
  useAIContext();

  const trends = useMemo(() => {
    const now = new Date();

    // Weekly: last 7 days
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      return projects.filter(p => { const pd = new Date(p.createdAt); return pd >= d && pd < next; }).length;
    });

    // Monthly: last 6 months
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return projects.filter(p => { const pd = new Date(p.createdAt); return pd >= d && pd < next; }).length;
    });

    // Quarterly: last 4 quarters
    const quarterly = Array.from({ length: 4 }, (_, i) => {
      const qEnd = new Date(now); qEnd.setMonth(qEnd.getMonth() - i * 3); qEnd.setDate(0);
      const qStart = new Date(qEnd.getFullYear(), qEnd.getMonth() - 2, 1);
      return projects.filter(p => { const pd = new Date(p.createdAt); return pd >= qStart && pd <= qEnd; }).length;
    }).reverse();

    // Yearly: last 2 years
    const yearly = Array.from({ length: 2 }, (_, i) => {
      const yr = now.getFullYear() - (1 - i);
      return projects.filter(p => new Date(p.createdAt).getFullYear() === yr).length;
    });

    const weekLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i));
      return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
    });

    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d.toLocaleString("en-US", { month: "short" });
    });

    return { weekly, monthly, quarterly, yearly, weekLabels, monthLabels };
  }, [projects]);

  const activityTrends = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      return activities.filter(a => { const ad = new Date(a.timestamp); return ad >= d && ad < next; }).length;
    });
  }, [activities]);

  const sections = [
    {
      title: "📅 Weekly Trends — Projects Created",
      data: trends.weekly, labels: trends.weekLabels, color: "#6C63FF",
      desc: "Projects created each day this week",
    },
    {
      title: "🔔 Weekly Trends — Activities",
      data: activityTrends, labels: trends.weekLabels, color: "#10b981",
      desc: "Activities logged each day this week",
    },
    {
      title: "📆 Monthly Trends — Last 6 Months",
      data: trends.monthly, labels: trends.monthLabels, color: "#3b82f6",
      desc: "Projects created per month",
    },
    {
      title: "🗓️ Quarterly Trends — Last 4 Quarters",
      data: trends.quarterly, labels: ["Q1","Q2","Q3","Q4"], color: "#f59e0b",
      desc: "Projects created per quarter",
    },
  ];

  const totalThisWeek = trends.weekly.reduce((a, b) => a + b, 0);
  const totalThisMonth = trends.monthly[trends.monthly.length - 1];
  const growthWoW = trends.weekly.length > 1 && trends.weekly[trends.weekly.length - 2] > 0
    ? Math.round(((trends.weekly[trends.weekly.length - 1] - trends.weekly[trends.weekly.length - 2]) / trends.weekly[trends.weekly.length - 2]) * 100)
    : 0;

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>📈 Trend Analysis</h1>
      <p className="workspace-subtitle">Weekly, monthly, quarterly, and yearly trends — calculated from your live workspace data.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">📁</div><p className="stat-value">{projects.length}</p><h3 className="stat-label">Total Projects</h3></div>
        <div className="stat-card"><div className="stat-icon">📅</div><p className="stat-value">{totalThisWeek}</p><h3 className="stat-label">This Week</h3></div>
        <div className="stat-card"><div className="stat-icon">📆</div><p className="stat-value">{totalThisMonth}</p><h3 className="stat-label">This Month</h3></div>
        <div className="stat-card"><div className="stat-icon">{growthWoW >= 0 ? "📈" : "📉"}</div><p className="stat-value" style={{ color: growthWoW >= 0 ? "#10b981" : "#ef4444" }}>{growthWoW >= 0 ? "+" : ""}{growthWoW}%</p><h3 className="stat-label">WoW Growth</h3></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map(s => (
          <div key={s.title} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>{s.title}</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#9ca3af" }}>{s.desc}</p>
            <LineChart data={s.data} color={s.color} labels={s.labels} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Total: <strong style={{ color: "#374151" }}>{s.data.reduce((a,b) => a+b, 0)}</strong></span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Peak: <strong style={{ color: s.color }}>{Math.max(...s.data)}</strong></span>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Avg: <strong style={{ color: "#374151" }}>{(s.data.reduce((a,b) => a+b, 0) / s.data.length).toFixed(1)}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
