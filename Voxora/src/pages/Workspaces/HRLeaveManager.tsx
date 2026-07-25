// ── V6.6 Leave Manager ────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import type { LeaveRequest, LeaveType, LeaveStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const LEAVE_TYPES: LeaveType[] = ["annual", "sick", "maternity", "paternity", "unpaid", "other"];
const LEAVE_STATUSES: LeaveStatus[] = ["pending", "approved", "rejected"];

const STATUS_COLORS: Record<LeaveStatus, { bg: string; color: string }> = {
  pending:  { bg: "#fef3c7", color: "#92400e" },
  approved: { bg: "#d1fae5", color: "#065f46" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },
};

const TYPE_ICONS: Record<LeaveType, string> = {
  annual: "🏖️", sick: "🤒", maternity: "👶", paternity: "👨‍👶",
  unpaid: "💸", other: "📋",
};

const BLANK: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt"> = {
  employeeId: "", employeeName: "", type: "annual",
  startDate: "", endDate: "", days: 1,
  status: "pending", notes: "", reviewedBy: "",
};

// Compute leave balance (annual allowance: 20 days, sick: 10, maternity: 90, paternity: 14)
const ALLOWANCES: Record<LeaveType, number> = {
  annual: 20, sick: 10, maternity: 90, paternity: 14, unpaid: 365, other: 5,
};

export default function HRLeaveManager({ setWorkspace }: Props) {
  const { employees, leaves, addLeave, updateLeave, deleteLeave } = useHR();

  const [tab,       setTab]       = useState<"all" | "pending" | "approved" | "rejected" | "balance">("all");
  const [search,    setSearch]    = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<LeaveRequest | null>(null);
  const [form,      setForm]      = useState(BLANK);

  const filtered = useMemo(() => {
    let list = [...leaves];
    if (tab !== "all" && tab !== "balance") list = list.filter(l => l.status === tab);
    if (search)      list = list.filter(l => `${l.employeeName} ${l.type}`.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") list = list.filter(l => l.type === typeFilter);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [leaves, tab, search, typeFilter]);

  // Balance per employee
  const balances = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    const names = [...new Set(leaves.map(l => l.employeeName))].filter(Boolean);
    return names.map(name => {
      const balance: Record<string, { used: number; remaining: number }> = {};
      LEAVE_TYPES.forEach(type => {
        const used = leaves.filter(l =>
          l.employeeName === name &&
          l.type === type &&
          l.status === "approved" &&
          l.startDate.startsWith(currentYear)
        ).reduce((acc, l) => acc + (l.days || 0), 0);
        balance[type] = { used, remaining: Math.max(0, ALLOWANCES[type] - used) };
      });
      return { name, balance };
    });
  }, [leaves]);

  const openAdd  = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (l: LeaveRequest) => {
    setForm({ employeeId: l.employeeId, employeeName: l.employeeName, type: l.type, startDate: l.startDate, endDate: l.endDate, days: l.days, status: l.status, notes: l.notes, reviewedBy: l.reviewedBy });
    setEditing(l); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.employeeName.trim() || !form.startDate) return;
    editing ? updateLeave(editing.id, form) : addLeave(form);
    setShowForm(false); setEditing(null);
  };

  const approve = (id: string) => updateLeave(id, { status: "approved", reviewedBy: "HR Manager" });
  const reject  = (id: string) => updateLeave(id, { status: "rejected", reviewedBy: "HR Manager" });

  const counts = {
    pending:  leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length,
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🏖️ Leave Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>
            {counts.pending} pending · {counts.approved} approved · {counts.rejected} rejected
          </p>
        </div>
        <button className="workspace-btn" onClick={openAdd} style={{ background: "#3b82f6" }}>+ Request Leave</button>
      </div>

      {/* Stats */}
      <div className="stats" style={{ marginBottom: 24 }}>
        {[
          { label: "Pending",  val: counts.pending,  icon: "⏳", color: "#92400e" },
          { label: "Approved", val: counts.approved, icon: "✅", color: "#065f46" },
          { label: "Rejected", val: counts.rejected, icon: "❌", color: "#991b1b" },
          { label: "Total",    val: leaves.length,   icon: "📋", color: "#1e40af" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value" style={{ color: s.color }}>{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border,#e5e7eb)", flexWrap: "wrap" }}>
        {(["all", "pending", "approved", "rejected", "balance"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", border: "none", borderBottom: tab === t ? "2px solid #3b82f6" : "2px solid transparent", background: "transparent", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#3b82f6" : "var(--text-muted,#6b7280)", fontSize: 14, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Balance Tab */}
      {tab === "balance" && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Leave Balance — {new Date().getFullYear()}</h3>
          {balances.length === 0 ? (
            <p style={{ color: "var(--text-muted,#6b7280)", textAlign: "center", padding: "40px 0" }}>No leave data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {balances.map(emp => (
                <div key={emp.name} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{emp.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {LEAVE_TYPES.map(type => (
                      <div key={type} style={{ flex: "1 1 140px", background: "var(--bg,#f9fafb)", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", fontWeight: 600, marginBottom: 4 }}>{TYPE_ICONS[type]} {type}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: emp.balance[type].remaining > 0 ? "#065f46" : "#991b1b" }}>{emp.balance[type].remaining}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted,#9ca3af)" }}>of {ALLOWANCES[type]} · used {emp.balance[type].used}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leave List */}
      {tab !== "balance" && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <input type="text" placeholder="Search employee, type…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
              <option value="all">All Types</option>
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted,#6b7280)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏖️</div>
              <p style={{ fontSize: 15 }}>No leave requests found</p>
              <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 12, background: "#3b82f6" }}>+ Request Leave</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map(l => (
                <div key={l.id} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICONS[l.type]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{l.employeeName}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                      {l.type} leave · {l.startDate} → {l.endDate} · {l.days} day{l.days !== 1 ? "s" : ""}
                    </div>
                    {l.notes && <div style={{ fontSize: 12, color: "var(--text-muted,#9ca3af)", marginTop: 2 }}>{l.notes}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[l.status].bg, color: STATUS_COLORS[l.status].color }}>{l.status}</span>
                    {l.status === "pending" && (
                      <>
                        <button onClick={() => approve(l.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Approve</button>
                        <button onClick={() => reject(l.id)} style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Reject</button>
                      </>
                    )}
                    <button onClick={() => openEdit(l)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 12 }}>Edit</button>
                    <button onClick={() => deleteLeave(l.id)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "Edit Leave Request" : "New Leave Request"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Employee Name *</label>
                <input type="text" value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} list="emp-list"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <datalist id="emp-list">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Leave Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as LeaveType }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Number of Days</label>
                <input type="number" min={1} value={form.days} onChange={e => setForm(f => ({ ...f, days: Number(e.target.value) }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as LeaveStatus }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {LEAVE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, resize: "vertical", background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#3b82f6" }}>{editing ? "Save Changes" : "Submit Request"}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
