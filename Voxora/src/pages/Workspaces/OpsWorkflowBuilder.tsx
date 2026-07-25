// ── V6.5 Operations Studio — Workflow Builder ─────────────────────────────────
import { useState, useCallback } from "react";
import { useOps, newOpsId } from "../../hooks/useOps";
import type { OpsWorkflow, OpsWorkflowAction } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TRIGGER_OPTIONS = [
  "New task created", "Task status changed", "Task overdue", "New team member added",
  "SOP updated", "Manual trigger", "Daily schedule", "Weekly schedule",
  "Form submission", "Custom event",
];

const ACTION_TYPES = [
  "Send notification", "Assign task", "Update status", "Create SOP entry",
  "Send email", "Add to team", "Log activity", "Trigger webhook",
  "Generate report", "Archive item",
];

const BLANK_WF: Omit<OpsWorkflow, "id" | "createdAt" | "updatedAt"> = {
  name: "", description: "", trigger: TRIGGER_OPTIONS[0],
  conditions: [], actions: [], isActive: false,
};

export default function OpsWorkflowBuilder({ setWorkspace }: Props) {
  const { workflows, addWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow, toggleWorkflow } = useOps();

  const [view,      setView]      = useState<"list" | "editor">("list");
  const [editing,   setEditing]   = useState<OpsWorkflow | null>(null);
  const [form,      setForm]      = useState(BLANK_WF);
  const [condInput, setCondInput] = useState("");
  const [search,    setSearch]    = useState("");

  // ── List actions ───────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setEditing(null);
    setForm({ ...BLANK_WF, conditions: [], actions: [] });
    setCondInput("");
    setView("editor");
  }, []);

  const openEdit = useCallback((wf: OpsWorkflow) => {
    setEditing(wf);
    setForm({
      name: wf.name, description: wf.description, trigger: wf.trigger,
      conditions: [...wf.conditions],
      actions: JSON.parse(JSON.stringify(wf.actions)),
      isActive: wf.isActive,
    });
    setCondInput("");
    setView("editor");
  }, []);

  const saveWorkflow = useCallback(() => {
    if (!form.name.trim()) return;
    if (editing) {
      updateWorkflow(editing.id, form);
    } else {
      addWorkflow(form);
    }
    setView("list");
  }, [form, editing, addWorkflow, updateWorkflow]);

  // ── Condition helpers ──────────────────────────────────────────────────────
  const addCondition = useCallback(() => {
    const c = condInput.trim();
    if (c) setForm(prev => ({ ...prev, conditions: [...prev.conditions, c] }));
    setCondInput("");
  }, [condInput]);

  const removeCondition = useCallback((idx: number) => {
    setForm(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== idx) }));
  }, []);

  // ── Action helpers ─────────────────────────────────────────────────────────
  const addAction = useCallback(() => {
    const action: OpsWorkflowAction = { id: newOpsId(), type: ACTION_TYPES[0], description: "" };
    setForm(prev => ({ ...prev, actions: [...prev.actions, action] }));
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<OpsWorkflowAction>) => {
    setForm(prev => ({
      ...prev,
      actions: prev.actions.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, []);

  const removeAction = useCallback((id: string) => {
    setForm(prev => ({ ...prev, actions: prev.actions.filter(a => a.id !== id) }));
  }, []);

  const filtered = workflows.filter(w => {
    const q = search.toLowerCase();
    return !q || w.name.toLowerCase().includes(q) || w.trigger.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
  });

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === "list") {
    const active   = workflows.filter(w => w.isActive).length;
    const inactive = workflows.length - active;
    return (
      <div className="workspace-container" style={{ maxWidth: 1000 }}>
        <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>🔄 Workflow Builder</h1>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>
              {workflows.length} workflows · {active} active · {inactive} inactive
            </p>
          </div>
          <button className="workspace-btn" onClick={openNew}>+ New Workflow</button>
        </div>

        <input className="workspace-input" placeholder="🔍 Search workflows…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", marginBottom: 20 }} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted, #6b7280)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
            <p style={{ fontSize: 16, margin: 0 }}>{workflows.length === 0 ? "No workflows yet. Create your first business workflow!" : "No workflows match your search."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(wf => (
              <div key={wf.id} style={{
                background: "var(--bg-card, #fff)",
                border: `1.5px solid ${wf.isActive ? "#6C63FF44" : "var(--border, #e5e7eb)"}`,
                borderRadius: 14, padding: "16px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleWorkflow(wf.id)}
                    title={wf.isActive ? "Deactivate" : "Activate"}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: wf.isActive ? "#6C63FF" : "#e5e7eb",
                      border: "none", cursor: "pointer", position: "relative",
                      transition: "background 0.2s", flexShrink: 0, marginTop: 2,
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 3,
                      left: wf.isActive ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111827)" }}>{wf.name}</span>
                      <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 12, fontWeight: 600, background: wf.isActive ? "#6C63FF15" : "#f3f4f6", color: wf.isActive ? "#6C63FF" : "#6b7280" }}>
                        {wf.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {wf.description && <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{wf.description}</p>}
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted, #6b7280)", flexWrap: "wrap" }}>
                      <span>⚡ Trigger: <strong>{wf.trigger}</strong></span>
                      <span>📋 {wf.conditions.length} condition{wf.conditions.length !== 1 ? "s" : ""}</span>
                      <span>🔧 {wf.actions.length} action{wf.actions.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => openEdit(wf)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text, #111827)" }}>Edit</button>
                    <button onClick={() => duplicateWorkflow(wf.id)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#3b82f6" }}>Duplicate</button>
                    <button onClick={() => deleteWorkflow(wf.id)} style={{ padding: "7px 14px", border: "1px solid #fca5a5", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── EDITOR VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="workspace-container" style={{ maxWidth: 860 }}>
      <button className="back-btn" onClick={() => setView("list")}>← Back to Workflows</button>
      <h1 style={{ margin: "0 0 20px", fontSize: 24, fontWeight: 800 }}>{editing ? `Editing: ${editing.name}` : "New Workflow"}</h1>

      {/* Basic info */}
      <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📋 Workflow Info</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={ls}>NAME *</label>
            <input className="workspace-input" style={{ width: "100%" }} placeholder="Workflow name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={ls}>DESCRIPTION</label>
            <textarea className="workspace-input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} placeholder="What does this workflow do?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label style={ls}>STATUS</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <button
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                style={{
                  width: 48, height: 26, borderRadius: 13,
                  background: form.isActive ? "#6C63FF" : "#e5e7eb",
                  border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                }}
              >
                <span style={{
                  position: "absolute", top: 4,
                  left: form.isActive ? 26 : 4,
                  width: 18, height: 18, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }} />
              </button>
              <span style={{ fontSize: 14, color: form.isActive ? "#6C63FF" : "var(--text-muted, #6b7280)", fontWeight: 600 }}>
                {form.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger */}
      <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>⚡ Trigger</h3>
        <select className="workspace-input" style={{ width: "100%" }} value={form.trigger} onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}>
          {TRIGGER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Conditions */}
      <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>🔀 Conditions ({form.conditions.length})</h3>
        {form.conditions.map((cond, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, background: "#f9fafb", borderRadius: 8, padding: "8px 12px" }}>
            <span style={{ fontSize: 13, flex: 1, color: "var(--text, #111827)" }}>{cond}</span>
            <button onClick={() => removeCondition(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, padding: 2, lineHeight: 1 }}>×</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input className="workspace-input" style={{ flex: 1 }} placeholder="e.g. task.priority === high" value={condInput} onChange={e => setCondInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCondition())} />
          <button className="workspace-btn" style={{ padding: "8px 14px", fontSize: 13 }} onClick={addCondition}>Add</button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🔧 Actions ({form.actions.length})</h3>
          <button className="workspace-btn" style={{ fontSize: 13, padding: "7px 14px" }} onClick={addAction}>+ Add Action</button>
        </div>
        {form.actions.length === 0 && (
          <p style={{ margin: 0, color: "var(--text-muted, #6b7280)", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No actions yet. Click <strong>+ Add Action</strong> to define what happens when this workflow runs.</p>
        )}
        {form.actions.map((action, idx) => (
          <div key={action.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr auto", gap: 10, alignItems: "start", marginBottom: 10, padding: "12px", background: "#f9fafb", borderRadius: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#6C63FF", marginTop: 10 }}>#{idx + 1}</span>
            <select className="workspace-input" style={{ width: "100%" }} value={action.type} onChange={e => updateAction(action.id, { type: e.target.value })}>
              {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="workspace-input" style={{ width: "100%" }} placeholder="Description…" value={action.description} onChange={e => updateAction(action.id, { description: e.target.value })} />
            <button onClick={() => removeAction(action.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 20, padding: 4, lineHeight: 1, marginTop: 6 }}>×</button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button className="workspace-btn" style={{ padding: "11px 28px" }} onClick={saveWorkflow}>{editing ? "Save Changes" : "Create Workflow"}</button>
        <button onClick={() => setView("list")} style={{ padding: "11px 22px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 10, background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--text, #111827)" }}>Cancel</button>
      </div>
    </div>
  );
}

const ls: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" };
