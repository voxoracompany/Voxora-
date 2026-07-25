// ── V6.4 CRM Analytics Dashboard ────────────────────────────────────────────
import { useMemo } from "react";
import { useCRM } from "../../hooks/useCRM";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
}

function StatCard({ icon, label, value, sub, color = "#6C63FF", bg = "#ede9fe" }: StatCardProps) {
  return (
    <div style={{
      background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
      borderRadius: 16, padding: "20px 22px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text,#111827)", marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

interface BarProps { label: string; count: number; total: number; color: string }
function Bar({ label, count, total, color }: BarProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: "var(--text,#374151)", fontWeight: 600 }}>{label}</span>
        <span style={{ color: "var(--text-muted,#6b7280)" }}>{count} ({pct}%)</span>
      </div>
      <div style={{ height: 8, background: "var(--border,#e5e7eb)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s" }} />
      </div>
    </div>
  );
}

const STAGE_COLORS: Record<string, string> = {
  new: "#6C63FF", contacted: "#3b82f6", qualified: "#f59e0b",
  proposal: "#8b5cf6", negotiation: "#ec4899", won: "#10b981", lost: "#ef4444",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New Lead", contacted: "Contacted", qualified: "Qualified",
  proposal: "Proposal Sent", negotiation: "Negotiation", won: "Won", lost: "Lost",
};

export default function CRMAnalytics({ setWorkspace }: Props) {
  const { leads, contacts, meetings, tasks } = useCRM();

  const stats = useMemo(() => {
    const total       = leads.length;
    const won         = leads.filter(l => l.status === "won").length;
    const lost        = leads.filter(l => l.status === "lost").length;
    const active      = leads.filter(l => !["won","lost"].includes(l.status)).length;
    const converted   = total > 0 ? Math.round((won / total) * 100) : 0;
    const pipeline    = leads.filter(l => !["won","lost"].includes(l.status)).reduce((a, l) => a + (l.value || 0), 0);
    const wonValue    = leads.filter(l => l.status === "won").reduce((a, l) => a + (l.value || 0), 0);
    const allValues   = leads.filter(l => l.value > 0);
    const avgDeal     = allValues.length > 0 ? Math.round(allValues.reduce((a, l) => a + l.value, 0) / allValues.length) : 0;
    const winRate     = (won + lost) > 0 ? Math.round((won / (won + lost)) * 100) : 0;
    const forecast    = pipeline * (winRate / 100 || 0.3);

    // Source breakdown
    const bySrc: Record<string, number> = {};
    for (const l of leads) bySrc[l.source] = (bySrc[l.source] ?? 0) + 1;

    // Stage breakdown
    const byStage: Record<string, number> = {
      new: 0, contacted: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0, lost: 0,
    };
    for (const l of leads) byStage[l.status] = (byStage[l.status] ?? 0) + 1;

    // Task completion
    const doneTasks   = tasks.filter(t => t.status === "done").length;
    const totalTasks  = tasks.length;
    const taskRate    = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Meetings
    const upcoming = meetings.filter(m => m.status === "scheduled").length;
    const completed = meetings.filter(m => m.status === "completed").length;

    return {
      total, won, lost, active, converted, pipeline, wonValue, avgDeal,
      winRate, forecast, bySrc, byStage, doneTasks, totalTasks, taskRate,
      upcoming, completed,
      totalContacts: contacts.length,
    };
  }, [leads, contacts, meetings, tasks]);

  const fmt = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📈 CRM Analytics</h1>
      <p className="workspace-subtitle">Real-time insights from your sales pipeline, contacts, and tasks.</p>

      {leads.length === 0 && (
        <div style={{
          background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12,
          padding: "14px 18px", marginBottom: 24, fontSize: 14, color: "#92400e",
        }}>
          💡 No leads yet. <button onClick={() => setWorkspace("crmLeadManager")} style={{ background: "none", border: "none", color: "#92400e", cursor: "pointer", fontWeight: 700, textDecoration: "underline", fontSize: 14 }}>Add leads</button> to see analytics.
        </div>
      )}

      {/* Top KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard icon="👥" label="Total Leads"      value={stats.total}            color="#6C63FF" bg="#ede9fe" />
        <StatCard icon="📊" label="Conversion Rate"  value={`${stats.converted}%`}  color="#10b981" bg="#d1fae5" sub={`${stats.won} of ${stats.total} leads`} />
        <StatCard icon="⚡" label="Active Deals"     value={stats.active}           color="#f59e0b" bg="#fef3c7" />
        <StatCard icon="💰" label="Revenue Pipeline" value={fmt(stats.pipeline)}    color="#8b5cf6" bg="#ede9fe" sub="Estimated open value" />
        <StatCard icon="🤝" label="Avg Deal Size"    value={fmt(stats.avgDeal)}     color="#3b82f6" bg="#dbeafe" sub="Across all leads with value" />
        <StatCard icon="🏆" label="Win / Loss Ratio" value={`${stats.winRate}%`}    color="#10b981" bg="#d1fae5" sub={`${stats.won}W · ${stats.lost}L`} />
        <StatCard icon="🔮" label="Sales Forecast"   value={fmt(stats.forecast)}    color="#ec4899" bg="#fce7f3" sub={`Based on ${stats.winRate}% win rate`} />
        <StatCard icon="💵" label="Won Revenue"      value={fmt(stats.wonValue)}    color="#10b981" bg="#d1fae5" sub={`${stats.won} closed deals`} />
      </div>

      {/* Pipeline by stage + Source breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>📊 Pipeline by Stage</h3>
          {Object.entries(stats.byStage).map(([stage, count]) => (
            <Bar key={stage} label={STAGE_LABELS[stage] ?? stage} count={count} total={stats.total} color={STAGE_COLORS[stage] ?? "#6b7280"} />
          ))}
          {stats.total === 0 && <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13 }}>No data yet.</p>}
        </div>

        <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>🌐 Lead Sources</h3>
          {Object.entries(stats.bySrc).length === 0
            ? <p style={{ color: "var(--text-muted,#6b7280)", fontSize: 13 }}>No data yet.</p>
            : Object.entries(stats.bySrc)
                .sort((a, b) => b[1] - a[1])
                .map(([src, count]) => (
                  <Bar key={src} label={src} count={count} total={stats.total} color="#6C63FF" />
                ))
          }
        </div>
      </div>

      {/* Activity summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
        {/* Tasks */}
        <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>✅ Task Completion</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `conic-gradient(#10b981 ${stats.taskRate * 3.6}deg, #e5e7eb 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-card,#fff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#10b981" }}>
                {stats.taskRate}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>{stats.doneTasks} / {stats.totalTasks}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>Tasks completed</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Pending",     val: tasks.filter(t => t.status === "pending").length,     color: "#f59e0b" },
              { label: "In Progress", val: tasks.filter(t => t.status === "in-progress").length, color: "#3b82f6" },
              { label: "Done",        val: stats.doneTasks,                                       color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", background: s.color + "15", borderRadius: 10, padding: "8px 6px" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted,#6b7280)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Meetings */}
        <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📅 Meetings</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Total",     val: meetings.length,           color: "#6C63FF" },
              { label: "Upcoming",  val: stats.upcoming,            color: "#3b82f6" },
              { label: "Completed", val: stats.completed,           color: "#10b981" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: s.color + "10", borderRadius: 10, padding: "12px 8px" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div style={{ background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>📇 Contacts</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Total",      val: contacts.length,                                    color: "#6C63FF" },
              { label: "Favorites",  val: contacts.filter(c => c.isFavorite).length,          color: "#f59e0b" },
              { label: "Customers",  val: contacts.filter(c => c.type === "customer").length, color: "#10b981" },
              { label: "Investors",  val: contacts.filter(c => c.type === "investor").length, color: "#8b5cf6" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: s.color + "10", borderRadius: 10, padding: "10px 6px" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {[
          { label: "➕ Add Lead",       id: "crmLeadManager" },
          { label: "📊 View Pipeline",  id: "crmPipeline"    },
          { label: "✅ Add Task",        id: "crmTasks"       },
          { label: "📤 Export Data",    id: "crmExport"      },
        ].map(q => (
          <button key={q.id} onClick={() => setWorkspace(q.id)}
            style={{ padding: "10px 18px", background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#374151)" }}>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
