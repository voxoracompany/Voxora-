// ── V6.6 HR Reports ───────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useHR } from "../../hooks/useHR";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type Section = "overview" | "employees" | "attendance" | "leave" | "payroll";

const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Export helpers ─────────────────────────────────────────────────────────────
function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const content = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  trigger(filename + ".csv", new Blob([content], { type: "text/csv" }));
}

function exportJSON(filename: string, data: unknown) {
  trigger(filename + ".json", new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
}

function exportMarkdown(filename: string, title: string, headers: string[], rows: string[][]) {
  const sep  = `| ${headers.map(() => "---").join(" | ")} |`;
  const head = `# ${title}\n\n| ${headers.join(" | ")} |\n${sep}\n`;
  const body = rows.map(r => `| ${r.join(" | ")} |`).join("\n");
  trigger(filename + ".md", new Blob([head + body], { type: "text/markdown" }));
}

function exportPDF(title: string, tableHTML: string) {
  const html = `<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:sans-serif;padding:32px;color:#111827}h1{font-size:22px;margin-bottom:24px}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border:1px solid #e5e7eb;text-align:left}th{background:#f3f4f6;font-weight:700}</style></head><body><h1>${title}</h1>${tableHTML}</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.onload = () => w.print(); }
}

function trigger(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function HRReports({ setWorkspace }: Props) {
  const { employees, candidates, attendance, leaves, payroll, performance } = useHR();
  const [activeSection, setActiveSection] = useState<Section>("overview");

  // ── Computed data ────────────────────────────────────────────────────────────
  const overview = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach(e => { deptCounts[e.department] = (deptCounts[e.department] || 0) + 1; });

    const currentYear = String(new Date().getFullYear());
    const approvedLeaves = leaves.filter(l => l.status === "approved" && l.startDate.startsWith(currentYear));
    const totalLeaveDays = approvedLeaves.reduce((s, l) => s + (l.days || 0), 0);

    const paidPayroll   = payroll.filter(p => p.status === "paid");
    const totalPayroll  = paidPayroll.reduce((s, p) => s + p.netPay, 0);

    const avgRating = performance.length > 0
      ? (performance.reduce((s, r) => s + r.rating, 0) / performance.length).toFixed(1)
      : "—";

    return { deptCounts, totalLeaveDays, totalPayroll, avgRating };
  }, [employees, leaves, payroll, performance]);

  const attendanceReport = useMemo(() => {
    const byMonth: Record<string, { present: number; absent: number; leave: number }> = {};
    attendance.forEach(a => {
      const m = a.date.slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { present: 0, absent: 0, leave: 0 };
      if (a.status === "present" || a.status === "half-day") byMonth[m].present++;
      else if (a.status === "absent") byMonth[m].absent++;
      else if (a.status === "leave")  byMonth[m].leave++;
    });
    return Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  }, [attendance]);

  const leaveReport = useMemo(() => {
    const byType: Record<string, { approved: number; pending: number; rejected: number; days: number }> = {};
    leaves.forEach(l => {
      if (!byType[l.type]) byType[l.type] = { approved: 0, pending: 0, rejected: 0, days: 0 };
      if (l.status === "approved") { byType[l.type].approved++; byType[l.type].days += l.days; }
      else if (l.status === "pending")  byType[l.type].pending++;
      else if (l.status === "rejected") byType[l.type].rejected++;
    });
    return Object.entries(byType);
  }, [leaves]);

  const payrollReport = useMemo(() => {
    const byMonth: Record<string, { total: number; count: number }> = {};
    payroll.forEach(p => {
      const key = `${p.year}-${String(p.month).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
      byMonth[key].total += p.netPay;
      byMonth[key].count++;
    });
    return Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  }, [payroll]);

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const maxDept = Math.max(...Object.values(overview.deptCounts), 1);

  // ── PDF table builders ────────────────────────────────────────────────────────
  const empTableHTML = () => {
    const rows = employees.map(e => `<tr><td>${e.name}</td><td>${e.department}</td><td>${e.role}</td><td>${e.status}</td><td>${e.startDate || "—"}</td></tr>`).join("");
    return `<table><thead><tr><th>Name</th><th>Department</th><th>Role</th><th>Status</th><th>Start Date</th></tr></thead><tbody>${rows}</tbody></table>`;
  };

  const SECTIONS: { id: Section; label: string }[] = [
    { id: "overview",   label: "Overview"   },
    { id: "employees",  label: "Employees"  },
    { id: "attendance", label: "Attendance" },
    { id: "leave",      label: "Leave"      },
    { id: "payroll",    label: "Payroll"    },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("hrStudio")}>← Back to HR Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>📊 HR Reports</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>Workforce analytics and exports</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => exportCSV("hr-employees", ["Name","Email","Department","Role","Status","Start Date"], employees.map(e => [e.name, e.email, e.department, e.role, e.status, e.startDate]))}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ CSV</button>
          <button
            onClick={() => exportMarkdown("hr-employees", "HR Employee Report", ["Name","Department","Role","Status"], employees.map(e => [e.name, e.department, e.role, e.status]))}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ MD</button>
          <button
            onClick={() => exportJSON("hr-report", { employees, attendance, leaves, payroll, performance, candidates })}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ JSON</button>
          <button
            onClick={() => exportPDF("HR Employee Report", empTableHTML())}
            style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#14b8a6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>⬇ PDF</button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="stats" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Employees",  val: String(employees.length),                                          icon: "👤" },
          { label: "Active",           val: String(employees.filter(e => e.status === "active").length),       icon: "✅" },
          { label: "Candidates",       val: String(candidates.length),                                         icon: "🎯" },
          { label: "Hired",            val: String(candidates.filter(c => c.stage === "hired").length),        icon: "🎉" },
          { label: "Leave Days (YTD)", val: String(overview.totalLeaveDays),                                   icon: "🏖️" },
          { label: "Payroll Paid",     val: fmt(overview.totalPayroll),                                        icon: "💵" },
          { label: "Avg Rating",       val: overview.avgRating,                                                icon: "⭐" },
          { label: "Departments",      val: String(Object.keys(overview.deptCounts).length),                   icon: "🏢" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <p className="stat-value">{s.val}</p>
            <h3 className="stat-label">{s.label}</h3>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border,#e5e7eb)", flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ padding: "8px 18px", border: "none", borderBottom: activeSection === s.id ? "2px solid #14b8a6" : "2px solid transparent", background: "transparent", cursor: "pointer", fontWeight: activeSection === s.id ? 700 : 500, color: activeSection === s.id ? "#14b8a6" : "var(--text-muted,#6b7280)", fontSize: 14 }}>{s.label}</button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeSection === "overview" && (
        <div>
          {/* Department Distribution */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>🏢 Department Distribution</h2>
          {Object.keys(overview.deptCounts).length === 0 ? (
            <p style={{ color: "var(--text-muted,#6b7280)", marginBottom: 32 }}>No employee data yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {Object.entries(overview.deptCounts).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                <div key={dept} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 160, fontSize: 14, fontWeight: 600, color: "var(--text,#111827)", flexShrink: 0 }}>{dept}</span>
                  <div style={{ flex: 1, height: 24, background: "var(--border,#e5e7eb)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ width: `${(count / maxDept) * 100}%`, height: "100%", background: "#14b8a6", borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hiring Pipeline */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>📈 Hiring Pipeline</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
            {(["applied","screening","interview","offer","hired","rejected"] as const).map(stage => {
              const count = candidates.filter(c => c.stage === stage).length;
              const colors: Record<string, string> = { applied: "#3b82f6", screening: "#8b5cf6", interview: "#f59e0b", offer: "#10b981", hired: "#6C63FF", rejected: "#ef4444" };
              return (
                <div key={stage} style={{ flex: "1 1 120px", background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: colors[stage], marginBottom: 4 }}>{count}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", textTransform: "capitalize" }}>{stage}</div>
                </div>
              );
            })}
          </div>

          {/* Performance Distribution */}
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>⭐ Performance Distribution</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {([5, 4, 3, 2, 1] as const).map(rating => {
              const count = performance.filter(r => r.rating === rating).length;
              const labels: Record<number, string> = { 5: "Excellent", 4: "Good", 3: "Average", 2: "Below Avg", 1: "Poor" };
              return (
                <div key={rating} style={{ flex: "1 1 100px", background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{count}</div>
                  <div style={{ fontSize: 13, color: "#f59e0b" }}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted,#9ca3af)", marginTop: 2 }}>{labels[rating]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Employees ── */}
      {activeSection === "employees" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>👤 Employee Report</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => exportCSV("hr-employees-full", ["Name","Email","Phone","Department","Role","Status","Start Date"], employees.map(e => [e.name, e.email, e.phone, e.department, e.role, e.status, e.startDate]))}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ CSV</button>
              <button onClick={() => exportPDF("HR Employee Report", empTableHTML())}
                style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#14b8a6", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>⬇ PDF</button>
            </div>
          </div>
          {employees.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)" }}>No employees to report on.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "var(--bg-card,#fff)" }}>
                    {["Name","Department","Role","Status","Start Date"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border,#e5e7eb)", color: "var(--text,#111827)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.id} style={{ borderBottom: "1px solid var(--border,#e5e7eb)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{e.name}</td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted,#6b7280)" }}>{e.department}</td>
                      <td style={{ padding: "10px 14px" }}>{e.role}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: e.status === "active" ? "#d1fae5" : "#f3f4f6", color: e.status === "active" ? "#065f46" : "#374151" }}>{e.status}</span>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--text-muted,#6b7280)" }}>{e.startDate || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Attendance ── */}
      {activeSection === "attendance" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🕐 Attendance Report</h2>
            <button onClick={() => exportCSV("hr-attendance", ["Month","Present","Absent","Leave"], attendanceReport.map(([m, v]) => [m, String(v.present), String(v.absent), String(v.leave)]))}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ CSV</button>
          </div>
          {attendanceReport.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)" }}>No attendance data yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {attendanceReport.map(([month, val]) => (
                <div key={month} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>{month}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {([["Present", val.present, "#065f46", "#d1fae5"], ["Absent", val.absent, "#991b1b", "#fee2e2"], ["Leave", val.leave, "#92400e", "#fef3c7"]] as const).map(([label, count, color, bg]) => (
                      <div key={String(label)} style={{ flex: 1, minWidth: 80, background: String(bg), borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: String(color) }}>{count}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: String(color) }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Leave ── */}
      {activeSection === "leave" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🏖️ Leave Report</h2>
            <button onClick={() => exportCSV("hr-leave", ["Type","Approved","Pending","Rejected","Days Taken"], leaveReport.map(([t, v]) => [t, String(v.approved), String(v.pending), String(v.rejected), String(v.days)]))}
              style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ CSV</button>
          </div>
          {leaveReport.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)" }}>No leave data yet.</p> : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>{["Leave Type","Approved","Pending","Rejected","Days Taken"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid var(--border,#e5e7eb)" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {leaveReport.map(([type, val]) => (
                    <tr key={type} style={{ borderBottom: "1px solid var(--border,#e5e7eb)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, textTransform: "capitalize" }}>{type}</td>
                      <td style={{ padding: "10px 14px", color: "#065f46", fontWeight: 600 }}>{val.approved}</td>
                      <td style={{ padding: "10px 14px", color: "#92400e" }}>{val.pending}</td>
                      <td style={{ padding: "10px 14px", color: "#991b1b" }}>{val.rejected}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700 }}>{val.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Payroll ── */}
      {activeSection === "payroll" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>💵 Payroll Report</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => exportCSV("hr-payroll", ["Month","Records","Net Pay"], payrollReport.map(([m, v]) => [m, String(v.count), fmt(v.total)]))}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ CSV</button>
              <button onClick={() => exportMarkdown("hr-payroll", "Payroll Report", ["Month","Records","Net Pay"], payrollReport.map(([m, v]) => [m, String(v.count), fmt(v.total)]))}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text,#111827)" }}>⬇ MD</button>
            </div>
          </div>
          {payrollReport.length === 0 ? <p style={{ color: "var(--text-muted,#6b7280)" }}>No payroll data yet.</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {payrollReport.map(([month, val]) => {
                const [yr, mo] = month.split("-");
                return (
                  <div key={month} style={{ background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS_LONG[Number(mo) - 1]} {yr}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", marginTop: 2 }}>{val.count} records</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#065f46" }}>{fmt(val.total)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick nav */}
      <div style={{ marginTop: 32, background: "linear-gradient(135deg,#f0fdfa,#ccfbf1)", border: "1px solid #99f6e4", borderRadius: 16, padding: "20px 24px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#115e59" }}>🔗 Jump To</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "👤 Employees",   id: "hrEmployees"   },
            { label: "🎯 Recruitment", id: "hrRecruitment" },
            { label: "🕐 Attendance",  id: "hrAttendance"  },
            { label: "🏖️ Leave",       id: "hrLeave"       },
            { label: "💵 Payroll",     id: "hrPayroll"     },
            { label: "⭐ Performance", id: "hrPerformance" },
          ].map(q => (
            <button key={q.id} onClick={() => setWorkspace(q.id)}
              style={{ padding: "8px 14px", background: "#fff", border: "1.5px solid #99f6e4", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#115e59" }}>
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
