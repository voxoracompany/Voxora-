import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "💡", title: "Startup Idea Generator", desc: "Generate and refine business ideas with market-aware AI analysis." },
  { icon: "🔬", title: "Customer Research", desc: "Understand your target market before you invest time and money." },
  { icon: "📊", title: "Business Model Canvas", desc: "Map every dimension of your business in a structured, shareable format." },
  { icon: "🏆", title: "Competitor Analysis", desc: "Know your competition inside-out before entering the market." },
  { icon: "📋", title: "SWOT Analysis", desc: "Identify your strategic position with a rigorous framework." },
  { icon: "💰", title: "Financial Studio", desc: "Model costs, revenue, and cash flow without hiring a CFO." },
  { icon: "🎤", title: "Investor Studio", desc: "Build your pitch deck and fundraising strategy from day one." },
  { icon: "🗺️", title: "Product Roadmap", desc: "Plan your product development from idea to launch to scale." },
];

export default function Entrepreneurs() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ SOLUTIONS — ENTREPRENEURS</p>
        <h1>Build Your Business<br />10x Faster with AI</h1>
        <p>
          Voxora gives entrepreneurs every tool needed to validate ideas, plan strategy,
          model financials, and attract investors — all in one AI-powered workspace.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/signup")}>
            Start Building Free →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/platforms/startup-studio")}>
            Startup Studio
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "10+", label: "Entrepreneur Tools" },
          { value: "10x", label: "Faster Planning" },
          { value: "0", label: "Consultants Needed" },
          { value: "Free", label: "To Start" },
        ].map((s) => (
          <div className="pub-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ TOOLS FOR ENTREPRENEURS</p>
        <h2>Replace a Team of Consultants</h2>
        <p className="pub-section-sub">
          Every tool an entrepreneur needs — from idea validation to investor-ready
          financials — without the consulting fees.
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
        <h2>Your AI Co-Founder is Waiting</h2>
        <p>Start free. Build faster. Grow smarter. No credit card required.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Open Workspace →</button>
          <button className="btn-outline-white" onClick={() => navigate("/pricing")}>View Pricing</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
