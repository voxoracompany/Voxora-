// ── V6.5 Operations Studio — SOP Builder ─────────────────────────────────────
import { useState, useCallback } from "react";
import { useOps, newOpsId } from "../../hooks/useOps";
import type { OpsSOPDocument, SOPSection, SOPStep } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const CATEGORIES = ["HR", "Engineering", "Finance", "Marketing", "Sales", "Support", "Operations", "Legal", "Other"];

const BLANK_SOP: Omit<OpsSOPDocument, "id" | "createdAt" | "updatedAt"> = {
  title: "", description: "", category: "Operations", sections: [], tags: [],
};

export default function OpsSOPBuilder({ setWorkspace }: Props) {
  const { sops, addSOP, updateSOP, deleteSOP } = useOps();

  const [view,       setView]       = useState<"list" | "editor">("list");
  const [editing,    setEditing]    = useState<OpsSOPDocument | null>(null);
  const [form,       setForm]       = useState(BLANK_SOP);
  const [tagInput,   setTagInput]   = useState("");
  const [search,     setSearch]     = useState("");

  // ── List actions ───────────────────────────────────────────────────────────
  const openNew = useCallback(() => {
    setEditing(null);
    setForm({ ...BLANK_SOP, sections: [] });
    setTagInput("");
    setView("editor");
  }, []);

  const openEdit = useCallback((sop: OpsSOPDocument) => {
    setEditing(sop);
    setForm({ title: sop.title, description: sop.description, category: sop.category,
      sections: JSON.parse(JSON.stringify(sop.sections)), tags: [...sop.tags] });
    setTagInput("");
    setView("editor");
  }, []);

  const saveSOP = useCallback(() => {
    if (!form.title.trim()) return;
    if (editing) {
      updateSOP(editing.id, form);
    } else {
      addSOP(form);
    }
    setView("list");
  }, [form, editing, addSOP, updateSOP]);

  // ── Section helpers ────────────────────────────────────────────────────────
  const addSection = useCallback(() => {
    const sec: SOPSection = { id: newOpsId(), title: "New Section", notes: "", steps: [] };
    setForm(prev => ({ ...prev, sections: [...prev.sections, sec] }));
  }, []);

  const updateSection = useCallback((secId: string, updates: Partial<SOPSection>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSection = useCallback((secId: string) => {
    setForm(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== secId) }));
  }, []);

  // ── Step helpers ───────────────────────────────────────────────────────────
  const addStep = useCallback((secId: string) => {
    const step: SOPStep = { id: newOpsId(), title: "New Step", description: "" };
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === secId ? { ...s, steps: [...s.steps, step] } : s,
      ),
    }));
  }, []);

  const updateStep = useCallback((secId: string, stepId: string, updates: Partial<SOPStep>) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === secId
          ? { ...s, steps: s.steps.map(st => st.id === stepId ? { ...st, ...updates } : st) }
          : s,
      ),
    }));
  }, []);

  const deleteStep = useCallback((secId: string, stepId: string) => {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === secId ? { ...s, steps: s.steps.filter(st => st.id !== stepId) } : s,
      ),
    }));
  }, []);

  // ── Tag helpers ────────────────────────────────────────────────────────────
  const addTag = useCallback(() => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(prev => ({ ...prev, tags: [...prev.tags, t] }));
    setTagInput("");
  }, [tagInput, form.tags]);

  const removeTag = useCallback((tag: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  }, []);

  // ── Export helpers ─────────────────────────────────────────────────────────
  const exportMarkdown = useCallback((sop: OpsSOPDocument) => {
    const lines: string[] = [
      `# ${sop.title}`,
      ``,
      `**Category:** ${sop.category}  `,
      `**Created:** ${sop.createdAt.slice(0, 10)}  `,
      `**Tags:** ${sop.tags.join(", ") || "—"}`,
      ``,
      sop.description,
      ``,
    ];
    sop.sections.forEach((sec, si) => {
      lines.push(`## ${si + 1}. ${sec.title}`);
      if (sec.notes) lines.push(`> ${sec.notes}`);
      lines.push("");
      sec.steps.forEach((step, sti) => {
        lines.push(`### Step ${sti + 1}: ${step.title}`);
        if (step.description) lines.push(step.description);
        lines.push("");
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${sop.title.replace(/\s+/g, "-")}-sop.md`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportJSON = useCallback((sop: OpsSOPDocument) => {
    const blob = new Blob([JSON.stringify(sop, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${sop.title.replace(/\s+/g, "-")}-sop.json`; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportPDF = useCallback((sop: OpsSOPDocument) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const html = `<!DOCTYPE html><html><head><title>${sop.title}</title>
    <style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#111}
    h1{color:#1e3a5f}h2{color:#2563eb;border-bottom:1px solid #ddd;padding-bottom:6px}
    h3{color:#374151}blockquote{border-left:3px solid #6C63FF;margin:0;padding:0 12px;color:#555}
    .meta{color:#6b7280;font-size:14px;margin:8px 0 20px}</style></head><body>
    <h1>${sop.title}</h1>
    <div class="meta">Category: ${sop.category} &nbsp;|&nbsp; ${sop.createdAt.slice(0,10)}</div>
    <p>${sop.description}</p>
    ${sop.sections.map((sec, si) => `
      <h2>${si + 1}. ${sec.title}</h2>
      ${sec.notes ? `<blockquote>${sec.notes}</blockquote>` : ""}
      ${sec.steps.map((step, sti) => `<h3>Step ${sti + 1}: ${step.title}</h3><p>${step.description}</p>`).join("")}
    `).join("")}
    </body></html>`;
    win.document.write(html);
    win.document.close();
    win.print();
  }, []);

  const filtered = sops.filter(s => {
    const q = search.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
  });

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="workspace-container" style={{ maxWidth: 1000 }}>
        <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>📄 SOP Builder</h1>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>{sops.length} Standard Operating Procedures</p>
          </div>
          <button className="workspace-btn" onClick={openNew}>+ New SOP</button>
        </div>

        <input className="workspace-input" placeholder="🔍 Search SOPs…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", marginBottom: 20 }} />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted, #6b7280)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
            <p style={{ fontSize: 16, margin: 0 }}>{sops.length === 0 ? "No SOPs yet. Create your first Standard Operating Procedure!" : "No SOPs match your search."}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(sop => (
              <div key={sop.id} style={{
                background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
                borderRadius: 14, padding: "16px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text, #111827)" }}>{sop.title}</span>
                      <span style={{ background: "#eff6ff", color: "#2563eb", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{sop.category}</span>
                      {sop.tags.map(t => <span key={t} style={{ background: "#ede9fe", color: "#6C63FF", borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>{t}</span>)}
                    </div>
                    {sop.description && <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{sop.description.slice(0, 120)}{sop.description.length > 120 ? "…" : ""}</p>}
                    <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>
                      {sop.sections.length} section{sop.sections.length !== 1 ? "s" : ""} · {sop.sections.reduce((n, s) => n + s.steps.length, 0)} steps · Updated {sop.updatedAt.slice(0, 10)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button onClick={() => openEdit(sop)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text, #111827)" }}>Edit</button>
                    <button onClick={() => exportMarkdown(sop)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#2563eb" }}>MD</button>
                    <button onClick={() => exportJSON(sop)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#10b981" }}>JSON</button>
                    <button onClick={() => exportPDF(sop)} style={{ padding: "7px 14px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#f97316" }}>PDF</button>
                    <button onClick={() => deleteSOP(sop.id)} style={{ padding: "7px 14px", border: "1px solid #fca5a5", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444" }}>Delete</button>
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
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setView("list")}>← Back to SOP List</button>
      <h1 style={{ margin: "0 0 20px", fontSize: 24, fontWeight: 800 }}>{editing ? `Editing: ${editing.title}` : "New SOP"}</h1>

      {/* Meta fields */}
      <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📋 Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>TITLE *</label>
            <input className="workspace-input" style={{ width: "100%" }} placeholder="SOP title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>DESCRIPTION</label>
            <textarea className="workspace-input" style={{ width: "100%", minHeight: 70, resize: "vertical" }} placeholder="Purpose and scope of this SOP…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>CATEGORY</label>
            <select className="workspace-input" style={{ width: "100%" }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>TAGS</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              {form.tags.map(t => (
                <span key={t} style={{ background: "#ede9fe", color: "#6C63FF", borderRadius: 20, padding: "3px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                  {t}<button onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6C63FF", padding: 0, fontSize: 12 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="workspace-input" style={{ flex: 1 }} placeholder="Add tag…" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
              <button className="workspace-btn" style={{ padding: "8px 12px" }} onClick={addTag}>Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📑 Sections ({form.sections.length})</h3>
        <button className="workspace-btn" style={{ fontSize: 13, padding: "8px 16px" }} onClick={addSection}>+ Add Section</button>
      </div>

      {form.sections.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", border: "2px dashed var(--border, #e5e7eb)", borderRadius: 12, color: "var(--text-muted, #6b7280)", marginBottom: 20 }}>
          Click <strong>+ Add Section</strong> to start building your SOP.
        </div>
      )}

      {form.sections.map((sec, si) => (
        <div key={sec.id} style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#6C63FF", flexShrink: 0 }}>§{si + 1}</span>
            <input className="workspace-input" style={{ flex: 1, minWidth: 160 }} value={sec.title} onChange={e => updateSection(sec.id, { title: e.target.value })} placeholder="Section title" />
            <button onClick={() => deleteSection(sec.id)} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#ef4444" }}>Remove</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>NOTES</label>
            <textarea className="workspace-input" style={{ width: "100%", minHeight: 50, resize: "vertical" }} placeholder="Section notes…" value={sec.notes} onChange={e => updateSection(sec.id, { notes: e.target.value })} />
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted, #6b7280)" }}>STEPS ({sec.steps.length})</span>
            <button onClick={() => addStep(sec.id)} style={{ background: "#6C63FF15", border: "1px solid #6C63FF44", color: "#6C63FF", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Step</button>
          </div>
          {sec.steps.map((step, sti) => (
            <div key={step.id} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <span style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "#6b7280", width: 24, flexShrink: 0, textAlign: "right" }}>{sti + 1}.</span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <input className="workspace-input" style={{ width: "100%" }} placeholder="Step title" value={step.title} onChange={e => updateStep(sec.id, step.id, { title: e.target.value })} />
                <textarea className="workspace-input" style={{ width: "100%", minHeight: 44, resize: "vertical" }} placeholder="Description…" value={step.description} onChange={e => updateStep(sec.id, step.id, { description: e.target.value })} />
              </div>
              <button onClick={() => deleteStep(sec.id, step.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#ef4444", marginTop: 8, padding: 4 }} title="Remove step">×</button>
            </div>
          ))}
        </div>
      ))}

      {/* Save / Cancel */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button className="workspace-btn" style={{ padding: "11px 28px" }} onClick={saveSOP}>{editing ? "Save Changes" : "Create SOP"}</button>
        <button onClick={() => setView("list")} style={{ padding: "11px 22px", border: "1px solid var(--border, #e5e7eb)", borderRadius: 10, background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--text, #111827)" }}>Cancel</button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)",
};
