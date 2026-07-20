// ── V4.7 Team Collaboration Hub ───────────────────────────────────────────────
import { useProjects } from "../../context/ProjectContext";
import { useMemo }     from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  { id: "teamMembers",       icon: "👥", label: "Team Members",        desc: "Add team members, assign roles, and manage your team roster." },
  { id: "taskBoard",         icon: "📋", label: "Task Board",           desc: "Kanban board to track tasks across To Do, In Progress, and Done." },
  { id: "meetingNotes",      icon: "📝", label: "Meeting Notes",        desc: "AI-powered meeting notes with action items and decisions." },
  { id: "teamGoals",         icon: "🎯", label: "Team Goals",           desc: "Set and track shared team goals with progress and ownership." },
  { id: "roleAssignment",    icon: "🏷️", label: "Role & Responsibility", desc: "Define roles, responsibilities, and RACI matrix for your team." },
  { id: "teamAnnouncements", icon: "📢", label: "Announcements",        desc: "Post and manage team announcements and important updates." },
  { id: "teamBrief",         icon: "📡", label: "Team Brief",           desc: "AI-generated team status brief for standups and updates." },
  { id: "collaborationPlan", icon: "🤝", label: "Collaboration Plan",   desc: "AI-powered team collaboration strategy and communication plan." },
  { id: "teamRetrospective", icon: "🔁", label: "Retrospective",        desc: "Run team retrospectives — what went well, what to improve." },
];

const STATS = [
  { label: "Collab Tools", val: "9",    icon: "🛠️" },
  { label: "AI-Powered",   val: "Yes",  icon: "🤖" },
  { label: "Team Ready",   val: "Yes",  icon: "✅" },
  { label: "Focus",        val: "Scale",icon: "🚀" },
];

export default function TeamHub({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const teamProjects = useMemo(
    () => projects.filter(p =>
      ["Meeting Notes","Team Goal","Task","Team Brief","Collaboration Plan","Retrospective"].includes(p.category)
    ).slice(0, 3),
    [projects]
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🤝</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.5 }}>
          Team Collaboration
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 500 }}>
          Manage your team, run standups, track tasks, and collaborate efficiently. AI-powered meeting notes, role assignments, retrospectives, and team briefs — all in one workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 32 }}>
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Tools Grid */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🧰 Collaboration Tools</h2>
      <div className="cards" style={{ marginBottom: 32 }}>
        {TOOLS.map(t => (
          <div
            key={t.id}
            className="feature-card"
            style={{ cursor: "pointer" }}
            onClick={() => setWorkspace(t.id)}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{t.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>{t.label}</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{t.desc}</p>
            <button
              className="workspace-btn"
              style={{ marginTop: 14, width: "100%", fontSize: 13 }}
              onClick={e => { e.stopPropagation(); setWorkspace(t.id); }}
            >
              Open →
            </button>
          </div>
        ))}
      </div>

      {/* Recent Team Projects */}
      {teamProjects.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📁 Recent Team Projects</h2>
          <div className="recent-projects-list" style={{ marginBottom: 24 }}>
            {teamProjects.map(p => (
              <div key={p.id} className="recent-project-card">
                <div className="rpc-top"><span className="rpc-category">{p.category}</span></div>
                <h3 className="rpc-title">{p.title}</h3>
                <p className="rpc-date">
                  📅 {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
          <button className="workspace-btn" style={{ marginBottom: 32 }} onClick={() => setWorkspace("saved")}>
            View All Projects →
          </button>
        </>
      )}

      {/* Pro Tip */}
      <div style={{
        background: "linear-gradient(135deg, #eff6ff, #eef2ff)",
        border: "1.5px solid #bfdbfe", borderRadius: 14,
        padding: "18px 22px", fontSize: 14, color: "#1e40af",
      }}>
        <strong>💡 Team Workflow:</strong> Start with <strong>Team Members</strong> to build your roster and assign roles, use the <strong>Task Board</strong> for daily execution, run <strong>Meeting Notes</strong> after every sync, and close each sprint with a <strong>Retrospective</strong> to continuously improve.
      </div>
    </div>
  );
}
