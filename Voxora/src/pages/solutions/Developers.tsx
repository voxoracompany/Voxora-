import { useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "../public/public-pages.css";

const TOOLS = [
  { icon: "💡", title: "App Ideas Generator", desc: "Generate validated app concepts with technical feasibility analysis." },
  { icon: "🗺️", title: "Product Roadmap", desc: "Plan your technical roadmap from MVP to production with AI guidance." },
  { icon: "🔗", title: "API Integrations", desc: "Placeholder integrations for OpenAI, Anthropic, Google, Slack, and more." },
  { icon: "⚙️", title: "AI Workflows", desc: "Design and automate intelligent workflows for your development process." },
  { icon: "🏆", title: "Competitor Analysis", desc: "Analyse competing products before building to find your technical edge." },
  { icon: "📤", title: "Export Center", desc: "Export data in JSON, CSV, Markdown, and other developer-friendly formats." },
  { icon: "🔍", title: "Smart Search", desc: "Semantic search across all your projects, notes, and technical documentation." },
  { icon: "⚡", title: "Quick Actions (Ctrl+K)", desc: "Keyboard-first power-user features for developers who hate clicking." },
];

const INTEGRATIONS = ["OpenAI", "Anthropic", "Google Gemini", "Slack", "GitHub", "Notion", "Zapier", "Google Drive"];

export default function Developers() {
  const navigate = useNavigate();

  return (
    <div className="pub-page">
      <PublicNav />

      <section className="pub-hero">
        <p className="pub-hero-label">✦ SOLUTIONS — DEVELOPERS</p>
        <h1>AI Tools Built for<br />Developer Workflows</h1>
        <p>
          Voxora is keyboard-friendly, API-ready, and built with developer ergonomics
          in mind. From app ideation to technical planning to integrations.
        </p>
        <div className="pub-hero-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>
            Open Dashboard →
          </button>
          <button className="btn-outline-white" onClick={() => navigate("/signup")}>
            Sign Up Free
          </button>
        </div>
      </section>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ DEVELOPER TOOLS</p>
        <h2>Built for Builders</h2>
        <p className="pub-section-sub">
          Everything a developer needs to plan, research, and build — with keyboard
          shortcuts, JSON export, and API integrations baked in.
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

      <section className="pub-section bg-gray">
        <p className="pub-section-label">✦ INTEGRATIONS</p>
        <h2>Connect Your Existing Stack</h2>
        <p className="pub-section-sub">Voxora plugs into the tools you already use — or will use — through our growing integration ecosystem.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 720, margin: "0 auto" }}>
          {INTEGRATIONS.map((name) => (
            <div key={name} style={{
              background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
              padding: "12px 20px", fontWeight: 600, color: "#374151", fontSize: 14,
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}>
              {name} <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Coming soon</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-section bg-white">
        <p className="pub-section-label">✦ KEYBOARD SHORTCUTS</p>
        <h2>Power-User Shortcuts</h2>
        <p className="pub-section-sub">Navigate the entire Voxora dashboard without lifting your hands from the keyboard.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", maxWidth: 680, margin: "0 auto" }}>
          {[
            { keys: "Ctrl + K", action: "Smart Search" },
            { keys: "Ctrl + N", action: "New AI Chat" },
            { keys: "Ctrl + S", action: "Saved Projects" },
            { keys: "Ctrl + E", action: "Export Center" },
            { keys: "Ctrl + H", action: "Help Center" },
            { keys: "Esc", action: "Back to Dashboard" },
          ].map((s) => (
            <div key={s.keys} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <code style={{ background: "#0f172a", color: "#e2e8f0", padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>{s.keys}</code>
              <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{s.action}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pub-cta">
        <h2>Start Building with Voxora</h2>
        <p>Free forever for developers. Export JSON. Use keyboard shortcuts. Build faster.</p>
        <div className="pub-cta-actions">
          <button className="btn-white" onClick={() => navigate("/dashboard")}>Open Dashboard →</button>
          <button className="btn-outline-white" onClick={() => navigate("/platforms/ai-command-center")}>AI Command Center</button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
