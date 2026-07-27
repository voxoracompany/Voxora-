// ── V8.2 Scheduled Tasks Manager ─────────────────────────────────────────────
import { memo, useState, useCallback, useEffect } from "react";
import { ScheduledTaskService } from "../../services/automation/ScheduledTaskService";
import type { ScheduledTask, ScheduleFrequency, TaskRunRecord } from "../../services/automation/ScheduledTaskService";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const FREQ_LABELS: Record<ScheduleFrequency, string> = {
  daily: "Daily", weekly: "Weekly", monthly: "Monthly", custom: "Custom",
};
const FREQ_ICONS: Record<ScheduleFrequency, string> = {
  daily: "🌅", weekly: "📅", monthly: "🗓️", custom: "⚙️",
};
const STATUS_COLORS = { active: "#10b981", paused: "#f59e0b", error: "#ef4444" };
const RUN_COLORS = { success: "#10b981", failed: "#ef4444", skipped: "#f59e0b" };
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
const StatsBar = memo(function StatsBar({ stats }: {
  stats: ReturnType<typeof ScheduledTaskService["getStats"]>
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
      {[
        { label: "Total Tasks", value: stats.total, color: "#6C63FF" },
        { label: "Active", value: stats.active, color: "#10b981" },
        { label: "Paused", value: stats.paused, color: "#f59e0b" },
        { label: "Total Runs", value: stats.totalRuns, color: "#3b82f6" },
        { label: "Success Rate", value: `${stats.successRate}%`, color: "#10b981" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "10px 16px", flex: "1 1 100px", minWidth: 100, textAlign: "center",
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
});

// ── Task Row ──────────────────────────────────────────────────────────────────
const TaskRow = memo(function TaskRow({
  task, isRunning, onToggle, onRun, onDelete, onSelect,
}: {
  task: ScheduledTask;
  isRunning: boolean;
  onToggle: () => void;
  onRun: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
      padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontSize: 24 }}>{FREQ_ICONS[task.frequency]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{task.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px",
            background: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status],
          }}>{task.status.toUpperCase()}</span>
          <span style={{
            fontSize: 10, background: "#f1f5f9", color: "#64748b", borderRadius: 6, padding: "2px 8px",
          }}>{FREQ_LABELS[task.frequency]} · {task.time}</span>
        </div>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0" }}>{task.description}</p>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#94a3b8", flexWrap: "wrap" }}>
          <span>Next: <strong style={{ color: "#374151" }}>{formatDate(task.nextRunAt)}</strong></span>
          {task.lastRunAt && (
            <span>Last: <strong style={{ color: task.lastRunStatus === "success" ? "#10b981" : "#ef4444" }}>{formatRelative(task.lastRunAt)} ({task.lastRunStatus})</strong></span>
          )}
          <span>Runs: {task.runCount} · Fails: {task.failCount}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={onSelect} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, background: "#f1f5f9", color: "#374151", border: "none", cursor: "pointer", fontFamily: "inherit" }}>History</button>
        <button
          onClick={onRun} disabled={isRunning}
          style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: isRunning ? "#e2e8f0" : "#6C63FF", color: isRunning ? "#9ca3af" : "#fff", border: "none", cursor: isRunning ? "not-allowed" : "pointer", fontFamily: "inherit" }}
        >{isRunning ? "…" : "▶ Run"}</button>
        <button onClick={onToggle} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: task.status === "active" ? "#fef3c7" : "#dcfce7", color: task.status === "active" ? "#92400e" : "#166534", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          {task.status === "active" ? "Pause" : "Activate"}
        </button>
        <button onClick={onDelete} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 11, background: "#fef2f2", color: "#dc2626", border: "none", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
      </div>
    </div>
  );
});

// ── Create Task Modal ─────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("daily");
  const [time, setTime] = useState("09:00");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCreate = () => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Name is required");
    if (name.trim().length > 100) errs.push("Name must be under 100 characters");
    if (errs.length > 0) { setErrors(errs); return; }
    ScheduledTaskService.create({
      name: name.trim(),
      description: desc.trim() || `Runs ${frequency} at ${time}.`,
      frequency,
      time,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
    });
    onCreate();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>➕ Create Scheduled Task</h3>
        {errors.length > 0 && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 10, marginBottom: 14 }}>
            {errors.map((e) => <p key={e} style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{e}</p>)}
          </div>
        )}
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Task Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Growth Report" style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit" }} />
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does this task do?" rows={2} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit", resize: "none" }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit" }}>
              {Object.entries(FREQ_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit" }} />
          </div>
        </div>
        {frequency === "weekly" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Day of Week</label>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit" }}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </div>
        )}
        {frequency === "monthly" && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Day of Month</label>
            <input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "inherit" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, background: "#f1f5f9", color: "#374151", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={handleCreate} style={{ flex: 2, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#6C63FF", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Create Task</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Workspace ────────────────────────────────────────────────────────────
export default function ScheduledTasksManager({ setWorkspace: _setWorkspace }: Props) {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [runs, setRuns] = useState<TaskRunRecord[]>([]);
  const [stats, setStats] = useState(ScheduledTaskService.getStats());
  const [showCreate, setShowCreate] = useState(false);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [tab, setTab] = useState<"tasks" | "history">("tasks");
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const refresh = useCallback(() => {
    setTasks(ScheduledTaskService.getAll());
    setStats(ScheduledTaskService.getStats());
    setRuns(ScheduledTaskService.getRuns(30));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleToggle = useCallback((id: string) => {
    ScheduledTaskService.toggle(id);
    refresh();
  }, [refresh]);

  const handleRun = useCallback(async (id: string) => {
    setRunningIds((prev) => new Set(prev).add(id));
    try {
      await ScheduledTaskService.run(id);
      refresh();
    } finally {
      setRunningIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }, [refresh]);

  const handleDelete = useCallback((id: string) => {
    if (!confirm("Delete this scheduled task?")) return;
    ScheduledTaskService.delete(id);
    if (selectedTaskId === id) setSelectedTaskId(null);
    refresh();
  }, [selectedTaskId, refresh]);

  const filtered = tasks.filter((t) => filter === "all" || t.status === filter);
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const selectedRuns = selectedTaskId ? ScheduledTaskService.getRunsForTask(selectedTaskId, 20) : runs;

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div>
          <h1 className="workspace-title">⏰ Scheduled Tasks</h1>
          <p className="workspace-subtitle">Automate recurring jobs — daily, weekly, monthly, or custom.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#6C63FF", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}
        >+ Create Task</button>
      </div>

      <StatsBar stats={stats} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #e2e8f0" }}>
        {(["tasks", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 16px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            background: "none", color: tab === t ? "#6C63FF" : "#64748b", fontFamily: "inherit",
            borderBottom: tab === t ? "2px solid #6C63FF" : "2px solid transparent",
          }}>{t === "tasks" ? "📋 Tasks" : "📜 Run History"}</button>
        ))}
      </div>

      {tab === "tasks" ? (
        <>
          {/* Filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {(["all", "active", "paused"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: filter === f ? "#6C63FF" : "#f1f5f9", color: filter === f ? "#fff" : "#374151",
                border: "none", cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize",
              }}>{f}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", paddingTop: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>⏰</div>
              <p style={{ fontSize: 14 }}>No scheduled tasks yet. Create one to get started.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isRunning={runningIds.has(task.id)}
                  onToggle={() => handleToggle(task.id)}
                  onRun={() => handleRun(task.id)}
                  onDelete={() => handleDelete(task.id)}
                  onSelect={() => { setSelectedTaskId(task.id); setTab("history"); }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── History tab ── */
        <div>
          {selectedTask && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 20 }}>{FREQ_ICONS[selectedTask.frequency]}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{selectedTask.name}</span>
              <button onClick={() => setSelectedTaskId(null)} style={{ marginLeft: "auto", fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#e2e8f0", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Show All</button>
            </div>
          )}
          {selectedRuns.length === 0 ? (
            <div style={{ textAlign: "center", color: "#94a3b8", paddingTop: 30 }}>
              <p style={{ fontSize: 13 }}>No run records yet. Run a task manually to see history.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {selectedRuns.map((run) => (
                <div key={run.id} style={{
                  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", background: RUN_COLORS[run.status], flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{run.taskName}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{run.message}</div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8", flexShrink: 0 }}>
                    <div style={{ color: RUN_COLORS[run.status], fontWeight: 700, textTransform: "uppercase" }}>{run.status}</div>
                    <div>{formatRelative(run.timestamp)}</div>
                    <div>{run.duration}ms</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={refresh} />}
    </div>
  );
}
