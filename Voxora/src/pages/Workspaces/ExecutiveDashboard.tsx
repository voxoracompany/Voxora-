// ── V4.6 Executive Dashboard ──────────────────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 38; const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={96} height={96} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={48} cy={48} r={r} fill="none" stroke="#f3f4f6" strokeWidth={8} />
        <circle cx={48} cy={48} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x={48} y={52} textAnchor="middle" fill={color} fontSize={18} fontWeight={800}
          style={{ transform: "rotate(90deg)", transformOrigin: "48px 48px" }}>{value}</text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textAlign: "center" }}>{label}</span>
    </div>
  );
}

function SummaryCard({ icon, title, value, sub, color, onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", cursor: onClick ? "pointer" : "default", transition: "box-shadow 0.2s" }}
      onMouseOver={e => onClick && ((e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)")}
      onMouseOut={e => ((e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</p>
          <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#111827" }}>{value}</p>
          {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
      {color && <div style={{ marginTop: 10, height: 4, background: "#f3f4f6", borderRadius: 4 }}><div style={{ height: 4, width: "65%", background: color, borderRadius: 4 }} /></div>}
    </div>
  );
}

export default function ExecutiveDashboard({ setWorkspace }: Props) {
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();
  const { usage, isDemoMode } = useAIContext();

  const metrics = useMemo(() => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
    const thisWeek = projects.filter(p => new Date(p.createdAt) >= weekStart).length;
    const aiSessions = Number(localStorage.getItem("voxora-chat-count")) || 0;
    const cats: Record<string, number> = {};
    projects.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
    const topCat = Object.entries(cats).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";

    const healthScore = Math.min(100, Math.round(
      (Math.min(projects.length, 20) / 20) * 30 +
      (Math.min(activities.length, 50) / 50) * 30 +
      (Math.min(usage.todayCount, 10) / 10) * 25 +
      (favorites.length > 0 ? 15 : 0)
    ));
    const growthScore = Math.min(100, Math.round(
      (Math.min(thisWeek, 5) / 5) * 50 +
      (Math.min(usage.weeklyCount, 20) / 20) * 30 + 20
    ));
    const aiScore = Math.min(100, Math.round(
      (Math.min(usage.todayCount, 10) / 10) * 50 +
      (usage.avgResponseTime > 0 && usage.avgResponseTime < 3000 ? 30 : 10) + 20
    ));
    const investorScore = Math.min(100, Math.round(
      (projects.filter(p => ["Pitch Deck","Executive Summary","Fundraising Strategy","Investor Narrative","Cap Table","Due Diligence"].includes(p.category)).length / 6) * 100
    ));

    return { thisWeek, aiSessions, topCat, healthScore, growthScore, aiScore, investorScore };
  }, [projects, favorites, activities, usage]);

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>🏢 Executive Dashboard</h1>
      <p className="workspace-subtitle">Bird's-eye view of your business health, performance, and readiness scores.</p>

      {isDemoMode && (
        <div style={{ background: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 14, color: "#4c1d95" }}>
          <strong>🧪 Demo Mode:</strong> Scores are calculated from your real workspace data. <button onClick={() => setWorkspace("aiSettings")} style={{ background: "none", border: "none", color: "#6C63FF", fontWeight: 700, cursor: "pointer", padding: 0 }}>Configure AI →</button>
        </div>
      )}

      {/* Score Rings */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "28px 32px", marginBottom: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 700, color: "#374151" }}>🎯 Performance Scores</h2>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          <ScoreRing value={metrics.healthScore}  label="Business Health"    color="#10b981" />
          <ScoreRing value={metrics.growthScore}  label="Growth Score"       color="#6C63FF" />
          <ScoreRing value={metrics.aiScore}      label="AI Activity"        color="#3b82f6" />
          <ScoreRing value={metrics.investorScore} label="Investor Readiness" color="#f59e0b" />
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 28 }}>
        <SummaryCard icon="📁" title="Total Projects" value={projects.length} sub={`+${metrics.thisWeek} this week`} color="#6C63FF" onClick={() => setWorkspace("saved")} />
        <SummaryCard icon="🤖" title="AI Sessions" value={metrics.aiSessions} sub="Lifetime sessions" color="#3b82f6" onClick={() => setWorkspace("assistant")} />
        <SummaryCard icon="📡" title="AI Requests Today" value={usage.todayCount} sub={`${usage.weeklyCount} this week`} color="#10b981" onClick={() => setWorkspace("aiAnalytics")} />
        <SummaryCard icon="⭐" title="Favorites" value={favorites.length} sub={`${pinned.length} pinned`} color="#f59e0b" onClick={() => setWorkspace("saved")} />
        <SummaryCard icon="🔔" title="Activities" value={activities.length} sub="Total logged" color="#ef4444" onClick={() => setWorkspace("activity")} />
        <SummaryCard icon="🏆" title="Top Category" value={metrics.topCat.length > 12 ? metrics.topCat.slice(0,12)+"…" : metrics.topCat} sub="Most used workspace" color="#8b5cf6" />
      </div>

      {/* Studio Summaries */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📊 Studio Summaries</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {[
          { label: "Marketing Studio", icon: "📣", key: ["Email Marketing","Social Media","SEO Strategy","Advertising","Content Marketing","Brand Strategy","Marketing Strategy"], ws: "marketingHub", color: "#ec4899" },
          { label: "Financial Studio", icon: "💰", key: ["Financial Forecast","Revenue Model","Pricing Strategy","Unit Economics","Break-Even Analysis"], ws: "financialHub", color: "#f59e0b" },
          { label: "Investor Studio",  icon: "💼", key: ["Fundraising Strategy","Investor Pitch","Investor Narrative","Term Sheet","Due Diligence","Cap Table","Executive Summary"], ws: "investorHub", color: "#1d4ed8" },
          { label: "Growth Studio",   icon: "📈", key: ["Growth Plan","KPI","Goal","OKR","Growth Experiment","A/B Test","Weekly Review","Monthly Report"], ws: "growthHub", color: "#10b981" },
        ].map(s => {
          const count = projects.filter(p => s.key.includes(p.category)).length;
          return (
            <div key={s.label} onClick={() => setWorkspace(s.ws)} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 18px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)"}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{s.label}</h3>
              <p style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 800, color: s.color }}>{count}</p>
              <div style={{ height: 4, background: "#f3f4f6", borderRadius: 4 }}>
                <div style={{ height: 4, width: `${Math.min(100, count * 10)}%`, background: s.color, borderRadius: 4 }} />
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>projects · Open Studio →</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
