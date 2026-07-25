// ── V6.4 CRM Contact Manager ─────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useCRM, type Contact, type ContactType } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TYPES: { value: ContactType; label: string; icon: string; color: string }[] = [
  { value: "customer", label: "Customer",  icon: "👥", color: "#6C63FF" },
  { value: "investor", label: "Investor",  icon: "💼", color: "#10b981" },
  { value: "partner",  label: "Partner",   icon: "🤝", color: "#f59e0b" },
  { value: "supplier", label: "Supplier",  icon: "📦", color: "#3b82f6" },
];

const EMPTY: Omit<Contact, "id" | "createdAt" | "updatedAt"> = {
  name: "", type: "customer", company: "", email: "",
  phone: "", notes: "", isFavorite: false, activityHistory: [],
};

function typeInfo(t: ContactType) {
  return TYPES.find(x => x.value === t) ?? TYPES[0];
}

export default function CRMContacts({ setWorkspace }: Props) {
  const { contacts, addContact, updateContact, deleteContact, toggleFavorite, addContactActivity } = useCRM();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ContactType | "all">("all");
  const [favOnly, setFavOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, "id" | "createdAt" | "updatedAt">>(EMPTY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activityNote, setActivityNote] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filterType !== "all") list = list.filter(c => c.type === filterType);
    if (favOnly) list = list.filter(c => c.isFavorite);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [contacts, filterType, favOnly, search]);

  const selected = useMemo(() => contacts.find(c => c.id === selectedId) ?? null, [contacts, selectedId]);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({ name: c.name, type: c.type, company: c.company, email: c.email, phone: c.phone, notes: c.notes, isFavorite: c.isFavorite, activityHistory: c.activityHistory });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { showToast("Name is required.", "error"); return; }
    if (editing) {
      updateContact(editing.id, form);
      showToast("✅ Contact updated.");
    } else {
      addContact(form);
      addActivity({ type: "research_completed", title: "Contact Added", description: `Added ${form.name} (${form.type})`, category: "Sales & CRM", icon: "📇" });
      showToast("✅ Contact added.");
    }
    setModalOpen(false);
  };

  const addNote = () => {
    if (!selectedId || !activityNote.trim()) return;
    addContactActivity(selectedId, activityNote.trim());
    setActivityNote("");
    showToast("📝 Note added.");
  };

  const inp = (field: keyof typeof form, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📇 Contact Manager</h1>
      <p className="workspace-subtitle">Manage customers, investors, partners, and suppliers.</p>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <input className="workspace-input" placeholder="🔍 Search…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: "1 1 200px", maxWidth: 280 }} />
        <select className="workspace-input" value={filterType}
          onChange={e => setFilterType(e.target.value as ContactType | "all")}
          style={{ flex: "1 1 140px", maxWidth: 160 }}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
        </select>
        <button
          onClick={() => setFavOnly(v => !v)}
          style={{
            padding: "10px 16px", border: `1.5px solid ${favOnly ? "#f59e0b" : "var(--border,#e5e7eb)"}`,
            background: favOnly ? "#fef3c7" : "var(--bg-card,#fff)", borderRadius: 12,
            cursor: "pointer", fontSize: 13, fontWeight: 600, color: favOnly ? "#b45309" : "var(--text-muted,#6b7280)",
          }}
        >⭐ Favorites</button>
        <button className="workspace-btn" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>+ Add Contact</button>
      </div>

      {/* Type counts */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {TYPES.map(t => (
          <div key={t.value} style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 12, padding: "10px 16px", textAlign: "center", cursor: "pointer",
            borderColor: filterType === t.value ? t.color : "var(--border,#e5e7eb)",
          }} onClick={() => setFilterType(filterType === t.value ? "all" : t.value)}>
            <div style={{ fontSize: 18 }}>{t.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: t.color }}>
              {contacts.filter(c => c.type === t.value).length}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)" }}>{t.label}s</div>
          </div>
        ))}
      </div>

      {/* Two-column layout: list + detail */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Contact list */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted,#6b7280)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📇</div>
              <p>{contacts.length === 0 ? "No contacts yet. Add your first one!" : "No contacts match your filters."}</p>
            </div>
          ) : filtered.map(c => {
            const ti = typeInfo(c.type);
            const isSelected = selectedId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedId(isSelected ? null : c.id)}
                style={{
                  background: isSelected ? ti.color + "10" : "var(--bg-card,#fff)",
                  border: `1.5px solid ${isSelected ? ti.color : "var(--border,#e5e7eb)"}`,
                  borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: ti.color + "20", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 16, flexShrink: 0,
                    }}>{ti.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text,#111827)", display: "flex", alignItems: "center", gap: 6 }}>
                        {c.name} {c.isFavorite && <span>⭐</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                        {c.company || c.email || ti.label}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={e => { e.stopPropagation(); toggleFavorite(c.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: c.isFavorite ? 1 : 0.3 }}>⭐</button>
                    <button onClick={e => { e.stopPropagation(); openEdit(c); }}
                      style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#374151" }}>Edit</button>
                    <button onClick={e => { e.stopPropagation(); setDeleteId(c.id); }}
                      style={{ background: "#fee2e2", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>✕</button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: ti.color + "15", color: ti.color }}>
                    {ti.label}
                  </span>
                  {c.email && <span style={{ fontSize: 10, color: "var(--text-muted,#6b7280)" }}>📧 {c.email}</span>}
                  {c.phone && <span style={{ fontSize: 10, color: "var(--text-muted,#6b7280)" }}>📞 {c.phone}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{
            flex: "0 0 320px", background: "var(--bg-card,#fff)",
            border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 20,
            position: "sticky", top: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>{typeInfo(selected.type).icon}</div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text,#111827)" }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>{typeInfo(selected.type).label}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 16 }}>
              {selected.company && <div>🏢 <strong>Company:</strong> {selected.company}</div>}
              {selected.email   && <div>📧 <strong>Email:</strong> {selected.email}</div>}
              {selected.phone   && <div>📞 <strong>Phone:</strong> {selected.phone}</div>}
              {selected.notes   && (
                <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px", color: "var(--text,#374151)" }}>
                  {selected.notes}
                </div>
              )}
            </div>
            {/* Add note */}
            <div style={{ borderTop: "1px solid var(--border,#e5e7eb)", paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: "var(--text,#111827)" }}>📝 Add Activity Note</div>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="workspace-input" placeholder="Note…" value={activityNote}
                  onChange={e => setActivityNote(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addNote(); }}
                  style={{ flex: 1, fontSize: 13 }} />
                <button className="workspace-btn" onClick={addNote} style={{ padding: "0 14px", fontSize: 13 }}>+</button>
              </div>
            </div>
            {/* Activity history */}
            {(selected.activityHistory ?? []).length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted,#6b7280)", marginBottom: 8 }}>ACTIVITY HISTORY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {(selected.activityHistory ?? []).map((a, i) => (
                    <div key={i} style={{ fontSize: 12, borderLeft: "3px solid #6C63FF", paddingLeft: 8, color: "var(--text,#374151)" }}>
                      <div style={{ color: "var(--text-muted,#9ca3af)", marginBottom: 2 }}>{new Date(a.date).toLocaleString()}</div>
                      {a.note}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "✏️ Edit Contact" : "➕ Add Contact"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input className="workspace-input" placeholder="Full Name *" value={form.name} onChange={e => inp("name", e.target.value)} />
              <select className="workspace-input" value={form.type} onChange={e => inp("type", e.target.value as ContactType)}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
              <input className="workspace-input" placeholder="Company" value={form.company} onChange={e => inp("company", e.target.value)} />
              <input className="workspace-input" placeholder="Email" type="email" value={form.email} onChange={e => inp("email", e.target.value)} />
              <input className="workspace-input" placeholder="Phone" value={form.phone} onChange={e => inp("phone", e.target.value)} />
              <textarea className="workspace-textarea" placeholder="Notes…" value={form.notes} onChange={e => inp("notes", e.target.value)} style={{ minHeight: 80 }} />
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isFavorite} onChange={e => inp("isFavorite", e.target.checked)} />
                ⭐ Mark as favorite
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: "10px 20px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button className="workspace-btn" onClick={handleSave}>{editing ? "Save Changes" : "Add Contact"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 340, width: "90%" }}>
            <h3 style={{ margin: "0 0 10px" }}>Delete Contact?</h3>
            <p style={{ color: "var(--text-muted,#6b7280)", marginBottom: 20 }}>This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: "9px 18px", background: "none", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontWeight: 600, color: "var(--text-muted,#6b7280)" }}>Cancel</button>
              <button onClick={() => { if (deleteId === selectedId) setSelectedId(null); deleteContact(deleteId); setDeleteId(null); showToast("🗑️ Contact deleted.", "error"); }} style={{ padding: "9px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
