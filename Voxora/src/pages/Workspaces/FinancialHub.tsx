// ── V4.3 Financial Studio Hub ─────────────────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "financialForecast", icon: "💰", label: "Financial Forecast",   desc: "12-month revenue projections with unit economics and break-even analysis." },
  { id: "revenueModel",      icon: "💵", label: "Revenue Model",        desc: "Design your pricing tiers, revenue streams, and expansion strategy." },
  { id: "pricingStrategy",   icon: "🏷️", label: "Pricing Strategy",    desc: "Discover the optimal price point with competitor benchmarking." },
  { id: "unitEconomics",     icon: "📊", label: "Unit Economics",       desc: "CAC, LTV, payback period, and churn impact analysis." },
  { id: "breakEven",         icon: "📈", label: "Break-Even Analysis",  desc: "Know exactly how many customers you need to become profitable." },
  { id: "pitchDeck",         icon: "🎯", label: "Investor Pitch Deck",  desc: "12-slide pitch deck outline with talking points for every slide." },
  { id: "executiveSummary",  icon: "📄", label: "Executive Summary",    desc: "One-page executive summary for investors and partners." },
];

const STATS = [
  { label: "Financial Tools", val: "7",      icon: "🛠️" },
  { label: "AI-Powered",      val: "100%",   icon: "🤖" },
  { label: "Avg Time Saved",  val: "10h/wk", icon: "⏱️" },
  { label: "Investor-Ready",  val: "Yes",    icon: "✅" },
];

export default function FinancialHub({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const financialProjects = useMemo(
    () => projects.filter(p =>
      ["Financial Forecast","Revenue Model","Pricing Strategy","Unit Economics",
       "Break-Even Analysis","Investor Pitch","Executive Summary"].includes(p.category)
    ).slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Financial Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 480 }}>
          AI-powered financial tools for founders. Build forecasts, model revenue, price your product, and create investor-ready documents — in minutes.
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Financial Tools</h2>
      <div className="cards" style={{ marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card"
            style={{ cursor: "pointer" }}
            onClick={() => setWorkspace(t.id)}
          >
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

      {/* Recent Financial Projects */}
      {financialProjects.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📁 Recent Financial Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {financialProjects.map(p => (
              <div key={p.id} className="recent-project-card">
                <div className="rpc-top">
                  <span className="rpc-category">{p.category}</span>
                </div>
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

      {/* Pro Tip */}
      <div style={{
        background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        border: "1.5px solid #6ee7b7", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#065f46",
      }}>
        <strong>💡 Pro Tip:</strong> Start with <strong>Unit Economics</strong> to understand your fundamental business health, then use <strong>Financial Forecast</strong> to project growth. Create the <strong>Investor Pitch Deck</strong> only after you have real traction numbers to show.
      </div>
    </div>
  );
}
