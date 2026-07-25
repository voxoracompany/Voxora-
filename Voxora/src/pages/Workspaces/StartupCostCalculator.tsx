// ── V6.3 Startup Cost Calculator ────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface CostItem { label: string; oneTime: number; monthly: number; icon: string }

const DEFAULTS: CostItem[] = [
  { label: "Equipment",     oneTime: 5000,  monthly: 0,    icon: "🖥️" },
  { label: "Software",      oneTime: 1000,  monthly: 500,  icon: "💿" },
  { label: "Salaries",      oneTime: 0,     monthly: 8000, icon: "👥" },
  { label: "Marketing",     oneTime: 2000,  monthly: 1500, icon: "📣" },
  { label: "Office",        oneTime: 3000,  monthly: 2000, icon: "🏢" },
  { label: "Legal",         oneTime: 2500,  monthly: 200,  icon: "⚖️" },
  { label: "Miscellaneous", oneTime: 1000,  monthly: 500,  icon: "📦" },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function StartupCostCalculator({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [items, setItems] = useState<CostItem[]>(DEFAULTS);

  const totalOneTime = useMemo(() => items.reduce((s, i) => s + i.oneTime, 0), [items]);
  const totalMonthly = useMemo(() => items.reduce((s, i) => s + i.monthly, 0), [items]);
  const totalYear1   = useMemo(() => totalOneTime + totalMonthly * 12, [totalOneTime, totalMonthly]);

  const update = (idx: number, field: "oneTime" | "monthly", val: number) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const maxBar = Math.max(...items.map(i => i.oneTime + i.monthly * 12), 1);

  const saveProj = () => {
    const notes = items.map(i => `${i.icon} ${i.label}: One-time ${fmt(i.oneTime)}, Monthly ${fmt(i.monthly)}`).join("\n")
      + `\n\nTotal Startup Cost: ${fmt(totalOneTime)}\nMonthly Operating Cost: ${fmt(totalMonthly)}\nYear 1 Total: ${fmt(totalYear1)}`;
    saveProject({ id: Date.now().toString(), title: "Startup Cost Estimate", category: "Startup Costs", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "startup_costs_calculated", title: "Startup Costs Calculated", description: `Total startup cost: ${fmt(totalOneTime)}`, category: "Finance", icon: "🧮" });
    showToast("🧮 Cost estimate saved!");
  };

  const exportCSV = () => {
    const rows = [["Category","One-Time ($)","Monthly ($)","Annual ($)"],
      ...items.map(i => [i.label, i.oneTime, i.monthly, i.oneTime + i.monthly * 12]),
      ["TOTAL", totalOneTime, totalMonthly, totalYear1]];
    downloadBlob(rows.map(r => r.join(",")).join("\n"), "startup_costs.csv", "text/csv");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ items, totals: { oneTime: totalOneTime, monthly: totalMonthly, year1: totalYear1 } }, null, 2), "startup_costs.json", "application/json");
  };
  const exportMarkdown = () => {
    const header = `# Startup Cost Calculator\n\n| Category | One-Time | Monthly | Annual |\n|----------|----------|---------|--------|\n`;
    const rows = items.map(i => `| ${i.icon} ${i.label} | ${fmt(i.oneTime)} | ${fmt(i.monthly)} | ${fmt(i.oneTime + i.monthly * 12)} |`).join("\n");
    const footer = `\n| **TOTAL** | **${fmt(totalOneTime)}** | **${fmt(totalMonthly)}** | **${fmt(totalYear1)}** |`;
    downloadBlob(header + rows + footer, "startup_costs.md", "text/markdown");
  };
  const exportExcel = () => {
    const rows = [["Category","One-Time ($)","Monthly ($)","Annual ($)"],
      ...items.map(i => [i.label, i.oneTime, i.monthly, i.oneTime + i.monthly * 12]),
      ["TOTAL", totalOneTime, totalMonthly, totalYear1]];
    const html = `<table>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
    downloadBlob(html, "startup_costs.xls", "application/vnd.ms-excel");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>🧮 Startup Cost Calculator</h1>
      <p className="workspace-subtitle">Estimate every cost category and see your total startup and monthly operating costs instantly.</p>

      {/* Summary Cards */}
      <div className="fs-kpi-grid" style={{ marginBottom: 28 }}>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">🚀</div>
          <div className="fs-kpi-label">Total Startup Cost</div>
          <div className="fs-kpi-value fs-kpi-negative">{fmt(totalOneTime)}</div>
          <div className="fs-kpi-sub">One-time expenses</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">📅</div>
          <div className="fs-kpi-label">Monthly Operating</div>
          <div className="fs-kpi-value fs-kpi-neutral">{fmt(totalMonthly)}</div>
          <div className="fs-kpi-sub">Recurring costs/mo</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">📆</div>
          <div className="fs-kpi-label">Year 1 Total</div>
          <div className="fs-kpi-value fs-kpi-negative">{fmt(totalYear1)}</div>
          <div className="fs-kpi-sub">Startup + 12mo ops</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">💰</div>
          <div className="fs-kpi-label">Recommended Raise</div>
          <div className="fs-kpi-value fs-kpi-positive">{fmt(totalYear1 * 1.3)}</div>
          <div className="fs-kpi-sub">Year 1 + 30% buffer</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <h2 className="fs-section-title">📋 Cost Breakdown</h2>
      <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
        <div className="fs-table-wrap">
          <table className="fs-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Category</th>
                <th>One-Time ($)</th>
                <th>Monthly ($)</th>
                <th>Annual ($)</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const annual = item.oneTime + item.monthly * 12;
                const pct = maxBar > 0 ? Math.round((annual / maxBar) * 100) : 0;
                return (
                  <tr key={item.label}>
                    <td><span style={{ marginRight: 6 }}>{item.icon}</span><strong>{item.label}</strong></td>
                    <td>
                      <input
                        className="fs-input"
                        type="number"
                        min={0}
                        style={{ width: 100, padding: "6px 10px", fontSize: 13 }}
                        value={item.oneTime}
                        onChange={e => update(idx, "oneTime", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input
                        className="fs-input"
                        type="number"
                        min={0}
                        style={{ width: 100, padding: "6px 10px", fontSize: 13 }}
                        value={item.monthly}
                        onChange={e => update(idx, "monthly", Number(e.target.value))}
                      />
                    </td>
                    <td className="positive">{fmt(annual)}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="fs-bar-track" style={{ flex: 1 }}>
                          <div className="fs-bar-fill fs-bar-expected" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #6b7280)", width: 30 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 800 }}>
                <td><strong>TOTAL</strong></td>
                <td className="negative"><strong>{fmt(totalOneTime)}</strong></td>
                <td className="negative"><strong>{fmt(totalMonthly)}</strong></td>
                <td className="positive"><strong>{fmt(totalYear1)}</strong></td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Estimate</button>
        <button className="workspace-btn" style={{ background: "#6b7280" }} onClick={() => setItems(DEFAULTS)}>↺ Reset</button>
      </div>

      {/* Export */}
      <h2 className="fs-section-title">📤 Export</h2>
      <div className="fs-export-row">
        <button className="fs-export-btn" onClick={() => window.print()}>🖨️ PDF</button>
        <button className="fs-export-btn" onClick={exportExcel}>📊 Excel</button>
        <button className="fs-export-btn" onClick={exportCSV}>📄 CSV</button>
        <button className="fs-export-btn" onClick={exportMarkdown}>📝 Markdown</button>
        <button className="fs-export-btn" onClick={exportJSON}>{ }{} JSON</button>
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="fs-export-btn" onClick={() => setWorkspace("breakEvenCalculator")}>⚖️ Break-Even Calculator →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("cashFlowPlanner")}>💸 Cash Flow Planner →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("investorStudio")}>🚀 Investor Studio →</button>
      </div>
    </div>
  );
}
