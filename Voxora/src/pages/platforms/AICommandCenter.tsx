import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const FEATURES = [
  { icon: "💬", title: "Unified AI Chat", desc: "One intelligent conversation interface across all your projects and workspaces." },
  { icon: "🧠", title: "AI Memory", desc: "Voxora remembers your context, preferences, and previous conversations." },
  { icon: "📚", title: "Conversation History", desc: "Search, revisit, and continue any past session with full context preserved." },
  { icon: "🔍", title: "Smart Search", desc: "Instantly find anything across all your workspaces, notes, and AI sessions." },
  { icon: "💡", title: "AI Recommendations", desc: "Get proactive suggestions based on your goals, projects, and activity." },
  { icon: "📌", title: "Pinned Conversations", desc: "Pin your most important sessions for quick access at any time." },
  { icon: "⚡", title: "Quick Actions", desc: "Launch any Voxora tool directly from the command center with one click." },
  { icon: "🗂️", title: "Session Management", desc: "Rename, archive, duplicate, or delete conversations to keep your workspace tidy." },
];

export default function AICommandCenter() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ PLATFORM — AI COMMAND CENTER</p>
        <h1>Your Unified AI<br />Command Center</h1>
        <p>
          One intelligent hub that connects every AI tool, conversation, and project
          in your Voxora workspace. Think faster, build faster.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Open Command Center →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Sign Up Free
          </button>
        </div>
      </section>

      <div className="pub-stats-strip">
        {[
          { value: "10+", label: "AI Tools Connected" },
          { value: "∞", label: "Conversations Stored" },
          { value: "1", label: "Unified Interface" },
          { value: "0ms", label: "Context Switch Time" },
        ].map((s) => (
          <div className="pub-stat" key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ FEATURES</p>
        <h2>Everything You Need in One Place</h2>
        <p className="pub-section-sub">
          The AI Command Center eliminates context-switching by bringing all your
          AI tools and conversations into a single, intelligent interface.
        </p>
        <div className="pub-grid">
          {FEATURES.map((f) => (
            <div className="pub-card" key={f.title}>
              <div className="pub-card-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Ready to Command Your AI Workspace?</h2>
        <p>Start free. No credit card required. Access the full AI Command Center instantly.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Launch App →</button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>Create Account</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
