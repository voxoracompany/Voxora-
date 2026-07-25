// ── V6.5 Operations Studio Hub ────────────────────────────────────────────────
import { useMemo } from "react";
import { useOps } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "opsTaskManager",
    icon: "✅",
    label: "Task Manager",
    desc: "Create, assign, and track tasks with priority, status, due dates, assignees, and progress tracking.",
    badge: "Core",
    color: "#6C63FF",
  },
  {
    id: "opsKanban",
    icon: "📋",
    label: "Kanban Board",
    desc: "Visualise work across Todo, In Progress, Review, and Completed columns with drag-and-drop cards.",
    badge: "New",
    color: "#10b981",
  },
  {
    id: "opsSOP",
    icon: "📄",
    label: "SOP Builder",
    desc: "Create Standard Operating Procedures with sections, steps, and notes. Export as PDF, Markdown, or JSON.",
    badge: "New",
    color: "#f59e0b",
  },
  {
    id: "opsWorkflow",
    icon: "🔄",
    label: "Workflow Builder",
    desc: "Define business workflows with triggers, conditions, and actions. Save, duplicate, and activate.",
    badge: "New",
    color: "#3b82f6",
  },
  {
    id: "opsTeam",
    icon: "👥",
    label: "Team Manager",
    desc: "Manage team members with roles, departments, permissions, and activity history.",
    badge: "New",
    color: "#8b5cf6",
  },
  {
    id: "opsPerformance",
    icon: "📊",
    label: "Performance Dashboard",
    desc: "KPI cards, productivity metrics, team performance, and exportable reports.",
    badge: "New",
    color: "#ec4899",
  },
];

const badgeColor = (b: string) => {
  if (b === "Core") return "#6C63FF";
  if (b === "AI")   return "#8b5cf6";
  return "#10b981";
};

export default function OperationsStudio({ setWorkspace }: Props) {
  const { tasks, kanban, sops, workflows, team } = useOps();

  const stats = useMemo(() => [
    { label: "Tasks",          val: String(tasks.length),                icon: "✅" },
    { label: "Kanban Cards",   val: String(kanban.length),               icon: "📋" },
    { label: "SOPs",           val: String(sops.length),                 icon: "📄" },
    { label: "Workflows",      val: String(workflows.filter(w => w.isActive).length) + " active", icon: "🔄" },
    { label: "Team Members",   val: String(team.length),                 icon: "👥" },
    { label: "Studio Tools",   val: String(TOOLS.length),                icon: "🛠️" },
  ], [tasks, kanban, sops, workflows, team]);

  const recentTasks = useMemo(
    () => [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [tasks],
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>⚙️</div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
          Operations Studio{" "}
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 10 }}>V6.5</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 560 }}>
          End-to-end operations management for growing teams. Tasks, Kanban boards, SOPs,
          workflows, team management, and performance dashboards — all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>🧰 Operations Tools</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            style={{
              background: "var(--bg-card, #fff)",
              border: "1.5px solid var(--border, #e5e7eb)",
              borderRadius: 16,
              padding: 20,
              cursor: "pointer",
              position: "relative",
              transition: "box-shadow 0.2s, transform 0.15s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            onClick={() => setWorkspace(t.id)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            <span style={{
              position: "absolute", top: 12, right: 12,
              background: badgeColor(t.badge), color: "#fff",
              fontSize: 10, fontWeight: 700, padding: "3px 8px",
              borderRadius: 20, letterSpacing: 0.5,
            }}>{t.badge}</span>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "var(--text, #111827)" }}>{t.label}</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{t.desc}</p>
            <button
              className="workspace-btn"
              style={{ width: "100%", fontSize: 13, background: t.color }}
              onClick={e => { e.stopPropagation(); setWorkspace(t.id); }}
            >Open →</button>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      {recentTasks.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🕒 Recent Tasks</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {recentTasks.map(t => (
              <div key={t.id} style={{
                background: "var(--bg-card, #fff)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 12, padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text, #111827)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>
                    {t.assignee || "Unassigned"} · {t.status} · {t.dueDate || "No due date"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 60, height: 6, borderRadius: 4,
                    background: "var(--border, #e5e7eb)", overflow: "hidden",
                  }}>
                    <div style={{ width: `${t.progress}%`, height: "100%", background: "#6C63FF", borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted, #6b7280)" }}>{t.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Start */}
      <div style={{
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #bfdbfe",
        borderRadius: 16, padding: "24px 28px",
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#1e40af" }}>🚀 Quick Start</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "➕ Add Task",        id: "opsTaskManager"  },
            { label: "📋 View Kanban",     id: "opsKanban"       },
            { label: "📄 Create SOP",      id: "opsSOP"          },
            { label: "📊 Performance",     id: "opsPerformance"  },
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setWorkspace(q.id)}
              style={{
                padding: "9px 16px", background: "#fff",
                border: "1.5px solid #93c5fd", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: "#1e40af", transition: "background 0.15s",
              }}
            >{q.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
