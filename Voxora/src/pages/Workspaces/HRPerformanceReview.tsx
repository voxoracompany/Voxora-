// ── V6.6 Performance Review ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR, newHRId } from "../../hooks/useHR";
import type { PerformanceReview, PerformanceGoal, KPI, PerformanceRating, ReviewStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const RATINGS: PerformanceRating[] = [1, 2, 3, 4, 5];
const RATING_LABELS: Record<PerformanceRating, string> = { 1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent" };
const RATING_COLORS: Record<PerformanceRating, string> = { 1: "#991b1b", 2: "#92400e", 3: "#1e40af", 4: "#065f46", 5: "#5b21b6" };
const REVIEW_STATUSES: ReviewStatus[] = ["draft", "submitted", "reviewed"];

const STATUS_COLORS: Record<ReviewStatus, { bg: string; color: string }> = {
  draft:     { bg: "#f3f4f6", color: "#374151" },
  submitted: { bg: "#dbeafe", color: "#1e40af" },
  reviewed:  { bg: "#d1fae5", color: "#065f46" },
};

const BLANK_REVIEW: Omit<PerformanceReview, "id" | "createdAt" | "updatedAt"> = {
  employeeId: "", employeeName: "", period: "",
  goals: [], kpis: [], rating: 3,
  managerFeedback: "", improvementPlan: "", status: "draft",
};

export default function HRPerformanceReview({ setWorkspace }: Props) {
  const { employees, performance, addReview, updateReview, deleteReview } = useHR();

  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected,   setSelected]   = useState<PerformanceReview | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<PerformanceReview | null>(null);
  const [form,       setForm]       = useState(BLANK_REVIEW);

  // Goal editing within form
  const [goalText, setGoalText] = useState("");
  const [kpiName,  setKpiName]  = useState("");
  const [kpiTarget,setKpiTarget]= useState("");
  const [kpiActual,setKpiActual]= useState("");
  const [kpiUnit,  setKpiUnit]  = useState("");

  const filtered = useMemo(() => {
    let list = [...performance];
    if (search)                list = list.filter(r => r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.period.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [performance, search, statusFilter]);

  const avgRating = performance.length > 0
    ? (performance.reduce((s, r) => s + r.rating, 0) / performance.length).toFixed(1)
    : "—";

  const openAdd = () => { setForm({ ...BLANK_REVIEW, goals: [], kpis: [] }); setEditing(null); setShowForm(true); };
  const openEdit = (r: PerformanceReview) => { setForm({ ...r }); setEditing(r); setShowForm(true); };

  const addGoal = () => {
    if (!goalText.trim()) return;
    const goal: PerformanceGoal = { id: newHRId(), title: goalText, description: "", targetDate: "", completed: false };
    setForm(f => ({ ...f, goals: [...f.goals, goal] }));
    setGoalText("");
  };

  const toggleGoal = (id: string) => {
    setForm(f => ({ ...f, goals: f.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) }));
  };

  const removeGoal = (id: string) => setForm(f => ({ ...f, goals: f.goals.filter(g => g.id !== id) }));

  const addKPI = () => {
    if (!kpiName.trim()) return;
    const kpi: KPI = { id: newHRId(), name: kpiName, target: kpiTarget, actual: kpiActual, unit: kpiUnit };
    setForm(f => ({ ...f, kpis: [...f.kpis, kpi] }));
    setKpiName(""); setKpiTarget(""); setKpiActual(""); setKpiUnit("");
  };

  const removeKPI = (id: string) => setForm(f => ({ ...f, kpis: f.kpis.filter(k => k.id !== id) }));

  const handleSubmit = () => {
    if (!form.employeeName.trim() || !form.period.trim()) return;
    editing ? updateReview(editing.id, form) : addReview(form);
    setShowForm(false); setEditing(null);
  };

  const starStr = (r: PerformanceRating) => "★".repeat(r) + "☆".repeat(5 - r);

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>⭐ Performance Reviews</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>
            {performance.length} reviews · Avg rating: {avgRating}
          </p>
        </div>
        <button className="workspace-btn" onClick={openAdd} style={{ background: "#ec4899" }}>+ New Review</button>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 24 }}>
        {[
          { label: "Draft",     val: performance.filter(r => r.status === "draft").length,     icon: "📝" },
          { label: "Submitted", val: performance.filter(r => r.status === "submitted").length, icon: "📤" },
          { label: "Reviewed",  val: performance.filter(r => r.status === "reviewed").length,  icon: "✅" },
          { label: "Excellent", val: performance.filter(r => r.rating === 5).length,           icon: "🌟" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input type="text" placeholder="Search employee, period…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Statuses</option>
          {REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Review List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p style={{ fontSize: 15 }}>No performance reviews yet</p>
          <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 12, background: "#ec4899" }}>+ New Review</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px 20px", cursor: "pointer" }} onClick={() => setSelected(selected?.id === r.id ? null : r)}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.employeeName}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>Period: {r.period} · {r.goals.length} goals · {r.kpis.length} KPIs</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, color: RATING_COLORS[r.rating], fontWeight: 700, letterSpacing: 1 }}>{starStr(r.rating)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[r.status].bg, color: STATUS_COLORS[r.status].color }}>{r.status}</span>
                  <button onClick={e => { e.stopPropagation(); openEdit(r); }} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 12 }}>Edit</button>
                  <button onClick={e => { e.stopPropagation(); r.status !== "reviewed" && updateReview(r.id, { status: "reviewed" }); }} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: r.status === "reviewed" ? "#d1fae5" : "#ec4899", color: r.status === "reviewed" ? "#065f46" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{r.status === "reviewed" ? "✓ Reviewed" : "Mark Reviewed"}</button>
                  <button onClick={e => { e.stopPropagation(); deleteReview(r.id); if (selected?.id === r.id) setSelected(null); }} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>×</button>
                </div>
              </div>

              {/* Expanded Detail */}
              {selected?.id === r.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border,#e5e7eb)" }}>
                  {r.goals.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>🎯 Goals</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {r.goals.map(g => (
                          <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                            <span>{g.completed ? "✅" : "⬜"}</span>
                            <span style={{ textDecoration: g.completed ? "line-through" : "none", color: g.completed ? "var(--text-muted,#6b7280)" : "var(--text,#111827)" }}>{g.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.kpis.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>📊 KPIs</h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {r.kpis.map(k => (
                          <div key={k.id} style={{ background: "var(--bg,#f9fafb)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                            <div style={{ fontWeight: 700 }}>{k.name}</div>
                            <div style={{ color: "var(--text-muted,#6b7280)" }}>Target: {k.target} {k.unit} · Actual: {k.actual} {k.unit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.managerFeedback && (
                    <div style={{ marginBottom: 10 }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>💬 Manager Feedback</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.6 }}>{r.managerFeedback}</p>
                    </div>
                  )}
                  {r.improvementPlan && (
                    <div>
                      <h4 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>📈 Improvement Plan</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted,#6b7280)", lineHeight: 1.6 }}>{r.improvementPlan}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "Edit Review" : "New Performance Review"}</h2>

            {/* Basic Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Employee Name *</label>
                <input type="text" value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} list="emp-perf-list"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <datalist id="emp-perf-list">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Period *</label>
                <input type="text" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} placeholder="e.g. Q1 2025, H1 2025"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Rating</label>
                <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) as PerformanceRating }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {RATINGS.map(r => <option key={r} value={r}>{r} — {RATING_LABELS[r]}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ReviewStatus }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {REVIEW_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Goals */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>🎯 Goals</h4>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input type="text" value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="Add a goal…" onKeyDown={e => e.key === "Enter" && addGoal()}
                  style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 13, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <button onClick={addGoal} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#ec4899", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Add</button>
              </div>
              {form.goals.map(g => (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", fontSize: 13 }}>
                  <button onClick={() => toggleGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{g.completed ? "✅" : "⬜"}</button>
                  <span style={{ flex: 1, textDecoration: g.completed ? "line-through" : "none" }}>{g.title}</span>
                  <button onClick={() => removeGoal(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 16 }}>×</button>
                </div>
              ))}
            </div>

            {/* KPIs */}
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700 }}>📊 KPIs</h4>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 6, marginBottom: 8 }}>
                <input placeholder="KPI Name" value={kpiName}   onChange={e => setKpiName(e.target.value)}   style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 12, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <input placeholder="Target"   value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 12, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <input placeholder="Actual"   value={kpiActual} onChange={e => setKpiActual(e.target.value)} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 12, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <input placeholder="Unit"     value={kpiUnit}   onChange={e => setKpiUnit(e.target.value)}   style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 12, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <button onClick={addKPI} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#ec4899", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+</button>
              </div>
              {form.kpis.map(k => (
                <div key={k.id} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, padding: "4px 0", borderBottom: "1px solid var(--border,#e5e7eb)" }}>
                  <span style={{ flex: 1, fontWeight: 600 }}>{k.name}</span>
                  <span style={{ color: "var(--text-muted,#6b7280)" }}>T: {k.target} {k.unit}</span>
                  <span style={{ color: "#065f46" }}>A: {k.actual} {k.unit}</span>
                  <button onClick={() => removeKPI(k.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}>×</button>
                </div>
              ))}
            </div>

            {/* Feedback & Improvement */}
            {[["Manager Feedback", "managerFeedback"], ["Improvement Plan", "improvementPlan"]].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
                <textarea value={String(form[key as keyof typeof form])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} rows={3}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, resize: "vertical", background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#ec4899" }}>{editing ? "Save Changes" : "Create Review"}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
