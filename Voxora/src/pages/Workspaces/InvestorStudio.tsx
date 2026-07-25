// ── V6.1 Investor & Pitch Studio — Hub ───────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "pitchDeckGenerator",
    icon: "🎯",
    label: "Pitch Deck Generator",
    desc: "10-slide AI-generated investor pitch deck covering every key section from problem to funding ask.",
    badge: "AI",
  },
  {
    id: "execSummaryGen",
    icon: "📄",
    label: "Executive Summary Generator",
    desc: "One-page investor-ready executive summary, AI-generated from your business plan inputs.",
    badge: "AI",
  },
  {
    id: "elevatorPitch",
    icon: "🎤",
    label: "Elevator Pitch Generator",
    desc: "Generate 30-second, 60-second, and 2-minute pitches tailored for any audience.",
    badge: "AI",
  },
  {
    id: "fundingCalculator",
    icon: "💰",
    label: "Funding Calculator",
    desc: "Calculate equity %, runway, and post-money valuation from your raise parameters.",
    badge: "Calc",
  },
  {
    id: "investorReadiness",
    icon: "📊",
    label: "Investor Readiness Score",
    desc: "Score your startup out of 100 with AI-driven strengths, weaknesses, and recommendations.",
    badge: "AI",
  },
];

const BADGE_COLORS: Record<string, string> = {
  AI:   "linear-gradient(135deg,#6C63FF,#a78bfa)",
  Calc: "linear-gradient(135deg,#10b981,#34d399)",
};

const STATS = [
  { icon: "🎯", label: "Pitch Tools",   val: "5"    },
  { icon: "💼", label: "Raise-Ready",   val: "Yes"  },
  { icon: "⚡", label: "AI-Powered",    val: "100%" },
  { icon: "📤", label: "Export Formats", val: "3"   },
];

export default function InvestorStudio({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const recent = useMemo(
    () =>
      projects
        .filter(p =>
          ["Pitch Deck","Executive Summary","Elevator Pitch","Investor Readiness"].includes(p.category)
        )
        .slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,#1e3a8a 0%,#6C63FF 55%,#db2777 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Investor &amp; Pitch Studio
        </h1>
        <p style={{ margin: "10px 0 24px", fontSize: 16, opacity: 0.9, maxWidth: 520 }}>
          Everything you need to pitch investors with confidence. Generate pitch decks, executive summaries,
          elevator pitches, calculate funding terms, and score your investor readiness — all AI-powered.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="workspace-btn"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
            onClick={() => setWorkspace("pitchDeckGenerator")}
          >
            🎯 Generate Pitch Deck
          </button>
          <button
            className="workspace-btn"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
            onClick={() => setWorkspace("investorReadiness")}
          >
            📊 Check Readiness
          </button>
        </div>
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🛠️ Pitch &amp; Funding Tools</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card"
            style={{ cursor: "pointer", position: "relative", paddingTop: 24 }}
            onClick={() => setWorkspace(t.id)}
          >
            {/* Badge */}
            <span style={{
              position: "absolute", top: 12, right: 12,
              background: BADGE_COLORS[t.badge] || "#6C63FF",
              color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px",
              borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase",
            }}>
              {t.badge}
            </span>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>{t.label}</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.5 }}>
              {t.desc}
            </p>
            <button
              className="workspace-btn"
              style={{ width: "100%", fontSize: 13 }}
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>🕒 Recent Investor Work</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {recent.map(p => (
              <div key={p.id} className="feature-card" style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                      {p.category} · {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={{
                    background: "#f3f4f6", borderRadius: 8, padding: "3px 10px",
                    fontSize: 12, color: "#374151", fontWeight: 600,
                  }}>
                    Saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Tips */}
      <div style={{
        background: "var(--card-bg,#f9fafb)", borderRadius: 16,
        padding: "24px 28px", border: "1px solid var(--border,#e5e7eb)",
      }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>💡 Fundraising Quick Tips</h3>
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Lead with the problem — investors fund solutions to big, painful problems.",
            "Know your numbers: CAC, LTV, burn rate, and runway before every meeting.",
            "Tailor your pitch length: 30s for hallways, 2min for intro calls, deck for formal meetings.",
            "Investor readiness > speed. A strong deck at the right time beats a rushed one.",
            "Always send a 1-page executive summary before the full deck.",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.6 }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
