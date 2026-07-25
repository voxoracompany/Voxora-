// ── V6.6 Employee Manager ─────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import type { Employee, EmploymentStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Product", "Design", "Legal", "Support"];
const STATUSES: EmploymentStatus[] = ["active", "inactive", "on-leave", "terminated"];
const STATUS_COLORS: Record<EmploymentStatus, { bg: string; color: string }> = {
  active:     { bg: "#d1fae5", color: "#065f46" },
  inactive:   { bg: "#f3f4f6", color: "#374151" },
  "on-leave": { bg: "#fef3c7", color: "#92400e" },
  terminated: { bg: "#fee2e2", color: "#991b1b" },
};

const BLANK: Omit<Employee, "id" | "createdAt" | "updatedAt"> = {
  name: "", email: "", phone: "", department: "Engineering", role: "",
  status: "active", startDate: "", address: "", notes: "",
};

export default function HREmployeeManager({ setWorkspace }: Props) {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useHR();

  const [search,  setSearch]  = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy,  setSortBy]  = useState<"name" | "department" | "startDate">("name");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Employee | null>(null);
  const [form, setForm] = useState(BLANK);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...employees];
    if (search)           list = list.filter(e => `${e.name} ${e.email} ${e.role} ${e.department}`.toLowerCase().includes(search.toLowerCase()));
    if (deptFilter !== "all")   list = list.filter(e => e.department === deptFilter);
    if (statusFilter !== "all") list = list.filter(e => e.status === statusFilter);
    list.sort((a, b) => (a[sortBy] ?? "").localeCompare(b[sortBy] ?? ""));
    return list;
  }, [employees, search, deptFilter, statusFilter, sortBy]);

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true); };
  const openEdit = (e: Employee) => { setForm({ name: e.name, email: e.email, phone: e.phone, department: e.department, role: e.role, status: e.status, startDate: e.startDate, address: e.address, notes: e.notes }); setEditing(e); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateEmployee(editing.id, form);
    } else {
      addEmployee(form);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setConfirmDelete(null);
  };

  const depts = [...new Set(employees.map(e => e.department))].filter(Boolean);

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>👤 Employee Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted, #6b7280)", fontSize: 14 }}>
            {employees.length} employees · {employees.filter(e => e.status === "active").length} active
          </p>
        </div>
        <button className="workspace-btn" onClick={openAdd} style={{ background: "#6C63FF" }}>+ Add Employee</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search name, email, role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}
        />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="name">Sort: Name</option>
          <option value="department">Sort: Department</option>
          <option value="startDate">Sort: Start Date</option>
        </select>
      </div>

      {/* Department Summary */}
      {depts.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {depts.map(d => (
            <span key={d} style={{ padding: "4px 12px", borderRadius: 20, background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", cursor: "pointer" }}
              onClick={() => setDeptFilter(deptFilter === d ? "all" : d)}>
              {d} ({employees.filter(e => e.department === d).length})
            </span>
          ))}
        </div>
      )}

      {/* Employee List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No employees found</p>
          <p style={{ fontSize: 14 }}>Add your first employee to get started.</p>
          <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 16, background: "#6C63FF" }}>+ Add Employee</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(emp => (
            <div key={emp.id} style={{
              background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)",
              borderRadius: 12, padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#6C63FF", flexShrink: 0 }}>
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text,#111827)" }}>{emp.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                  {emp.role} · {emp.department}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted,#9ca3af)", marginTop: 2 }}>
                  {emp.email}{emp.phone ? ` · ${emp.phone}` : ""}
                  {emp.startDate ? ` · Started ${emp.startDate}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[emp.status].bg, color: STATUS_COLORS[emp.status].color }}>
                  {emp.status}
                </span>
                <button onClick={() => openEdit(emp)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text,#111827)" }}>Edit</button>
                <button onClick={() => setConfirmDelete(emp.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 13, color: "#dc2626" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 700 }}>{editing ? "Edit Employee" : "Add Employee"}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {([
                ["Name *", "name", "text"],
                ["Email", "email", "email"],
                ["Phone", "phone", "tel"],
                ["Role / Job Title", "role", "text"],
                ["Start Date", "startDate", "date"],
              ] as [string, keyof typeof BLANK, string][]).map(([label, key, type]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>{label}</label>
                  <input type={type} value={String(form[key])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Department</label>
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EmploymentStatus }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Address</label>
              <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, resize: "vertical", background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#6C63FF" }}>{editing ? "Save Changes" : "Add Employee"}</button>
              <button onClick={closeForm} style={{ flex: 1, padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14, color: "var(--text,#111827)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 16, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Delete Employee?</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--text-muted,#6b7280)" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Delete</button>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
