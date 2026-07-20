// ── V4.5 Goal Tracker ─────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type Priority = "High" | "Medium" | "Low";
type Status   = "Not Started" | "In Progress" | "Completed" | "At Risk";

interface Goal {
  id: string; title: string; progress: number;
  deadline: string; status: Status; priority: Priority;
}

const STATUS_COLOR: Record<Status, string> = {
  "Not Started": "#6b7280", "In Progress": "#3b82f6",
  "Completed": "#10b981", "At Risk": "#ef4444",
};
const PRIORITY_COLOR: Record<Priority, string> = {
  High: "#ef4444", Medium: "#f59e0b", Low: "#10b981",
};

export default function GoalTracker({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ title: "", deadline: "", priority: "Medium" as Priority });
  const [adding, setAdding] = useState(false);

  const addGoal = () => {
    if (!form.title.trim()) return;
    const g: Goal = {
      id: Date.now().toString(), title: form.title,
      progress: 0, deadline: form.deadline,
      status: "Not Started", priority: form.priority,
    };
    setGoals(prev => [g, ...prev]);
    setForm({ title: "", deadline: "", priority: "Medium" });
    setAdding(false);
    addActivity({ type: "goal_created", title: "Goal Created", description: `Goal "${g.title}" added.`, category: "Growth Studio", icon: "🎯" });
    showToast("🎯 Goal added!");
  };

  const updateGoal = (id: string, field: keyof Goal, val: string | number) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    showToast("🗑️ Goal removed.");
  };

  const completed = goals.filter(g => g.status === "Completed").length;

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🎯 Goal Tracker</h1>
      <p className="workspace-subtitle">Create and track goals with progress, deadlines, and priority.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">🎯</div><p className="stat-value">{goals.length}</p><h3 className="stat-label">Total Goals</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{completed}</p><h3 className="stat-label">Completed</h3></div>
        <div className="stat-card"><div className="stat-icon">🔥</div><p className="stat-value">{goals.filter(g => g.priority === "High").length}</p><h3 className="stat-label">High Priority</h3></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><p className="stat-value">{goals.filter(g => g.status === "At Risk").length}</p><h3 className="stat-label">At Risk</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v => !v)}>
        {adding ? "✕ Cancel" : "+ Add Goal"}
      </button>

      {adding && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Goal title..." value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input type="date" className="workspace-input" value={form.deadline} onChange={e => setForm(v => ({ ...v, deadline: e.target.value }))} />
              <select className="workspace-input" value={form.priority} onChange={e => setForm(v => ({ ...v, priority: e.target.value as Priority }))}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <button className="workspace-btn" onClick={addGoal} disabled={!form.title.trim()}>🎯 Add Goal</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🎯</div>
          <p>No goals yet. Add your first goal to start tracking progress.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {goals.map(g => (
            <div key={g.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{g.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: PRIORITY_COLOR[g.priority] + "20", color: PRIORITY_COLOR[g.priority] }}>{g.priority}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: STATUS_COLOR[g.status] + "20", color: STATUS_COLOR[g.status] }}>{g.status}</span>
                  </div>
                  {g.deadline && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7280" }}>📅 Deadline: {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                </div>
                <button onClick={() => deleteGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, padding: "2px 6px" }}>🗑️</button>
              </div>
              {/* Progress */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Progress</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{g.progress}%</span>
                </div>
                <input type="range" min={0} max={100} value={g.progress}
                  onChange={e => updateGoal(g.id, "progress", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#6C63FF" }} />
                <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4, marginTop: 4 }}>
                  <div style={{ height: 6, width: `${g.progress}%`, background: g.progress === 100 ? "#10b981" : "#6C63FF", borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["Not Started","In Progress","Completed","At Risk"] as Status[]).map(s => (
                  <button key={s} onClick={() => updateGoal(g.id, "status", s)}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${STATUS_COLOR[s]}`, background: g.status === s ? STATUS_COLOR[s] : "transparent", color: g.status === s ? "#fff" : STATUS_COLOR[s], cursor: "pointer", fontWeight: 600 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
