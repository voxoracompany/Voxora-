// ── V6.7 Customer Support Studio Hub ─────────────────────────────────────────
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "aiSupportAssistant",
    icon: "🤖",
    label: "AI Support Assistant",
    desc: "Instant AI-powered answers to customer questions with conversation history and escalation.",
    badge: "AI",
    color: "#6C63FF",
  },
  {
    id: "supportTickets",
    icon: "🎫",
    label: "Support Ticket Manager",
    desc: "Create, track, and resolve customer support tickets with priority, status, and assignment.",
    badge: "Core",
    color: "#3b82f6",
  },
  {
    id: "supportKB",
    icon: "📚",
    label: "Knowledge Base",
    desc: "Build and manage a searchable knowledge base of articles, FAQs, and guides.",
    badge: "Core",
    color: "#10b981",
  },
  {
    id: "liveChat",
    icon: "💬",
    label: "Live Chat Manager",
    desc: "Manage live chat sessions, agent queues, chat history, and response templates.",
    badge: "New",
    color: "#f59e0b",
  },
  {
    id: "customerFeedback",
    icon: "⭐",
    label: "Customer Feedback Tracker",
    desc: "Collect and analyze customer satisfaction scores, NPS, and product feedback.",
    badge: "New",
    color: "#ec4899",
  },
  {
    id: "supportAnalytics",
    icon: "📊",
    label: "Support Analytics",
    desc: "Ticket volume trends, resolution times, CSAT scores, and agent performance metrics.",
    badge: "New",
    color: "#8b5cf6",
  },
];

export default function CustomerSupportStudio({ setWorkspace }: Props) {
  const stats = [
    { label: "Open Tickets",      value: "—", icon: "🎫" },
    { label: "Avg Resolution",    value: "—", icon: "⏱️" },
    { label: "CSAT Score",        value: "—", icon: "⭐" },
    { label: "KB Articles",       value: "—", icon: "📚" },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 36 }}>🎧</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Customer Support Studio</h1>
            <span style={{ background: "#6C63FF", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>V6.7</span>
          </div>
        </div>
        <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 15, maxWidth: 620, margin: 0 }}>
          Everything you need to deliver world-class customer support — AI assistant, ticketing, knowledge base, live chat, and analytics in one place.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary,#111827)" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Support Tools</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 18 }}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setWorkspace(tool.id)}
            style={{ background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: "22px 22px", textAlign: "left", cursor: "pointer", transition: "box-shadow .2s,transform .15s", display: "flex", flexDirection: "column", gap: 10 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,0,0,.08)"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tool.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {tool.icon}
              </div>
              <span style={{ background: tool.badge === "AI" ? "#6C63FF" : tool.badge === "Core" ? "#3b82f6" : "#10b981", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
                {tool.badge}
              </span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary,#111827)", marginBottom: 4 }}>{tool.label}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.5 }}>{tool.desc}</div>
            </div>
            <div style={{ color: tool.color, fontSize: 13, fontWeight: 600 }}>Open →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
