import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

const CATEGORIES = [
  {
    icon: "🚀",
    title: "Getting Started",
    desc: "Set up your account, first project, and workspace.",
    articles: [
      "How to create your first project",
      "Navigating the Voxora workspace",
      "Demo Mode vs. cloud account",
      "Choosing the right studio for your use case",
    ],
  },
  {
    icon: "🤖",
    title: "AI & Tools",
    desc: "Using AI models, prompts, and automation tools.",
    articles: [
      "Which AI models does Voxora support?",
      "How to connect your own API key",
      "Understanding prompt credits",
      "AI response quality tips",
    ],
  },
  {
    icon: "💾",
    title: "Data & Storage",
    desc: "Exports, backups, and cloud sync.",
    articles: [
      "How to export a project as PDF or Markdown",
      "Backing up all your data",
      "Switching from Demo Mode to cloud sync",
      "Deleting your account and all data",
    ],
  },
  {
    icon: "💳",
    title: "Billing & Plans",
    desc: "Subscriptions, upgrades, and invoices.",
    articles: [
      "What's included in the free plan?",
      "Upgrading to Pro or Enterprise",
      "Managing your subscription",
      "Requesting a refund",
    ],
  },
  {
    icon: "🔐",
    title: "Account & Security",
    desc: "Passwords, two-factor auth, and permissions.",
    articles: [
      "Resetting your password",
      "Enabling two-factor authentication",
      "Managing team member access",
      "Reporting a security issue",
    ],
  },
  {
    icon: "🔌",
    title: "Integrations",
    desc: "Connecting Voxora to your existing tools.",
    articles: [
      "Connecting Firebase for cloud storage",
      "Using the Voxora API",
      "Zapier & webhook integrations",
      "Slack and Notion sync (coming soon)",
    ],
  },
];

const FAQS = [
  {
    q: "Is Voxora free to use?",
    a: "Yes — the full Voxora platform is free in Demo Mode with no account required. Pro and Enterprise plans unlock cloud sync, team collaboration, priority AI, and advanced analytics.",
  },
  {
    q: "Where is my data stored?",
    a: "In Demo Mode your data lives entirely in your browser's localStorage — nothing leaves your device. When you create an account and enable cloud sync, your data is encrypted and stored securely on our servers.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account is needed to explore Voxora today. Create one when you're ready to sync across devices, invite teammates, or unlock Pro features.",
  },
  {
    q: "Can I export my projects?",
    a: "Yes. Export any project as PDF, Markdown, or plain text from the Export Center. You can also back up all your data as a JSON file from Settings → Data Management.",
  },
  {
    q: "What AI models does Voxora use?",
    a: "Voxora supports OpenAI (GPT-4o), Google Gemini, and Anthropic Claude. In Demo Mode a built-in mock engine provides realistic responses. Add your API key in Settings → AI Configuration to switch to live models.",
  },
  {
    q: "How do I report a bug?",
    a: "Use the contact form below or email support@voxora.ai with a short description of what happened, which browser and OS you're using, and steps to reproduce the issue. We aim to respond within 24 hours.",
  },
];

const STATUS_INDICATORS = [
  { label: "API", status: "operational" },
  { label: "Web App", status: "operational" },
  { label: "AI Services", status: "operational" },
  { label: "Auth", status: "operational" },
  { label: "Cloud Sync", status: "operational" },
];

export default function Support() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  const filteredCats = search.trim()
    ? CATEGORIES.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.articles.some((a) => a.toLowerCase().includes(search.toLowerCase()))
      )
    : CATEGORIES;

  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-hero">
        <p className="pub-hero-label">✦ HELP CENTER</p>
        <h1>How Can We Help?</h1>
        <p>Search our docs, browse by category, or contact our team directly.</p>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <input
            className="pub-auth-input"
            placeholder="Search help articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ fontSize: 16, padding: "14px 20px", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff" }}
          />
        </div>
      </section>

      {/* System Status */}
      <section style={{ background: "#0f172a", padding: "20px 40px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>SYSTEM STATUS</span>
          {STATUS_INDICATORS.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              <span style={{ fontSize: 13, color: "#94a3b8" }}>{s.label}</span>
            </div>
          ))}
          <span style={{ fontSize: 13, color: "#22c55e", fontWeight: 600, marginLeft: "auto" }}>All Systems Operational</span>
        </div>
      </section>

      {/* Categories */}
      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ BROWSE BY TOPIC</p>
        <h2>Help Categories</h2>
        <p className="pub-section-sub">Find answers organised by topic area.</p>
        {filteredCats.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center" }}>No categories match your search.</p>
        ) : (
          <div className="pub-grid" style={{ maxWidth: 1000 }}>
            {filteredCats.map((cat) => (
              <div key={cat.title} className="pub-card" style={{ textAlign: "left" }}>
                <div className="pub-card-icon">{cat.icon}</div>
                <h3>{cat.title}</h3>
                <p style={{ marginBottom: 14 }}>{cat.desc}</p>
                <ul style={{ padding: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {cat.articles.map((a) => (
                    <li key={a} style={{ fontSize: 13, color: "#6C63FF", cursor: "pointer" }}>
                      → {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ FAQ</p>
        <h2>Frequently Asked Questions</h2>
        <p className="pub-section-sub">Quick answers to the most common questions.</p>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "18px 22px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0f172a",
                  fontFamily: "inherit",
                  gap: 12,
                }}
              >
                {faq.q}
                <span style={{ fontSize: 18, color: "#6C63FF", flexShrink: 0 }}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 22px 18px", fontSize: 14.5, color: "#6b7280", lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ CONTACT SUPPORT</p>
        <h2>Still Need Help?</h2>
        <p className="pub-section-sub">Submit a ticket and our team will respond within 24 hours.</p>

        <div style={{ maxWidth: 620, margin: "0 auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "36px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <h3 style={{ fontSize: 22, color: "#0f172a", margin: "12px 0 6px" }}>Ticket Submitted!</h3>
              <p style={{ color: "#6b7280", marginBottom: 20 }}>
                We've received your request and will reply to your email within 24 hours.
              </p>
              <button className="btn-primary" onClick={() => setSent(false)}>Submit Another</button>
            </div>
          ) : (
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="pub-auth-label">Your Name</label>
                  <input
                    className="pub-auth-input"
                    placeholder="Jane Smith"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="pub-auth-label">Email Address</label>
                  <input
                    className="pub-auth-input"
                    type="email"
                    placeholder="jane@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="pub-auth-label">Subject</label>
                <input
                  className="pub-auth-input"
                  placeholder="e.g. Can't export my project"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>
              <div>
                <label className="pub-auth-label">Message</label>
                <textarea
                  className="pub-auth-input"
                  placeholder="Describe your issue in as much detail as possible…"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  rows={5}
                  required
                  style={{ resize: "vertical", minHeight: 120 }}
                />
              </div>
              <button className="pub-auth-submit" type="submit">Submit Ticket →</button>
            </form>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="pub-cta">
        <h2>Not Finding Your Answer?</h2>
        <p>Reach us directly or explore the platform hands-on in Demo Mode.</p>
        <div className="pub-cta-actions">
          <a href="mailto:support@voxora.ai" className="btn-white">
            ✉️ Email Support
          </a>
          <button className="btn-outline-white" onClick={() => navigate("/dashboard")}>
            Try Demo Mode →
          </button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
