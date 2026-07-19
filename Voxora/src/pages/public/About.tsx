import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

const TEAM = [
  { name: "Alex Rivera", role: "CEO & Co-Founder", avatar: "AR" },
  { name: "Mia Chen", role: "CTO & Co-Founder", avatar: "MC" },
  { name: "Jordan Park", role: "Head of Product", avatar: "JP" },
  { name: "Sofia Torres", role: "Head of Design", avatar: "ST" },
  { name: "Liam Nguyen", role: "Lead Engineer", avatar: "LN" },
  { name: "Emma Walsh", role: "Head of Growth", avatar: "EW" },
];

const VALUES = [
  { icon: "🧠", title: "Intelligence First", desc: "We build tools that augment human intelligence, not replace it. AI works best as a creative partner." },
  { icon: "🔓", title: "Open by Default", desc: "We believe great tools should be accessible to everyone, starting free with no gatekeeping." },
  { icon: "🔒", title: "Privacy Matters", desc: "Your ideas are yours. We are committed to data privacy and local-first design." },
  { icon: "⚡", title: "Speed of Thought", desc: "Great ideas move fast. Voxora is built to keep up with the speed at which you think and create." },
  { icon: "🌍", title: "Global Ambition", desc: "We are building for creators and founders everywhere, across all industries and backgrounds." },
  { icon: "🤝", title: "Community Driven", desc: "The best product decisions come from listening to the people who use them every day." },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      {/* Hero */}
      <section className="pub-hero">
        <p className="pub-hero-label">✦ ABOUT VOXORA</p>
        <h1>Building the Intelligence<br />Layer for the AI Age</h1>
        <p>
          Voxora is on a mission to make powerful AI tools accessible to every creator,
          entrepreneur, and innovator — from the first idea to full execution.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Try It Free →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/careers")}>
            Join Our Team
          </button>
        </div>
      </section>

      {/* Stats */}
      <div className="pub-stats-strip">
        {[
          { value: "10+", label: "AI Tools Available" },
          { value: "∞", label: "Ideas Possible" },
          { value: "100%", label: "Free to Start" },
          { value: "2026", label: "Founded" },
        ].map((s) => (
          <div className="pub-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ OUR MISSION</p>
        <h2>Why We Built Voxora</h2>
        <p className="pub-section-sub">
          We saw creators and founders spending hours switching between tools, losing context,
          and struggling to turn raw ideas into action. Voxora changes that.
        </p>
        <div className="pub-grid">
          {VALUES.map((v) => (
            <div className="pub-card" key={v.title}>
              <div className="pub-card-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ THE TEAM</p>
        <h2>The People Behind Voxora</h2>
        <p className="pub-section-sub">
          A passionate team of engineers, designers, and builders obsessed with the intersection
          of AI and human creativity.
        </p>
        <div className="pub-team-grid">
          {TEAM.map((member) => (
            <div className="pub-team-card" key={member.name}>
              <div className="pub-team-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pub-cta">
        <h2>Ready to Build with Voxora?</h2>
        <p>Join thousands of creators and founders using Voxora to build smarter and faster.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/signup")}>Start for Free →</button>
          <button className="btn-outline-white" onClick={() => navigate("/contact")}>Contact Us</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
