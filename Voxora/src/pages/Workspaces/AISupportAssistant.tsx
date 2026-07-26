// ── V6.7 AI Support Assistant ─────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: string;
}

const SUGGESTED = [
  "How do I reset my password?",
  "Where can I find my invoices?",
  "How do I cancel my subscription?",
  "What are your support hours?",
  "How do I export my data?",
];

const RESPONSES: Record<string, string> = {
  password: "To reset your password, go to **Settings → Security → Change Password**. You'll receive an email with a reset link within 2 minutes. Check your spam folder if you don't see it.",
  invoice: "Invoices are available under **Billing & Plans → Invoice History**. You can download them as PDF at any time. Invoices are also emailed automatically on each billing date.",
  cancel: "To cancel your subscription, go to **Billing & Plans → Manage Plan → Cancel Subscription**. Your access continues until the end of the current billing period. We're sorry to see you go — let us know how we can improve!",
  hours: "Our support team is available **Monday–Friday, 9 AM – 6 PM UTC**. For urgent issues, use the live chat for faster response times. AI support is available 24/7.",
  export: "You can export your data from **Export Center** in the sidebar. We support CSV, JSON, and PDF formats for most workspaces. For a full account export, go to **Settings → Data & Privacy → Export All Data**.",
};

function getReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("password") || lower.includes("reset") || lower.includes("login")) return RESPONSES.password;
  if (lower.includes("invoice") || lower.includes("receipt") || lower.includes("billing") || lower.includes("payment")) return RESPONSES.invoice;
  if (lower.includes("cancel") || lower.includes("unsubscribe") || lower.includes("stop")) return RESPONSES.cancel;
  if (lower.includes("hour") || lower.includes("support") || lower.includes("contact") || lower.includes("available")) return RESPONSES.hours;
  if (lower.includes("export") || lower.includes("download") || lower.includes("data")) return RESPONSES.export;
  return `Thanks for reaching out! I'm your AI Support Assistant. I can help you with account settings, billing, data export, and general platform questions.\n\nIf I'm unable to resolve your issue, I'll escalate it to a human agent. Could you provide more details about your question?`;
}

function uid() { return Math.random().toString(36).slice(2); }
function nowISO() { return new Date().toISOString(); }
function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const LS_KEY = "voxora-ai-support-messages";

export default function AISupportAssistant({ setWorkspace }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: uid(), role: "user", text: text.trim(), ts: nowISO() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getReply(text);
      const botMsg: Message = { id: uid(), role: "assistant", text: reply, ts: nowISO() };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(LS_KEY);
  };

  const renderText = (txt: string) =>
    txt.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <div className="workspace-container" style={{ maxWidth: 800 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🤖 AI Support Assistant</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>
            Instant AI-powered answers to your support questions
          </p>
        </div>
        {messages.length > 0 && (
          <button className="btn-secondary" onClick={clearChat} style={{ fontSize: 13 }}>
            🗑 Clear Chat
          </button>
        )}
      </div>

      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 16px", background: "var(--bg-secondary,#f9fafb)", borderRadius: 10, border: "1px solid var(--border-color,#e5e7eb)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>AI Support is online · Average response time: &lt;1 s</span>
      </div>

      {/* Chat window */}
      <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: 20, minHeight: 340, maxHeight: 460, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto", color: "var(--text-muted,#6b7280)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Hi! I'm your AI Support Assistant.</p>
            <p style={{ fontSize: 13 }}>Ask me anything about your account, billing, or using Voxora.</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.role === "user" ? "#6C63FF" : "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
              {m.role === "user" ? "👤" : "🤖"}
            </div>
            <div style={{ maxWidth: "72%", background: m.role === "user" ? "#6C63FF" : "var(--bg-primary,#fff)", color: m.role === "user" ? "#fff" : "var(--text-primary,#111827)", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", border: m.role === "assistant" ? "1px solid var(--border-color,#e5e7eb)" : "none", fontSize: 14, lineHeight: 1.55 }}>
              <div style={{ whiteSpace: "pre-wrap" }}>{renderText(m.text)}</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: 0.65, textAlign: "right" }}>{fmtTime(m.ts)}</div>
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
            <div style={{ background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
              <span style={{ display: "flex", gap: 4 }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9ca3af", display: "inline-block", animation: `pulse 1.2s ${d}s infinite` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginBottom: 8 }}>Suggested questions:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED.map(q => (
              <button
                key={q}
                onClick={() => send(q)}
                style={{ padding: "6px 12px", background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 20, fontSize: 13, cursor: "pointer", color: "var(--text-primary,#111827)", transition: "border-color .2s" }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Type your question…"
          disabled={typing}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 14, outline: "none" }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || typing}
          className="btn-primary"
          style={{ padding: "12px 20px", borderRadius: 10 }}
        >
          Send ↑
        </button>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 8, textAlign: "center" }}>
        AI responses are simulated in Demo Mode. Connect an AI provider in Settings for live answers.
      </p>
    </div>
  );
}
