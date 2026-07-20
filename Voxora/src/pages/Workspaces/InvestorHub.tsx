// ── V4.4 Investor Studio Hub ──────────────────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "fundraisingStrategy", icon: "🚀", label: "Fundraising Strategy",  desc: "Define how much to raise, who to target, and a 90-day fundraising timeline." },
  { id: "investorNarrative",   icon: "📖", label: "Investor Narrative",    desc: "Craft the founding story, market insight, and belief statement investors need." },
  { id: "pitchDeck",           icon: "🎯", label: "Pitch Deck",            desc: "12-slide investor pitch deck outline with full talking points." },
  { id: "executiveSummary",    icon: "📄", label: "Executive Summary",     desc: "One-page summary for investors, partners, and accelerator applications." },
  { id: "termSheet",           icon: "📋", label: "Term Sheet Guide",      desc: "Understand every clause in plain English — what to accept and what to fight." },
  { id: "dueDiligence",        icon: "✅", label: "Due Diligence Checklist", desc: "Everything investors will ask for — prepared before your first meeting." },
  { id: "capTable",            icon: "📊", label: "Cap Table Planner",     desc: "Model founder dilution, ESOP, and founder payout at different exit sizes." },
];

const STATS = [
  { label: "Investor Tools", val: "7",    icon: "🛠️" },
  { label: "Raise-Ready",    val: "Yes",  icon: "💼" },
  { label: "Avg Round Prep", val: "4wks", icon: "⏱️" },
  { label: "Deal Stages",    val: "All",  icon: "🏆" },
];

export default function InvestorHub({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const investorProjects = useMemo(
    () => projects.filter(p =>
      ["Fundraising Strategy","Investor Pitch","Investor Narrative","Term Sheet",
       "Due Diligence","Cap Table","Executive Summary"].includes(p.category)
    ).slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #db2777 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Investor Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 480 }}>
          Everything you need to raise your next round. From narrative to term sheets, due diligence to cap tables — powered by Voxora AI.
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Investor Tools</h2>
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

      {/* Recent Investor Projects */}
      {investorProjects.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📁 Recent Investor Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {investorProjects.map(p => (
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
        background: "linear-gradient(135deg, #eff6ff, #f5f3ff)",
        border: "1.5px solid #bfdbfe", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#1e40af",
      }}>
        <strong>💡 Fundraising Order:</strong> Start with <strong>Investor Narrative</strong> to lock in your story, build the <strong>Pitch Deck</strong> and <strong>Executive Summary</strong> around it, use <strong>Due Diligence Checklist</strong> to prepare your data room, then study <strong>Term Sheets</strong> before your first term sheet arrives — not after.
      </div>
    </div>
  );
}
