// ── V4.5 Growth Studio Hub ────────────────────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "growthPlanner",          icon: "🌱", label: "Growth Planner",             desc: "Define growth goals, quarterly objectives, monthly milestones, and weekly action plan." },
  { id: "kpiDashboard",           icon: "📊", label: "KPI Dashboard",              desc: "Track revenue growth, customer growth, MRR, ARR, CAC, LTV, and churn rate." },
  { id: "goalTracker",            icon: "🎯", label: "Goal Tracker",               desc: "Create goals with progress bars, deadlines, status, and priority levels." },
  { id: "okrManager",             icon: "🏆", label: "OKR Manager",               desc: "Set objectives, define key results, and track progress toward each outcome." },
  { id: "growthOpportunity",      icon: "🔭", label: "Growth Opportunity Finder",  desc: "Discover market, product, customer, and revenue growth opportunities." },
  { id: "growthExperiments",      icon: "🧪", label: "Growth Experiments",         desc: "Plan experiments with hypothesis, expected outcomes, results, and lessons." },
  { id: "abTestPlanner",          icon: "⚖️", label: "A/B Test Planner",           desc: "Design A/B tests with variants, metrics, and declare a winner." },
  { id: "businessMilestones",     icon: "🗓️", label: "Business Milestones",        desc: "Build an interactive milestone timeline for your business journey." },
  { id: "weeklyReview",           icon: "📋", label: "Weekly Review",              desc: "Generate your weekly business review with AI-powered insights." },
  { id: "monthlyGrowthReport",    icon: "📈", label: "Monthly Growth Report",      desc: "Get a structured monthly growth report for your business." },
  { id: "aiGrowthRecommendations",icon: "🤖", label: "AI Growth Recommendations",  desc: "AI-powered actionable recommendations to accelerate growth." },
];

const STATS = [
  { label: "Growth Tools",   val: "11",    icon: "🛠️" },
  { label: "AI-Powered",     val: "Yes",   icon: "🤖" },
  { label: "Time to Insight",val: "<2min", icon: "⚡" },
  { label: "Focus",          val: "Scale", icon: "📈" },
];

export default function GrowthHub({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const growthProjects = useMemo(
    () => projects.filter(p =>
      ["Growth Plan","KPI","Goal","OKR","Growth Experiment","A/B Test",
       "Business Milestone","Weekly Review","Monthly Report","Growth Recommendations"].includes(p.category)
    ).slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #059669 0%, #10b981 40%, #34d399 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Growth Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 480 }}>
          Plan, track, and accelerate business growth. Set OKRs, run experiments, monitor KPIs, and get AI-powered growth recommendations — all in one place.
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Growth Tools</h2>
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

      {/* Recent Growth Projects */}
      {growthProjects.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📁 Recent Growth Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {growthProjects.map(p => (
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

      {/* Pro Tip */}
      <div style={{
        background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
        border: "1.5px solid #6ee7b7", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#065f46",
      }}>
        <strong>💡 Growth Sequence:</strong> Start with <strong>Growth Planner</strong> to set your goals, define <strong>OKRs</strong> around them, track daily progress with the <strong>KPI Dashboard</strong>, run <strong>Growth Experiments</strong> to find what works, and use <strong>AI Growth Recommendations</strong> for ongoing strategy.
      </div>
    </div>
  );
}
