// ── V4.2 Marketing Studio Hub ─────────────────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "marketingStrategy", icon: "📣", label: "Marketing Strategy",    desc: "Full go-to-market strategy with channels, messaging, and 30-day plan." },
  { id: "emailCampaign",     icon: "📧", label: "Email Campaign",         desc: "Generate a 3-email drip campaign that converts cold leads to customers." },
  { id: "socialMedia",       icon: "📱", label: "Social Media Posts",     desc: "LinkedIn, X, Instagram, and TikTok content — ready to publish." },
  { id: "seoPlanner",        icon: "🔍", label: "SEO Keyword Planner",    desc: "Keyword clusters, content plan, and 90-day SEO calendar." },
  { id: "adCopy",            icon: "📢", label: "Ad Copy Generator",      desc: "Google, Facebook, LinkedIn, and YouTube ad variations." },
  { id: "contentCalendar",   icon: "📅", label: "Content Calendar",       desc: "A complete 4-week content marketing plan across all channels." },
  { id: "brandVoice",        icon: "🎙️", label: "Brand Voice",           desc: "Define your tone, messaging pillars, taglines, and style guide." },
  { id: "content",           icon: "✍️", label: "AI Content Ideas",       desc: "Brainstorm 8 high-impact content concepts for any topic." },
];

const STATS = [
  { label: "Marketing Tools", val: "7", icon: "🛠️" },
  { label: "AI-Powered",      val: "100%", icon: "🤖" },
  { label: "Avg Time Saved",  val: "8h/wk", icon: "⏱️" },
  { label: "Output Formats",  val: "5+",  icon: "📤" },
];

export default function MarketingHub({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const marketingProjects = useMemo(
    () => projects.filter(p =>
      ["Email Marketing","Social Media","SEO Strategy","Advertising","Content Marketing",
       "Brand Strategy","Marketing Strategy"].includes(p.category)
    ).slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      {/* Header */}
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #a855f7 50%, #ec4899 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📣</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Marketing Studio
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 480 }}>
          AI-powered marketing tools for founders. Build campaigns, plan content, and define your brand in minutes — not weeks.
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Marketing Tools</h2>
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

      {/* Recent Marketing Projects */}
      {marketingProjects.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📁 Recent Marketing Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {marketingProjects.map(p => (
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
        background: "linear-gradient(135deg, #ede9fe, #fce7f3)",
        border: "1.5px solid #d8b4fe", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#581c87",
      }}>
        <strong>💡 Pro Tip:</strong> Start with <strong>Marketing Strategy</strong> to define your channels and messaging, then use <strong>Content Calendar</strong> to plan 4 weeks of content, and <strong>Ad Copy</strong> when you're ready to scale. This sequence works best for early-stage founders.
      </div>
    </div>
  );
}
