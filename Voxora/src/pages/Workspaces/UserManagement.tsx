// ── V5.8 User Management ──────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useAuth }           from "../../context/AuthContext";
import { AuditLogService }   from "../../services/admin/AuditLogService";
import type { AdminUser, UserRole, UserStatus } from "../../services/admin/AdminTypes";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

const ROLE_COLORS: Record<UserRole, string> = {
  owner:  "#6C63FF",
  admin:  "#2563eb",
  team:   "#059669",
  user:   "#64748b",
};

const ROLE_LABELS: Record<UserRole, string> = {
  owner:  "👑 Owner",
  admin:  "🛡️ Admin",
  team:   "👥 Team",
  user:   "👤 User",
};

const STATUS_COLORS: Record<UserStatus, string> = {
  active:    "#10b981",
  suspended: "#f59e0b",
  pending:   "#6366f1",
  deleted:   "#ef4444",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function UserManagement({ setWorkspace }: Props) {
  const { user } = useAuth();

  const demoUsers: AdminUser[] = useMemo(() => [
    {
      id:            "demo-user",
      name:          user?.name || localStorage.getItem("voxora-name") || "Demo User",
      email:         user?.email || "demo@voxora.ai",
      role:          "owner",
      status:        "active",
      avatarEmoji:   user?.avatarEmoji || "🚀",
      createdAt:     new Date(Date.now() - 7 * 86400000).toISOString(),
      lastLogin:     new Date().toISOString(),
      projectCount:  parseInt(localStorage.getItem("voxora-projects") || "[]") > 0
                       ? JSON.parse(localStorage.getItem("voxora-projects") || "[]").length
                       : 0,
      aiRequests:    parseInt(localStorage.getItem("voxora-chat-count") || "0"),
      plan:          "Pro",
      emailVerified: user?.emailVerified ?? true,
    },
  ], [user]);

  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter]   = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole]         = useState<UserRole | null>(null);
  const [toast, setToast]               = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const filtered = useMemo(() => {
    return demoUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole   = roleFilter   === "all" || u.role   === roleFilter;
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [demoUsers, search, roleFilter, statusFilter]);

  const handleEditRole = (newRole: UserRole) => {
    setEditRole(null);
    AuditLogService.log("user_role_change", `Role changed to ${newRole} for ${selectedUser?.name}`);
    showToast(`✅ Role updated to ${newRole} (demo)`);
  };

  const handleSuspend = (u: AdminUser) => {
    AuditLogService.log("user_suspend", `User suspended: ${u.name}`);
    showToast("⚠️ User suspended (demo)");
  };

  const handleReactivate = (u: AdminUser) => {
    AuditLogService.log("user_reactivate", `User reactivated: ${u.name}`);
    showToast("✅ User reactivated (demo)");
  };

  const handleDelete = (u: AdminUser) => {
    AuditLogService.log("user_delete", `User deleted: ${u.name}`);
    showToast("🗑️ User deleted (demo)");
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("adminDashboard")}>← Back to Admin</button>

      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-header">
        <h1>👥 User Management</h1>
        <p className="workspace-subtitle">View, search, and manage platform users.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <span className="admin-badge admin-badge--blue">V5.8</span>
          <span className="admin-badge">Demo Mode</span>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-filter-row">
          <input
            className="admin-search-input"
            placeholder="🔍  Search users by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="admin-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}>
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="team">Team</option>
            <option value="user">User</option>
          </select>
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", margin: "8px 0 0" }}>
          Showing {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* User Table */}
      <div className="admin-card" style={{ overflowX: "auto" }}>
        <h3>Platform Users</h3>
        {filtered.length === 0 ? (
          <p className="admin-empty-text">No users match your filters.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Projects</th>
                <th>AI Requests</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{u.avatarEmoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary,#64748b)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="admin-role-badge"
                      style={{ background: ROLE_COLORS[u.role] + "22", color: ROLE_COLORS[u.role], border: `1px solid ${ROLE_COLORS[u.role]}44` }}
                    >
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <span className="admin-status-badge" style={{ color: STATUS_COLORS[u.status] }}>
                      <span className="admin-status-dot" style={{ background: STATUS_COLORS[u.status] }} />
                      {u.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.plan}</td>
                  <td style={{ fontSize: 13, textAlign: "center" }}>{u.projectCount}</td>
                  <td style={{ fontSize: 13, textAlign: "center" }}>{u.aiRequests}</td>
                  <td style={{ fontSize: 12, color: "var(--text-secondary,#64748b)" }}>{timeAgo(u.lastLogin)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="admin-icon-btn" onClick={() => setSelectedUser(u)} title="View Profile">👁️</button>
                      <button className="admin-icon-btn" onClick={() => { setSelectedUser(u); setEditRole(u.role); }} title="Edit Role">✏️</button>
                      {u.status === "active"
                        ? <button className="admin-icon-btn admin-icon-btn--warn" onClick={() => handleSuspend(u)} title="Suspend">⛔</button>
                        : <button className="admin-icon-btn admin-icon-btn--ok" onClick={() => handleReactivate(u)} title="Reactivate">✅</button>
                      }
                      <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => handleDelete(u)} title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* User Profile Panel */}
      {selectedUser && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3>👤 User Profile — {selectedUser.name}</h3>
            <button className="admin-icon-btn" onClick={() => { setSelectedUser(null); setEditRole(null); }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginTop: 12 }}>
            {[
              { label: "Name",           value: selectedUser.name },
              { label: "Email",          value: selectedUser.email },
              { label: "Role",           value: ROLE_LABELS[selectedUser.role] },
              { label: "Status",         value: selectedUser.status },
              { label: "Plan",           value: selectedUser.plan },
              { label: "Email Verified", value: selectedUser.emailVerified ? "✅ Verified" : "❌ Unverified" },
              { label: "Projects",       value: String(selectedUser.projectCount) },
              { label: "AI Requests",    value: String(selectedUser.aiRequests) },
              { label: "Member Since",   value: new Date(selectedUser.createdAt).toLocaleDateString() },
              { label: "Last Login",     value: timeAgo(selectedUser.lastLogin) },
            ].map((f) => (
              <div key={f.label} className="admin-field">
                <div className="admin-field-label">{f.label}</div>
                <div className="admin-field-value">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Edit Role */}
          {editRole !== null && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Change Role:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["owner","admin","team","user"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    className={`admin-action-btn ${editRole === r ? "admin-action-btn--primary" : ""}`}
                    onClick={() => handleEditRole(r)}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Role Guide */}
      <div className="admin-card">
        <h3>📖 Role Guide</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
            <div key={role} className="admin-field" style={{ borderLeft: `3px solid ${ROLE_COLORS[role]}` }}>
              <div className="admin-field-label">{label}</div>
              <div className="admin-field-value" style={{ fontSize: 12, color: "var(--text-secondary,#64748b)" }}>
                {role === "owner"  && "Full platform access. Cannot be modified."}
                {role === "admin"  && "Manage users, settings, and monitoring."}
                {role === "team"   && "Access to collaboration and project tools."}
                {role === "user"   && "Standard access to AI and workspace tools."}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
