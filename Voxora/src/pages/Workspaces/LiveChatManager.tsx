// ── V6.7 Live Chat Manager ────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type ChatStatus = "waiting" | "active" | "resolved";

interface ChatSession {
  id: string;
  visitor: string;
  email: string;
  status: ChatStatus;
  agent: string;
  startedAt: string;
  lastMessage: string;
  messageCount: number;
  waitTime: number; // seconds
  tags: string[];
}

const AGENTS = ["Unassigned", "Alice Chen", "Bob Martin", "Carol Smith"];

const STATUS_COLOR: Record<ChatStatus, string> = {
  waiting: "#f59e0b", active: "#10b981", resolved: "#6b7280",
};

const LS_KEY = "voxora-live-chats";
function uid() { return "CHT-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }
function nowISO() { return new Date().toISOString(); }
function fmtTime(iso: string) { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString(); }

const SEED: ChatSession[] = [
  { id: "CHT-W1X2Y", visitor: "Sarah Johnson", email: "sarah@example.com", status: "active", agent: "Alice Chen", startedAt: "2025-07-25T14:30:00Z", lastMessage: "Can you help me with my billing?", messageCount: 6, waitTime: 45, tags: ["billing"] },
  { id: "CHT-A3B4C", visitor: "Tom Wilson", email: "tom@example.com", status: "waiting", agent: "Unassigned", startedAt: "2025-07-25T15:10:00Z", lastMessage: "Hello, is anyone there?", messageCount: 1, waitTime: 180, tags: ["general"] },
  { id: "CHT-D5E6F", visitor: "Emma Davis", email: "emma@example.com", status: "resolved", agent: "Bob Martin", startedAt: "2025-07-25T12:00:00Z", lastMessage: "Thank you for your help!", messageCount: 12, waitTime: 30, tags: ["technical", "export"] },
];

function load(): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? SEED; } catch { return SEED; }
}
function save(c: ChatSession[]) { localStorage.setItem(LS_KEY, JSON.stringify(c)); }

const TEMPLATES = [
  { label: "Greeting", text: "Hi! Welcome to Voxora support. How can I help you today?" },
  { label: "Wait", text: "Thanks for your patience. Let me check that for you right now." },
  { label: "Escalate", text: "I'm going to escalate this to our specialist team who can better assist you." },
  { label: "Resolve", text: "I'm glad we could resolve this for you! Is there anything else I can help with?" },
  { label: "Follow-up", text: "We'll send you a follow-up email within 24 hours with the resolution details." },
];

export default function LiveChatManager({ setWorkspace }: Props) {
  const [chats, setChats]       = useState<ChatSession[]>(load);
  const [filter, setFilter]     = useState<ChatStatus | "all">("all");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [newForm, setNewForm]   = useState({ visitor: "", email: "", agent: "Unassigned", tags: "" });

  const persist = (c: ChatSession[]) => { setChats(c); save(c); };

  const filtered = useMemo(() => chats.filter(c => {
    if (filter !== "all" && c.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || c.visitor.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  }), [chats, filter, search]);

  const selectedChat = selected ? chats.find(c => c.id === selected) : null;

  const updateStatus = (id: string, status: ChatStatus) =>
    persist(chats.map(c => c.id === id ? { ...c, status } : c));

  const assignAgent = (id: string, agent: string) =>
    persist(chats.map(c => c.id === id ? { ...c, agent, status: c.status === "waiting" ? "active" : c.status } : c));

  const createChat = () => {
    if (!newForm.visitor.trim()) return;
    const tags = newForm.tags.split(",").map(t => t.trim()).filter(Boolean);
    persist([{ id: uid(), visitor: newForm.visitor, email: newForm.email, status: "waiting", agent: newForm.agent, startedAt: nowISO(), lastMessage: "Chat initiated", messageCount: 0, waitTime: 0, tags }, ...chats]);
    setShowNew(false);
    setNewForm({ visitor: "", email: "", agent: "Unassigned", tags: "" });
  };

  const counts = { waiting: chats.filter(c => c.status === "waiting").length, active: chats.filter(c => c.status === "active").length, resolved: chats.filter(c => c.status === "resolved").length };

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>💬 Live Chat Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Manage customer chat sessions, queues, and response templates</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>+ New Chat Session</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Waiting", value: counts.waiting, color: "#f59e0b" },
          { label: "Active", value: counts.active, color: "#10b981" },
          { label: "Resolved", value: counts.resolved, color: "#6b7280" },
          { label: "Total", value: chats.length, color: "#6C63FF" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-secondary,#f9fafb)", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedChat ? "1fr 340px" : "1fr", gap: 20 }}>
        {/* Chat list */}
        <div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats…" style={{ flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }} />
            {(["all", "waiting", "active", "resolved"] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${filter === s ? "#6C63FF" : "var(--border-color,#e5e7eb)"}`, background: filter === s ? "#6C63FF" : "var(--bg-primary,#fff)", color: filter === s ? "#fff" : "var(--text-primary,#111827)", fontSize: 13, cursor: "pointer", fontWeight: filter === s ? 600 : 400 }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted,#6b7280)" }}>No chats found.</div>}
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c.id === selected ? null : c.id)} style={{ background: c.id === selected ? "#6C63FF08" : "var(--bg-primary,#fff)", border: `1px solid ${c.id === selected ? "#6C63FF" : "var(--border-color,#e5e7eb)"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "border-color .2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{c.visitor}</span>
                      <span style={{ background: STATUS_COLOR[c.status] + "22", color: STATUS_COLOR[c.status], padding: "1px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginBottom: 6 }}>{c.lastMessage}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                      {fmtTime(c.startedAt)} · 👤 {c.agent} · 💬 {c.messageCount} msgs
                      {c.status === "waiting" && <span style={{ color: "#ef4444", marginLeft: 8 }}>⏱ {Math.floor(c.waitTime / 60)}m {c.waitTime % 60}s wait</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", whiteSpace: "nowrap" }}>{fmtDate(c.startedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedChat && (
          <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 20, height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{selectedChat.visitor}</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted,#6b7280)" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              <div style={{ fontSize: 13 }}><strong>Email:</strong> {selectedChat.email || "—"}</div>
              <div style={{ fontSize: 13 }}><strong>ID:</strong> {selectedChat.id}</div>
              <div style={{ fontSize: 13 }}><strong>Started:</strong> {fmtDate(selectedChat.startedAt)} {fmtTime(selectedChat.startedAt)}</div>
              <div style={{ fontSize: 13 }}><strong>Messages:</strong> {selectedChat.messageCount}</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Assign Agent</label>
              <select value={selectedChat.agent} onChange={e => assignAgent(selectedChat.id, e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                {AGENTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Status</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["waiting", "active", "resolved"] as ChatStatus[]).map(s => (
                  <button key={s} onClick={() => updateStatus(selectedChat.id, s)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${selectedChat.status === s ? STATUS_COLOR[s] : "var(--border-color,#e5e7eb)"}`, background: selectedChat.status === s ? STATUS_COLOR[s] + "22" : "var(--bg-primary,#fff)", color: selectedChat.status === s ? STATUS_COLOR[s] : "var(--text-primary,#111827)", fontSize: 12, cursor: "pointer", fontWeight: selectedChat.status === s ? 700 : 400 }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Response Templates</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TEMPLATES.map(t => (
                  <button key={t.label} onClick={() => navigator.clipboard?.writeText(t.text)} title={t.text} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 12, cursor: "pointer", textAlign: "left" }}>
                    📋 {t.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 8 }}>Click a template to copy to clipboard</p>
            </div>
          </div>
        )}
      </div>

      {/* New chat modal */}
      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-primary,#fff)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>New Chat Session</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ label: "Visitor Name *", key: "visitor", placeholder: "Customer name" }, { label: "Email", key: "email", placeholder: "email@example.com" }, { label: "Tags (comma-separated)", key: "tags", placeholder: "billing, technical" }].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{f.label}</label>
                  <input value={(newForm as Record<string, string>)[f.key]} onChange={e => setNewForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Assign Agent</label>
                <select value={newForm.agent} onChange={e => setNewForm(p => ({ ...p, agent: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                  {AGENTS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn-primary" onClick={createChat}>Create Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
