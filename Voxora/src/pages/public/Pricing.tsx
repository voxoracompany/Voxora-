import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";
import "../../App.css";

const PLANS = [
  {
    plan: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need to get started.",
    features: [
      "All AI Tools (10+)",
      "Unlimited Projects",
      "Smart Search",
      "Export (MD, TXT)",
      "Activity Center",
      "Local Storage",
      "Help Center",
    ],
    cta: "Get Started Free",
    featured: false,
  },
  {
    plan: "Pro",
    price: "$12",
    period: "/month",
    desc: "For power users and serious builders.",
    features: [
      "Everything in Free",
      "Cloud Sync (coming soon)",
      "PDF Export",
      "Priority Support",
      "Advanced Analytics",
      "Team Sharing (coming soon)",
      "Custom Integrations",
    ],
    cta: "Start Pro Trial",
    featured: true,
  },
  {
    plan: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Custom AI Models",
      "SSO / SAML",
      "Dedicated Support",
      "SLA Guarantee",
      "Custom Integrations",
      "Volume Discounts",
    ],
    cta: "Contact Sales",
    featured: false,
  },
];

const FAQS = [
  { q: "Can I upgrade or downgrade at any time?", a: "Yes. You can upgrade to Pro instantly and downgrade at the end of your billing period." },
  { q: "Is there a free trial for Pro?", a: "Yes — try Pro free for 14 days. No credit card required." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards via Stripe. Enterprise invoicing is available on request." },
  { q: "Where is my data stored on the free plan?", a: "On the free plan, all data is stored locally in your browser. Cloud sync is a Pro feature coming soon." },
  { q: "Do you offer nonprofit or student discounts?", a: "Yes! Contact us at hello@voxora.ai with proof of eligibility." },
];

function PricingFaq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-landing-item">
      <button className="faq-landing-q" onClick={() => setOpen((o) => !o)}>
        <span>{q}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="faq-landing-a">{a}</div>}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ PRICING</p>
        <h1>Simple, Transparent Pricing</h1>
        <p>Start free. Upgrade when you're ready. Cancel anytime.</p>
      </section>

      <section className="pub-section bg-gray">
        <div className="pricing-grid" style={{ maxWidth: 980, margin: "0 auto" }}>
          {PLANS.map((p) => (
            <div key={p.plan} className={`pricing-card ${p.featured ? "featured" : ""}`}>
              {p.featured && <div className="pricing-badge">Most Popular</div>}
              <h3>{p.plan}</h3>
              <div className="pricing-price">
                <span className="pricing-amount">{p.price}</span>
                <span className="pricing-period">{p.period}</span>
              </div>
              <p className="pricing-desc">{p.desc}</p>
              <ul className="pricing-features">
                {p.features.map((f) => (
                  <li key={f} className="pricing-feature">
                    <span className="pricing-check">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.featured ? "primary pricing-cta" : "secondary pricing-cta"}
                onClick={() => navigate(p.plan === "Enterprise" ? "/contact" : "/signup")}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ FAQ</p>
        <h2>Pricing Questions</h2>
        <p className="pub-section-sub">Everything you need to know about our plans.</p>
        <div className="faq-landing-list" style={{ textAlign: "left" }}>
          {FAQS.map((f, i) => (
            <PricingFaq key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Start Building Today</h2>
        <p>Join thousands of creators and founders on the free plan — no credit card needed.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/signup")}>Get Started Free →</button>
          <button className="btn-outline-white" onClick={() => navigate("/contact")}>Talk to Sales</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
