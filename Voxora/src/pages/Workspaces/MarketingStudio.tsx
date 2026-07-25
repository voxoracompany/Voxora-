// ── V6.2 Marketing Studio — Hub ──────────────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";
import "./MarketingStudio.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "brandIdentityGen",
    icon: "🎨",
    label: "Brand Identity Generator",
    desc: "Company names, taglines, mission & vision statements, brand voice, personality, and colour palette — all AI-generated.",
    badge: "AI",
  },
  {
    id: "landingPageGen",
    icon: "🖥️",
    label: "Landing Page Generator",
    desc: "Hero, headlines, features, benefits, testimonials, FAQs, CTAs and footer copy — ready to hand to your developer.",
    badge: "AI",
  },
  {
    id: "marketingCopyGen",
    icon: "✍️",
    label: "Marketing Copy Generator",
    desc: "Facebook, Instagram, LinkedIn, Google Ads, Twitter/X posts, product descriptions, and press releases.",
    badge: "AI",
  },
  {
    id: "emailCampaignGen",
    icon: "📧",
    label: "Email Campaign Generator",
    desc: "Welcome, launch, promotional, newsletter and follow-up email sequences — fully AI-written.",
    badge: "AI",
  },
  {
    id: "socialMediaPlanner",
    icon: "📅",
    label: "Social Media Content Planner",
    desc: "30-day content calendar with captions, hashtags and posting schedule for LinkedIn, Facebook, Instagram, X and TikTok.",
    badge: "AI",
  },
  {
    id: "seoToolkit",
    icon: "🔍",
    label: "SEO Toolkit",
    desc: "SEO title, meta description, keywords, blog outline, FAQ schema and internal linking suggestions.",
    badge: "AI",
  },
];

const BADGE_COLORS: Record<string, string> = {
  AI:   "linear-gradient(135deg,#6C63FF,#a78bfa)",
  Calc: "linear-gradient(135deg,#10b981,#34d399)",
};

const STATS = [
  { icon: "🛠️", label: "Marketing Tools",   val: "6"    },
  { icon: "📣", label: "Ad Platforms",       val: "7"    },
  { icon: "📅", label: "Days of Content",    val: "30"   },
  { icon: "📤", label: "Export Formats",     val: "3"    },
];

export default function MarketingStudio({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const recent = useMemo(
    () =>
      projects
        .filter(p =>
          ["Brand Identity","Landing Page","Marketing Copy","Email Campaign",
           "Social Media Plan","SEO Toolkit"].includes(p.category)
        )
        .slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg,#0f766e 0%,#6C63FF 50%,#ec4899 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📣</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Marketing Studio
        </h1>
        <p style={{ margin: "10px 0 24px", fontSize: 16, opacity: 0.9, maxWidth: 520 }}>
          Everything you need to go to market. Build your brand identity, generate landing page
          copy, write ads across every platform, plan 30 days of social content and nail your SEO
          — all AI-powered.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            className="workspace-btn"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
            onClick={() => setWorkspace("brandIdentityGen")}
          >
            🎨 Build Brand Identity
          </button>
          <button
            className="workspace-btn"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
            onClick={() => setWorkspace("socialMediaPlanner")}
          >
            📅 Plan 30-Day Content
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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🛠️ Marketing Tools</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card ms-tool-card"
            style={{ cursor: "pointer", position: "relative", paddingTop: 24 }}
            onClick={() => setWorkspace(t.id)}
          >
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
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>🕒 Recent Marketing Work</h2>
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
                  <span style={{ background: "#f3f4f6", borderRadius: 8, padding: "3px 10px", fontSize: 12, color: "#374151", fontWeight: 600 }}>Saved</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Tips */}
      <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 16, padding: "24px 28px", border: "1px solid var(--border,#e5e7eb)" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>💡 Marketing Quick Tips</h3>
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Start with brand identity — your voice and personality should be consistent across every channel.",
            "Write landing page copy before designing the page — copy drives design, not the other way around.",
            "One ad platform at a time — nail Facebook before spreading to LinkedIn and Google.",
            "30-day content calendars remove decision fatigue — plan once, post consistently.",
            "SEO compounds. Every optimised page is an asset that works 24/7 for free.",
          ].map((tip, i) => (
            <li key={i} style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.6 }}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
