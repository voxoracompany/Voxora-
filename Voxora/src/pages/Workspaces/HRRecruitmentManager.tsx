// ── V6.6 Recruitment Manager ──────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import type { Candidate, InterviewStage, OfferStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const STAGES: InterviewStage[] = ["applied", "screening", "interview", "offer", "hired", "rejected"];
const OFFER_STATUSES: OfferStatus[] = ["none", "pending", "accepted", "declined"];

const STAGE_COLORS: Record<InterviewStage, { bg: string; color: string }> = {
  applied:   { bg: "#dbeafe", color: "#1e40af" },
  screening: { bg: "#e0e7ff", color: "#3730a3" },
  interview: { bg: "#fef3c7", color: "#92400e" },
  offer:     { bg: "#d1fae5", color: "#065f46" },
  hired:     { bg: "#dcfce7", color: "#166534" },
  rejected:  { bg: "#fee2e2", color: "#991b1b" },
};

const OFFER_COLORS: Record<OfferStatus, { bg: string; color: string }> = {
  none:     { bg: "#f3f4f6", color: "#6b7280" },
  pending:  { bg: "#fef3c7", color: "#92400e" },
  accepted: { bg: "#d1fae5", color: "#065f46" },
  declined: { bg: "#fee2e2", color: "#991b1b" },
};

const BLANK: Omit<Candidate, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", position: "", stage: "applied",
  offerStatus: "none", notes: "", resumeUrl: "", appliedAt: new Date().toISOString().slice(0, 10),
};

export default function HRRecruitmentManager({ setWorkspace }: Props) {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useHR();

  const [search,       setSearch]       = useState("");
  const [stageFilter,  setStageFilter]  = useState("all");
  const [posFilter,    setPosFilter]    = useState("all");
  const [showForm,     setShowForm]     = useState(false);
  const [editing,      setEditing]      = useState<Candidate | null>(null);
  const [form,         setForm]         = useState(BLANK);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [view,         setView]         = useState<"list" | "pipeline">("list");

  const filtered = useMemo(() => {
    let list = [...candidates];
    if (search)              list = list.filter(c => `${c.name} ${c.email} ${c.position}`.toLowerCase().includes(search.toLowerCase()));
    if (stageFilter !== "all") list = list.filter(c => c.stage === stageFilter);
    if (posFilter !== "all")   list = list.filter(c => c.position === posFilter);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [candidates, search, stageFilter, posFilter]);

  const positions = [...new Set(candidates.map(c => c.position))].filter(Boolean);
  const openPositions = [...new Set(candidates.filter(c => !["hired", "rejected"].includes(c.stage)).map(c => c.position))];

  const openAdd  = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (c: Candidate) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, position: c.position, stage: c.stage, offerStatus: c.offerStatus, notes: c.notes, resumeUrl: c.resumeUrl, appliedAt: c.appliedAt });
    setEditing(c); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    editing ? updateCandidate(editing.id, form) : addCandidate(form);
    closeForm();
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🎯 Recruitment Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>
            {candidates.length} candidates · {openPositions.length} open positions
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("list")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: view === "list" ? "#6C63FF" : "transparent", color: view === "list" ? "#fff" : "var(--text,#111827)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>List</button>
          <button onClick={() => setView("pipeline")} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: view === "pipeline" ? "#6C63FF" : "transparent", color: view === "pipeline" ? "#fff" : "var(--text,#111827)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Pipeline</button>
          <button className="workspace-btn" onClick={openAdd} style={{ background: "#6C63FF" }}>+ Add Candidate</button>
        </div>
      </div>

      {/* Open Positions Summary */}
      {openPositions.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted,#6b7280)", alignSelf: "center" }}>Open roles:</span>
          {openPositions.map(p => (
            <span key={p} style={{ padding: "4px 12px", borderRadius: 20, background: "#ede9fe", fontSize: 12, fontWeight: 600, color: "#5b21b6", cursor: "pointer" }} onClick={() => setPosFilter(posFilter === p ? "all" : p)}>
              {p} ({candidates.filter(c => c.position === p && !["hired", "rejected"].includes(c.stage)).length})
            </span>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input type="text" placeholder="Search name, email, position…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Positions</option>
          {positions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Pipeline View */}
      {view === "pipeline" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, marginBottom: 24 }}>
          {STAGES.map(stage => {
            const cols = candidates.filter(c => c.stage === stage);
            return (
              <div key={stage} style={{ minWidth: 200, flex: 1, background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, textTransform: "capitalize" }}>{stage}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: STAGE_COLORS[stage].bg, color: STAGE_COLORS[stage].color }}>{cols.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cols.map(c => (
                    <div key={c.id} style={{ background: "var(--bg,#f9fafb)", borderRadius: 8, padding: "10px 12px", cursor: "pointer", border: "1px solid var(--border,#e5e7eb)" }} onClick={() => openEdit(c)}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{c.position}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted,#6b7280)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No candidates found</p>
            <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 16, background: "#6C63FF" }}>+ Add Candidate</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#065f46", flexShrink: 0 }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{c.position} · {c.email}{c.phone ? ` · ${c.phone}` : ""}</div>
                  {c.notes && <div style={{ fontSize: 12, color: "var(--text-muted,#9ca3af)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.notes}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STAGE_COLORS[c.stage].bg, color: STAGE_COLORS[c.stage].color }}>{c.stage}</span>
                  {c.offerStatus !== "none" && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: OFFER_COLORS[c.offerStatus].bg, color: OFFER_COLORS[c.offerStatus].color }}>Offer: {c.offerStatus}</span>
                  )}
                  <button onClick={() => openEdit(c)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text,#111827)" }}>Edit</button>
                  <button onClick={() => setConfirmDelete(c.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 13, color: "#dc2626" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700 }}>{editing ? "Edit Candidate" : "Add Candidate"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {([["Name *", "name", "text"], ["Email", "email", "email"], ["Phone", "phone", "tel"], ["Position / Role", "position", "text"], ["Applied Date", "appliedAt", "date"]] as [string, keyof typeof BLANK, string][]).map(([label, key, type]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>{label}</label>
                  <input type={type} value={String(form[key])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Stage</label>
                <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as InterviewStage }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Offer Status</label>
                <select value={form.offerStatus} onChange={e => setForm(f => ({ ...f, offerStatus: e.target.value as OfferStatus }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {OFFER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Resume URL (placeholder)</label>
                <input type="url" value={form.resumeUrl} onChange={e => setForm(f => ({ ...f, resumeUrl: e.target.value }))}
                  placeholder="https://drive.google.com/..." style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, resize: "vertical", background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#10b981" }}>{editing ? "Save Changes" : "Add Candidate"}</button>
              <button onClick={closeForm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Delete Candidate?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text-muted,#6b7280)" }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { deleteCandidate(confirmDelete); setConfirmDelete(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Delete</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
