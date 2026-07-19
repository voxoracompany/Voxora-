import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "✍️", title: "AI Content Ideas", desc: "Generate endless content concepts tailored to your niche and audience." },
  { icon: "📅", title: "Content Calendar", desc: "Plan and schedule weeks of content in one automated session." },
  { icon: "📱", title: "Social Media Posts", desc: "Create platform-optimised posts for every channel you publish on." },
  { icon: "📝", title: "Blog & Article Writer", desc: "Draft long-form content, newsletters, and thought-leadership pieces." },
  { icon: "🎯", title: "Audience Research", desc: "Understand what your audience wants before you create anything." },
  { icon: "📤", title: "Export & Publish", desc: "Export content as PDF, Markdown, or plain text ready to publish." },
];

const TESTIMONIALS = [
  { name: "Priya R.", role: "Content Creator", text: "I generate a month's worth of content ideas in 20 minutes. Game-changer.", avatar: "PR" },
  { name: "Leo M.", role: "YouTuber", text: "The audience research tool helped me understand what my viewers actually want to see.", avatar: "LM" },
];

export default function Creators() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ SOLUTIONS — CREATORS</p>
        <h1>AI Tools Built for<br />Content Creators</h1>
        <p>
          Stop staring at a blank page. Voxora gives creators the AI toolkit to
          generate ideas, plan content, and publish consistently — without burning out.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/signup")}>
            Start for Free →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/dashboard")}>
            Explore the Platform
          </button>
        </div>
      </section>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ CREATOR TOOLS</p>
        <h2>Made for Creators Who Create a Lot</h2>
        <p className="pub-section-sub">All the tools you need to go from blank page to published content — faster than ever.</p>
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
        <p className="pub-section-label">✦ TESTIMONIALS</p>
        <h2>Creators Love Voxora</h2>
        <p className="pub-section-sub">Join the creators using AI to scale their output without sacrificing quality.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 760, margin: "0 auto" }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 18, padding: 24, flex: 1, minWidth: 280, maxWidth: 360 }}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, fontStyle: "italic", marginBottom: 16 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6C63FF,#a855f7)", color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.avatar}</div>
                <div>
                  <strong style={{ display: "block", fontSize: 13, color: "#0f172a" }}>{t.name}</strong>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Start Creating with AI Today</h2>
        <p>Free forever. No credit card. Full access to all creator tools.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/signup")}>Get Started Free →</button>
          <button className="btn-outline-white" onClick={() => navigate("/platforms/marketing-studio")}>Marketing Studio</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
