// ── V6.4 CRM Lead Manager ────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useCRM, type Lead, type LeadStatus, type LeadSource } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "new",         label: "New Lead",      color: "#6C63FF" },
  { value: "contacted",   label: "Contacted",     color: "#3b82f6" },
  { value: "qualified",   label: "Qualified",     color: "#f59e0b" },
  { value: "proposal",    label: "Proposal Sent", color: "#8b5cf6" },
  { value: "negotiation", label: "Negotiation",   color: "#ec4899" },
  { value: "won",         label: "Won",           color: "#10b981" },
  { value: "lost",        label: "Lost",          color: "#ef4444" },
];

const SOURCES: LeadSource[] = [
  "Website","Referral","LinkedIn","Cold Outreach","Event","Social Media","Other",
];

const EMPTY: Omit<Lead, "id" | "createdAt" | "updatedAt"> = {
  name: "", company: "", email: "", phone: "",
  source: "Website", status: "new",
  notes: "", tags: [], value: 0,
};

function statusInfo(s: LeadStatus) {
  return STATUSES.find(x => x.value === s) ?? STATUSES[0];
}

function TagBadge({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "#ede9fe", color: "#7c3aed",
      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
    }}>
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#7c3aed", lineHeight: 1, padding: 0, fontSize: 12 }}
        >×</button>
      )}
    </span>
  );
}

export default function CRMLeadManager({ setWorkspace }: Props) {
  const { leads, addLead, updateLead, deleteLead } = useCRM();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [filterSource, setFilterSource] = useState<LeadSource | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState<Omit<Lead, "id" | "createdAt" | "updatedAt">>(EMPTY);
  const [tagInput, setTagInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = leads;
    if (filterStatus !== "all") list = list.filter(l => l.status === filterStatus);
    if (filterSource !== "all") list = list.filter(l => l.source === filterSource);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [leads, filterStatus, filterSource, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setTagInput("");
    setModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setForm({
      name: lead.name, company: lead.company, email: lead.email,
      phone: lead.phone, source: lead.source, status: lead.status,
      notes: lead.notes, tags: [...lead.tags], value: lead.value,
    });
    setTagInput("");
    setModalOpen(true);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tags.includes(t)) { setTagInput(""); return; }
    setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { showToast("Name is required.", "error"); return; }
    if (editing) {
      updateLead(editing.id, form);
      showToast("✅ Lead updated.");
    } else {
      addLead(form);
      addActivity({ type: "research_completed", title: "Lead Added", description: `New lead: ${form.name} at ${form.company}`, category: "Sales & CRM", icon: "👤" });
      showToast("✅ Lead added.");
    }
    setModalOpen(false);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteLead(deleteId);
    showToast("🗑️ Lead deleted.", "error");
    setDeleteId(null);
  };

  const inp = (field: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>👤 Lead Manager</h1>
      <p className="workspace-subtitle">Track every lead from first contact to close.</p>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input
          className="workspace-input"
          placeholder="🔍 Search leads…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: "1 1 200px", maxWidth: 280 }}
        />
        <select
          className="workspace-input"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as LeadStatus | "all")}
          style={{ flex: "1 1 160px", maxWidth: 180 }}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          className="workspace-input"
          value={filterSource}
          onChange={e => setFilterSource(e.target.value as LeadSource | "all")}
          style={{ flex: "1 1 160px", maxWidth: 180 }}
        >
          <option value="all">All Sources</option>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="workspace-btn" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>+ Add Lead</button>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total", val: leads.length, color: "#6C63FF" },
          { label: "Won",   val: leads.filter(l => l.status === "won").length, color: "#10b981" },
          { label: "Active",val: leads.filter(l => !["won","lost"].includes(l.status)).length, color: "#f59e0b" },
          { label: "Pipeline", val: `$${leads.filter(l => !["won","lost"].includes(l.status)).reduce((a,l) => a + (l.value || 0),0).toLocaleString()}`, color: "#8b5cf6" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 12, padding: "12px 20px", textAlign: "center", minWidth: 90,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Lead list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <p>{leads.length === 0 ? 'No leads yet. Click "+ Add Lead" to start.' : "No leads match your filters."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(lead => {
            const si = statusInfo(lead.status);
            const expanded = expandedId === lead.id;
            return (
              <div
                key={lead.id}
                style={{
                  background: "var(--bg-card,#fff)",
                  border: "1.5px solid var(--border,#e5e7eb)",
                  borderRadius: 14, padding: "14px 18px",
                  transition: "box-shadow 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text,#111827)" }}>{lead.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px",
                        borderRadius: 20, background: si.color + "20", color: si.color,
                      }}>{si.label}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                      {lead.company}{lead.email && ` · ${lead.email}`}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {lead.tags.map(t => <TagBadge key={t} tag={t} />)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {lead.value > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                        ${lead.value.toLocaleString()}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", background: "#f3f4f6", borderRadius: 8, padding: "3px 8px" }}>
                      {lead.source}
                    </span>
                    <button
                      onClick={() => setExpandedId(expanded ? null : lead.id)}
                      style={{ background: "none", border: "1px solid var(--border,#e5e7eb)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontSize: 12, color: "var(--text-muted,#6b7280)" }}
                    >{expanded ? "▲" : "▼"}</button>
                    <button
                      onClick={() => openEdit(lead)}
                      style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}
                    >Edit</button>
                    <button
                      onClick={() => confirmDelete(lead.id)}
                      style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#dc2626" }}
                    >Delete</button>
                  </div>
                </div>
                {expanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border,#e5e7eb)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, color: "var(--text-muted,#6b7280)" }}>
                      {lead.phone && <span>📞 {lead.phone}</span>}
                      <span>📅 Added {new Date(lead.createdAt).toLocaleDateString()}</span>
                    </div>
                    {lead.notes && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "var(--text,#374151)", background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>
                        {lead.notes}
                      </div>
                    )}
                    {/* Quick status changer */}
                    <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {STATUSES.filter(s => s.value !== lead.status).map(s => (
                        <button
                          key={s.value}
                          onClick={() => { updateLead(lead.id, { status: s.value }); showToast(`Moved to ${s.label}`); }}
                          style={{
                            background: s.color + "15", border: `1px solid ${s.color}40`,
                            color: s.color, borderRadius: 8, padding: "4px 10px",
                            fontSize: 11, fontWeight: 600, cursor: "pointer",
                          }}
                        >→ {s.label}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
        }}>
          <div style={{
            background: "var(--bg-card,#fff)", borderRadius: 20, padding: 28,
            width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>
              {editing ? "✏️ Edit Lead" : "➕ Add Lead"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="workspace-input" placeholder="Name *" value={form.name}
                onChange={e => inp("name", e.target.value)} style={{ gridColumn: "1 / -1" }} />
              <input className="workspace-input" placeholder="Company" value={form.company}
                onChange={e => inp("company", e.target.value)} />
              <input className="workspace-input" placeholder="Email" type="email" value={form.email}
                onChange={e => inp("email", e.target.value)} />
              <input className="workspace-input" placeholder="Phone" value={form.phone}
                onChange={e => inp("phone", e.target.value)} />
              <input className="workspace-input" placeholder="Deal Value ($)" type="number" value={form.value || ""}
                onChange={e => inp("value", parseFloat(e.target.value) || 0)} />
              <select className="workspace-input" value={form.source}
                onChange={e => inp("source", e.target.value as LeadSource)}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="workspace-input" value={form.status} style={{ gridColumn: "1 / -1" }}
                onChange={e => inp("status", e.target.value as LeadStatus)}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <textarea className="workspace-textarea" placeholder="Notes…" value={form.notes}
                onChange={e => inp("notes", e.target.value)} style={{ gridColumn: "1 / -1", minHeight: 80 }} />
              {/* Tags */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input className="workspace-input" placeholder="Add tag…" value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    style={{ flex: 1 }} />
                  <button className="workspace-btn" onClick={addTag} style={{ padding: "0 16px" }}>+</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {form.tags.map(t => <TagBadge key={t} tag={t} onRemove={() => removeTag(t)} />)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: "10px 20px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}
              >Cancel</button>
              <button className="workspace-btn" onClick={handleSave}>
                {editing ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 380, width: "90%" }}>
            <h3 style={{ margin: "0 0 10px" }}>Delete Lead?</h3>
            <p style={{ color: "var(--text-muted,#6b7280)", marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "9px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
