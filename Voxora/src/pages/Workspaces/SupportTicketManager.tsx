// ── V6.7 Support Ticket Manager ───────────────────────────────────────────────
import { useState, useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type Priority = "low" | "medium" | "high" | "urgent";
type Status   = "open" | "in-progress" | "resolved" | "closed";

interface Ticket {
  id: string;
  subject: string;
  customer: string;
  email: string;
  priority: Priority;
  status: Status;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignee: string;
}

const CATEGORIES = ["Billing", "Technical", "Account", "Feature Request", "Bug Report", "General"];
const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];
const STATUSES: Status[]     = ["open", "in-progress", "resolved", "closed"];
const AGENTS = ["Unassigned", "Alice Chen", "Bob Martin", "Carol Smith", "David Kim"];

const PRIORITY_COLOR: Record<Priority, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#ef4444", urgent: "#dc2626",
};
const STATUS_COLOR: Record<Status, string> = {
  "open": "#3b82f6", "in-progress": "#f59e0b", "resolved": "#10b981", "closed": "#6b7280",
};

const LS_KEY = "voxora-support-tickets";
function uid() { return "TKT-" + Math.random().toString(36).slice(2, 7).toUpperCase(); }
function nowISO() { return new Date().toISOString(); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString(); }

const SEED: Ticket[] = [
  { id: "TKT-A1B2C", subject: "Cannot export my data", customer: "John Doe", email: "john@example.com", priority: "high", status: "open", category: "Technical", description: "Export button does nothing when clicked.", createdAt: "2025-07-20T09:00:00Z", updatedAt: "2025-07-20T09:00:00Z", assignee: "Alice Chen" },
  { id: "TKT-D3E4F", subject: "Wrong invoice amount", customer: "Jane Smith", email: "jane@example.com", priority: "urgent", status: "in-progress", category: "Billing", description: "My invoice shows $99 but I subscribed to the $49 plan.", createdAt: "2025-07-21T11:00:00Z", updatedAt: "2025-07-22T08:00:00Z", assignee: "Bob Martin" },
  { id: "TKT-G5H6I", subject: "Password reset not working", customer: "Mike Lee", email: "mike@example.com", priority: "medium", status: "resolved", category: "Account", description: "I never receive the reset email.", createdAt: "2025-07-18T14:00:00Z", updatedAt: "2025-07-19T10:00:00Z", assignee: "Carol Smith" },
];

function load(): Ticket[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? SEED; } catch { return SEED; }
}
function save(t: Ticket[]) { localStorage.setItem(LS_KEY, JSON.stringify(t)); }

const EMPTY: Omit<Ticket, "id" | "createdAt" | "updatedAt"> = {
  subject: "", customer: "", email: "", priority: "medium", status: "open",
  category: "General", description: "", assignee: "Unassigned",
};

export default function SupportTicketManager({ setWorkspace }: Props) {
  const [tickets, setTickets]   = useState<Ticket[]>(load);
  const [form, setForm]         = useState({ ...EMPTY });
  const [editing, setEditing]   = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [detail, setDetail]     = useState<string | null>(null);

  const persist = (t: Ticket[]) => { setTickets(t); save(t); };

  const filtered = useMemo(() => tickets.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    const q = search.toLowerCase();
    return !q || t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
  }), [tickets, filterStatus, filterPriority, search]);

  const openNew = () => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); setDetail(null); };
  const openEdit = (t: Ticket) => { const { id, createdAt, updatedAt, ...rest } = t; setForm(rest); setEditing(t.id); setShowForm(true); setDetail(null); };

  const submit = () => {
    if (!form.subject.trim() || !form.customer.trim()) return;
    if (editing) {
      persist(tickets.map(t => t.id === editing ? { ...t, ...form, updatedAt: nowISO() } : t));
    } else {
      persist([{ id: uid(), ...form, createdAt: nowISO(), updatedAt: nowISO() }, ...tickets]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => { if (confirm("Delete this ticket?")) persist(tickets.filter(t => t.id !== id)); };

  const counts = useMemo(() => ({
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    urgent: tickets.filter(t => t.priority === "urgent").length,
  }), [tickets]);

  const detailTicket = detail ? tickets.find(t => t.id === detail) : null;

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🎫 Support Ticket Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Track and resolve customer support tickets</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ New Ticket</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Open", value: counts.open, color: "#3b82f6" },
          { label: "In Progress", value: counts.inProgress, color: "#f59e0b" },
          { label: "Resolved", value: counts.resolved, color: "#10b981" },
          { label: "Urgent", value: counts.urgent, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-secondary,#f9fafb)", border: `1px solid ${s.color}33`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" style={{ flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | "all")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as Priority | "all")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* Detail panel */}
      {detailTicket && (
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginBottom: 4 }}>{detailTicket.id}</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{detailTicket.subject}</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ background: PRIORITY_COLOR[detailTicket.priority] + "22", color: PRIORITY_COLOR[detailTicket.priority], padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{detailTicket.priority}</span>
                <span style={{ background: STATUS_COLOR[detailTicket.status] + "22", color: STATUS_COLOR[detailTicket.status], padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{detailTicket.status}</span>
                <span style={{ background: "#e5e7eb", color: "#374151", padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>{detailTicket.category}</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6 }}>{detailTicket.description}</p>
              <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>
                👤 {detailTicket.customer} ({detailTicket.email}) · Assignee: {detailTicket.assignee} · Created: {fmtDate(detailTicket.createdAt)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => openEdit(detailTicket)}>Edit</button>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color,#e5e7eb)" }}>
              {["ID", "Subject", "Customer", "Priority", "Status", "Assignee", "Created", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 700, color: "var(--text-muted,#6b7280)", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted,#6b7280)" }}>No tickets found. Click "New Ticket" to create one.</td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color,#e5e7eb)", cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-secondary,#f9fafb)"}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
              >
                <td style={{ padding: "10px 12px", fontFamily: "monospace", color: "#6C63FF" }}>{t.id}</td>
                <td style={{ padding: "10px 12px", maxWidth: 220 }}><button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, color: "var(--text-primary,#111827)", padding: 0, textAlign: "left" }} onClick={() => setDetail(t.id === detail ? null : t.id)}>{t.subject}</button></td>
                <td style={{ padding: "10px 12px" }}>{t.customer}</td>
                <td style={{ padding: "10px 12px" }}><span style={{ background: PRIORITY_COLOR[t.priority] + "22", color: PRIORITY_COLOR[t.priority], padding: "2px 8px", borderRadius: 12, fontWeight: 600, fontSize: 12 }}>{t.priority}</span></td>
                <td style={{ padding: "10px 12px" }}><span style={{ background: STATUS_COLOR[t.status] + "22", color: STATUS_COLOR[t.status], padding: "2px 8px", borderRadius: 12, fontWeight: 600, fontSize: 12 }}>{t.status}</span></td>
                <td style={{ padding: "10px 12px" }}>{t.assignee}</td>
                <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{fmtDate(t.createdAt)}</td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => openEdit(t)}>Edit</button>
                    <button style={{ padding: "4px 10px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => remove(t.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-primary,#fff)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>{editing ? "Edit Ticket" : "New Support Ticket"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Subject *", key: "subject", type: "text", placeholder: "Brief description of the issue" },
                { label: "Customer Name *", key: "customer", type: "text", placeholder: "Full name" },
                { label: "Customer Email", key: "email", type: "email", placeholder: "email@example.com" },
                { label: "Assignee", key: "assignee", type: "select", options: AGENTS },
                { label: "Category", key: "category", type: "select", options: CATEGORIES },
                { label: "Priority", key: "priority", type: "select", options: PRIORITIES },
                { label: "Status", key: "status", type: "select", options: STATUSES },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                      {f.options!.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Detailed description of the issue…" rows={4} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>{editing ? "Save Changes" : "Create Ticket"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
