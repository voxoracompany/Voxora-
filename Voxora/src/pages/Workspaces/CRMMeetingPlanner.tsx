// ── V6.4 CRM Meeting Planner ─────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useCRM, type Meeting, type MeetingStatus } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const STATUS_META: Record<MeetingStatus, { label: string; color: string; bg: string }> = {
  scheduled:  { label: "Scheduled",  color: "#3b82f6", bg: "#dbeafe" },
  completed:  { label: "Completed",  color: "#10b981", bg: "#d1fae5" },
  cancelled:  { label: "Cancelled",  color: "#ef4444", bg: "#fee2e2" },
};

const EMPTY: Omit<Meeting, "id" | "createdAt" | "updatedAt"> = {
  title: "", date: "", time: "", participants: "",
  agenda: "", notes: "", followUpActions: "", status: "scheduled",
};

export default function CRMMeetingPlanner({ setWorkspace }: Props) {
  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useCRM();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [filterStatus, setFilterStatus] = useState<MeetingStatus | "all">("all");
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing, setEditing]       = useState<Meeting | null>(null);
  const [form, setForm]             = useState<Omit<Meeting, "id" | "createdAt" | "updatedAt">>(EMPTY);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const sorted = useMemo(() => {
    let list = [...meetings];
    if (filterStatus !== "all") list = list.filter(m => m.status === filterStatus);
    return list.sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const db = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return db - da;
    });
  }, [meetings, filterStatus]);

  const upcoming = useMemo(() =>
    meetings.filter(m => m.status === "scheduled" && m.date >= new Date().toISOString().slice(0,10)).length,
    [meetings],
  );

  const openAdd = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditing(null);
    setForm({ ...EMPTY, date: today });
    setModalOpen(true);
  };

  const openEdit = (m: Meeting) => {
    setEditing(m);
    setForm({
      title: m.title, date: m.date, time: m.time,
      participants: m.participants, agenda: m.agenda,
      notes: m.notes, followUpActions: m.followUpActions, status: m.status,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { showToast("Title is required.", "error"); return; }
    if (!form.date)          { showToast("Date is required.", "error");  return; }
    if (editing) {
      updateMeeting(editing.id, form);
      showToast("✅ Meeting updated.");
    } else {
      addMeeting(form);
      addActivity({ type: "research_completed", title: "Meeting Planned", description: `"${form.title}" on ${form.date}`, category: "Sales & CRM", icon: "📅" });
      showToast("✅ Meeting added.");
    }
    setModalOpen(false);
  };

  const inp = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📅 Meeting Planner</h1>
      <p className="workspace-subtitle">Schedule, track, and manage all your sales meetings.</p>

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total",     val: meetings.length,                                         color: "#6C63FF" },
          { label: "Upcoming",  val: upcoming,                                                color: "#3b82f6" },
          { label: "Completed", val: meetings.filter(m => m.status === "completed").length,   color: "#10b981" },
          { label: "Cancelled", val: meetings.filter(m => m.status === "cancelled").length,   color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 12, padding: "10px 18px", textAlign: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {(["all", "scheduled", "completed", "cancelled"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "1.5px solid",
                borderColor: filterStatus === s ? (s === "all" ? "#6C63FF" : STATUS_META[s as MeetingStatus]?.color ?? "#6C63FF") : "var(--border,#e5e7eb)",
                background: filterStatus === s ? (s === "all" ? "#ede9fe" : STATUS_META[s as MeetingStatus]?.bg ?? "#ede9fe") : "var(--bg-card,#fff)",
                color: filterStatus === s ? (s === "all" ? "#6C63FF" : STATUS_META[s as MeetingStatus]?.color ?? "#6C63FF") : "var(--text-muted,#6b7280)",
                cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize",
              }}
            >{s === "all" ? "All" : STATUS_META[s as MeetingStatus].label}</button>
          ))}
        </div>
        <button className="workspace-btn" onClick={openAdd} style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>+ Schedule Meeting</button>
      </div>

      {/* Meeting list */}
      {sorted.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p>{meetings.length === 0 ? "No meetings yet. Schedule your first one!" : "No meetings match the selected filter."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map(m => {
            const sm = STATUS_META[m.status];
            const expanded = expandedId === m.id;
            const isPast = m.date < new Date().toISOString().slice(0,10);
            return (
              <div key={m.id} style={{
                background: "var(--bg-card,#fff)",
                border: `1.5px solid ${expanded ? sm.color : "var(--border,#e5e7eb)"}`,
                borderRadius: 14, padding: "14px 18px",
                opacity: m.status === "cancelled" ? 0.7 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text,#111827)" }}>{m.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: sm.bg, color: sm.color }}>{sm.label}</span>
                      {isPast && m.status === "scheduled" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#fee2e2", color: "#ef4444" }}>Overdue</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 4 }}>
                      📅 {m.date} {m.time && `at ${m.time}`}
                      {m.participants && ` · 👥 ${m.participants}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      onClick={() => setExpandedId(expanded ? null : m.id)}
                      style={{ background: "none", border: "1px solid var(--border,#e5e7eb)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, color: "var(--text-muted,#6b7280)" }}
                    >{expanded ? "▲" : "▼"}</button>
                    <button onClick={() => openEdit(m)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>Edit</button>
                    <button onClick={() => setDeleteId(m.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>Delete</button>
                  </div>
                </div>

                {expanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border,#e5e7eb)" }}>
                    {m.agenda && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted,#6b7280)", marginBottom: 4 }}>AGENDA</div>
                        <div style={{ fontSize: 13, color: "var(--text,#374151)", whiteSpace: "pre-line", background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>{m.agenda}</div>
                      </div>
                    )}
                    {m.notes && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted,#6b7280)", marginBottom: 4 }}>NOTES</div>
                        <div style={{ fontSize: 13, color: "var(--text,#374151)", whiteSpace: "pre-line", background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>{m.notes}</div>
                      </div>
                    )}
                    {m.followUpActions && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted,#6b7280)", marginBottom: 4 }}>FOLLOW-UP ACTIONS</div>
                        <div style={{ fontSize: 13, color: "var(--text,#374151)", whiteSpace: "pre-line", background: "#fef3c7", borderRadius: 8, padding: "8px 12px" }}>{m.followUpActions}</div>
                      </div>
                    )}
                    {/* Quick status update */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {(["scheduled","completed","cancelled"] as MeetingStatus[]).filter(s => s !== m.status).map(s => (
                        <button key={s} onClick={() => { updateMeeting(m.id, { status: s }); showToast(`Marked as ${STATUS_META[s].label}`); }}
                          style={{ padding: "5px 12px", background: STATUS_META[s].bg, color: STATUS_META[s].color, border: `1px solid ${STATUS_META[s].color}40`, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          → {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "✏️ Edit Meeting" : "📅 Schedule Meeting"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="workspace-input" placeholder="Meeting Title *" value={form.title} onChange={e => inp("title", e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input className="workspace-input" type="date" value={form.date} onChange={e => inp("date", e.target.value)} />
                <input className="workspace-input" type="time" value={form.time} onChange={e => inp("time", e.target.value)} />
              </div>
              <input className="workspace-input" placeholder="Participants (names or emails)" value={form.participants} onChange={e => inp("participants", e.target.value)} />
              <select className="workspace-input" value={form.status} onChange={e => inp("status", e.target.value)}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <textarea className="workspace-textarea" placeholder="Agenda…" value={form.agenda} onChange={e => inp("agenda", e.target.value)} style={{ minHeight: 80 }} />
              <textarea className="workspace-textarea" placeholder="Notes…" value={form.notes} onChange={e => inp("notes", e.target.value)} style={{ minHeight: 80 }} />
              <textarea className="workspace-textarea" placeholder="Follow-up actions…" value={form.followUpActions} onChange={e => inp("followUpActions", e.target.value)} style={{ minHeight: 60 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: "10px 20px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button className="workspace-btn" onClick={handleSave}>{editing ? "Save Changes" : "Schedule"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 340, width: "90%" }}>
            <h3 style={{ margin: "0 0 10px" }}>Delete Meeting?</h3>
            <p style={{ color: "var(--text-muted,#6b7280)", marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button onClick={() => { deleteMeeting(deleteId); setDeleteId(null); showToast("🗑️ Meeting deleted.", "error"); }} style={{ padding: "9px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
