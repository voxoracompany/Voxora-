// ── V4.7 Task Board ───────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type Col = "todo" | "inprogress" | "done";
type Priority = "High" | "Medium" | "Low";

interface Task {
  id: string; title: string; description: string;
  assignee: string; priority: Priority; col: Col; dueDate: string;
}

const COL_CONFIG: Record<Col, { label: string; icon: string; color: string }> = {
  todo:       { label: "To Do",       icon: "📋", color: "#6b7280" },
  inprogress: { label: "In Progress", icon: "🔄", color: "#3b82f6" },
  done:       { label: "Done",        icon: "✅", color: "#10b981" },
};
const PRIORITY_COLOR: Record<Priority, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function TaskBoard({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [adding, setAdding] = useState<Col | null>(null);
  const [form, setForm]     = useState({ title: "", description: "", assignee: "", priority: "Medium" as Priority, dueDate: "" });
  const [dragging, setDragging] = useState<string | null>(null);

  const addTask = (col: Col) => {
    if (!form.title.trim()) return;
    const t: Task = { ...form, id: Date.now().toString(), col };
    setTasks(prev => [...prev, t]);
    setForm({ title: "", description: "", assignee: "", priority: "Medium", dueDate: "" });
    setAdding(null);
    addActivity({ type: "task_created", title: "Task Created", description: form.title, category: "Team Collaboration", icon: "📋" });
    showToast("📋 Task added!");
  };

  const moveTask = (id: string, col: Col) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, col } : t));
    if (col === "done") showToast("✅ Task completed!");
  };

  const removeTask = (id: string) => { setTasks(prev => prev.filter(t => t.id !== id)); showToast("🗑️ Task removed."); };

  const cols: Col[] = ["todo", "inprogress", "done"];

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>📋 Task Board</h1>
      <p className="workspace-subtitle">Kanban board to track tasks across To Do, In Progress, and Done.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        {cols.map(c => {
          const cfg = COL_CONFIG[c]; const count = tasks.filter(t => t.col === c).length;
          return <div key={c} className="stat-card"><div className="stat-icon">{cfg.icon}</div><p className="stat-value">{count}</p><h3 className="stat-label">{cfg.label}</h3></div>;
        })}
        <div className="stat-card"><div className="stat-icon">🔥</div><p className="stat-value">{tasks.filter(t => t.priority === "High").length}</p><h3 className="stat-label">High Priority</h3></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {cols.map(col => {
          const cfg = COL_CONFIG[col];
          const colTasks = tasks.filter(t => t.col === col);
          return (
            <div key={col}
              style={{ background: "#f9fafb", borderRadius: 16, padding: "16px 14px", minHeight: 300, border: dragging ? "2px dashed #6C63FF" : "2px solid transparent", transition: "border 0.15s" }}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); if (dragging) { moveTask(dragging, col); setDragging(null); } }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: cfg.color }}>{cfg.icon} {cfg.label}</h3>
                <span style={{ background: cfg.color + "20", color: cfg.color, borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{colTasks.length}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {colTasks.map(t => (
                  <div key={t.id} draggable
                    onDragStart={() => setDragging(t.id)} onDragEnd={() => setDragging(null)}
                    style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px 14px", cursor: "grab", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", transition: "box-shadow 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{t.title}</span>
                      <button onClick={() => removeTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14, padding: "0 0 0 6px" }}>✕</button>
                    </div>
                    {t.description && <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>{t.description}</p>}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: PRIORITY_COLOR[t.priority] + "20", color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                      {t.assignee && <span style={{ fontSize: 10, color: "#6b7280" }}>👤 {t.assignee}</span>}
                      {t.dueDate && <span style={{ fontSize: 10, color: "#9ca3af" }}>📅 {new Date(t.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                      {cols.filter(c => c !== col).map(c => (
                        <button key={c} onClick={() => moveTask(t.id, c)}
                          style={{ fontSize: 10, padding: "3px 8px", borderRadius: 8, border: "1px solid " + COL_CONFIG[c].color, color: COL_CONFIG[c].color, background: "transparent", cursor: "pointer", fontWeight: 600 }}>
                          → {COL_CONFIG[c].label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add task button */}
              {adding === col ? (
                <div style={{ marginTop: 10, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "12px" }}>
                  <input className="workspace-input" style={{ fontSize: 13, marginBottom: 8 }} placeholder="Task title *" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} autoFocus />
                  <input className="workspace-input" style={{ fontSize: 13, marginBottom: 8 }} placeholder="Assignee" value={form.assignee} onChange={e => setForm(v => ({ ...v, assignee: e.target.value }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                    <select className="workspace-input" style={{ fontSize: 12 }} value={form.priority} onChange={e => setForm(v => ({ ...v, priority: e.target.value as Priority }))}>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <input type="date" className="workspace-input" style={{ fontSize: 12 }} value={form.dueDate} onChange={e => setForm(v => ({ ...v, dueDate: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="workspace-btn" style={{ fontSize: 12, padding: "8px 14px", flex: 1 }} onClick={() => addTask(col)} disabled={!form.title.trim()}>Add</button>
                    <button style={{ fontSize: 12, padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer" }} onClick={() => setAdding(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAdding(col)} style={{ marginTop: 10, width: "100%", padding: "9px", background: "transparent", border: "1.5px dashed #d1d5db", borderRadius: 10, color: "#9ca3af", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ Add Task</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
