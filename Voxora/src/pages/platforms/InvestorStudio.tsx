import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "🎤", title: "Pitch Deck Generator", desc: "Build a compelling, investor-ready pitch deck structure with AI-crafted slides." },
  { icon: "📝", title: "Executive Summary Generator", desc: "Create a concise, powerful executive summary that opens doors." },
  { icon: "✅", title: "Investment Readiness Assessment", desc: "Know exactly where you stand before you walk into an investor meeting." },
  { icon: "📋", title: "Funding Checklist", desc: "A complete checklist of everything investors will ask for — before they ask." },
  { icon: "🗂️", title: "Investor CRM", desc: "Track your investor pipeline, conversations, and next steps in one place." },
  { icon: "📓", title: "Investor Notes", desc: "Capture meeting notes, feedback, and follow-ups for every investor interaction." },
  { icon: "📅", title: "Fundraising Timeline", desc: "Plan your raise from first outreach to term sheet with a clear timeline." },
  { icon: "📤", title: "Presentation Export", desc: "Export your pitch materials in professional formats ready to share." },
];

export default function InvestorStudio() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ PLATFORM — INVESTOR STUDIO</p>
        <h1>Raise Capital with<br />Confidence</h1>
        <p>
          The Investor Studio prepares you for every stage of fundraising — from your
          first pitch deck to managing a full investor pipeline.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Launch Investor Studio →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Sign Up Free
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "8", label: "Investor Tools" },
          { value: "1", label: "Unified Pipeline" },
          { value: "∞", label: "Investors Tracked" },
          { value: "Free", label: "To Start" },
        ].map((s) => (
          <div className="pub-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ TOOLS INCLUDED</p>
        <h2>Everything You Need to Raise</h2>
        <p className="pub-section-sub">
          From your first pitch to closing the round, the Investor Studio has every
          tool you need to present confidently and manage relationships effectively.
        </p>
        <div className="pub-grid">
          {TOOLS.map((t) => (
            <div className="pub-card" key={t.title}>
              <div className="pub-card-icon">{t.icon}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Ready to Raise Your Round?</h2>
        <p>Start with the Investment Readiness Assessment and know exactly what to fix before your first meeting.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Open Investor Studio →</button>
          <button className="btn-outline-white" onClick={() => navigate("/platforms/financial-studio")}>Financial Studio</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
