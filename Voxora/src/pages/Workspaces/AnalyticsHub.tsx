// ── V4.6 Advanced Analytics Studio Hub ───────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "executiveDashboard",   icon: "🏢", label: "Executive Dashboard",   desc: "Business health score, performance score, growth score, and studio summaries." },
  { id: "revenueAnalytics",     icon: "💰", label: "Revenue Analytics",     desc: "Revenue trends, monthly/annual revenue, forecast, and growth rates." },
  { id: "customerAnalytics",    icon: "👥", label: "Customer Analytics",    desc: "Customer growth, retention, churn, acquisition, and lifetime value." },
  { id: "marketingAnalytics",   icon: "📣", label: "Marketing Analytics",   desc: "Campaign performance, SEO, social media, email, and conversion rates." },
  { id: "financialAnalytics",   icon: "📊", label: "Financial Analytics",   desc: "Profit, expenses, cash flow, burn rate, and break-even progress." },
  { id: "aiAnalytics",          icon: "🤖", label: "AI Analytics",          desc: "AI requests, workspace usage, prompt usage, tokens, and response times." },
  { id: "startupAnalytics",     icon: "🚀", label: "Startup Analytics",     desc: "Startup readiness, validation score, business model, competitors, and market." },
  { id: "trendAnalysis",        icon: "📈", label: "Trend Analysis",        desc: "Weekly, monthly, quarterly, and yearly trend breakdowns." },
  { id: "analyticsReports",     icon: "📄", label: "Reports",               desc: "Generate weekly, monthly, quarterly, and annual reports." },
];

const STATS = [
  { label: "Analytics Modules", val: "9",    icon: "📊" },
  { label: "Live Data",         val: "Yes",  icon: "🔴" },
  { label: "Export Formats",    val: "5",    icon: "📤" },
  { label: "AI-Powered",        val: "Yes",  icon: "🤖" },
];

export default function AnalyticsHub({ setWorkspace }: Props) {
  const { projects, favorites } = useProjects();
  const { activities }          = useActivity();
  const { usage }               = useAIContext();

  const quickStats = useMemo(() => ({
    projects: projects.length,
    favorites: favorites.length,
    activities: activities.length,
    aiRequests: usage.todayCount,
  }), [projects, favorites, activities, usage]);

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #6C63FF 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Advanced Analytics Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 520 }}>
          Deep insights across every dimension of your business — revenue, customers, marketing, AI usage, and more. Real data, live from your workspace.
        </p>
      </div>

      {/* Live quick stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        <div className="stat-card"><div className="stat-icon">📁</div><p className="stat-value">{quickStats.projects}</p><h3 className="stat-label">Projects</h3></div>
        <div className="stat-card"><div className="stat-icon">⭐</div><p className="stat-value">{quickStats.favorites}</p><h3 className="stat-label">Favorites</h3></div>
        <div className="stat-card"><div className="stat-icon">🔔</div><p className="stat-value">{quickStats.activities}</p><h3 className="stat-label">Activities</h3></div>
        <div className="stat-card"><div className="stat-icon">🤖</div><p className="stat-value">{quickStats.aiRequests}</p><h3 className="stat-label">AI Today</h3></div>
      </div>

      {/* Studio stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Analytics Modules</h2>
      <div className="cards" style={{ marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div key={t.id} className="feature-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace(t.id)}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>{t.label}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{t.desc}</p>
            <button className="workspace-btn" style={{ marginTop: 14, width: "100%", fontSize: 13 }}
              onClick={e => { e.stopPropagation(); setWorkspace(t.id); }}>Open →</button>
          </div>
        ))}
      </div>

      {/* Pro Tip */}
      <div style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)", border: "1.5px solid #bfdbfe", borderRadius: 14, padding: "18px 22px", fontSize: 14, color: "#1e40af" }}>
        <strong>💡 Analytics Flow:</strong> Start with the <strong>Executive Dashboard</strong> for a bird's-eye view, drill into <strong>Revenue</strong> and <strong>Customer Analytics</strong> for growth signals, use <strong>AI Analytics</strong> to measure your AI usage efficiency, and export reports with the <strong>Reports</strong> module.
      </div>
    </div>
  );
}
