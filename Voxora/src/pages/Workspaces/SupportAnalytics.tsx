// ── V6.7 Support Analytics ────────────────────────────────────────────────────
import { useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function getTickets() {
  try { return JSON.parse(localStorage.getItem("voxora-support-tickets") || "[]"); } catch { return []; }
}
function getChats() {
  try { return JSON.parse(localStorage.getItem("voxora-live-chats") || "[]"); } catch { return []; }
}
function getFeedback() {
  try { return JSON.parse(localStorage.getItem("voxora-customer-feedback") || "[]"); } catch { return []; }
}
function getKBArticles() {
  try { return JSON.parse(localStorage.getItem("voxora-support-kb") || "[]"); } catch { return []; }
}

function StatCard({ label, value, icon, color, sub }: { label: string; value: string | number; icon: string; color: string; sub?: string }) {
  return (
    <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: "20px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>{label}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{ width: 120, fontSize: 13, color: "var(--text-primary,#111827)", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 10, background: "var(--border-color,#e5e7eb)", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 5, transition: "width .4s" }} />
      </div>
      <div style={{ width: 32, fontSize: 13, fontWeight: 700, color, textAlign: "right" }}>{value}</div>
    </div>
  );
}

export default function SupportAnalytics({ setWorkspace }: Props) {
  const { ticketStats, chatStats, feedbackStats, kbStats } = useMemo(() => {
    const tickets = getTickets();
    const chats   = getChats();
    const feedback = getFeedback();
    const kb      = getKBArticles();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    tickets.forEach((t: { status: string; priority: string; category: string }) => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    });

    const chatByStatus: Record<string, number> = {};
    chats.forEach((c: { status: string }) => { chatByStatus[c.status] = (chatByStatus[c.status] || 0) + 1; });

    const avgScore = feedback.length
      ? (feedback.reduce((s: number, f: { score: number }) => s + f.score, 0) / feedback.length).toFixed(1)
      : "—";

    const byType: Record<string, number> = {};
    feedback.forEach((f: { type: string }) => { byType[f.type] = (byType[f.type] || 0) + 1; });

    const kbViews = kb.reduce((s: number, a: { views: number }) => s + (a.views || 0), 0);
    const kbHelpful = kb.reduce((s: number, a: { helpful: number }) => s + (a.helpful || 0), 0);

    return {
      ticketStats: { total: tickets.length, byStatus, byPriority, byCategory },
      chatStats: { total: chats.length, byStatus: chatByStatus },
      feedbackStats: { total: feedback.length, avgScore, byType },
      kbStats: { total: kb.length, views: kbViews, helpful: kbHelpful },
    };
  }, []);

  const priorityColors: Record<string, string> = { low: "#10b981", medium: "#f59e0b", high: "#ef4444", urgent: "#dc2626" };
  const statusColors:   Record<string, string> = { open: "#3b82f6", "in-progress": "#f59e0b", resolved: "#10b981", closed: "#6b7280" };
  const chatColors:     Record<string, string> = { waiting: "#f59e0b", active: "#10b981", resolved: "#6b7280" };
  const typeColors:     Record<string, string> = { csat: "#10b981", nps: "#6C63FF", review: "#f59e0b", suggestion: "#3b82f6", bug: "#ef4444" };

  const maxCategory = Math.max(...Object.values(ticketStats.byCategory), 1);

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>📊 Support Analytics</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Ticket volumes, chat activity, feedback scores, and knowledge base performance</p>
      </div>

      {/* Overview stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Tickets" value={ticketStats.total} icon="🎫" color="#3b82f6" sub={`${ticketStats.byStatus["open"] || 0} open`} />
        <StatCard label="Live Chats" value={chatStats.total} icon="💬" color="#10b981" sub={`${chatStats.byStatus["active"] || 0} active`} />
        <StatCard label="Avg Feedback Score" value={feedbackStats.avgScore} icon="⭐" color="#f59e0b" sub={`${feedbackStats.total} responses`} />
        <StatCard label="KB Articles" value={kbStats.total} icon="📚" color="#6C63FF" sub={`${kbStats.views} views · ${kbStats.helpful} helpful`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 24 }}>
        {/* Ticket status */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>🎫 Tickets by Status</h3>
          {Object.keys(statusColors).map(s => (
            <Bar key={s} label={s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")} value={ticketStats.byStatus[s] || 0} max={ticketStats.total || 1} color={statusColors[s]} />
          ))}
          {ticketStats.total === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13, textAlign: "center" }}>No ticket data yet.</p>}
        </div>

        {/* Ticket priority */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>🚨 Tickets by Priority</h3>
          {Object.keys(priorityColors).map(p => (
            <Bar key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} value={ticketStats.byPriority[p] || 0} max={ticketStats.total || 1} color={priorityColors[p]} />
          ))}
          {ticketStats.total === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13, textAlign: "center" }}>No ticket data yet.</p>}
        </div>

        {/* Ticket categories */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📁 Tickets by Category</h3>
          {Object.entries(ticketStats.byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
            <Bar key={cat} label={cat} value={count} max={maxCategory} color="#6C63FF" />
          ))}
          {Object.keys(ticketStats.byCategory).length === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13, textAlign: "center" }}>No category data yet.</p>}
        </div>

        {/* Chat status */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>💬 Chats by Status</h3>
          {Object.keys(chatColors).map(s => (
            <Bar key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={chatStats.byStatus[s] || 0} max={chatStats.total || 1} color={chatColors[s]} />
          ))}
          {chatStats.total === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13, textAlign: "center" }}>No chat data yet.</p>}
        </div>

        {/* Feedback breakdown */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>⭐ Feedback by Type</h3>
          {Object.keys(typeColors).map(t => (
            <Bar key={t} label={{ csat: "CSAT", nps: "NPS", review: "Review", suggestion: "Suggestion", bug: "Bug Report" }[t] || t} value={feedbackStats.byType[t] || 0} max={feedbackStats.total || 1} color={typeColors[t]} />
          ))}
          {feedbackStats.total === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13, textAlign: "center" }}>No feedback data yet.</p>}
        </div>

        {/* Quick links */}
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 22 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>🔗 Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { id: "supportTickets", icon: "🎫", label: "Open Ticket Manager" },
              { id: "supportKB", icon: "📚", label: "Open Knowledge Base" },
              { id: "liveChat", icon: "💬", label: "Open Live Chat Manager" },
              { id: "customerFeedback", icon: "⭐", label: "Open Feedback Tracker" },
              { id: "aiSupportAssistant", icon: "🤖", label: "Open AI Support Assistant" },
            ].map(link => (
              <button key={link.id} onClick={() => setWorkspace(link.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--text-primary,#111827)", fontWeight: 500, textAlign: "left" }}>
                <span>{link.icon}</span> {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
