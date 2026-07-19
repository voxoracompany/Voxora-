import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "📊", title: "Business Analytics", desc: "Track performance metrics and get AI-powered insights across your business." },
  { icon: "📣", title: "Marketing Studio", desc: "Scale your content production and marketing campaigns with AI." },
  { icon: "💰", title: "Financial Studio", desc: "Advanced financial modelling, forecasting, and health scoring." },
  { icon: "👥", title: "Team Collaboration", desc: "Share workspaces, assign tasks, and collaborate across your organisation." },
  { icon: "🔗", title: "Integrations", desc: "Connect Voxora with your existing tools — Slack, Notion, Google Drive, and more." },
  { icon: "📤", title: "Export Center", desc: "Export reports, analyses, and plans in PDF, CSV, and other business formats." },
  { icon: "⚙️", title: "Custom Workflows", desc: "Build AI-powered workflows tailored to your specific business processes." },
  { icon: "🔒", title: "Enterprise Security", desc: "SSO, SAML, role-based access, and dedicated compliance support." },
];

export default function Businesses() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ SOLUTIONS — BUSINESSES</p>
        <h1>AI That Works for<br />Your Whole Business</h1>
        <p>
          Voxora scales from solo founders to full teams, with enterprise-grade tools
          for analytics, collaboration, security, and custom AI workflows.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/contact")}>
            Talk to Sales →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Try Free First
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "Enterprise", label: "Grade Security" },
          { value: "∞", label: "Team Members" },
          { value: "10+", label: "Integrations" },
          { value: "SLA", label: "Guaranteed" },
        ].map((s) => (
          <div className="pub-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ BUSINESS FEATURES</p>
        <h2>Built to Scale with Your Business</h2>
        <p className="pub-section-sub">
          From analytics to automation, Voxora gives your entire team the AI tools
          they need to operate smarter and grow faster.
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
        <h2>Ready to Scale with AI?</h2>
        <p>Talk to our team about enterprise pricing, custom integrations, and dedicated support.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/contact")}>Contact Sales →</button>
          <button className="btn-outline-white" onClick={() => navigate("/pricing")}>View Plans</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
