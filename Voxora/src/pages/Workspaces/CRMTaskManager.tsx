// ── V6.4 CRM Task Manager ────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useCRM, type CRMTask, type TaskType, type TaskPriority, type TaskStatus } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TYPES: { value: TaskType; label: string; icon: string }[] = [
  { value: "call",      label: "Call",       icon: "📞" },
  { value: "email",     label: "Email",      icon: "📧" },
  { value: "meeting",   label: "Meeting",    icon: "📅" },
  { value: "follow-up", label: "Follow-up",  icon: "🔁" },
  { value: "deadline",  label: "Deadline",   icon: "⏰" },
  { value: "other",     label: "Other",      icon: "📌" },
];

const PRIORITIES: { value: TaskPriority; label: string; color: string; bg: string }[] = [
  { value: "low",    label: "Low",    color: "#6b7280", bg: "#f3f4f6" },
  { value: "medium", label: "Medium", color: "#f59e0b", bg: "#fef3c7" },
  { value: "high",   label: "High",   color: "#ef4444", bg: "#fee2e2" },
];

const TASK_STATUSES: { value: TaskStatus; label: string; color: string; bg: string }[] = [
  { value: "pending",     label: "Pending",     color: "#6b7280", bg: "#f3f4f6" },
  { value: "in-progress", label: "In Progress", color: "#3b82f6", bg: "#dbeafe" },
  { value: "done",        label: "Done",        color: "#10b981", bg: "#d1fae5" },
];

const EMPTY: Omit<CRMTask, "id" | "createdAt" | "updatedAt"> = {
  type: "call", title: "", priority: "medium", status: "pending", dueDate: "", notes: "",
};

function typeInfo(t: TaskType) { return TYPES.find(x => x.value === t) ?? TYPES[0]; }
function priorityInfo(p: TaskPriority) { return PRIORITIES.find(x => x.value === p) ?? PRIORITIES[1]; }
function statusInfo(s: TaskStatus) { return TASK_STATUSES.find(x => x.value === s) ?? TASK_STATUSES[0]; }

function isOverdue(task: CRMTask): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return task.dueDate < new Date().toISOString().slice(0, 10);
}

export default function CRMTaskManager({ setWorkspace }: Props) {
  const { tasks, addTask, updateTask, deleteTask } = useCRM();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [filterType, setFilterType]       = useState<TaskType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [filterStatus, setFilterStatus]   = useState<TaskStatus | "all">("all");
  const [search, setSearch]               = useState("");
  const [modalOpen, setModalOpen]         = useState(false);
  const [editing, setEditing]             = useState<CRMTask | null>(null);
  const [form, setForm]                   = useState<Omit<CRMTask, "id" | "createdAt" | "updatedAt">>(EMPTY);
  const [deleteId, setDeleteId]           = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filterType     !== "all") list = list.filter(t => t.type === filterType);
    if (filterPriority !== "all") list = list.filter(t => t.priority === filterPriority);
    if (filterStatus   !== "all") list = list.filter(t => t.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
    }
    // Sort: overdue first, then by dueDate asc, then by priority
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return list.sort((a, b) => {
      const ao = isOverdue(a) ? -1 : 0;
      const bo = isOverdue(b) ? -1 : 0;
      if (ao !== bo) return ao - bo;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, filterType, filterPriority, filterStatus, search]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, dueDate: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEdit = (t: CRMTask) => {
    setEditing(t);
    setForm({ type: t.type, title: t.title, priority: t.priority, status: t.status, dueDate: t.dueDate, notes: t.notes });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { showToast("Title is required.", "error"); return; }
    if (editing) {
      updateTask(editing.id, form);
      showToast("✅ Task updated.");
    } else {
      addTask(form);
      addActivity({ type: "research_completed", title: "Task Added", description: form.title, category: "Sales & CRM", icon: "✅" });
      showToast("✅ Task added.");
    }
    setModalOpen(false);
  };

  const cycleStatus = (task: CRMTask) => {
    const order: TaskStatus[] = ["pending", "in-progress", "done"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    updateTask(task.id, { status: next });
    showToast(`Task → ${statusInfo(next).label}`);
  };

  const inp = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>✅ Task Manager</h1>
      <p className="workspace-subtitle">Track calls, emails, follow-ups, and deadlines.</p>

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total",       val: tasks.length,                                       color: "#6C63FF" },
          { label: "Pending",     val: tasks.filter(t => t.status === "pending").length,   color: "#f59e0b" },
          { label: "In Progress", val: tasks.filter(t => t.status === "in-progress").length, color: "#3b82f6" },
          { label: "Done",        val: tasks.filter(t => t.status === "done").length,      color: "#10b981" },
          { label: "Overdue",     val: tasks.filter(isOverdue).length,                     color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 80,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input className="workspace-input" placeholder="🔍 Search tasks…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: "1 1 200px", maxWidth: 240 }} />
        <select className="workspace-input" value={filterType} onChange={e => setFilterType(e.target.value as TaskType | "all")}
          style={{ flex: "1 1 130px", maxWidth: 150 }}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
        <select className="workspace-input" value={filterPriority} onChange={e => setFilterPriority(e.target.value as TaskPriority | "all")}
          style={{ flex: "1 1 130px", maxWidth: 150 }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select className="workspace-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | "all")}
          style={{ flex: "1 1 130px", maxWidth: 150 }}>
          <option value="all">All Statuses</option>
          {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button className="workspace-btn" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>+ Add Task</button>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p>{tasks.length === 0 ? "No tasks yet. Add your first one!" : "No tasks match your filters."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(task => {
            const ti = typeInfo(task.type);
            const pi = priorityInfo(task.priority);
            const si = statusInfo(task.status);
            const overdue = isOverdue(task);
            return (
              <div key={task.id} style={{
                background: overdue ? "#fff7f7" : "var(--bg-card,#fff)",
                border: `1.5px solid ${overdue ? "#fca5a5" : "var(--border,#e5e7eb)"}`,
                borderRadius: 12, padding: "12px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  {/* Status toggle button */}
                  <button
                    onClick={() => cycleStatus(task)}
                    title={`Click to advance: ${si.label}`}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: si.bg, border: `2px solid ${si.color}`,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12,
                    }}
                  >{task.status === "done" ? "✓" : ""}</button>

                  <span style={{ fontSize: 18 }}>{ti.icon}</span>

                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: "var(--text,#111827)",
                      textDecoration: task.status === "done" ? "line-through" : "none",
                      opacity: task.status === "done" ? 0.6 : 1,
                    }}>{task.title}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: si.bg, color: si.color }}>{si.label}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: pi.bg, color: pi.color }}>{pi.label}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#6b7280" }}>{ti.label}</span>
                      {task.dueDate && (
                        <span style={{ fontSize: 10, color: overdue ? "#ef4444" : "var(--text-muted,#6b7280)", fontWeight: overdue ? 700 : 400 }}>
                          {overdue ? "⚠️ " : "📅 "}{task.dueDate}
                        </span>
                      )}
                    </div>
                    {task.notes && <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 4 }}>{task.notes}</div>}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(task)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#374151" }}>Edit</button>
                    <button onClick={() => setDeleteId(task.id)} style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "✏️ Edit Task" : "➕ Add Task"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="workspace-input" placeholder="Task title *" value={form.title} onChange={e => inp("title", e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select className="workspace-input" value={form.type} onChange={e => inp("type", e.target.value)}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
                <select className="workspace-input" value={form.priority} onChange={e => inp("priority", e.target.value)}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label} Priority</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select className="workspace-input" value={form.status} onChange={e => inp("status", e.target.value)}>
                  {TASK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <input className="workspace-input" type="date" value={form.dueDate} onChange={e => inp("dueDate", e.target.value)} />
              </div>
              <textarea className="workspace-textarea" placeholder="Notes…" value={form.notes} onChange={e => inp("notes", e.target.value)} style={{ minHeight: 80 }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: "10px 20px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button className="workspace-btn" onClick={handleSave}>{editing ? "Save Changes" : "Add Task"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 340, width: "90%" }}>
            <h3 style={{ margin: "0 0 10px" }}>Delete Task?</h3>
            <p style={{ color: "var(--text-muted,#6b7280)", marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button onClick={() => { deleteTask(deleteId); setDeleteId(null); showToast("🗑️ Task deleted.", "error"); }} style={{ padding: "9px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
