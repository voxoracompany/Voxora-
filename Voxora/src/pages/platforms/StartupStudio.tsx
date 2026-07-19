import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "💡", title: "Startup Idea Generator", desc: "Turn vague thoughts into validated business concepts with market context." },
  { icon: "🔬", title: "Customer Research", desc: "Understand your target audience before you build a single feature." },
  { icon: "👤", title: "Customer Persona Builder", desc: "Create detailed, data-driven personas for your ideal customers." },
  { icon: "✅", title: "Product Validation", desc: "Test your assumptions and validate demand before investing resources." },
  { icon: "📊", title: "Business Model Canvas", desc: "Map your entire business model on a single, shareable canvas." },
  { icon: "🏆", title: "Competitor Analysis", desc: "Understand the competitive landscape and find your strategic edge." },
  { icon: "📋", title: "SWOT Analysis", desc: "Analyze strengths, weaknesses, opportunities, and threats in minutes." },
  { icon: "🗺️", title: "Product Roadmap", desc: "Build a step-by-step development plan from MVP to scale." },
];

export default function StartupStudio() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ PLATFORM — STARTUP STUDIO</p>
        <h1>From Zero to Launch,<br />Faster Than Ever</h1>
        <p>
          The Startup Studio gives you every tool you need to validate ideas,
          understand customers, and plan your go-to-market strategy — all powered by AI.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Launch Startup Studio →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Sign Up Free
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "8+", label: "Startup Tools" },
          { value: "10x", label: "Faster Validation" },
          { value: "0", label: "Spreadsheets Needed" },
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
        <h2>Everything a Founder Needs</h2>
        <p className="pub-section-sub">
          Replace weeks of research, strategy sessions, and planning with AI-powered
          tools that give you answers in minutes.
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

      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ HOW IT WORKS</p>
        <h2>From Idea to Action in 3 Steps</h2>
        <p className="pub-section-sub">No frameworks to learn. Just describe your idea and Voxora does the rest.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 820, margin: "0 auto" }}>
          {[
            { num: "01", title: "Describe Your Idea", desc: "Tell Voxora what you want to build. No structure required — just your thoughts." },
            { num: "02", title: "Run the Studio Tools", desc: "Use any combination of the 8 Startup Studio tools to analyze and plan." },
            { num: "03", title: "Save, Export & Execute", desc: "Save your research, export your plans, and start building with confidence." },
          ].map((s) => (
            <div key={s.num} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: "28px 24px", flex: 1, minWidth: 220, maxWidth: 260, textAlign: "left" }}>
              <span style={{ display: "block", fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg,#6C63FF,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>{s.num}</span>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 13.5, color: "#6b7280", lineHeight: 1.5, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Start Building Your Startup Today</h2>
        <p>Join founders who use Voxora to validate faster and build smarter.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Open Startup Studio →</button>
          <button className="btn-outline-white" onClick={() => navigate("/pricing")}>View Pricing</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
