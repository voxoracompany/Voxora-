// ── V6.3 Financial Studio Hub ────────────────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "financialDashboard",      icon: "📊", label: "Financial Dashboard",      desc: "Revenue, expenses, profit, MRR, ARR, burn rate & cash balance at a glance.", badge: "New" },
  { id: "revenueForecast",         icon: "📈", label: "Revenue Forecast",          desc: "12, 24 & 36-month projections with best, expected & worst-case scenarios.",  badge: "New" },
  { id: "startupCostCalculator",   icon: "🧮", label: "Startup Cost Calculator",   desc: "Estimate equipment, salaries, marketing, legal & operating costs instantly.", badge: "New" },
  { id: "breakEvenCalculator",     icon: "⚖️", label: "Break-Even Calculator",    desc: "Calculate break-even units, revenue & the month you reach profitability.",    badge: "New" },
  { id: "pricingStrategyGenerator",icon: "🏷️", label: "Pricing Strategy Generator","desc": "AI-powered pricing models: subscription, freemium, one-time, usage & enterprise.", badge: "AI" },
  { id: "cashFlowPlanner",         icon: "💸", label: "Cash Flow Planner",         desc: "Track monthly income, expenses & cash reserves. Generate AI runway insights.", badge: "AI" },
  { id: "financialHealthScore",    icon: "💯", label: "Financial Health Score",    desc: "Get a score out of 100 with strengths, risks & AI recommendations.",          badge: "AI" },
];

const STATS = [
  { label: "Studio Tools",    val: "7+",    icon: "🛠️" },
  { label: "AI-Powered",      val: "100%",  icon: "🤖" },
  { label: "Export Formats",  val: "5",     icon: "📤" },
  { label: "Investor-Ready",  val: "Yes",   icon: "✅" },
];

const CATEGORIES = [
  "Financial Dashboard","Revenue Forecast","Startup Costs",
  "Break-Even","Pricing Strategy","Cash Flow","Financial Health",
];

export default function FinancialStudio({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const recent = useMemo(
    () => projects.filter(p => CATEGORIES.includes(p.category)).slice(0, 3),
    [projects],
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1040 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>💰</div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
          Financial Studio <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 10 }}>V6.3</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 500 }}>
          AI-powered financial tools for founders. Model revenue, plan cash flow, calculate break-even and generate investor-ready reports — in minutes.
        </p>
      </div>

      {/* Stats */}
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
      <h2 className="fs-section-title">🧰 Financial Tools</h2>
      <div className="cards" style={{ marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setWorkspace(t.id)}
          >
            {t.badge && (
              <span style={{
                position: "absolute", top: 12, right: 12,
                background: t.badge === "AI" ? "#6C63FF" : "#10b981",
                color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px",
                borderRadius: 20, letterSpacing: 0.5,
              }}>{t.badge}</span>
            )}
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>{t.label}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{t.desc}</p>
            <button
              className="workspace-btn"
              style={{ marginTop: 14, width: "100%", fontSize: 13 }}
              onClick={e => { e.stopPropagation(); setWorkspace(t.id); }}
            >
              Open →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      {recent.length > 0 && (
        <>
          <h2 className="fs-section-title">📁 Recent Financial Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {recent.map(p => (
              <div key={p.id} className="recent-project-card">
                <div className="rpc-top"><span className="rpc-category">{p.category}</span></div>
                <h3 className="rpc-title">{p.title}</h3>
                <p className="rpc-date">
                  📅 {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
          <button className="workspace-btn" style={{ marginBottom: 32 }} onClick={() => setWorkspace("saved")}>
            View All Projects →
          </button>
        </>
      )}

      {/* Quick Links */}
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        border: "1.5px solid #6ee7b7", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#065f46",
      }}>
        <strong>💡 Quick Start:</strong> Begin with{" "}
        <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setWorkspace("financialDashboard")}>Financial Dashboard</strong>
        {" "}to input your numbers, then run a{" "}
        <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setWorkspace("revenueForecast")}>Revenue Forecast</strong>
        {" "}and check your{" "}
        <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setWorkspace("financialHealthScore")}>Financial Health Score</strong>.
        Integrates with{" "}
        <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setWorkspace("investorStudio")}>Investor Studio</strong>
        {" "}and{" "}
        <strong style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setWorkspace("businessPlanGenerator")}>Business Plan Generator</strong>.
      </div>
    </div>
  );
}
