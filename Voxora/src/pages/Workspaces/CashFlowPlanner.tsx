// ── V6.3 Cash Flow Planner ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface MonthRow { month: string; income: number; expenses: number }

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENT_YEAR = new Date().getFullYear();

const DEFAULT_ROWS: MonthRow[] = MONTH_NAMES.map(m => ({ month: `${m} ${CURRENT_YEAR}`, income: 15000, expenses: 12000 }));

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CashFlowPlanner({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { analyze, isLoading, isDemoMode } = useAI("cashFlow");

  const [rows,          setRows]          = useState<MonthRow[]>(DEFAULT_ROWS);
  const [startingCash,  setStartingCash]  = useState(50000);
  const [aiComment,     setAiComment]     = useState("");

  const update = (idx: number, field: "income" | "expenses", val: number) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  /* Running cash balance */
  const enriched = useMemo(() => {
    let balance = startingCash;
    return rows.map(r => {
      const net = r.income - r.expenses;
      balance  += net;
      return { ...r, net, balance };
    });
  }, [rows, startingCash]);

  const totalIncome   = useMemo(() => rows.reduce((s, r) => s + r.income,   0), [rows]);
  const totalExpenses = useMemo(() => rows.reduce((s, r) => s + r.expenses, 0), [rows]);
  const totalNet      = totalIncome - totalExpenses;
  const finalBalance  = enriched[enriched.length - 1]?.balance ?? startingCash;
  const negativeMonths = enriched.filter(r => r.net < 0).length;
  const burnRate      = totalNet < 0 ? Math.abs(totalNet / 12) : 0;
  const runway        = burnRate > 0 && startingCash > 0 ? Math.round(startingCash / burnRate) : null;
  const runwayPct     = runway != null ? Math.min((runway / 24) * 100, 100) : 100;
  const runwayCls     = runway == null || runway > 18 ? "fs-runway-safe" : runway > 9 ? "fs-runway-caution" : "fs-runway-danger";

  const generate = async () => {
    const summary = `Cash flow 12-month summary: Total income ${fmt(totalIncome)}, total expenses ${fmt(totalExpenses)}, net ${fmt(totalNet)}, starting cash ${fmt(startingCash)}, ending balance ${fmt(finalBalance)}, negative months: ${negativeMonths}, monthly burn rate: ${burnRate > 0 ? fmt(burnRate) : "cash flow positive"}, runway: ${runway != null ? runway + " months" : "positive"}.`;
    const out = await analyze(`${summary} Provide 4-5 actionable AI recommendations to improve this cash flow, reduce risk, and extend runway. Be specific and strategic.`, "cashFlow");
    if (out) {
      setAiComment(out);
      addActivity({ type: "cashflow_analyzed", title: "Cash Flow Analyzed", description: "AI cash flow recommendations generated.", category: "Finance", icon: "💸" });
    }
  };

  const saveProj = () => {
    const notes = `Cash Flow Planner\n\nStarting Cash: ${fmt(startingCash)}\nTotal Income: ${fmt(totalIncome)}\nTotal Expenses: ${fmt(totalExpenses)}\nNet Cash Flow: ${fmt(totalNet)}\nEnding Balance: ${fmt(finalBalance)}\nNegative Months: ${negativeMonths}/12\nRunway: ${runway != null ? runway + " months" : "Cash flow positive"}${aiComment ? "\n\nAI Recommendations:\n" + aiComment : ""}`;
    saveProject({ id: Date.now().toString(), title: `Cash Flow Plan ${CURRENT_YEAR}`, category: "Cash Flow", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "cashflow_saved", title: "Cash Flow Saved", description: `12-month cash flow plan saved.`, category: "Finance", icon: "💸" });
    showToast("💸 Cash flow plan saved!");
  };

  const exportCSV = () => {
    const rows2 = [["Month","Income","Expenses","Net","Running Balance"], ...enriched.map(r => [r.month, r.income, r.expenses, r.net, r.balance.toFixed(0)])];
    downloadBlob(rows2.map(r => r.join(",")).join("\n"), "cash_flow.csv", "text/csv");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ startingCash, rows: enriched, totals: { income: totalIncome, expenses: totalExpenses, net: totalNet, finalBalance } }, null, 2), "cash_flow.json", "application/json");
  };
  const exportMarkdown = () => {
    const header = `# Cash Flow Plan ${CURRENT_YEAR}\n\nStarting Cash: ${fmt(startingCash)}\n\n| Month | Income | Expenses | Net | Balance |\n|-------|--------|----------|-----|---------|\n`;
    const bodyRows = enriched.map(r => `| ${r.month} | ${fmt(r.income)} | ${fmt(r.expenses)} | ${r.net >= 0 ? "+" : ""}${fmt(r.net)} | ${fmt(r.balance)} |`).join("\n");
    downloadBlob(header + bodyRows, "cash_flow.md", "text/markdown");
  };
  const exportExcel = () => {
    const rowsArr = [["Month","Income","Expenses","Net","Running Balance"], ...enriched.map(r => [r.month, r.income, r.expenses, r.net, r.balance.toFixed(0)])];
    const html = `<table>${rowsArr.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
    downloadBlob(html, "cash_flow.xls", "application/vnd.ms-excel");
  };

  const maxIncome = Math.max(...rows.map(r => r.income), 1);

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>💸 Cash Flow Planner</h1>
      <p className="workspace-subtitle">Track monthly income, expenses and cash reserves. Get AI recommendations on extending your runway.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Summary KPIs */}
      <div className="fs-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">💵</div>
          <div className="fs-kpi-label">Total Income</div>
          <div className="fs-kpi-value fs-kpi-positive">{fmt(totalIncome)}</div>
          <div className="fs-kpi-sub">12-month total</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">💸</div>
          <div className="fs-kpi-label">Total Expenses</div>
          <div className="fs-kpi-value fs-kpi-negative">{fmt(totalExpenses)}</div>
          <div className="fs-kpi-sub">12-month total</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">📊</div>
          <div className="fs-kpi-label">Net Cash Flow</div>
          <div className={`fs-kpi-value ${totalNet >= 0 ? "fs-kpi-positive" : "fs-kpi-negative"}`}>{totalNet >= 0 ? "+" : ""}{fmt(totalNet)}</div>
          <div className="fs-kpi-sub">income − expenses</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">🏦</div>
          <div className="fs-kpi-label">Ending Balance</div>
          <div className={`fs-kpi-value ${finalBalance >= 0 ? "fs-kpi-neutral" : "fs-kpi-negative"}`}>{fmt(finalBalance)}</div>
          <div className="fs-kpi-sub">end of period</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">⚠️</div>
          <div className="fs-kpi-label">Negative Months</div>
          <div className={`fs-kpi-value ${negativeMonths === 0 ? "fs-kpi-positive" : "fs-kpi-negative"}`}>{negativeMonths} / 12</div>
          <div className="fs-kpi-sub">cash-burn months</div>
        </div>
        <div className="fs-kpi-card">
          <div className="fs-kpi-icon">🕐</div>
          <div className="fs-kpi-label">Runway</div>
          <div className={`fs-kpi-value ${runway == null || runway > 18 ? "fs-kpi-positive" : runway > 9 ? "fs-kpi-neutral" : "fs-kpi-negative"}`}>
            {runway != null ? `${runway} mo` : "Positive"}
          </div>
          <div className="fs-kpi-sub">at avg burn rate</div>
        </div>
      </div>

      {/* Runway Meter */}
      {runway != null && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--color-text, #374151)" }}>
            Runway Meter — {runway} months
          </div>
          <div className="fs-runway-bar">
            <div className={`fs-runway-fill ${runwayCls}`} style={{ width: `${runwayPct}%` }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted, #6b7280)", marginTop: 2 }}>
            {runway > 18 ? "✅ Healthy runway" : runway > 9 ? "⚠️ Consider raising or cutting costs" : "🚨 Critical — take action now"}
          </div>
        </div>
      )}

      {/* Starting Cash */}
      <div style={{ marginBottom: 20 }}>
        <label className="fs-label">Starting Cash Balance ($)</label>
        <input
          className="fs-input"
          type="number"
          min={0}
          value={startingCash}
          onChange={e => setStartingCash(Number(e.target.value))}
          style={{ maxWidth: 240, marginTop: 6 }}
        />
      </div>

      {/* Income vs Expenses chart */}
      <h2 className="fs-section-title">📉 Income vs. Expenses</h2>
      <div className="fs-chart" style={{ marginBottom: 8 }}>
        {rows.map((r, i) => (
          <div key={r.month} style={{ marginBottom: 4 }}>
            <div className="fs-chart-row">
              <span className="fs-chart-label" style={{ fontSize: 11 }}>{MONTH_NAMES[i]}</span>
              <div className="fs-bar-track"><div className="fs-bar-fill fs-bar-best" style={{ width: `${(r.income / maxIncome) * 100}%` }} /></div>
              <span className="fs-chart-val">{fmt(r.income)}</span>
            </div>
            <div className="fs-chart-row">
              <span className="fs-chart-label" />
              <div className="fs-bar-track"><div className="fs-bar-fill" style={{ width: `${(r.expenses / maxIncome) * 100}%`, background: "linear-gradient(90deg,#ef4444,#f87171)" }} /></div>
              <span className="fs-chart-val" style={{ color: "#ef4444" }}>{fmt(r.expenses)}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{ width: 24, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#10b981,#34d399)", display: "inline-block" }} />Income
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{ width: 24, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#ef4444,#f87171)", display: "inline-block" }} />Expenses
        </span>
      </div>

      {/* Monthly Table */}
      <h2 className="fs-section-title">📋 Monthly Detail</h2>
      <div className="fs-table-wrap" style={{ marginBottom: 24 }}>
        <table className="fs-table">
          <thead>
            <tr><th>Month</th><th>Income ($)</th><th>Expenses ($)</th><th>Net</th><th>Running Balance</th></tr>
          </thead>
          <tbody>
            {enriched.map((r, idx) => (
              <tr key={r.month}>
                <td style={{ fontWeight: 600 }}>{r.month}</td>
                <td>
                  <input
                    className="fs-input"
                    type="number"
                    min={0}
                    style={{ width: 110, padding: "5px 8px", fontSize: 12 }}
                    value={r.income}
                    onChange={e => update(idx, "income", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    className="fs-input"
                    type="number"
                    min={0}
                    style={{ width: 110, padding: "5px 8px", fontSize: 12 }}
                    value={r.expenses}
                    onChange={e => update(idx, "expenses", Number(e.target.value))}
                  />
                </td>
                <td className={r.net >= 0 ? "positive" : "negative"}>{r.net >= 0 ? "+" : ""}{fmt(r.net)}</td>
                <td className={r.balance >= 0 ? "positive" : "negative"}>{fmt(r.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>TOTAL</strong></td>
              <td className="positive"><strong>{fmt(totalIncome)}</strong></td>
              <td className="negative"><strong>{fmt(totalExpenses)}</strong></td>
              <td className={totalNet >= 0 ? "positive" : "negative"}><strong>{totalNet >= 0 ? "+" : ""}{fmt(totalNet)}</strong></td>
              <td className={finalBalance >= 0 ? "positive" : "negative"}><strong>{fmt(finalBalance)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* AI Recommendations */}
      <button className="workspace-btn" onClick={generate} disabled={isLoading}>
        {isLoading ? "⏳ Generating AI recommendations…" : "🤖 Generate AI Recommendations"}
      </button>
      {aiComment && (
        <div className="fs-ai-box" style={{ marginTop: 16 }}>
          <strong>🤖 AI Cash Flow Recommendations</strong><br /><br />{aiComment}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Plan</button>
      </div>

      {/* Export */}
      <h2 className="fs-section-title" style={{ marginTop: 24 }}>📤 Export</h2>
      <div className="fs-export-row">
        <button className="fs-export-btn" onClick={() => window.print()}>🖨️ PDF</button>
        <button className="fs-export-btn" onClick={exportExcel}>📊 Excel</button>
        <button className="fs-export-btn" onClick={exportCSV}>📄 CSV</button>
        <button className="fs-export-btn" onClick={exportMarkdown}>📝 Markdown</button>
        <button className="fs-export-btn" onClick={exportJSON}>{ }{} JSON</button>
      </div>
    </div>
  );
}
