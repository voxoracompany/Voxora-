// ── V6.5 Operations Studio — Kanban Board ─────────────────────────────────────
// HTML5 native drag-and-drop (same pattern as CRMPipeline.tsx — no extra libs).
import { useState, useMemo, useCallback, useRef } from "react";
import { useOps } from "../../hooks/useOps";
import type { OpsKanbanCard, OpsKanbanColumn, OpsPriority } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const COLUMNS: { id: OpsKanbanColumn; label: string; icon: string; color: string }[] = [
  { id: "todo",        label: "Todo",        icon: "📥", color: "#6b7280" },
  { id: "in-progress", label: "In Progress", icon: "⚡", color: "#3b82f6" },
  { id: "review",      label: "Review",      icon: "🔍", color: "#f59e0b" },
  { id: "done",        label: "Completed",   icon: "✅", color: "#10b981" },
];

const PRIORITY_COLOR: Record<OpsPriority, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

const BLANK_CARD = { title: "", description: "", priority: "medium" as OpsPriority, assignee: "", dueDate: "" };

export default function OpsKanban({ setWorkspace }: Props) {
  const { kanban, addCard, updateCard, deleteCard, moveCard } = useOps();

  const [dragId,       setDragId]       = useState<string | null>(null);
  const [addingTo,     setAddingTo]     = useState<OpsKanbanColumn | null>(null);
  const [editingCard,  setEditingCard]  = useState<OpsKanbanCard | null>(null);
  const [form,         setForm]         = useState(BLANK_CARD);
  const dragOverCol    = useRef<OpsKanbanColumn | null>(null);

  const byColumn = useMemo(() => {
    const map: Record<OpsKanbanColumn, OpsKanbanCard[]> = {
      todo: [], "in-progress": [], review: [], done: [],
    };
    [...kanban]
      .sort((a, b) => a.order - b.order)
      .forEach(c => map[c.column].push(c));
    return map;
  }, [kanban]);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragStart = useCallback((id: string) => setDragId(id), []);

  const onDragOver = useCallback((e: React.DragEvent, col: OpsKanbanColumn) => {
    e.preventDefault();
    dragOverCol.current = col;
  }, []);

  const onDrop = useCallback((col: OpsKanbanColumn) => {
    if (dragId) moveCard(dragId, col);
    setDragId(null);
    dragOverCol.current = null;
  }, [dragId, moveCard]);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const openAdd = useCallback((col: OpsKanbanColumn) => {
    setEditingCard(null);
    setForm(BLANK_CARD);
    setAddingTo(col);
  }, []);

  const openEdit = useCallback((card: OpsKanbanCard) => {
    setEditingCard(card);
    setForm({ title: card.title, description: card.description, priority: card.priority, assignee: card.assignee, dueDate: card.dueDate });
    setAddingTo(null);
  }, []);

  const saveCard = useCallback(() => {
    if (!form.title.trim()) return;
    if (editingCard) {
      updateCard(editingCard.id, form);
      setEditingCard(null);
    } else if (addingTo) {
      const colCards = byColumn[addingTo];
      addCard({ ...form, column: addingTo, order: colCards.length });
      setAddingTo(null);
    }
  }, [form, editingCard, addingTo, addCard, updateCard, byColumn]);

  const cancelForm = useCallback(() => { setAddingTo(null); setEditingCard(null); }, []);

  const sel = (field: string, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  const isOverdue = (card: OpsKanbanCard) =>
    card.dueDate && card.column !== "done" && new Date(card.dueDate) < new Date();

  const totalCards = kanban.length;
  const doneCards  = kanban.filter(c => c.column === "done").length;

  return (
    <div className="workspace-container" style={{ maxWidth: 1200 }}>
      <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>📋 Kanban Board</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>
            {totalCards} cards · {doneCards} completed · drag cards between columns to update status
          </p>
        </div>
        <button className="workspace-btn" onClick={() => openAdd("todo")}>+ New Card</button>
      </div>

      {/* Edit card modal */}
      {editingCard && (
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid #6C63FF", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>Edit Card</h3>
          <CardForm form={form} sel={sel} onSave={saveCard} onCancel={cancelForm} />
        </div>
      )}

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, overflowX: "auto" }}>
        {COLUMNS.map(col => {
          const cards = byColumn[col.id];
          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={() => onDrop(col.id)}
              style={{
                background: "var(--bg-card, #fafafa)",
                border: "1.5px solid var(--border, #e5e7eb)",
                borderRadius: 14, padding: 14, minHeight: 420,
                transition: "border-color 0.15s",
              }}
            >
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{col.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text, #111827)" }}>{col.label}</span>
                  <span style={{
                    background: col.color + "22", color: col.color,
                    borderRadius: 20, padding: "1px 8px", fontSize: 12, fontWeight: 700,
                  }}>{cards.length}</span>
                </div>
                <button
                  onClick={() => openAdd(col.id)}
                  style={{ background: "none", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, padding: "3px 10px", cursor: "pointer", fontSize: 18, color: col.color, lineHeight: 1 }}
                  title="Add card"
                >+</button>
              </div>

              {/* Inline add form */}
              {addingTo === col.id && (
                <div style={{ background: "#fff", border: "1.5px solid #6C63FF", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <CardForm form={form} sel={sel} onSave={saveCard} onCancel={cancelForm} compact />
                </div>
              )}

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {cards.map(card => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => onDragStart(card.id)}
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${isOverdue(card) ? "#fca5a5" : "var(--border, #e5e7eb)"}`,
                      borderRadius: 10, padding: "10px 12px",
                      cursor: "grab", opacity: dragId === card.id ? 0.4 : 1,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.15s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 3px 12px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                  >
                    {/* Priority + title */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLOR[card.priority], marginTop: 4, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text, #111827)", lineHeight: 1.35 }}>{card.title}</span>
                    </div>

                    {card.description && (
                      <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-muted, #6b7280)", lineHeight: 1.4 }}>
                        {card.description.slice(0, 60)}{card.description.length > 60 ? "…" : ""}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {card.assignee && <span style={{ fontSize: 11, color: "var(--text-muted, #6b7280)" }}>👤 {card.assignee}</span>}
                        {card.dueDate  && <span style={{ fontSize: 11, color: isOverdue(card) ? "#ef4444" : "var(--text-muted, #6b7280)" }}>📅 {card.dueDate}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(card)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted, #6b7280)", padding: "2px 4px" }} title="Edit">✏️</button>
                        <button onClick={() => deleteCard(card.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", padding: "2px 4px" }} title="Delete">🗑️</button>
                      </div>
                    </div>

                    {/* Move buttons (accessible fallback) */}
                    <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                      {COLUMNS.filter(c => c.id !== col.id).map(c => (
                        <button
                          key={c.id}
                          onClick={() => moveCard(card.id, c.id)}
                          style={{
                            background: c.color + "15", border: `1px solid ${c.color}44`,
                            color: c.color, borderRadius: 6, padding: "2px 7px",
                            fontSize: 10, fontWeight: 600, cursor: "pointer",
                          }}
                        >→ {c.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {cards.length === 0 && addingTo !== col.id && (
                  <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--text-muted, #9ca3af)", fontSize: 13, border: "2px dashed var(--border, #e5e7eb)", borderRadius: 10 }}>
                    Drop cards here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Shared inline card form ────────────────────────────────────────────────────
function CardForm({
  form, sel, onSave, onCancel, compact = false,
}: {
  form: { title: string; description: string; priority: OpsPriority; assignee: string; dueDate: string };
  sel: (f: string, v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        className="workspace-input"
        placeholder="Card title *"
        value={form.title}
        onChange={e => sel("title", e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSave()}
        autoFocus
        style={{ width: "100%" }}
      />
      {!compact && (
        <textarea
          className="workspace-input"
          placeholder="Description…"
          value={form.description}
          onChange={e => sel("description", e.target.value)}
          style={{ width: "100%", minHeight: 60, resize: "vertical" }}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 8 }}>
        <select className="workspace-input" value={form.priority} onChange={e => sel("priority", e.target.value)} style={{ width: "100%" }}>
          {(["low", "medium", "high", "critical"] as OpsPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input className="workspace-input" type="date" value={form.dueDate} onChange={e => sel("dueDate", e.target.value)} style={{ width: "100%" }} />
        {!compact && <input className="workspace-input" placeholder="Assignee" value={form.assignee} onChange={e => sel("assignee", e.target.value)} style={{ width: "100%", gridColumn: "1 / -1" }} />}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="workspace-btn" style={{ flex: 1, fontSize: 13, padding: "8px" }} onClick={onSave}>Save</button>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text, #111827)" }}>Cancel</button>
      </div>
    </div>
  );
}
