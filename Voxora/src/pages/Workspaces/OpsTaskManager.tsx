// ── V6.5 Operations Studio — Task Manager ─────────────────────────────────────
import { useState, useMemo, useCallback } from "react";
import { useOps } from "../../hooks/useOps";
import type { OpsTask, OpsPriority, OpsTaskStatus } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const PRIORITIES: OpsPriority[]   = ["low", "medium", "high", "critical"];
const STATUSES: OpsTaskStatus[]   = ["todo", "in-progress", "review", "done"];

const PRIORITY_COLOR: Record<OpsPriority, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};
const STATUS_COLOR: Record<OpsTaskStatus, string> = {
  todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};

const BLANK: Omit<OpsTask, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", priority: "medium", status: "todo",
  dueDate: "", assignee: "", progress: 0, tags: [],
};

export default function OpsTaskManager({ setWorkspace }: Props) {
  const { tasks, addTask, updateTask, deleteTask } = useOps();

  const [search,    setSearch]    = useState("");
  const [filterStatus,   setFilterStatus]   = useState<OpsTaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<OpsPriority  | "all">("all");
  const [sortBy,    setSortBy]    = useState<"dueDate" | "priority" | "title" | "progress">("dueDate");
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<OpsTask | null>(null);
  const [form,      setForm]      = useState(BLANK);
  const [tagInput,  setTagInput]  = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasks
      .filter(t =>
        (filterStatus   === "all" || t.status   === filterStatus) &&
        (filterPriority === "all" || t.priority === filterPriority) &&
        (!q || t.title.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sortBy === "dueDate")  return (a.dueDate || "9").localeCompare(b.dueDate || "9");
        if (sortBy === "priority") return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
        if (sortBy === "progress") return b.progress - a.progress;
        return a.title.localeCompare(b.title);
      });
  }, [tasks, search, filterStatus, filterPriority, sortBy]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(BLANK);
    setTagInput("");
    setShowForm(true);
  }, []);

  const openEdit = useCallback((t: OpsTask) => {
    setEditing(t);
    setForm({ title: t.title, description: t.description, priority: t.priority, status: t.status,
      dueDate: t.dueDate, assignee: t.assignee, progress: t.progress, tags: [...t.tags] });
    setTagInput("");
    setShowForm(true);
  }, []);

  const saveForm = useCallback(() => {
    if (!form.title.trim()) return;
    if (editing) {
      updateTask(editing.id, form);
    } else {
      addTask(form);
    }
    setShowForm(false);
  }, [form, editing, addTask, updateTask]);

  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    }
    setTagInput("");
  }, [tagInput, form.tags]);

  const removeTag = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }, []);

  const sel = (field: keyof typeof form, val: string | number) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const isOverdue = (t: OpsTask) =>
    t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date();

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>✅ Task Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>
            {tasks.length} total · {tasks.filter(t => t.status === "done").length} done · {tasks.filter(t => isOverdue(t)).length} overdue
          </p>
        </div>
        <button className="workspace-btn" onClick={openAdd}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          className="workspace-input"
          placeholder="🔍 Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
        <select className="workspace-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value as OpsTaskStatus | "all")} style={{ minWidth: 130 }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="workspace-input" value={filterPriority} onChange={e => setFilterPriority(e.target.value as OpsPriority | "all")} style={{ minWidth: 140 }}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="workspace-input" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ minWidth: 140 }}>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="title">Sort: Title</option>
          <option value="progress">Sort: Progress</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
          borderRadius: 16, padding: 24, marginBottom: 24,
        }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700 }}>
            {editing ? "Edit Task" : "New Task"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>TITLE *</label>
              <input className="workspace-input" style={{ width: "100%" }} placeholder="Task title" value={form.title} onChange={e => sel("title", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>DESCRIPTION</label>
              <textarea className="workspace-input" style={{ width: "100%", minHeight: 70, resize: "vertical" }} placeholder="Task description…" value={form.description} onChange={e => sel("description", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>PRIORITY</label>
              <select className="workspace-input" style={{ width: "100%" }} value={form.priority} onChange={e => sel("priority", e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>STATUS</label>
              <select className="workspace-input" style={{ width: "100%" }} value={form.status} onChange={e => sel("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>DUE DATE</label>
              <input className="workspace-input" style={{ width: "100%" }} type="date" value={form.dueDate} onChange={e => sel("dueDate", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>ASSIGNEE</label>
              <input className="workspace-input" style={{ width: "100%" }} placeholder="Name or email" value={form.assignee} onChange={e => sel("assignee", e.target.value)} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>PROGRESS — {form.progress}%</label>
              <input type="range" min={0} max={100} step={5} style={{ width: "100%", accentColor: "#6C63FF" }} value={form.progress} onChange={e => sel("progress", Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" }}>TAGS</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{ background: "#ede9fe", color: "#6C63FF", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6C63FF", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="workspace-input" style={{ flex: 1 }} placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <button className="workspace-btn" style={{ padding: "8px 14px" }} onClick={addTag}>Add</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="workspace-btn" onClick={saveForm}>{editing ? "Save Changes" : "Create Task"}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border, #e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--text, #111827)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Task List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted, #6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 16, margin: 0 }}>{tasks.length === 0 ? "No tasks yet. Create your first task!" : "No tasks match your filters."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{
              background: "var(--bg-card, #fff)",
              border: `1.5px solid ${isOverdue(t) ? "#fca5a5" : "var(--border, #e5e7eb)"}`,
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
            }}>
              {/* Priority dot */}
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: PRIORITY_COLOR[t.priority], flexShrink: 0 }} />

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text, #111827)" }}>{t.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: STATUS_COLOR[t.status] + "22", color: STATUS_COLOR[t.status] }}>{t.status}</span>
                  {isOverdue(t) && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: "#fee2e2", color: "#ef4444" }}>OVERDUE</span>}
                  {t.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#ede9fe", color: "#6C63FF" }}>{tag}</span>
                  ))}
                </div>
                {t.description && <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 3 }}>{t.description.slice(0, 80)}{t.description.length > 80 ? "…" : ""}</div>}
                <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 3, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {t.assignee && <span>👤 {t.assignee}</span>}
                  {t.dueDate  && <span>📅 {t.dueDate}</span>}
                  <span style={{ color: PRIORITY_COLOR[t.priority] }}>⚑ {t.priority}</span>
                </div>
              </div>

              {/* Progress */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 80 }}>
                <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>{t.progress}%</span>
                <div style={{ width: 80, height: 6, borderRadius: 4, background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
                  <div style={{ width: `${t.progress}%`, height: "100%", background: t.progress === 100 ? "#10b981" : "#6C63FF", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>

              {/* Quick status change */}
              <select
                className="workspace-input"
                style={{ width: 130, fontSize: 12, padding: "6px 8px" }}
                value={t.status}
                onChange={e => updateTask(t.id, { status: e.target.value as OpsTaskStatus, progress: e.target.value === "done" ? 100 : t.progress })}
                onClick={e => e.stopPropagation()}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(t)} style={{ background: "none", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "var(--text, #111827)" }}>Edit</button>
                <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#ef4444" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
