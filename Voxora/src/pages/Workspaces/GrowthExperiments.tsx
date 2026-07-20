// ── V4.5 Growth Experiments ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type ExpStatus = "Planning" | "Running" | "Completed" | "Cancelled";

interface Experiment {
  id: string; name: string; hypothesis: string; expectedOutcome: string;
  results: string; lessons: string; status: ExpStatus;
}

const STATUS_COLOR: Record<ExpStatus, string> = {
  Planning: "#6b7280", Running: "#3b82f6", Completed: "#10b981", Cancelled: "#ef4444",
};

const EMPTY: Omit<Experiment, "id"> = { name: "", hypothesis: "", expectedOutcome: "", results: "", lessons: "", status: "Planning" };

export default function GrowthExperiments({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [form, setForm]   = useState({ ...EMPTY });
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const addExperiment = () => {
    if (!form.name.trim()) return;
    const exp: Experiment = { ...form, id: Date.now().toString() };
    setExperiments(prev => [exp, ...prev]);
    setForm({ ...EMPTY });
    setAdding(false);
    addActivity({ type: "experiment_created", title: "Growth Experiment Created", description: form.name, category: "Growth Studio", icon: "🧪" });
    showToast("🧪 Experiment added!");
  };

  const update = (id: string, field: keyof Experiment, val: string) =>
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));

  const remove = (id: string) => { setExperiments(prev => prev.filter(e => e.id !== id)); showToast("🗑️ Experiment removed."); };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🧪 Growth Experiments</h1>
      <p className="workspace-subtitle">Plan experiments, track hypotheses, log results, and capture lessons learned.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">🧪</div><p className="stat-value">{experiments.length}</p><h3 className="stat-label">Experiments</h3></div>
        <div className="stat-card"><div className="stat-icon">▶️</div><p className="stat-value">{experiments.filter(e => e.status === "Running").length}</p><h3 className="stat-label">Running</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{experiments.filter(e => e.status === "Completed").length}</p><h3 className="stat-label">Completed</h3></div>
        <div className="stat-card"><div className="stat-icon">📚</div><p className="stat-value">{experiments.filter(e => e.lessons.trim()).length}</p><h3 className="stat-label">Lessons Logged</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v => !v)}>
        {adding ? "✕ Cancel" : "+ New Experiment"}
      </button>

      {adding && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Experiment name..." value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
            <textarea className="workspace-textarea" placeholder="Hypothesis: We believe that..." value={form.hypothesis} onChange={e => setForm(v => ({ ...v, hypothesis: e.target.value }))} rows={2} />
            <textarea className="workspace-textarea" placeholder="Expected outcome..." value={form.expectedOutcome} onChange={e => setForm(v => ({ ...v, expectedOutcome: e.target.value }))} rows={2} />
            <button className="workspace-btn" onClick={addExperiment} disabled={!form.name.trim()}>🧪 Add Experiment</button>
          </div>
        </div>
      )}

      {experiments.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">🧪</div><p>No experiments yet. Add your first growth experiment.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {experiments.map(e => (
            <div key={e.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{e.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: STATUS_COLOR[e.status] + "20", color: STATUS_COLOR[e.status] }}>{e.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setExpanded(expanded === e.id ? null : e.id)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>{expanded === e.id ? "▲ Collapse" : "▼ Expand"}</button>
                  <button onClick={() => remove(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }}>🗑️</button>
                </div>
              </div>

              {e.hypothesis && <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}><strong>Hypothesis:</strong> {e.hypothesis}</p>}

              {expanded === e.id && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    {(["Planning","Running","Completed","Cancelled"] as ExpStatus[]).map(s => (
                      <button key={s} onClick={() => update(e.id, "status", s)}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, border: `1.5px solid ${STATUS_COLOR[s]}`, background: e.status === s ? STATUS_COLOR[s] : "transparent", color: e.status === s ? "#fff" : STATUS_COLOR[s], cursor: "pointer", fontWeight: 600 }}>{s}</button>
                    ))}
                  </div>
                  <textarea className="workspace-textarea" placeholder="Results..." value={e.results} onChange={ev => update(e.id, "results", ev.target.value)} rows={2} style={{ marginBottom: 10 }} />
                  <textarea className="workspace-textarea" placeholder="Lessons learned..." value={e.lessons} onChange={ev => update(e.id, "lessons", ev.target.value)} rows={2} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
