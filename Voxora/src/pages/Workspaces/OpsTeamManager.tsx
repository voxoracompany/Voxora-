// ── V6.5 Operations Studio — Team Manager ─────────────────────────────────────
import { useState, useMemo, useCallback } from "react";
import { useOps } from "../../hooks/useOps";
import type { OpsTeamMember, OpsTeamMemberStatus } from "../../hooks/useOps";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const ROLES = ["CEO", "CTO", "COO", "CFO", "Product Manager", "Engineer", "Designer",
  "Marketing Manager", "Sales Manager", "Customer Success", "Operations", "HR", "Finance", "Other"];

const DEPARTMENTS = ["Engineering", "Product", "Marketing", "Sales", "Finance",
  "Operations", "HR", "Customer Success", "Legal", "Executive", "Other"];

const ALL_PERMISSIONS = [
  "View dashboards", "Edit tasks", "Manage team", "View analytics",
  "Edit workflows", "Manage SOPs", "View financials", "Admin access",
];

const STATUS_COLOR: Record<OpsTeamMemberStatus, string> = {
  active: "#10b981", inactive: "#6b7280", invited: "#f59e0b",
};

const BLANK: Omit<OpsTeamMember, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", role: "Engineer", department: "Engineering",
  permissions: ["View dashboards", "Edit tasks"],
  status: "active", activityHistory: [],
};

export default function OpsTeamManager({ setWorkspace }: Props) {
  const { team, addMember, updateMember, deleteMember, addMemberActivity } = useOps();

  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<OpsTeamMemberStatus | "all">("all");
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<OpsTeamMember | null>(null);
  const [form,        setForm]        = useState(BLANK);
  const [actNote,     setActNote]     = useState<Record<string, string>>({});
  const [expanded,    setExpanded]    = useState<string | null>(null);

  const departments = useMemo(() => {
    const set = new Set(team.map(m => m.department));
    return ["all", ...DEPARTMENTS.filter(d => set.has(d)), ...([...set].filter(d => !DEPARTMENTS.includes(d)))];
  }, [team]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return team.filter(m =>
      (filterDept   === "all" || m.department === filterDept) &&
      (filterStatus === "all" || m.status     === filterStatus) &&
      (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)),
    );
  }, [team, search, filterDept, filterStatus]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm({ ...BLANK, permissions: [...BLANK.permissions], activityHistory: [] });
    setShowForm(true);
  }, []);

  const openEdit = useCallback((m: OpsTeamMember) => {
    setEditing(m);
    setForm({ name: m.name, email: m.email, role: m.role, department: m.department,
      permissions: [...m.permissions], status: m.status, activityHistory: m.activityHistory });
    setShowForm(true);
  }, []);

  const saveForm = useCallback(() => {
    if (!form.name.trim()) return;
    if (editing) {
      updateMember(editing.id, form);
    } else {
      addMember(form);
    }
    setShowForm(false);
  }, [form, editing, addMember, updateMember]);

  const togglePermission = useCallback((perm: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
  }, []);

  const handleAddActivity = useCallback((memberId: string) => {
    const note = actNote[memberId]?.trim();
    if (!note) return;
    addMemberActivity(memberId, note);
    setActNote(prev => ({ ...prev, [memberId]: "" }));
  }, [actNote, addMemberActivity]);

  const stats = useMemo(() => ({
    total:    team.length,
    active:   team.filter(m => m.status === "active").length,
    invited:  team.filter(m => m.status === "invited").length,
    inactive: team.filter(m => m.status === "inactive").length,
  }), [team]);

  return (
    <div className="workspace-container" style={{ maxWidth: 1050 }}>
      <button className="back-btn" onClick={() => setWorkspace("opsStudio")}>← Back to Operations Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>👥 Team Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>
            {stats.total} members · {stats.active} active · {stats.invited} invited · {stats.inactive} inactive
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              const name = prompt("Invite by email:");
              if (name) addMember({ ...BLANK, name, email: name, status: "invited", activityHistory: [] });
            }}
            style={{ padding: "9px 18px", border: "1.5px solid #6C63FF", borderRadius: 10, background: "#6C63FF15", cursor: "pointer", fontSize: 14, color: "#6C63FF", fontWeight: 600 }}
          >✉️ Invite</button>
          <button className="workspace-btn" onClick={openAdd}>+ Add Member</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input className="workspace-input" placeholder="🔍 Search members…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <select className="workspace-input" value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ minWidth: 160 }}>
          <option value="all">All Departments</option>
          {departments.filter(d => d !== "all").map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="workspace-input" value={filterStatus} onChange={e => setFilterStatus(e.target.value as OpsTeamMemberStatus | "all")} style={{ minWidth: 140 }}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700 }}>{editing ? "Edit Member" : "Add Team Member"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={lbl}>NAME *</label>
              <input className="workspace-input" style={{ width: "100%" }} placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>EMAIL</label>
              <input className="workspace-input" type="email" style={{ width: "100%" }} placeholder="email@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={lbl}>ROLE</label>
              <select className="workspace-input" style={{ width: "100%" }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>DEPARTMENT</label>
              <select className="workspace-input" style={{ width: "100%" }} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>STATUS</label>
              <select className="workspace-input" style={{ width: "100%" }} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as OpsTeamMemberStatus }))}>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label style={lbl}>PERMISSIONS</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                {ALL_PERMISSIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePermission(p)}
                    style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                      border: form.permissions.includes(p) ? "1.5px solid #6C63FF" : "1.5px solid var(--border, #e5e7eb)",
                      background: form.permissions.includes(p) ? "#ede9fe" : "transparent",
                      color: form.permissions.includes(p) ? "#6C63FF" : "var(--text-muted, #6b7280)",
                      fontWeight: form.permissions.includes(p) ? 600 : 400,
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="workspace-btn" onClick={saveForm}>{editing ? "Save Changes" : "Add Member"}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--border, #e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--text, #111827)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Members list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted, #6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p style={{ fontSize: 16, margin: 0 }}>{team.length === 0 ? "No team members yet. Add your first member!" : "No members match your filters."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(m => (
            <div key={m.id} style={{ background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e5e7eb)", borderRadius: 14, overflow: "hidden" }}>
              {/* Header row */}
              <div
                style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flexWrap: "wrap" }}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
              >
                {/* Avatar */}
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                  background: `hsl(${m.name.charCodeAt(0) * 7 % 360}, 60%, 50%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 16,
                }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text, #111827)" }}>{m.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: STATUS_COLOR[m.status] + "20", color: STATUS_COLOR[m.status] }}>{m.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>
                    {m.role} · {m.department}{m.email ? ` · ${m.email}` : ""}
                  </div>
                </div>
                {/* Permissions preview */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 260 }}>
                  {m.permissions.slice(0, 3).map(p => (
                    <span key={p} style={{ fontSize: 11, padding: "2px 7px", borderRadius: 12, background: "#ede9fe", color: "#6C63FF" }}>{p}</span>
                  ))}
                  {m.permissions.length > 3 && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 12, background: "#f3f4f6", color: "#6b7280" }}>+{m.permissions.length - 3}</span>}
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => openEdit(m)} style={{ background: "none", border: "1px solid var(--border, #e5e7eb)", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "var(--text, #111827)" }}>Edit</button>
                  <button onClick={() => deleteMember(m.id)} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: "#ef4444" }}>Remove</button>
                </div>
                <span style={{ color: "var(--text-muted, #6b7280)", fontSize: 12 }}>{expanded === m.id ? "▲" : "▼"}</span>
              </div>

              {/* Expanded: activity history */}
              {expanded === m.id && (
                <div style={{ borderTop: "1px solid var(--border, #e5e7eb)", padding: "14px 18px" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--text-muted, #6b7280)" }}>ACTIVITY HISTORY</h4>
                  {(m.activityHistory ?? []).length === 0 && (
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-muted, #6b7280)" }}>No activity logged yet.</p>
                  )}
                  {(m.activityHistory ?? []).slice(0, 5).map((act, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: "var(--text-muted, #6b7280)", flexShrink: 0 }}>{act.date.slice(0, 10)}</span>
                      <span style={{ color: "var(--text, #111827)" }}>{act.note}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input className="workspace-input" style={{ flex: 1 }} placeholder="Log activity note…" value={actNote[m.id] ?? ""} onChange={e => setActNote(prev => ({ ...prev, [m.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleAddActivity(m.id)} />
                    <button className="workspace-btn" style={{ padding: "8px 16px", fontSize: 13 }} onClick={() => handleAddActivity(m.id)}>Log</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, marginBottom: 5, color: "var(--text-muted, #6b7280)" };
