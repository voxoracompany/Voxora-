import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "💸", title: "Startup Cost Calculator", desc: "Estimate your initial costs and funding needs before you spend a dollar." },
  { icon: "📈", title: "Revenue Forecast", desc: "Model different growth scenarios and understand your upside potential." },
  { icon: "🌊", title: "Cash Flow Planner", desc: "Plan your monthly cash position and identify gaps before they become crises." },
  { icon: "📊", title: "P&L Estimator", desc: "Project your profit and loss across multiple time horizons with ease." },
  { icon: "⚖️", title: "Break-even Calculator", desc: "Know exactly when your business becomes profitable under different assumptions." },
  { icon: "🏦", title: "Funding Planner", desc: "Map out your fundraising strategy, timeline, and investor targets." },
  { icon: "📉", title: "Financial Dashboard", desc: "Visualise all your key financial metrics in one clean, exportable dashboard." },
  { icon: "❤️‍🔥", title: "Business Health Score", desc: "Get a single score that reflects the financial health of your startup." },
];

export default function FinancialStudio() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ PLATFORM — FINANCIAL STUDIO</p>
        <h1>Understand Your Numbers.<br />Without a CFO.</h1>
        <p>
          The Financial Studio gives every founder the financial clarity of a seasoned CFO —
          from cost modelling to revenue forecasting to cash flow planning.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Launch Financial Studio →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Sign Up Free
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "8", label: "Financial Tools" },
          { value: "0", label: "Spreadsheets Needed" },
          { value: "∞", label: "Scenarios Modelled" },
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
        <h2>Financial Clarity for Founders</h2>
        <p className="pub-section-sub">
          Replace complex spreadsheets with intelligent financial planning tools
          that give you the answers you need — fast.
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
        <h2>Take Control of Your Finances</h2>
        <p>Get the financial clarity you need to make confident decisions and grow your business.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Open Financial Studio →</button>
          <button className="btn-outline-white" onClick={() => navigate("/platforms/investor-studio")}>Investor Studio</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
