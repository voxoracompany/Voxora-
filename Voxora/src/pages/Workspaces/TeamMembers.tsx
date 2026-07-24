// ── V4.7 Team Members ─────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type Role = "Founder" | "Co-Founder" | "CTO" | "CPO" | "CMO" | "CFO" | "Engineer" | "Designer" | "Marketer" | "Ops" | "Sales" | "Advisor" | "Other";
type Status = "Active" | "Part-time" | "Advisor" | "Inactive";

interface Member {
  id: string; name: string; role: Role; email: string;
  department: string; status: Status; joinDate: string; notes: string;
}

const ROLES: Role[] = ["Founder","Co-Founder","CTO","CPO","CMO","CFO","Engineer","Designer","Marketer","Ops","Sales","Advisor","Other"];
const STATUSES: Status[] = ["Active","Part-time","Advisor","Inactive"];
const STATUS_COLOR: Record<Status, string> = { Active: "#10b981", "Part-time": "#3b82f6", Advisor: "#f59e0b", Inactive: "#9ca3af" };
const ROLE_COLORS: Partial<Record<Role, string>> = { Founder: "#6C63FF", "Co-Founder": "#8b5cf6", CTO: "#3b82f6", CPO: "#10b981", CMO: "#ec4899", CFO: "#f59e0b" };
const DEPTS = ["Engineering","Product","Marketing","Finance","Operations","Design","Sales","Leadership","Advisory"];
const AVATARS = ["🧑","👩","👨","🧑‍💻","👩‍💼","👨‍💼","🧑‍🎨","👩‍🔬","👨‍💼","🧑‍🏫"];

const EMPTY = { name:"", role:"Engineer" as Role, email:"", department:"Engineering", status:"Active" as Status, joinDate:"", notes:"" };

export default function TeamMembers({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm]       = useState({ ...EMPTY });
  const [adding, setAdding]   = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    if (!form.name.trim()) return;
    const m: Member = { ...form, id: Date.now().toString() };
    setMembers(prev => [...prev, m]);
    setForm({ ...EMPTY });
    setAdding(false);
    addActivity({ type: "team_member_added", title: "Team Member Added", description: `${form.name} joined as ${form.role}.`, category: "Team Collaboration", icon: "👥" });
    showToast("👥 Team member added!");
  };

  const remove = (id: string) => { setMembers(prev => prev.filter(m => m.id !== id)); showToast("🗑️ Member removed."); };
  const update = (id: string, field: keyof Member, val: string) =>
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));

  const byDept = members.reduce<Record<string, Member[]>>((acc, m) => {
    (acc[m.department] = acc[m.department] || []).push(m); return acc;
  }, {});

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>👥 Team Members</h1>
      <p className="workspace-subtitle">Build your team roster, assign roles, and manage your people.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">👥</div><p className="stat-value">{members.length}</p><h3 className="stat-label">Team Size</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{members.filter(m => m.status === "Active").length}</p><h3 className="stat-label">Active</h3></div>
        <div className="stat-card"><div className="stat-icon">🏢</div><p className="stat-value">{Object.keys(byDept).length}</p><h3 className="stat-label">Departments</h3></div>
        <div className="stat-card"><div className="stat-icon">🎯</div><p className="stat-value">{[...new Set(members.map(m => m.role))].length}</p><h3 className="stat-label">Unique Roles</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v => !v)}>
        {adding ? "✕ Cancel" : "+ Add Team Member"}
      </button>

      {adding && (
        <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "20px 22px", marginBottom: 24 }}>
          <div className="workspace-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input className="workspace-input" placeholder="Full name *" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} />
              <input className="workspace-input" placeholder="Email address" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} />
              <select className="workspace-input" value={form.role} onChange={e => setForm(v => ({ ...v, role: e.target.value as Role }))}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <select className="workspace-input" value={form.department} onChange={e => setForm(v => ({ ...v, department: e.target.value }))}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <select className="workspace-input" value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value as Status }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="date" className="workspace-input" value={form.joinDate} onChange={e => setForm(v => ({ ...v, joinDate: e.target.value }))} />
            </div>
            <textarea className="workspace-textarea" placeholder="Notes / responsibilities..." value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} rows={2} />
            <button className="workspace-btn" onClick={add} disabled={!form.name.trim()}>👥 Add Member</button>
          </div>
        </div>
      )}

      {members.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">👥</div><p>No team members yet. Add your first team member to start building your roster.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {members.map((m, idx) => {
            const color = ROLE_COLORS[m.role] ?? "#6b7280";
            const avatar = AVATARS[idx % AVATARS.length];
            return (
              <div key={m.id} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: color + "20", color }}>{m.role}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: STATUS_COLOR[m.status] + "20", color: STATUS_COLOR[m.status] }}>{m.status}</span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{m.department}{m.email ? ` · ${m.email}` : ""}{m.joinDate ? ` · Joined ${new Date(m.joinDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" })}` : ""}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setExpanded(expanded === m.id ? null : m.id)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 12, cursor: "pointer" }}>{expanded === m.id ? "▲" : "▼"}</button>
                    <button onClick={() => remove(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 18 }}>🗑️</button>
                  </div>
                </div>
                {expanded === m.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>ROLE</label>
                        <select className="workspace-input" style={{ fontSize: 13, marginTop: 4 }} value={m.role} onChange={e => update(m.id, "role", e.target.value)}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
                      <div><label style={{ fontSize: 11, color: "#6b7280", fontWeight: 700 }}>STATUS</label>
                        <select className="workspace-input" style={{ fontSize: 13, marginTop: 4 }} value={m.status} onChange={e => update(m.id, "status", e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                    </div>
                    {m.notes && <p style={{ margin: "10px 0 0", fontSize: 13, color: "#374151" }}>{m.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
