// ── V4.5 A/B Test Planner ─────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

interface ABTest {
  id: string; name: string; variantA: string; variantB: string;
  metrics: string; winner: "A" | "B" | "none"; notes: string;
}

export default function ABTestPlanner({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [form, setForm]   = useState({ name: "", variantA: "", variantB: "", metrics: "" });
  const [adding, setAdding] = useState(false);

  const addTest = () => {
    if (!form.name.trim()) return;
    const t: ABTest = { ...form, id: Date.now().toString(), winner: "none", notes: "" };
    setTests(prev => [t, ...prev]);
    setForm({ name: "", variantA: "", variantB: "", metrics: "" });
    setAdding(false);
    addActivity({ type: "ab_test_created", title: "A/B Test Created", description: form.name, category: "Growth Studio", icon: "⚖️" });
    showToast("⚖️ A/B Test added!");
  };

  const update = (id: string, field: keyof ABTest, val: string) =>
    setTests(prev => prev.map(t => t.id === id ? { ...t, [field]: val } : t));

  const remove = (id: string) => { setTests(prev => prev.filter(t => t.id !== id)); showToast("🗑️ Test removed."); };

  const winners = { A: tests.filter(t => t.winner === "A").length, B: tests.filter(t => t.winner === "B").length };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("growthHub")}>← Back to Growth Studio</button>
      <h1>⚖️ A/B Test Planner</h1>
      <p className="workspace-subtitle">Design A/B tests, define variants and metrics, and declare a winner.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">⚖️</div><p className="stat-value">{tests.length}</p><h3 className="stat-label">Total Tests</h3></div>
        <div className="stat-card"><div className="stat-icon">🅰️</div><p className="stat-value">{winners.A}</p><h3 className="stat-label">Variant A Won</h3></div>
        <div className="stat-card"><div className="stat-icon">🅱️</div><p className="stat-value">{winners.B}</p><h3 className="stat-label">Variant B Won</h3></div>
        <div className="stat-card"><div className="stat-icon">⏳</div><p className="stat-value">{tests.filter(t => t.winner === "none").length}</p><h3 className="stat-label">Undecided</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v => !v)}>
        {adding ? "✕ Cancel" : "+ New A/B Test"}
      </button>

      {adding && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Test name (e.g. CTA Button Color)..." value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <textarea className="workspace-textarea" placeholder="Variant A description..." value={form.variantA} onChange={e => setForm(v => ({ ...v, variantA: e.target.value }))} rows={3} />
              <textarea className="workspace-textarea" placeholder="Variant B description..." value={form.variantB} onChange={e => setForm(v => ({ ...v, variantB: e.target.value }))} rows={3} />
            </div>
            <input className="workspace-input" placeholder="Success metrics (e.g. click-through rate, conversion rate)..." value={form.metrics} onChange={e => setForm(v => ({ ...v, metrics: e.target.value }))} />
            <button className="workspace-btn" onClick={addTest} disabled={!form.name.trim()}>⚖️ Create Test</button>
          </div>
        </div>
      )}

      {tests.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">⚖️</div><p>No A/B tests yet. Create your first test to start optimizing.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tests.map(t => (
            <div key={t.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t.name}</h3>
                <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }}>🗑️</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                {(["A","B"] as const).map(v => (
                  <div key={v} style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${t.winner === v ? (v === "A" ? "#6C63FF" : "#10b981") : "#e5e7eb"}`, background: t.winner === v ? (v === "A" ? "#ede9fe" : "#ecfdf5") : "#fafafa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: v === "A" ? "#6C63FF" : "#10b981" }}>Variant {v}</span>
                      {t.winner === v && <span style={{ fontSize: 11, fontWeight: 700, background: v === "A" ? "#6C63FF" : "#10b981", color: "#fff", borderRadius: 20, padding: "2px 8px" }}>🏆 Winner</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{(v === "A" ? t.variantA : t.variantB) || <em style={{ color: "#9ca3af" }}>No description</em>}</p>
                  </div>
                ))}
              </div>

              {t.metrics && <p style={{ margin: "0 0 12px", fontSize: 13, color: "#374151" }}><strong>📏 Metrics:</strong> {t.metrics}</p>}

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Winner:</span>
                {(["none","A","B"] as const).map(w => (
                  <button key={w} onClick={() => update(t.id, "winner", w)}
                    style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, border: "1.5px solid #e5e7eb", background: t.winner === w ? "#6C63FF" : "#f3f4f6", color: t.winner === w ? "#fff" : "#374151", cursor: "pointer", fontWeight: 600 }}>
                    {w === "none" ? "Undecided" : `Variant ${w}`}
                  </button>
                ))}
              </div>

              <textarea className="workspace-textarea" placeholder="Notes / observations..." value={t.notes} onChange={e => update(t.id, "notes", e.target.value)} rows={2} style={{ marginTop: 12 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
