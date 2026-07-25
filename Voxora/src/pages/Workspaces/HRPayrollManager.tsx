// ── V6.6 Payroll Manager ──────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import type { PayrollRecord, PayrollStatus } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUSES: PayrollStatus[] = ["draft", "processed", "paid"];
const STATUS_COLORS: Record<PayrollStatus, { bg: string; color: string }> = {
  draft:     { bg: "#f3f4f6", color: "#374151" },
  processed: { bg: "#fef3c7", color: "#92400e" },
  paid:      { bg: "#d1fae5", color: "#065f46" },
};

const thisYear  = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

const BLANK: Omit<PayrollRecord, "id" | "createdAt" | "updatedAt"> = {
  employeeId: "", employeeName: "", month: thisMonth, year: thisYear,
  baseSalary: 0, bonuses: 0, deductions: 0, netPay: 0,
  status: "draft", notes: "",
};

function calcNet(f: typeof BLANK) {
  return Math.max(0, f.baseSalary + f.bonuses - f.deductions);
}

function exportCSV(records: PayrollRecord[]) {
  const header = "Name,Month,Year,Base Salary,Bonuses,Deductions,Net Pay,Status\n";
  const rows = records.map(r =>
    `"${r.employeeName}",${MONTHS[r.month - 1]},${r.year},${r.baseSalary},${r.bonuses},${r.deductions},${r.netPay},${r.status}`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "payroll.csv"; a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(records: PayrollRecord[]) {
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "payroll.json"; a.click();
  URL.revokeObjectURL(url);
}

function exportMarkdown(records: PayrollRecord[]) {
  const header = "| Name | Month | Year | Base | Bonuses | Deductions | Net Pay | Status |\n|---|---|---|---|---|---|---|---|\n";
  const rows = records.map(r =>
    `| ${r.employeeName} | ${MONTHS[r.month-1]} | ${r.year} | ${r.baseSalary} | ${r.bonuses} | ${r.deductions} | ${r.netPay} | ${r.status} |`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "payroll.md"; a.click();
  URL.revokeObjectURL(url);
}

export default function HRPayrollManager({ setWorkspace }: Props) {
  const { employees, payroll, addPayroll, updatePayroll, deletePayroll } = useHR();

  const [search,      setSearch]      = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter,  setYearFilter]  = useState(String(thisYear));
  const [statusFilter,setStatusFilter]= useState("all");
  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState<PayrollRecord | null>(null);
  const [form,        setForm]        = useState(BLANK);

  const filtered = useMemo(() => {
    let list = [...payroll];
    if (search)               list = list.filter(r => r.employeeName.toLowerCase().includes(search.toLowerCase()));
    if (monthFilter !== "all") list = list.filter(r => r.month === Number(monthFilter));
    if (yearFilter)            list = list.filter(r => r.year === Number(yearFilter));
    if (statusFilter !== "all") list = list.filter(r => r.status === statusFilter);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [payroll, search, monthFilter, yearFilter, statusFilter]);

  const totalNet      = filtered.reduce((acc, r) => acc + r.netPay, 0);
  const totalSalary   = filtered.reduce((acc, r) => acc + r.baseSalary, 0);
  const totalBonuses  = filtered.reduce((acc, r) => acc + r.bonuses, 0);
  const totalDeductions = filtered.reduce((acc, r) => acc + r.deductions, 0);

  const openAdd = () => {
    setForm({ ...BLANK }); setEditing(null); setShowForm(true);
  };
  const openEdit = (r: PayrollRecord) => {
    setForm({ employeeId: r.employeeId, employeeName: r.employeeName, month: r.month, year: r.year, baseSalary: r.baseSalary, bonuses: r.bonuses, deductions: r.deductions, netPay: r.netPay, status: r.status, notes: r.notes });
    setEditing(r); setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.employeeName.trim()) return;
    const net = calcNet(form);
    const record = { ...form, netPay: net };
    editing ? updatePayroll(editing.id, record) : addPayroll(record);
    setShowForm(false); setEditing(null);
  };

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>💵 Payroll Manager</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>{payroll.length} payroll records</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => exportCSV(filtered)}      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text,#111827)", fontWeight: 600 }}>⬇ CSV</button>
          <button onClick={() => exportMarkdown(filtered)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text,#111827)", fontWeight: 600 }}>⬇ MD</button>
          <button onClick={() => exportJSON(filtered)}     style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, color: "var(--text,#111827)", fontWeight: 600 }}>⬇ JSON</button>
          <button className="workspace-btn" onClick={openAdd} style={{ background: "#8b5cf6" }}>+ Add Payroll</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Salary",     val: fmt(totalSalary),    icon: "💰" },
          { label: "Total Bonuses",    val: fmt(totalBonuses),   icon: "🎁" },
          { label: "Total Deductions", val: fmt(totalDeductions),icon: "➖" },
          { label: "Net Payroll",      val: fmt(totalNet),       icon: "💵" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value" style={{ fontSize: 18 }}>{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input type="text" placeholder="Search employee…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Months</option>
          {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
        </select>
        <input type="number" value={yearFilter} onChange={e => setYearFilter(e.target.value)} placeholder="Year" min={2020} max={2040}
          style={{ width: 90, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Payroll Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted,#6b7280)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💵</div>
          <p style={{ fontSize: 15 }}>No payroll records found</p>
          <button className="workspace-btn" onClick={openAdd} style={{ marginTop: 12, background: "#8b5cf6" }}>+ Add Payroll Record</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--bg-card,#fff)" }}>
                {["Employee", "Month/Year", "Base Salary", "Bonuses", "Deductions", "Net Pay", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border,#e5e7eb)", color: "var(--text,#111827)", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border,#e5e7eb)" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600 }}>{r.employeeName}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text-muted,#6b7280)" }}>{MONTHS[r.month-1]} {r.year}</td>
                  <td style={{ padding: "10px 14px" }}>{fmt(r.baseSalary)}</td>
                  <td style={{ padding: "10px 14px", color: "#065f46" }}>{fmt(r.bonuses)}</td>
                  <td style={{ padding: "10px 14px", color: "#991b1b" }}>{fmt(r.deductions)}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }}>{fmt(r.netPay)}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: STATUS_COLORS[r.status].bg, color: STATUS_COLORS[r.status].color }}>{r.status}</span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(r)} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 12 }}>Edit</button>
                      {r.status !== "paid" && (
                        <button onClick={() => updatePayroll(r.id, { status: r.status === "draft" ? "processed" : "paid" })} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: r.status === "draft" ? "#f59e0b" : "#10b981", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                          {r.status === "draft" ? "Process" : "Mark Paid"}
                        </button>
                      )}
                      <button onClick={() => deletePayroll(r.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #fca5a5", background: "transparent", cursor: "pointer", fontSize: 12, color: "#dc2626" }}>×</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card,#fff)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700 }}>{editing ? "Edit Payroll Record" : "Add Payroll Record"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Employee Name *</label>
                <input type="text" value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} list="emp-pay-list"
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                <datalist id="emp-pay-list">{employees.map(e => <option key={e.id} value={e.name} />)}</datalist>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Month</label>
                  <select value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                    {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Year</label>
                  <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} min={2020} max={2040}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Base Salary ($)</label>
                  <input type="number" value={form.baseSalary} min={0} onChange={e => setForm(f => ({ ...f, baseSalary: Number(e.target.value) }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Bonuses ($)</label>
                  <input type="number" value={form.bonuses} min={0} onChange={e => setForm(f => ({ ...f, bonuses: Number(e.target.value) }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Deductions ($)</label>
                  <input type="number" value={form.deductions} min={0} onChange={e => setForm(f => ({ ...f, deductions: Number(e.target.value) }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 13, fontWeight: 600 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PayrollStatus }))}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ background: "var(--bg,#f9fafb)", borderRadius: 10, padding: "12px 16px", fontSize: 15, fontWeight: 700 }}>
                Net Pay: {fmt(calcNet(form))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", fontSize: 14, resize: "vertical", background: "var(--bg-card,#fff)", color: "var(--text,#111827)" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className="workspace-btn" onClick={handleSubmit} style={{ flex: 1, background: "#8b5cf6" }}>{editing ? "Save Changes" : "Add Record"}</button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
