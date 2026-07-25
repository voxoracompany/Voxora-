// ── V6.6 HR & People Studio Hub ──────────────────────────────────────────────
import { useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "hrEmployees",
    icon: "👤",
    label: "Employee Manager",
    desc: "Add, edit, and manage employees with departments, roles, status, contact info, and notes.",
    badge: "Core",
    color: "#6C63FF",
  },
  {
    id: "hrRecruitment",
    icon: "🎯",
    label: "Recruitment Manager",
    desc: "Track job openings, candidates, interview stages, offer status, and hiring pipeline.",
    badge: "New",
    color: "#10b981",
  },
  {
    id: "hrAttendance",
    icon: "🕐",
    label: "Attendance Manager",
    desc: "Daily attendance tracking, clock in/out, leave records, absent records, and monthly summaries.",
    badge: "New",
    color: "#f59e0b",
  },
  {
    id: "hrLeave",
    icon: "🏖️",
    label: "Leave Manager",
    desc: "Annual, sick, maternity and paternity leave requests with approval workflow and leave balance.",
    badge: "New",
    color: "#3b82f6",
  },
  {
    id: "hrPayroll",
    icon: "💵",
    label: "Payroll Manager",
    desc: "Salary records, bonuses, deductions, monthly payroll summaries, history, and export.",
    badge: "New",
    color: "#8b5cf6",
  },
  {
    id: "hrPerformance",
    icon: "⭐",
    label: "Performance Review",
    desc: "Employee goals, KPIs, ratings, manager feedback, review history, and improvement plans.",
    badge: "New",
    color: "#ec4899",
  },
  {
    id: "hrReports",
    icon: "📊",
    label: "HR Reports",
    desc: "Workforce analytics, department distribution, attendance, leave, payroll reports, and exports.",
    badge: "New",
    color: "#14b8a6",
  },
];

const badgeColor = (b: string) => {
  if (b === "Core") return "#6C63FF";
  return "#10b981";
};

export default function HRPeopleStudio({ setWorkspace }: Props) {
  const { employees, candidates, attendance, leaves, payroll, performance } = useHR();

  const stats = useMemo(() => {
    const activeEmp   = employees.filter(e => e.status === "active").length;
    const onLeave     = employees.filter(e => e.status === "on-leave").length;
    const openJobs    = [...new Set(candidates.filter(c => !["hired", "rejected"].includes(c.stage)).map(c => c.position))].length;
    const todayStr    = new Date().toISOString().slice(0, 10);
    const todayAtt    = attendance.filter(a => a.date === todayStr).length;
    const pendingLv   = leaves.filter(l => l.status === "pending").length;
    const paidPayroll = payroll.filter(p => p.status === "paid").length;

    return [
      { label: "Active Employees", val: String(activeEmp),   icon: "👤" },
      { label: "On Leave",         val: String(onLeave),     icon: "🏖️" },
      { label: "Open Positions",   val: String(openJobs),    icon: "🎯" },
      { label: "Present Today",    val: String(todayAtt),    icon: "🕐" },
      { label: "Pending Leaves",   val: String(pendingLv),   icon: "📋" },
      { label: "Paid Payrolls",    val: String(paidPayroll), icon: "💵" },
      { label: "Reviews",          val: String(performance.length), icon: "⭐" },
      { label: "Studio Tools",     val: String(TOOLS.length),      icon: "🛠️" },
    ];
  }, [employees, candidates, attendance, leaves, payroll, performance]);

  const recentEmployees = useMemo(
    () => [...employees].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [employees],
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #6C63FF 60%, #a78bfa 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>👥</div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
          HR &amp; People Studio{" "}
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 10 }}>V6.6</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 580 }}>
          Complete HR management for growing teams — employees, recruitment, attendance, leave,
          payroll, performance reviews, and workforce analytics all in one place.
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
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>🧰 HR Tools</h2>
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

      {/* Recent Employees */}
      {recentEmployees.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🕒 Recent Employees</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {recentEmployees.map(e => (
              <div key={e.id} style={{
                background: "var(--bg-card, #fff)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 12, padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text, #111827)" }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>
                    {e.role} · {e.department}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                  background: e.status === "active" ? "#d1fae5" : e.status === "on-leave" ? "#fef3c7" : "#fee2e2",
                  color:      e.status === "active" ? "#065f46" : e.status === "on-leave" ? "#92400e" : "#991b1b",
                }}>{e.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick Start */}
      <div style={{
        background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
        border: "1px solid #c4b5fd",
        borderRadius: 16, padding: "24px 28px",
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#5b21b6" }}>🚀 Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "➕ Add Employee",    id: "hrEmployees"   },
            { label: "🎯 Recruitment",     id: "hrRecruitment" },
            { label: "🕐 Mark Attendance", id: "hrAttendance"  },
            { label: "🏖️ Approve Leave",  id: "hrLeave"       },
            { label: "💵 Payroll",         id: "hrPayroll"     },
            { label: "📊 HR Reports",      id: "hrReports"     },
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setWorkspace(q.id)}
              style={{
                padding: "9px 16px", background: "#fff",
                border: "1.5px solid #c4b5fd", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: "#5b21b6", transition: "background 0.15s",
              }}
            >{q.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
