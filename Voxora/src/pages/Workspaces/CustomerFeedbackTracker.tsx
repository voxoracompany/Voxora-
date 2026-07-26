// ── V6.7 Customer Feedback Tracker ────────────────────────────────────────────
import { useState, useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type FType = "csat" | "nps" | "review" | "suggestion" | "bug";

interface Feedback {
  id: string;
  customer: string;
  email: string;
  type: FType;
  score: number; // 1-10
  comment: string;
  product: string;
  status: "new" | "reviewed" | "actioned";
  createdAt: string;
}

const TYPES: FType[] = ["csat", "nps", "review", "suggestion", "bug"];
const PRODUCTS = ["AI Assistant", "Dashboard", "Analytics", "Billing", "Integrations", "General"];

const TYPE_LABEL: Record<FType, string> = {
  csat: "CSAT", nps: "NPS", review: "Review", suggestion: "Suggestion", bug: "Bug Report",
};
const TYPE_ICON: Record<FType, string> = {
  csat: "😊", nps: "📊", review: "⭐", suggestion: "💡", bug: "🐛",
};

const LS_KEY = "voxora-customer-feedback";
function uid() { return Math.random().toString(36).slice(2, 10); }
function nowISO() { return new Date().toISOString(); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString(); }

const SEED: Feedback[] = [
  { id: uid(), customer: "Alice Brown", email: "alice@example.com", type: "csat", score: 9, comment: "Really impressed with the AI assistant. Super helpful!", product: "AI Assistant", status: "reviewed", createdAt: "2025-07-20T09:00:00Z" },
  { id: uid(), customer: "Bob Green", email: "bob@example.com", type: "nps", score: 7, comment: "Good product overall. Would be better with more export options.", product: "Dashboard", status: "new", createdAt: "2025-07-21T11:00:00Z" },
  { id: uid(), customer: "Carol White", email: "carol@example.com", type: "bug", score: 4, comment: "The PDF export sometimes shows blank pages for large reports.", product: "Analytics", status: "actioned", createdAt: "2025-07-22T14:00:00Z" },
  { id: uid(), customer: "David Black", email: "david@example.com", type: "suggestion", score: 8, comment: "Would love a dark mode option for the landing page.", product: "General", status: "new", createdAt: "2025-07-23T10:00:00Z" },
  { id: uid(), customer: "Eva Clark", email: "eva@example.com", type: "review", score: 10, comment: "Best business intelligence tool I've used. Highly recommend!", product: "General", status: "reviewed", createdAt: "2025-07-24T15:00:00Z" },
];

function load(): Feedback[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? SEED; } catch { return SEED; }
}
function save(f: Feedback[]) { localStorage.setItem(LS_KEY, JSON.stringify(f)); }

function scoreColor(score: number) {
  if (score >= 9) return "#10b981";
  if (score >= 7) return "#f59e0b";
  return "#ef4444";
}

function scoreEmoji(score: number) {
  if (score >= 9) return "😄";
  if (score >= 7) return "😐";
  return "😞";
}

export default function CustomerFeedbackTracker({ setWorkspace }: Props) {
  const [feedback, setFeedback] = useState<Feedback[]>(load);
  const [form, setForm]         = useState<{ customer: string; email: string; type: FType; score: number; comment: string; product: string; status: "new" | "reviewed" | "actioned" }>({ customer: "", email: "", type: "csat", score: 8, comment: "", product: "General", status: "new" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [filterType, setFilterType] = useState<FType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "reviewed" | "actioned">("all");

  const persist = (f: Feedback[]) => { setFeedback(f); save(f); };

  const filtered = useMemo(() => feedback.filter(f => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    const q = search.toLowerCase();
    return !q || f.customer.toLowerCase().includes(q) || f.comment.toLowerCase().includes(q);
  }), [feedback, filterType, filterStatus, search]);

  const stats = useMemo(() => {
    const avg = feedback.length ? (feedback.reduce((s, f) => s + f.score, 0) / feedback.length).toFixed(1) : "—";
    const promoters = feedback.filter(f => f.type === "nps" && f.score >= 9).length;
    const detractors = feedback.filter(f => f.type === "nps" && f.score <= 6).length;
    const npsTotal = feedback.filter(f => f.type === "nps").length;
    const nps = npsTotal ? Math.round(((promoters - detractors) / npsTotal) * 100) : null;
    const csat = feedback.filter(f => f.type === "csat");
    const csatAvg = csat.length ? (csat.reduce((s, f) => s + f.score, 0) / csat.length).toFixed(1) : "—";
    return { avg, nps, csatAvg, total: feedback.length };
  }, [feedback]);

  const openNew = () => { setForm({ customer: "", email: "", type: "csat", score: 8, comment: "", product: "General", status: "new" }); setEditing(null); setShowForm(true); };
  const openEdit = (f: Feedback) => { const { id, createdAt, ...rest } = f; setForm(rest); setEditing(f.id); setShowForm(true); };

  const submit = () => {
    if (!form.customer.trim() || !form.comment.trim()) return;
    if (editing) {
      persist(feedback.map(f => f.id === editing ? { ...f, ...form } : f));
    } else {
      persist([{ id: uid(), ...form, createdAt: nowISO() }, ...feedback]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => { if (confirm("Delete this feedback?")) persist(feedback.filter(f => f.id !== id)); };
  const updateStatus = (id: string, status: "new" | "reviewed" | "actioned") =>
    persist(feedback.map(f => f.id === id ? { ...f, status } : f));

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>⭐ Customer Feedback Tracker</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Collect and analyse customer satisfaction, NPS, and product feedback</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Add Feedback</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Avg Score", value: stats.avg, icon: "⭐", color: "#f59e0b" },
          { label: "NPS Score", value: stats.nps !== null ? String(stats.nps) : "—", icon: "📊", color: "#6C63FF" },
          { label: "CSAT Avg", value: stats.csatAvg, icon: "😊", color: "#10b981" },
          { label: "Total Feedback", value: String(stats.total), icon: "💬", color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback…" style={{ flex: 1, minWidth: 160, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }} />
        <select value={filterType} onChange={e => setFilterType(e.target.value as FType | "all")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as "all" | "new" | "reviewed" | "actioned")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="actioned">Actioned</option>
        </select>
      </div>

      {/* Feedback cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted,#6b7280)" }}>No feedback found. Click "+ Add Feedback" to log some.</div>}
        {filtered.map(f => (
          <div key={f.id} style={{ background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>{scoreEmoji(f.score)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{f.customer}</span>
                <span style={{ background: "#e5e7eb", color: "#374151", padding: "2px 8px", borderRadius: 12, fontSize: 11 }}>{TYPE_ICON[f.type]} {TYPE_LABEL[f.type]}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: scoreColor(f.score) }}>{f.score}/10</span>
                <span style={{ background: f.status === "new" ? "#dbeafe" : f.status === "reviewed" ? "#fef3c7" : "#d1fae5", color: f.status === "new" ? "#1d4ed8" : f.status === "reviewed" ? "#d97706" : "#059669", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{f.status}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginLeft: "auto" }}>{f.product} · {fmtDate(f.createdAt)}</span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.55, color: "var(--text-primary,#111827)" }}>{f.comment}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["new", "reviewed", "actioned"] as const).map(s => (
                  <button key={s} onClick={() => updateStatus(f.id, s)} style={{ padding: "4px 10px", fontSize: 11, borderRadius: 20, border: `1px solid ${f.status === s ? "#6C63FF" : "var(--border-color,#e5e7eb)"}`, background: f.status === s ? "#6C63FF" : "var(--bg-secondary,#f9fafb)", color: f.status === s ? "#fff" : "var(--text-muted,#6b7280)", cursor: "pointer" }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => openEdit(f)}>Edit</button>
                <button style={{ padding: "4px 10px", fontSize: 11, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 20, cursor: "pointer" }} onClick={() => remove(f.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-primary,#fff)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>{editing ? "Edit Feedback" : "Add Feedback"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Customer Name *", key: "customer", placeholder: "Full name" },
                { label: "Email", key: "email", placeholder: "email@example.com" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{f.label}</label>
                  <input value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as FType }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                    {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Product</label>
                  <select value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Score: {form.score}/10</label>
                <input type="range" min={1} max={10} value={form.score} onChange={e => setForm(p => ({ ...p, score: Number(e.target.value) }))} style={{ width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                  <span>1 – Very poor</span><span>10 – Excellent</span>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Comment *</label>
                <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} placeholder="Customer's feedback…" rows={4} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>{editing ? "Save Changes" : "Add Feedback"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
