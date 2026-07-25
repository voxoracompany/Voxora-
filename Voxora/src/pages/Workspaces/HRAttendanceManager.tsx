// ── V6.6 Attendance Manager ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import type { AttendanceRecord, AttendanceStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const STATUSES: AttendanceStatus[] = ["present", "absent", "leave", "half-day"];
const STATUS_COLORS: Record<AttendanceStatus, { bg: string; color: string }> = {
  present:  { bg: "#d1fae5", color: "#065f46" },
  absent:   { bg: "#fee2e2", color: "#991b1b" },
  leave:    { bg: "#fef3c7", color: "#92400e" },
  "half-day": { bg: "#dbeafe", color: "#1e40af" },
};

const today = new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const BLANK: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt"> = {
  employeeId: "", employeeName: "", date: today,
  clockIn: "", clockOut: "", status: "present", notes: "",
};

export default function HRAttendanceManager({ setWorkspace }: Props) {
  const { employees, attendance, addAttendance, updateAttendance, deleteAttendance } = useHR();

  const [dateFilter, setDateFilter] = useState(today);
  const [monthView,  setMonthView]  = useState(today.slice(0, 7));
  const [tab,        setTab]        = useState<"daily" | "history" | "summary">("daily");
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<AttendanceRecord | null>(null);
  const [form,       setForm]       = useState(BLANK);

  const dailyRecords = useMemo(() => attendance.filter(a => a.date === dateFilter), [attendance, dateFilter]);
  const historyRecords = useMemo(() => [...attendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50), [attendance]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const records = attendance.filter(a => a.date.startsWith(monthView));
    const names = [...new Set(records.map(r => r.employeeName))].filter(Boolean);
    return names.map(name => {
      const recs = records.filter(r => r.employeeName === name);
      return {
        name,
        present:  recs.filter(r => r.status === "present").length,
        absent:   recs.filter(r => r.status === "absent").length,
        leave:    recs.filter(r => r.status === "leave").length,
        halfDay:  recs.filter(r => r.status === "half-day").length,
        total:    recs.length,
      };
    });
  }, [attendance, monthView]);

  const clockIn = (empId: string, empName: string) => {
    const existing = attendance.find(a => a.date === today && a.employeeId === empId);
    if (existing) {
      updateAttendance(existing.id, { clockIn: nowTime(), status: "present" });
    } else {
      addAttendance({ employeeId: empId, employeeName: empName, date: today, clockIn: nowTime(), clockOut: "", status: "present", notes: "" });
    }
  };

  const clockOut = (empId: string) => {
    const existing = attendance.find(a => a.date === today && a.employeeId === empId);
    if (existing) updateAttendance(existing.id, { clockOut: nowTime() });
  };

  const openEdit = (r: AttendanceRecord) => {
    setForm({ employeeId: r.employeeId, employeeName: r.employeeName, date: r.date, clockIn: r.clockIn, clockOut: r.clockOut, status: r.status, notes: r.notes });
    setEditing(r); setShowForm(true);
  };

  const openAdd = () => { setForm({ ...BLANK, date: dateFilter }); setEditing(null); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.employeeName.trim()) return;
    editing ? updateAttendance(editing.id, form) : addAttendance(form);
    setShowForm(false); setEditing(null);
  };

  const todayPresent = attendance.filter(a => a.date === today && a.status === "present").length;
  const todayAbsent  = attendance.filter(a => a.date === today && a.status === "absent").length;
  const todayLeave   = attendance.filter(a => a.date === today && a.status === "leave").length;

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>🕐 Attendance Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Today: {todayPresent} present · {todayAbsent} absent · {todayLeave} on leave</p>
        </div>
        <button className="workspace-btn" onClick={openAdd} style={{ background: "#f59e0b" }}>+ Add Record</button>
      </div>

      {/* Today Quick Clock */}
      {employees.length > 0 && (
        <div style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>⚡ Quick Clock — {today}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {employees.filter(e => e.status === "active").slice(0, 10).map(emp => {
              const rec = attendance.find(a => a.date === today && a.employeeId === emp.id);
              return (
                <div key={emp.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "var(--bg,#f9fafb)", borderRadius: 8 }}>
                  <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{emp.name} <span style={{ fontWeight: 400, color: "var(--text-muted,#6b7280)", fontSize: 12 }}>· {emp.department}</span></div>
                  {rec ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                      {rec.clockIn && <span>In: {rec.clockIn}</span>}
                      {rec.clockOut && <span>Out: {rec.clockOut}</span>}
                      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_COLORS[rec.status].bg, color: STATUS_COLORS[rec.status].color }}>{rec.status}</span>
                      {!rec.clockOut && <button onClick={() => clockOut(emp.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clock Out</button>}
                    </div>
                  ) : (
                    <button onClick={() => clockIn(emp.id, emp.name)} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#10b981", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clock In</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border,#e5e7eb)", paddingBottom: 0 }}>
        {(["daily", "history", "summary"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", border: "none", borderBottom: tab === t ? "2px solid #6C63FF" : "2px solid transparent", background: "transparent", cursor: "pointer", fontWeight: tab === t ? 700 : 500, color: tab === t ? "#6C63FF" : "var(--text-muted,#6b7280)", fontSize: 14, textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {/* Daily Tab */}
      {tab === "daily" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Date:</label>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
          </div>
          {dailyRecords.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted,#6b7280)" }}>
              <p style={{ fontSize: 15 }}>No attendance records for {dateFilter}</p>
              <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 12, background: "#f59e0b" }}>+ Add Record</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dailyRecords.map(r => (
                <div key={r.id} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.employeeName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                      {r.clockIn ? `In: ${r.clockIn}` : "Not clocked in"}{r.clockOut ? ` · Out: ${r.clockOut}` : ""}
                      {r.notes ? ` · ${r.notes}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[r.status].bg, color: STATUS_COLORS[r.status].color }}>{r.status}</span>
                  <button onClick={() => openEdit(r)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 12 }}>Edit</button>
                  <button onClick={() => deleteAttendance(r.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {historyRecords.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)", textAlign: "center", padding: "40px 0" }}>No attendance history yet.</p> : historyRecords.map(r => (
            <div key={r.id} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.employeeName} <span style={{ fontWeight: 400, color: "var(--text-muted,#6b7280)", fontSize: 12 }}>· {r.date}</span></div>
                <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>
                  {r.clockIn ? `In: ${r.clockIn}` : "No clock-in"}{r.clockOut ? ` · Out: ${r.clockOut}` : ""}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[r.status].bg, color: STATUS_COLORS[r.status].color }}>{r.status}</span>
              <button onClick={() => deleteAttendance(r.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Summary Tab */}
      {tab === "summary" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Month:</label>
            <input type="month" value={monthView} onChange={e => setMonthView(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
          </div>
          {monthlySummary.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)", textAlign: "center", padding: "40px 0" }}>No data for this month.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "var(--bg-card,#fff)" }}>
                    {["Employee", "Present", "Absent", "Leave", "Half-Day", "Total"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border,#e5e7eb)", color: "var(--text,#111827)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map(row => (
                    <tr key={row.name} style={{ borderBottom: "1px solid var(--border,#e5e7eb)" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: "10px 16px", color: "#065f46" }}>{row.present}</td>
                      <td style={{ padding: "10px 16px", color: "#991b1b" }}>{row.absent}</td>
                      <td style={{ padding: "10px 16px", color: "#92400e" }}>{row.leave}</td>
                      <td style={{ padding: "10px 16px", color: "#1e40af" }}>{row.halfDay}</td>
                      <td style={{ padding: "10px 16px", fontWeight: 700 }}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 480 }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "Edit Record" : "Add Attendance Record"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Employee Name", "employeeName", "text"], ["Employee ID", "employeeId", "text"], ["Date", "date", "date"], ["Clock In", "clockIn", "time"], ["Clock Out", "clockOut", "time"]].map(([label, key, type]) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
                  <input type={type} value={String(form[key as keyof typeof form])} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    list={key === "employeeName" ? "emp-names" : undefined}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
              ))}
              <datalist id="emp-names">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AttendanceStatus }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#f59e0b" }}>{editing ? "Save" : "Add Record"}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
