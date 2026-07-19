import { useState } from "react";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

const CHANNELS = [
  { icon: "✉️", title: "Email Us", desc: "hello@voxora.ai", link: "mailto:hello@voxora.ai" },
  { icon: "🐦", title: "Twitter / X", desc: "@VoxoraAI", link: "https://twitter.com" },
  { icon: "💼", title: "LinkedIn", desc: "Voxora AI", link: "https://linkedin.com" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-hero">
        <p className="pub-hero-label">✦ CONTACT</p>
        <h1>Get In Touch</h1>
        <p>Have a question, idea, or partnership inquiry? We'd love to hear from you.</p>
      </section>

      {/* Channels */}
      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ REACH US</p>
        <h2>Find Us Here</h2>
        <p className="pub-section-sub">Pick the channel that works best for you.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 680, margin: "0 auto 0" }}>
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={c.link}
              className="pub-card"
              style={{ textDecoration: "none", minWidth: 180, flex: 1 }}
            >
              <div className="pub-card-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ SEND A MESSAGE</p>
        <h2>We'll Get Back to You</h2>
        <p className="pub-section-sub">Fill out the form and we'll respond within 24 hours.</p>

        <div style={{
          maxWidth: 620, margin: "0 auto",
          background: "#f8fafc", border: "1px solid #e5e7eb",
          borderRadius: 20, padding: "36px",
        }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 48 }}>✅</div>
              <h3 style={{ fontSize: 22, color: "#0f172a", margin: "12px 0 6px" }}>Message Sent!</h3>
              <p style={{ color: "#6b7280", marginBottom: 20 }}>Thanks for reaching out. We'll reply within 24 hours.</p>
              <button className="btn-primary" onClick={() => setSent(false)}>Send Another</button>
            </div>
          ) : (
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <input className="pub-auth-input" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
                <input className="pub-auth-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
              </div>
              <input className="pub-auth-input" placeholder="Subject (optional)" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
              <textarea
                className="pub-auth-input"
                placeholder="Your message…"
                value={form.message}
                onChange={e => setForm(f => ({...f, message: e.target.value}))}
                rows={5}
                required
                style={{ resize: "vertical", minHeight: 120 }}
              />
              <button className="pub-auth-submit" type="submit">Send Message →</button>
            </form>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
