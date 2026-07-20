// ── V4.5 OKR Manager ──────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

interface KeyResult { id: string; text: string; progress: number; }
interface Objective { id: string; title: string; keyResults: KeyResult[]; }

export default function OKRManager({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [newObj, setNewObj]         = useState("");
  const [newKR, setNewKR]           = useState<Record<string, string>>({});

  const addObjective = () => {
    if (!newObj.trim()) return;
    const o: Objective = { id: Date.now().toString(), title: newObj, keyResults: [] };
    setObjectives(prev => [...prev, o]);
    setNewObj("");
    addActivity({ type: "okr_created", title: "OKR Objective Added", description: newObj, category: "Growth Studio", icon: "🏆" });
    showToast("🏆 Objective added!");
  };

  const addKR = (objId: string) => {
    const text = newKR[objId]?.trim();
    if (!text) return;
    setObjectives(prev => prev.map(o => o.id === objId
      ? { ...o, keyResults: [...o.keyResults, { id: Date.now().toString(), text, progress: 0 }] }
      : o));
    setNewKR(prev => ({ ...prev, [objId]: "" }));
  };

  const updateKRProgress = (objId: string, krId: string, val: number) =>
    setObjectives(prev => prev.map(o => o.id === objId
      ? { ...o, keyResults: o.keyResults.map(kr => kr.id === krId ? { ...kr, progress: val } : kr) }
      : o));

  const deleteObjective = (id: string) => setObjectives(prev => prev.filter(o => o.id !== id));
  const deleteKR = (objId: string, krId: string) =>
    setObjectives(prev => prev.map(o => o.id === objId
      ? { ...o, keyResults: o.keyResults.filter(kr => kr.id !== krId) }
      : o));

  const avgProgress = (o: Objective) =>
    o.keyResults.length ? Math.round(o.keyResults.reduce((s, k) => s + k.progress, 0) / o.keyResults.length) : 0;

  const totalKRs = objectives.reduce((s, o) => s + o.keyResults.length, 0);
  const completedKRs = objectives.reduce((s, o) => s + o.keyResults.filter(k => k.progress === 100).length, 0);

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>🏆 OKR Manager</h1>
      <p className="workspace-subtitle">Set Objectives, define Key Results, and track progress toward each outcome.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">🎯</div><p className="stat-value">{objectives.length}</p><h3 className="stat-label">Objectives</h3></div>
        <div className="stat-card"><div className="stat-icon">🔑</div><p className="stat-value">{totalKRs}</p><h3 className="stat-label">Key Results</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{completedKRs}</p><h3 className="stat-label">Completed KRs</h3></div>
        <div className="stat-card"><div className="stat-icon">📈</div><p className="stat-value">{totalKRs ? Math.round((completedKRs / totalKRs) * 100) : 0}%</p><h3 className="stat-label">Overall Progress</h3></div>
      </div>

      <div className="workspace-form" style={{ flexDirection: "row", gap: 10 }}>
        <input className="workspace-input" style={{ flex: 1 }} placeholder="New Objective..." value={newObj}
          onChange={e => setNewObj(e.target.value)} onKeyDown={e => e.key === "Enter" && addObjective()} />
        <button className="workspace-btn" onClick={addObjective} disabled={!newObj.trim()}>+ Add Objective</button>
      </div>

      {objectives.length === 0 ? (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🏆</div>
          <p>No OKRs yet. Add your first objective to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {objectives.map(o => {
            const avg = avgProgress(o);
            return (
              <div key={o.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>🎯 {o.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <div style={{ flex: 1, height: 8, background: "#f3f4f6", borderRadius: 4 }}>
                        <div style={{ height: 8, width: `${avg}%`, background: avg === 100 ? "#10b981" : "#6C63FF", borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: avg === 100 ? "#10b981" : "#6C63FF", minWidth: 38 }}>{avg}%</span>
                    </div>
                  </div>
                  <button onClick={() => deleteObjective(o.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18, marginLeft: 12 }}>🗑️</button>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Key Results</h4>
                  {o.keyResults.length === 0 && <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 8px" }}>No key results yet.</p>}
                  {o.keyResults.map(kr => (
                    <div key={kr.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "10px 12px", background: "#f9fafb", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, flex: 1, fontWeight: 500 }}>🔑 {kr.text}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 180 }}>
                        <input type="range" min={0} max={100} value={kr.progress}
                          onChange={e => updateKRProgress(o.id, kr.id, Number(e.target.value))}
                          style={{ width: 100, accentColor: "#6C63FF" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 34 }}>{kr.progress}%</span>
                      </div>
                      <button onClick={() => deleteKR(o.id, kr.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 14 }}>✕</button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input className="workspace-input" style={{ flex: 1, fontSize: 13 }} placeholder="Add key result..."
                    value={newKR[o.id] || ""} onChange={e => setNewKR(prev => ({ ...prev, [o.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addKR(o.id)} />
                  <button className="workspace-btn" style={{ fontSize: 13, padding: "10px 16px" }} onClick={() => addKR(o.id)} disabled={!newKR[o.id]?.trim()}>+ KR</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
