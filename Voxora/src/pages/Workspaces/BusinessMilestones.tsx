// ── V4.5 Business Milestones ──────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type MStatus = "Upcoming" | "In Progress" | "Achieved" | "Missed";

interface Milestone {
  id: string; title: string; description: string;
  date: string; status: MStatus; category: string;
}

const STATUS_COLOR: Record<MStatus, string> = {
  Upcoming: "#6b7280", "In Progress": "#3b82f6", Achieved: "#10b981", Missed: "#ef4444",
};

const STATUS_ICON: Record<MStatus, string> = {
  Upcoming: "⏳", "In Progress": "🔄", Achieved: "✅", Missed: "❌",
};

const CATEGORIES = ["Product", "Revenue", "Team", "Marketing", "Fundraising", "Operations", "Customer", "Legal", "Other"];

export default function BusinessMilestones({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [form, setForm] = useState({ title: "", description: "", date: "", category: "Product" });
  const [adding, setAdding] = useState(false);

  const add = () => {
    if (!form.title.trim()) return;
    const m: Milestone = { ...form, id: Date.now().toString(), status: "Upcoming" };
    setMilestones(prev => [...prev, m].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ title: "", description: "", date: "", category: "Product" });
    setAdding(false);
    addActivity({ type: "milestone_added", title: "Milestone Added", description: form.title, category: "Growth Studio", icon: "🗓️" });
    showToast("🗓️ Milestone added!");
  };

  const update = (id: string, field: keyof Milestone, val: string) =>
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));

  const remove = (id: string) => { setMilestones(prev => prev.filter(m => m.id !== id)); showToast("🗑️ Milestone removed."); };

  const achieved = milestones.filter(m => m.status === "Achieved").length;

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🗓️ Business Milestones</h1>
      <p className="workspace-subtitle">Build an interactive milestone timeline for your business journey.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">🗓️</div><p className="stat-value">{milestones.length}</p><h3 className="stat-label">Milestones</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{achieved}</p><h3 className="stat-label">Achieved</h3></div>
        <div className="stat-card"><div className="stat-icon">🔄</div><p className="stat-value">{milestones.filter(m => m.status === "In Progress").length}</p><h3 className="stat-label">In Progress</h3></div>
        <div className="stat-card"><div className="stat-icon">📈</div><p className="stat-value">{milestones.length ? Math.round((achieved / milestones.length) * 100) : 0}%</p><h3 className="stat-label">Success Rate</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v => !v)}>
        {adding ? "✕ Cancel" : "+ Add Milestone"}
      </button>

      {adding && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Milestone title..." value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} />
            <textarea className="workspace-textarea" placeholder="Description (optional)..." value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))} rows={2} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input type="date" className="workspace-input" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))} />
              <select className="workspace-input" value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button className="workspace-btn" onClick={add} disabled={!form.title.trim()}>🗓️ Add Milestone</button>
          </div>
        </div>
      )}

      {milestones.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">🗓️</div><p>No milestones yet. Add your first business milestone to start building your timeline.</p></div>
      ) : (
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: "#e5e7eb" }} />

          {milestones.map((m) => {
            const color = STATUS_COLOR[m.status];
            return (
              <div key={m.id} style={{ position: "relative", marginBottom: 20 }}>
                {/* Dot */}
                <div style={{ position: "absolute", left: -25, top: 18, width: 14, height: 14, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: "0 0 0 2px " + color + "40", zIndex: 1 }} />

                <div style={{ background: "#fff", border: `1.5px solid ${color}30`, borderLeft: `3px solid ${color}`, borderRadius: "0 12px 12px 0", padding: "14px 18px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: color + "20", color }}>{STATUS_ICON[m.status]} {m.status}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, background: "#f3f4f6", borderRadius: 20, padding: "2px 8px" }}>{m.category}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{m.title}</h3>
                      {m.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{m.description}</p>}
                      {m.date && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>📅 {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select value={m.status} onChange={e => update(m.id, "status", e.target.value)}
                        style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "4px 8px", fontSize: 11, cursor: "pointer", color, fontWeight: 700, background: "#fafafa" }}>
                        {(["Upcoming","In Progress","Achieved","Missed"] as MStatus[]).map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16 }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
