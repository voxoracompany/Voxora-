// ── V6.4 Sales & CRM Studio Hub ──────────────────────────────────────────────
import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const TOOLS = [
  {
    id: "crmLeadManager",
    icon: "👤",
    label: "Lead Manager",
    desc: "Add, edit, and track leads with name, company, source, status, tags, and notes.",
    badge: "Core",
    color: "#6C63FF",
  },
  {
    id: "crmPipeline",
    icon: "📊",
    label: "Sales Pipeline",
    desc: "Drag-and-drop Kanban board across 7 stages — from New Lead to Won or Lost.",
    badge: "New",
    color: "#10b981",
  },
  {
    id: "crmContacts",
    icon: "📇",
    label: "Contact Manager",
    desc: "Manage customers, investors, partners, and suppliers. Search, filter, favorite, and track activity.",
    badge: "New",
    color: "#f59e0b",
  },
  {
    id: "crmMeetings",
    icon: "📅",
    label: "Meeting Planner",
    desc: "Schedule meetings with agenda, participants, notes, and follow-up actions.",
    badge: "New",
    color: "#3b82f6",
  },
  {
    id: "crmProposals",
    icon: "📝",
    label: "Proposal Generator",
    desc: "AI-powered sales, service, product, and partnership proposal generation.",
    badge: "AI",
    color: "#8b5cf6",
  },
  {
    id: "crmAnalytics",
    icon: "📈",
    label: "CRM Analytics",
    desc: "Total leads, conversion rate, pipeline value, win/loss ratio, and sales forecast.",
    badge: "New",
    color: "#ec4899",
  },
  {
    id: "crmTasks",
    icon: "✅",
    label: "Task Manager",
    desc: "Track calls, emails, meetings, follow-ups, and deadlines with priority and due dates.",
    badge: "New",
    color: "#14b8a6",
  },
  {
    id: "crmExport",
    icon: "📤",
    label: "Export Center",
    desc: "Export CRM data as PDF, CSV, Excel (.xlsx), JSON, or Markdown.",
    badge: "New",
    color: "#f97316",
  },
];

const STATS = [
  { label: "Studio Tools",  val: "8",     icon: "🛠️" },
  { label: "AI-Powered",    val: "Yes",   icon: "🤖" },
  { label: "Export Formats",val: "5",     icon: "📤" },
  { label: "Pipeline Stages",val: "7",    icon: "📊" },
];

const CRM_CATEGORIES = [
  "Sales Proposal","Service Proposal","Product Proposal","Partnership Proposal",
];

const badgeColor = (b: string) => {
  if (b === "AI")   return "#8b5cf6";
  if (b === "Core") return "#6C63FF";
  return "#10b981";
};

export default function SalesCRM({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const recent = useMemo(
    () => projects.filter(p => CRM_CATEGORIES.includes(p.category)).slice(0, 3),
    [projects],
  );

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #8b5cf6 50%, #a78bfa 100%)",
        borderRadius: 20, padding: "40px 36px", marginBottom: 32, color: "#fff",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🤝</div>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>
          Sales & CRM Studio{" "}
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.85, marginLeft: 10 }}>V6.4</span>
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 16, opacity: 0.9, maxWidth: 540 }}>
          AI-powered customer relationship tools for founders and sales teams. Manage leads,
          run your pipeline, close deals, and grow revenue — all in one place.
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
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, marginTop: 0 }}>🧰 CRM Tools</h2>
      <div
        className="cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
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
              background: badgeColor(t.badge),
              color: "#fff", fontSize: 10, fontWeight: 700,
              padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5,
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

      {/* Recent Proposals */}
      {recent.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📁 Recent Proposals</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
            {recent.map(p => (
              <div key={p.id} style={{
                background: "var(--bg-card, #fff)",
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 12, padding: "14px 18px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text, #111827)" }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>
                    {p.category} · {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="workspace-btn"
                  style={{ fontSize: 12, padding: "7px 14px" }}
                  onClick={() => setWorkspace("crmProposals")}
                >View</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick links */}
      <div style={{
        background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
        border: "1px solid #bbf7d0",
        borderRadius: 16, padding: "24px 28px",
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#166534" }}>🚀 Quick Start</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "➕ Add Lead",       id: "crmLeadManager" },
            { label: "📊 View Pipeline",  id: "crmPipeline"    },
            { label: "📅 Plan a Meeting", id: "crmMeetings"    },
            { label: "📈 View Analytics", id: "crmAnalytics"   },
          ].map(q => (
            <button
              key={q.id}
              onClick={() => setWorkspace(q.id)}
              style={{
                padding: "9px 16px", background: "#fff",
                border: "1.5px solid #86efac", borderRadius: 10,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: "#166534", transition: "background 0.15s",
              }}
            >{q.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
