// ── V5.7 Automation Workspace ─────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { AutomationEngine } from "../../services/automation/AutomationEngine";
import { validateWorkflow } from "../../services/automation/AutomationRules";
import type { AutomationWorkflow, ExecutionRecord, TriggerType, ScheduleType } from "../../services/automation/AutomationTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TRIGGER_LABELS: Record<TriggerType, string> = {
  project_created:       "Project Created",
  ai_conversation_saved: "AI Conversation Saved",
  billing_upgraded:      "Billing Upgraded",
  feedback_submitted:    "Feedback Submitted",
  report_generated:      "Report Generated",
  integration_connected: "Integration Connected",
  integration_synced:    "Integration Synced",
  manual:                "Manual",
};

const STATUS_COLOR: Record<string, string> = {
  active:   "#10b981",
  inactive: "#6b7280",
  error:    "#ef4444",
};

const EXEC_COLOR: Record<string, string> = {
  success: "#10b981",
  failed:  "#ef4444",
  skipped: "#f59e0b",
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Create Workflow Modal ─────────────────────────────────────────────────────

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [trigger, setTrigger]   = useState<TriggerType>("project_created");
  const [schedule, setSchedule] = useState<ScheduleType>("manual");
  const [errors, setErrors]     = useState<string[]>([]);

  const handleCreate = () => {
    const { valid, errors: errs } = validateWorkflow(name, trigger);
    if (!valid) { setErrors(errs); return; }
    AutomationEngine.create({
      name: name.trim(),
      description: desc.trim() || `Triggered when ${TRIGGER_LABELS[trigger]}.`,
      trigger: { type: trigger },
      schedule: { type: schedule },
    });
    onCreate();
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "var(--bg-card, #fff)", borderRadius: 20, padding: "32px 28px",
        width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 800 }}>⚡ Create Workflow</h2>

        {errors.length > 0 && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#991b1b" }}>
            {errors.map((e, i) => <div key={i}>• {e}</div>)}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Workflow Name *</label>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setErrors([]); }}
            placeholder="e.g. Notify on new project"
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What does this workflow do?"
            rows={2}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Trigger *</label>
          <select
            value={trigger}
            onChange={e => setTrigger(e.target.value as TriggerType)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14 }}
          >
            {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Schedule</label>
          <select
            value={schedule}
            onChange={e => setSchedule(e.target.value as ScheduleType)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14 }}
          >
            <option value="manual">Manual only</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          {schedule !== "manual" && (
            <p style={{ fontSize: 12, color: "#6b7280", margin: "6px 0 0" }}>
              ⏰ Scheduled execution — future-ready architecture (no server required).
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "transparent", fontSize: 14, cursor: "pointer" }}
          >Cancel</button>
          <button
            onClick={handleCreate}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#6c63ff", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >Create Workflow</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AutomationWorkspace({ setWorkspace }: Props) {
  const [workflows, setWorkflows]     = useState<AutomationWorkflow[]>([]);
  const [executions, setExecutions]   = useState<ExecutionRecord[]>([]);
  const [tab, setTab]                 = useState<"workflows" | "history">("workflows");
  const [showCreate, setShowCreate]   = useState(false);
  const [runningId, setRunningId]     = useState<string | null>(null);
  const [toast, setToast]             = useState("");
  const stats = AutomationEngine.getStats();

  const refresh = useCallback(() => {
    setWorkflows(AutomationEngine.getAll());
    setExecutions(AutomationEngine.getExecutions(30));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleToggle = (id: string) => {
    AutomationEngine.toggle(id);
    refresh();
    showToast("Workflow updated.");
  };

  const handleDuplicate = (id: string) => {
    AutomationEngine.duplicate(id);
    refresh();
    showToast("Workflow duplicated.");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this workflow? This cannot be undone.")) return;
    AutomationEngine.delete(id);
    refresh();
    showToast("Workflow deleted.");
  };

  const handleRun = async (id: string) => {
    setRunningId(id);
    await AutomationEngine.execute(id, "manual");
    setRunningId(null);
    refresh();
    showToast("Workflow executed.");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, background: "#1e293b", color: "#fff",
          borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 600, zIndex: 9999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeIn 0.2s ease",
        }}>{toast}</div>
      )}

      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={refresh} />
      )}

      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>Automation Engine</h1>
        <p style={{ margin: "10px 0 24px", fontSize: 16, opacity: 0.9, maxWidth: 520 }}>
          Build intelligent workflows that respond to events, run on a schedule, and connect your tools automatically.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: "#6c63ff", color: "#fff", border: "none", borderRadius: 12,
            padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}
        >+ Create Workflow</button>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {[
          { icon: "⚡", val: stats.total,           label: "Total Workflows" },
          { icon: "✅", val: stats.active,           label: "Active" },
          { icon: "⏸️", val: stats.inactive,          label: "Inactive" },
          { icon: "🔁", val: stats.totalExecutions,  label: "Executions" },
          { icon: "📊", val: `${stats.successRate}%`, label: "Success Rate" },
          { icon: "🕒", val: stats.recentExecutions.length, label: "Recent Runs" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value" style={{ fontSize: 15 }}>{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e5e7eb" }}>
        {(["workflows", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 20px", border: "none", background: "transparent",
              fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: "pointer",
              borderBottom: tab === t ? "2px solid #6c63ff" : "2px solid transparent",
              color: tab === t ? "#6c63ff" : "#6b7280", marginBottom: -2,
            }}
          >
            {t === "workflows" ? "⚡ Workflows" : "🕒 Execution History"}
          </button>
        ))}
      </div>

      {/* Workflows Tab */}
      {tab === "workflows" && (
        <>
          {workflows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>No workflows yet</h3>
              <p style={{ margin: "0 0 20px", fontSize: 14 }}>Create your first workflow to automate tasks.</p>
              <button
                onClick={() => setShowCreate(true)}
                style={{ background: "#6c63ff", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >+ Create Workflow</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {workflows.map(wf => (
                <div key={wf.id} style={{
                  background: "var(--bg-card, #fff)",
                  border: "1.5px solid var(--border, #e5e7eb)",
                  borderRadius: 16, padding: "20px 24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: STATUS_COLOR[wf.status], display: "inline-block", flexShrink: 0,
                        }} />
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{wf.name}</h3>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                          background: wf.status === "active" ? "#d1fae5" : "#f1f5f9",
                          color: STATUS_COLOR[wf.status], textTransform: "uppercase",
                        }}>{wf.status}</span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: "#6b7280" }}>{wf.description}</p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#9ca3af" }}>
                        <span>🎯 {TRIGGER_LABELS[wf.trigger.type]}</span>
                        <span>⏰ {wf.schedule?.type ?? "manual"}</span>
                        <span>🔁 {wf.executionCount} runs</span>
                        {wf.lastExecutedAt && <span>🕒 {formatRelative(wf.lastExecutedAt)}</span>}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <button
                        onClick={() => handleRun(wf.id)}
                        disabled={runningId === wf.id}
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "1.5px solid #6c63ff",
                          color: "#6c63ff", background: "transparent", fontSize: 12, fontWeight: 600,
                          cursor: runningId === wf.id ? "not-allowed" : "pointer", opacity: runningId === wf.id ? 0.6 : 1,
                        }}
                      >{runningId === wf.id ? "Running…" : "▶ Run"}</button>

                      <button
                        onClick={() => handleToggle(wf.id)}
                        style={{
                          padding: "7px 14px", borderRadius: 8,
                          border: `1.5px solid ${wf.status === "active" ? "#ef4444" : "#10b981"}`,
                          color: wf.status === "active" ? "#ef4444" : "#10b981",
                          background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >{wf.status === "active" ? "⏸ Disable" : "▶ Enable"}</button>

                      <button
                        onClick={() => handleDuplicate(wf.id)}
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                          background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151",
                        }}
                      >⧉ Duplicate</button>

                      <button
                        onClick={() => handleDelete(wf.id)}
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "1.5px solid #fee2e2",
                          background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#ef4444",
                        }}
                      >🗑 Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div>
          {executions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🕒</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>No execution history</h3>
              <p style={{ fontSize: 14 }}>Run a workflow to see execution records here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {executions.map(ex => (
                <div key={ex.id} style={{
                  background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: EXEC_COLOR[ex.status], flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.workflowName}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{ex.message}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af", flexWrap: "wrap" }}>
                    <span>🎯 {ex.triggeredBy}</span>
                    {ex.durationMs !== undefined && <span>⚡ {ex.durationMs}ms</span>}
                    <span>🕒 {formatRelative(ex.timestamp)}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: ex.status === "success" ? "#d1fae5" : ex.status === "failed" ? "#fee2e2" : "#fef3c7",
                    color: EXEC_COLOR[ex.status], textTransform: "uppercase",
                  }}>{ex.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Tasks info */}
      <div style={{
        marginTop: 32, background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
        border: "1.5px solid #c4b5fd", borderRadius: 16, padding: "20px 24px",
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#4c1d95" }}>
          ⏰ Scheduled Tasks — Future-Ready Architecture
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "#5b21b6", lineHeight: 1.6 }}>
          Daily, weekly, and monthly scheduled workflows are fully modeled and stored. Server-side execution 
          (cron, serverless functions, or a task queue) can be wired in when deploying to production — 
          no schema changes required.
        </p>
      </div>
    </div>
  );
}
