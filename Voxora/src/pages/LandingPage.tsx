import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import PublicFooter from "../components/PublicFooter";
import "../App.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.name.trim() || !contact.email.trim() || !contact.message.trim()) return;
    setContactSent(true);
    setContact({ name: "", email: "", message: "" });
  };

  const FAQS = [
    { q: "Is Voxora free to use?", a: "Yes — the core Voxora platform is free. Pro and Enterprise plans unlock advanced features, priority support, and team collaboration." },
    { q: "Where is my data stored?", a: "Your data is stored locally in your browser. Nothing is sent to external servers in the current version. A cloud sync option is coming with V2.2." },
    { q: "Do I need to create an account?", a: "No account is required to use Voxora today. Authentication and cloud backup will be optional features in a future update." },
    { q: "Can I export my projects?", a: "Yes! Export any project as PDF, Markdown, or plain text via the Export Center. You can also backup all your data as a JSON file from Settings." },
    { q: "What AI models does Voxora use?", a: "Voxora currently uses a built-in intelligent response system. Full AI model integration (GPT-4, Claude, etc.) is on the roadmap for V3.0." },
  ];

  return (
    <div className="voxora">
      <PublicNav />

      {/* ─── Hero ─── */}
      <main className="hero">
        <div className="hero-content">
          <p className="tagline section-label">✦ THE INTELLIGENCE LAYER FOR THE AI AGE</p>
          <h1>
            Build, Create &amp; Think
            <br />
            <span className="hero-gradient">With The Power Of AI</span>
          </h1>
          <p className="description">
            Voxora is the intelligent foundation that connects AI agents,
            creativity, automation, and human ideas into one powerful ecosystem.
          </p>
          <div className="buttons">
            <button className="primary" onClick={() => navigate("/signup")}>
              Start Building Free →
            </button>
            <button className="secondary" onClick={() => navigate("/dashboard")}>
              Explore the Platform
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><strong>10+</strong><span>AI Tools</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>∞</strong><span>Ideas Generated</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><strong>Free</strong><span>To Start</span></div>
          </div>
        </div>

        <div className="ai-card">
          <div className="ai-card-glow" />
          <div className="circle">AI</div>
          <h2>Voxora Intelligence Engine</h2>
          <p>Your AI command center for ideas, content, products and innovation.</p>
          <div className="ai-card-features">
            {["🧠 Idea Generation", "📊 Market Research", "🚀 Startup Strategy", "⚙️ Automation"].map(f => (
              <span key={f} className="ai-feature-chip">{f}</span>
            ))}
          </div>
        </div>
      </main>

      {/* ─── Features ─── */}
      <section className="ecosystem" id="features">
        <p className="section-label">✦ PLATFORM FEATURES</p>
        <h2>One Intelligence Layer.<br />Infinite AI Possibilities.</h2>
        <p className="section-sub">Voxora connects intelligent AI agents into one powerful ecosystem designed for creators, founders, businesses and innovators.</p>

        <div className="agent-grid">
          {[
            { icon: "🧠", title: "Idea Agent", desc: "Transform thoughts into strategies, plans and new possibilities with AI-powered brainstorming." },
            { icon: "✍️", title: "Creator Agent", desc: "Create content, concepts and digital experiences with intelligent AI generation." },
            { icon: "🚀", title: "Startup Agent", desc: "Turn ideas into products, businesses and growth strategies with market-ready analysis." },
            { icon: "⚙️", title: "Automation Agent", desc: "Build intelligent workflows that save time and increase output dramatically." },
            { icon: "📊", title: "Analytics Agent", desc: "Track your productivity and gain real insights from your actual project data." },
            { icon: "🔍", title: "Search Agent", desc: "Instantly find anything across all your projects, notes, and AI conversations." },
          ].map((a) => (
            <div key={a.title} className="agent-card" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
              <div className="agent-card-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Why Voxora ─── */}
      <section className="why-voxora">
        <p className="section-label">✦ WHY VOXORA</p>
        <h2>Why Voxora?</h2>
        <p className="section-sub">The future will not be powered by one AI. It will be powered by intelligent systems working together.</p>

        <div className="why-grid">
          {[
            { icon: "🌐", title: "Connected Intelligence", desc: "Voxora brings multiple AI agents together into one unified intelligence layer, eliminating context switching." },
            { icon: "⚡", title: "Faster Creation", desc: "Move from ideas to execution 10x faster with AI-powered tools that do the heavy lifting for you." },
            { icon: "🧩", title: "Endless Possibilities", desc: "Build, automate and innovate across different areas using intelligent AI systems built for scale." },
            { icon: "🔒", title: "Your Data, Your Control", desc: "Everything stays on your device. No accounts needed, no data harvesting, no surveillance." },
          ].map((w) => (
            <div key={w.title} className="why-card">
              <div className="why-card-icon">{w.icon}</div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="how-it-works">
        <p className="section-label">✦ HOW IT WORKS</p>
        <h2>How Voxora Works</h2>
        <p className="section-sub">From a simple idea to intelligent execution in three steps.</p>

        <div className="steps">
          {[
            { num: "01", title: "Share Your Idea", desc: "Start with a thought, challenge, or goal. Voxora adapts to you." },
            { num: "02", title: "Activate AI Tools", desc: "Choose from 10+ AI-powered tools designed for your objective." },
            { num: "03", title: "Create & Execute", desc: "Turn AI-powered insights into real products, content and solutions." },
          ].map((s) => (
            <div key={s.num} className="step-card">
              <span className="step-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="testimonials-section">
        <p className="section-label">✦ TESTIMONIALS</p>
        <h2>Built for Builders</h2>
        <p className="section-sub">Join innovators using Voxora to build smarter and faster.</p>

        <div className="testimonials-grid">
          {[
            { name: "Sarah K.", role: "Startup Founder", text: "Voxora completely changed how I validate ideas. What used to take weeks of research now takes minutes.", avatar: "SK" },
            { name: "Marcus T.", role: "Product Manager", text: "The analytics dashboard gives me real insight into my team's productivity. It's exactly what I needed.", avatar: "MT" },
            { name: "Priya R.", role: "Content Creator", text: "I use the AI Assistant every day for brainstorming. The suggestions are surprisingly on point.", avatar: "PR" },
            { name: "James L.", role: "Entrepreneur", text: "The SWOT Analysis and Business Model Canvas tools saved me countless hours of strategic planning.", avatar: "JL" },
          ].map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="pricing-section" id="pricing">
        <p className="section-label">✦ PRICING</p>
        <h2>Simple, Transparent Pricing</h2>
        <p className="section-sub">Start free. Upgrade when you're ready.</p>

        <div className="pricing-grid">
          {[
            {
              plan: "Free",
              price: "$0",
              period: "forever",
              desc: "Everything you need to get started.",
              features: ["All AI Tools", "Unlimited Projects", "Smart Search", "Export (MD, TXT)", "Activity Center", "Local Storage"],
              cta: "Get Started Free",
              featured: false,
            },
            {
              plan: "Pro",
              price: "$12",
              period: "/month",
              desc: "For power users and serious builders.",
              features: ["Everything in Free", "Cloud Sync (coming soon)", "PDF Export", "Priority Support", "Advanced Analytics", "Team Sharing (coming soon)"],
              cta: "Start Pro Trial",
              featured: true,
            },
            {
              plan: "Enterprise",
              price: "Custom",
              period: "",
              desc: "For teams and organizations.",
              features: ["Everything in Pro", "Custom AI Models", "SSO / SAML", "Dedicated Support", "SLA Guarantee", "Custom Integrations"],
              cta: "Contact Sales",
              featured: false,
            },
          ].map((p) => (
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

      {/* ─── FAQ ─── */}
      <section className="faq-landing" id="faq">
        <p className="section-label">✦ FAQ</p>
        <h2>Frequently Asked Questions</h2>
        <p className="section-sub">Everything you need to know about Voxora.</p>

        <div className="faq-landing-list">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-landing-item">
              <button
                className="faq-landing-q"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{f.q}</span>
                <span>{openFaq === i ? "▲" : "▼"}</span>
              </button>
              {openFaq === i && <div className="faq-landing-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section className="contact-section" id="contact">
        <p className="section-label">✦ CONTACT</p>
        <h2>Get In Touch</h2>
        <p className="section-sub">Have a question or want to learn more? We'd love to hear from you.</p>

        <div className="contact-form-wrap">
          {contactSent ? (
            <div className="contact-success">
              <div style={{ fontSize: 48 }}>✅</div>
              <h3>Message Sent!</h3>
              <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button className="primary" onClick={() => setContactSent(false)}>Send Another</button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleContact}>
              <div className="contact-row">
                <input
                  className="contact-input"
                  placeholder="Your name"
                  value={contact.name}
                  maxLength={80}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder="Your email"
                  value={contact.email}
                  maxLength={100}
                  onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                  required
                />
              </div>
              <textarea
                className="contact-input contact-textarea"
                placeholder="Your message…"
                value={contact.message}
                maxLength={2000}
                rows={5}
                onChange={(e) => setContact((c) => ({ ...c, message: e.target.value }))}
                required
              />
              <button className="primary" type="submit">Send Message →</button>
            </form>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
