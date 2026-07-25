// ── V6.4 CRM Sales Pipeline ──────────────────────────────────────────────────
// Native HTML5 drag-and-drop across 7 stages.
import { useState, useRef, useCallback, useMemo } from "react";
import { useCRM, type Lead, type LeadStatus } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

interface Stage {
  id: LeadStatus;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

const STAGES: Stage[] = [
  { id: "new",         label: "New Lead",      icon: "🌱", color: "#6C63FF", bg: "#ede9fe" },
  { id: "contacted",   label: "Contacted",     icon: "📞", color: "#3b82f6", bg: "#dbeafe" },
  { id: "qualified",   label: "Qualified",     icon: "✅", color: "#f59e0b", bg: "#fef3c7" },
  { id: "proposal",    label: "Proposal Sent", icon: "📝", color: "#8b5cf6", bg: "#ede9fe" },
  { id: "negotiation", label: "Negotiation",   icon: "🤝", color: "#ec4899", bg: "#fce7f3" },
  { id: "won",         label: "Won",           icon: "🏆", color: "#10b981", bg: "#d1fae5" },
  { id: "lost",        label: "Lost",          icon: "❌", color: "#ef4444", bg: "#fee2e2" },
];

export default function CRMPipeline({ setWorkspace }: Props) {
  const { leads, moveLead } = useCRM();
  const { showToast } = useToast();

  // Track which lead is being dragged and which column is hovered
  const draggedId = useRef<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatus | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = {
      new: [], contacted: [], qualified: [], proposal: [], negotiation: [], won: [], lost: [],
    };
    for (const l of leads) {
      if (map[l.status]) map[l.status].push(l);
    }
    return map;
  }, [leads]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    draggedId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stage: LeadStatus) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = draggedId.current;
    if (!id) return;
    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === stage) return;
    moveLead(id, stage);
    const stageLabel = STAGES.find(s => s.id === stage)?.label ?? stage;
    showToast(`Moved to ${stageLabel}`);
    draggedId.current = null;
  }, [leads, moveLead, showToast]);

  const totalPipeline = useMemo(() =>
    leads
      .filter(l => !["won", "lost"].includes(l.status))
      .reduce((a, l) => a + (l.value || 0), 0),
    [leads],
  );

  const wonValue = useMemo(() =>
    leads.filter(l => l.status === "won").reduce((a, l) => a + (l.value || 0), 0),
    [leads],
  );

  return (
    <div className="workspace-container" style={{ maxWidth: "100%", padding: "24px 20px" }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📊 Sales Pipeline</h1>
      <p className="workspace-subtitle">Drag leads between stages to update their status.</p>

      {/* Summary bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Total Leads",   val: leads.length,                                  color: "#6C63FF" },
          { label: "Active",        val: leads.filter(l => !["won","lost"].includes(l.status)).length, color: "#f59e0b" },
          { label: "Won",           val: leads.filter(l => l.status === "won").length,  color: "#10b981" },
          { label: "Pipeline Value",val: `$${totalPipeline.toLocaleString()}`,          color: "#8b5cf6" },
          { label: "Won Value",     val: `$${wonValue.toLocaleString()}`,               color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 100,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <p>No leads yet. <button onClick={() => setWorkspace("crmLeadManager")} style={{ background: "none", border: "none", color: "#6C63FF", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Add your first lead →</button></p>
        </div>
      )}

      {/* Kanban board */}
      <div style={{
        display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12,
        alignItems: "flex-start",
      }}>
        {STAGES.map(stage => {
          const stageLeads = leadsByStage[stage.id];
          const isOver = dragOverStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage.id)}
              style={{
                flex: "0 0 220px",
                background: isOver ? stage.bg : "var(--bg-card,#f9fafb)",
                border: `2px ${isOver ? "dashed" : "solid"} ${isOver ? stage.color : "var(--border,#e5e7eb)"}`,
                borderRadius: 16, padding: 12,
                minHeight: 300, transition: "background 0.2s, border 0.2s",
              }}
            >
              {/* Stage header */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{stage.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                  </div>
                  <span style={{
                    background: stage.color, color: "#fff",
                    fontSize: 11, fontWeight: 700, width: 20, height: 20,
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{stageLeads.length}</span>
                </div>
                {stageLeads.length > 0 && stageLeads.some(l => l.value > 0) && (
                  <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 4 }}>
                    ${stageLeads.reduce((a, l) => a + (l.value || 0), 0).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Lead cards */}
              {stageLeads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={e => handleDragStart(e, lead.id)}
                  style={{
                    background: "var(--bg-card,#fff)",
                    border: "1.5px solid var(--border,#e5e7eb)",
                    borderRadius: 10, padding: "10px 12px", marginBottom: 8,
                    cursor: "grab", userSelect: "none",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text,#111827)", marginBottom: 3 }}>
                    {lead.name}
                  </div>
                  {lead.company && (
                    <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginBottom: 4 }}>
                      🏢 {lead.company}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted,#6b7280)", background: "#f3f4f6", borderRadius: 6, padding: "2px 6px" }}>
                      {lead.source}
                    </span>
                    {lead.value > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>
                        ${lead.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {lead.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                      {lead.tags.slice(0, 2).map(t => (
                        <span key={t} style={{
                          fontSize: 9, fontWeight: 600, background: "#ede9fe", color: "#7c3aed",
                          padding: "2px 6px", borderRadius: 20,
                        }}>{t}</span>
                      ))}
                      {lead.tags.length > 2 && (
                        <span style={{ fontSize: 9, color: "var(--text-muted,#6b7280)" }}>+{lead.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {stageLeads.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "20px 8px",
                  color: "var(--text-muted,#9ca3af)", fontSize: 12,
                  border: "1.5px dashed var(--border,#e5e7eb)", borderRadius: 10,
                }}>
                  Drop here
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
