// ── V6.5 Operations Studio — Performance Dashboard ────────────────────────────
import { useMemo, useCallback } from "react";
import { useOps } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const PRIORITY_COLOR: Record<string, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};
const STATUS_COLOR: Record<string, string> = {
  todo: "#6b7280", "in-progress": "#3b82f6", review: "#f59e0b", done: "#10b981",
};

export default function OpsPerformance({ setWorkspace }: Props) {
  const { tasks, kanban, sops, workflows, team } = useOps();

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const done       = tasks.filter(t => t.status === "done").length;
    const total      = tasks.length;
    const rate       = total ? Math.round((done / total) * 100) : 0;
    const overdue    = tasks.filter(t => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date()).length;
    const avgProgress = total ? Math.round(tasks.reduce((s, t) => s + t.progress, 0) / total) : 0;
    const kanbanDone  = kanban.filter(c => c.column === "done").length;
    const activeWf    = workflows.filter(w => w.isActive).length;
    const activeTeam  = team.filter(m => m.status === "active").length;

    return [
      { label: "Total Tasks",        val: String(total),          icon: "📋", color: "#6C63FF", sub: `${done} completed` },
      { label: "Completion Rate",    val: `${rate}%`,             icon: "📈", color: "#10b981", sub: `${done}/${total} done` },
      { label: "Avg. Progress",      val: `${avgProgress}%`,      icon: "⚡", color: "#3b82f6", sub: "across all tasks" },
      { label: "Overdue Tasks",      val: String(overdue),        icon: "⚠️", color: overdue > 0 ? "#ef4444" : "#10b981", sub: overdue > 0 ? "needs attention" : "all on track" },
      { label: "Kanban Cards",       val: String(kanban.length),  icon: "📊", color: "#f59e0b", sub: `${kanbanDone} completed` },
      { label: "Active Workflows",   val: String(activeWf),       icon: "🔄", color: "#8b5cf6", sub: `of ${workflows.length} total` },
      { label: "SOPs",               val: String(sops.length),    icon: "📄", color: "#f97316", sub: `${sops.reduce((n, s) => n + s.sections.length, 0)} sections` },
      { label: "Active Team Members",val: String(activeTeam),     icon: "👥", color: "#ec4899", sub: `of ${team.length} total` },
    ];
  }, [tasks, kanban, sops, workflows, team]);

  // ── Tasks by status ─────────────────────────────────────────────────────────
  const tasksByStatus = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, "in-progress": 0, review: 0, done: 0 };
    tasks.forEach(t => { counts[t.status] = (counts[t.status] ?? 0) + 1; });
    const total = tasks.length || 1;
    return Object.entries(counts).map(([status, count]) => ({
      status, count, pct: Math.round((count / total) * 100),
    }));
  }, [tasks]);

  // ── Tasks by priority ───────────────────────────────────────────────────────
  const tasksByPriority = useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    tasks.forEach(t => { counts[t.priority] = (counts[t.priority] ?? 0) + 1; });
    const total = tasks.length || 1;
    return Object.entries(counts).map(([priority, count]) => ({
      priority, count, pct: Math.round((count / total) * 100),
    }));
  }, [tasks]);

  // ── Team productivity (tasks per assignee) ──────────────────────────────────
  const teamProductivity = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {};
    tasks.forEach(t => {
      const key = t.assignee || "Unassigned";
      if (!counts[key]) counts[key] = { total: 0, done: 0 };
      counts[key].total++;
      if (t.status === "done") counts[key].done++;
    });
    return Object.entries(counts)
      .map(([name, { total, done }]) => ({ name, total, done, rate: Math.round((done / total) * 100) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [tasks]);

  // ── Kanban by column ────────────────────────────────────────────────────────
  const kanbanByColumn = useMemo(() => {
    const counts: Record<string, number> = { todo: 0, "in-progress": 0, review: 0, done: 0 };
    kanban.forEach(c => { counts[c.column] = (counts[c.column] ?? 0) + 1; });
    const total = kanban.length || 1;
    return Object.entries(counts).map(([col, count]) => ({
      col, count, pct: Math.round((count / total) * 100),
      label: col === "in-progress" ? "In Progress" : col.charAt(0).toUpperCase() + col.slice(1),
    }));
  }, [kanban]);

  // ── Export report ───────────────────────────────────────────────────────────
  const exportReport = useCallback(() => {
    const lines = [
      `# Voxora Operations Performance Report`,
      `Generated: ${new Date().toLocaleDateString()}`,
      ``,
      `## KPIs`,
      ...kpis.map(k => `- **${k.label}:** ${k.val} (${k.sub})`),
      ``,
      `## Tasks by Status`,
      ...tasksByStatus.map(r => `- ${r.status}: ${r.count} (${r.pct}%)`),
      ``,
      `## Tasks by Priority`,
      ...tasksByPriority.map(r => `- ${r.priority}: ${r.count} (${r.pct}%)`),
      ``,
      `## Team Productivity`,
      ...teamProductivity.map(m => `- ${m.name}: ${m.done}/${m.total} tasks done (${m.rate}%)`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ops-performance-${new Date().toISOString().slice(0, 10)}.md`; a.click();
    URL.revokeObjectURL(url);
  }, [kpis, tasksByStatus, tasksByPriority, teamProductivity]);

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>📊 Performance Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>Real-time operations metrics and team performance</p>
        </div>
        <button className="workspace-btn" onClick={exportReport}>📤 Export Report</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)",
            borderRadius: 14, padding: "18px 18px 16px", borderTop: `4px solid ${k.color}`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111827)", margin: "4px 0 2px" }}>{k.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Tasks by Status */}
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📋 Tasks by Status</h3>
          {tasksByStatus.map(r => (
            <div key={r.status} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLOR[r.status] }}>
                  {r.status === "in-progress" ? "In Progress" : r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{r.count} · {r.pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
                <div style={{ width: `${r.pct}%`, height: "100%", background: STATUS_COLOR[r.status], borderRadius: 6, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tasks by Priority */}
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>⚑ Tasks by Priority</h3>
          {tasksByPriority.map(r => (
            <div key={r.priority} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: PRIORITY_COLOR[r.priority] }}>
                  {r.priority.charAt(0).toUpperCase() + r.priority.slice(1)}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{r.count} · {r.pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
                <div style={{ width: `${r.pct}%`, height: "100%", background: PRIORITY_COLOR[r.priority], borderRadius: 6, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Kanban by Column */}
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📊 Kanban Overview</h3>
          {kanbanByColumn.map(r => (
            <div key={r.col} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: STATUS_COLOR[r.col] }}>{r.label}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{r.count} · {r.pct}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
                <div style={{ width: `${r.pct}%`, height: "100%", background: STATUS_COLOR[r.col], borderRadius: 6, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Team Productivity */}
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>👥 Team Productivity</h3>
          {teamProductivity.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted, #6b7280)", fontSize: 13 }}>Assign tasks to team members to see productivity metrics.</p>
          ) : teamProductivity.map(m => (
            <div key={m.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text, #111827)" }}>{m.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>{m.done}/{m.total} · {m.rate}%</span>
              </div>
              <div style={{ height: 10, borderRadius: 6, background: "var(--border, #e5e7eb)", overflow: "hidden" }}>
                <div style={{ width: `${m.rate}%`, height: "100%", background: "#6C63FF", borderRadius: 6, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOPs and Workflows summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>📄 SOP Coverage</h3>
          {sops.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted, #6b7280)", fontSize: 13 }}>No SOPs created yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sops.slice(0, 5).map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text, #111827)", fontWeight: 500 }}>{s.title.slice(0, 30)}{s.title.length > 30 ? "…" : ""}</span>
                  <span style={{ color: "var(--text-muted, #6b7280)" }}>{s.sections.length} sections</span>
                </div>
              ))}
              {sops.length > 5 && <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>+{sops.length - 5} more</span>}
            </div>
          )}
        </div>

        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>🔄 Workflow Status</h3>
          {workflows.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted, #6b7280)", fontSize: 13 }}>No workflows created yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {workflows.slice(0, 5).map(w => (
                <div key={w.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span style={{ color: "var(--text, #111827)", fontWeight: 500 }}>{w.name.slice(0, 28)}{w.name.length > 28 ? "…" : ""}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
                    background: w.isActive ? "#6C63FF15" : "#f3f4f6",
                    color: w.isActive ? "#6C63FF" : "#6b7280",
                  }}>{w.isActive ? "Active" : "Inactive"}</span>
                </div>
              ))}
              {workflows.length > 5 && <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>+{workflows.length - 5} more</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
