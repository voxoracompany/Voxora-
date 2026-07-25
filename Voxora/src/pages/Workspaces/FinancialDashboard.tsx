// ── V6.3 Financial Dashboard ─────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface Metrics {
  revenue:     number;
  expenses:    number;
  cashBalance: number;
  mrr:         number;
  customers:   number;
  churnRate:   number;
}

const EMPTY: Metrics = {
  revenue: 0, expenses: 0, cashBalance: 0,
  mrr: 0, customers: 0, churnRate: 2,
};

const STORAGE_KEY = "voxora_financial_dashboard_v1";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function FinancialDashboard({ setWorkspace }: Props) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<Metrics>(EMPTY);

  /* Load persisted metrics */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const m = JSON.parse(raw) as Metrics; setMetrics(m); setDraft(m); }
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((m: Metrics) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
    setMetrics(m); setDraft(m);
  }, []);

  /* Derived */
  const grossProfit = metrics.revenue - metrics.expenses * 0.6;
  const netProfit   = metrics.revenue - metrics.expenses;
  const burnRate    = metrics.expenses > metrics.revenue ? metrics.expenses - metrics.revenue : 0;
  const arr         = metrics.mrr * 12;
  const runway      = burnRate > 0 && metrics.cashBalance > 0 ? Math.round(metrics.cashBalance / burnRate) : null;

  const save = () => {
    persist(draft);
    setEditing(false);
    addActivity({
      type: "financial_dashboard_updated",
      title: "Financial Dashboard Updated",
      description: "Financial metrics saved to dashboard.",
      category: "Finance", icon: "📊",
    });
    showToast("📊 Dashboard saved!");
  };

  const saveProject_ = () => {
    const summary = `Financial Dashboard Snapshot\n\nRevenue: ${fmt(metrics.revenue)}\nExpenses: ${fmt(metrics.expenses)}\nGross Profit: ${fmt(grossProfit)}\nNet Profit: ${fmt(netProfit)}\nCash Balance: ${fmt(metrics.cashBalance)}\nBurn Rate: ${burnRate > 0 ? fmt(burnRate) + "/mo" : "Profitable"}\nMRR: ${fmt(metrics.mrr)}\nARR: ${fmt(arr)}\nRunway: ${runway != null ? runway + " months" : "N/A"}`;
    saveProject({ id: Date.now().toString(), title: "Financial Dashboard Snapshot", category: "Financial Dashboard", createdAt: new Date().toISOString(), notes: summary });
    showToast("📁 Dashboard saved to projects!");
  };

  /* Export helpers */
  const exportCSV = () => {
    const rows = [
      ["Metric","Value"],
      ["Revenue", metrics.revenue],
      ["Expenses", metrics.expenses],
      ["Gross Profit", grossProfit.toFixed(0)],
      ["Net Profit", netProfit.toFixed(0)],
      ["Cash Balance", metrics.cashBalance],
      ["Burn Rate", burnRate.toFixed(0)],
      ["MRR", metrics.mrr],
      ["ARR", arr.toFixed(0)],
      ["Customers", metrics.customers],
      ["Churn Rate %", metrics.churnRate],
    ];
    downloadBlob(rows.map(r => r.join(",")).join("\n"), "financial_dashboard.csv", "text/csv");
  };

  const exportJSON = () => {
    const data = { revenue: metrics.revenue, expenses: metrics.expenses, grossProfit, netProfit, cashBalance: metrics.cashBalance, burnRate, mrr: metrics.mrr, arr, customers: metrics.customers, churnRate: metrics.churnRate };
    downloadBlob(JSON.stringify(data, null, 2), "financial_dashboard.json", "application/json");
  };

  const exportMarkdown = () => {
    const md = `# Financial Dashboard\n\n| Metric | Value |\n|--------|-------|\n| Revenue | ${fmt(metrics.revenue)} |\n| Expenses | ${fmt(metrics.expenses)} |\n| Gross Profit | ${fmt(grossProfit)} |\n| Net Profit | ${fmt(netProfit)} |\n| Cash Balance | ${fmt(metrics.cashBalance)} |\n| Burn Rate | ${burnRate > 0 ? fmt(burnRate) + "/mo" : "Profitable"} |\n| MRR | ${fmt(metrics.mrr)} |\n| ARR | ${fmt(arr)} |\n| Customers | ${metrics.customers} |\n| Churn Rate | ${metrics.churnRate}% |\n`;
    downloadBlob(md, "financial_dashboard.md", "text/markdown");
  };

  const exportExcel = () => {
    const html = `<table><tr><th>Metric</th><th>Value</th></tr><tr><td>Revenue</td><td>${metrics.revenue}</td></tr><tr><td>Expenses</td><td>${metrics.expenses}</td></tr><tr><td>Gross Profit</td><td>${grossProfit.toFixed(0)}</td></tr><tr><td>Net Profit</td><td>${netProfit.toFixed(0)}</td></tr><tr><td>Cash Balance</td><td>${metrics.cashBalance}</td></tr><tr><td>Burn Rate</td><td>${burnRate.toFixed(0)}</td></tr><tr><td>MRR</td><td>${metrics.mrr}</td></tr><tr><td>ARR</td><td>${arr.toFixed(0)}</td></tr><tr><td>Customers</td><td>${metrics.customers}</td></tr><tr><td>Churn Rate %</td><td>${metrics.churnRate}</td></tr></table>`;
    downloadBlob(html, "financial_dashboard.xls", "application/vnd.ms-excel");
  };

  const exportPDF = () => { window.print(); };

  const KPIs = [
    { icon: "💵", label: "Revenue",      val: fmt(metrics.revenue),     sub: "This period",            cls: "fs-kpi-positive" },
    { icon: "💸", label: "Expenses",     val: fmt(metrics.expenses),    sub: "This period",            cls: "fs-kpi-negative" },
    { icon: "📊", label: "Gross Profit", val: fmt(grossProfit),         sub: `${metrics.revenue > 0 ? ((grossProfit / metrics.revenue) * 100).toFixed(1) : "0"}% margin`, cls: netProfit >= 0 ? "fs-kpi-positive" : "fs-kpi-negative" },
    { icon: "🏆", label: "Net Profit",   val: fmt(netProfit),           sub: "After all expenses",     cls: netProfit >= 0 ? "fs-kpi-positive" : "fs-kpi-negative" },
    { icon: "🏦", label: "Cash Balance", val: fmt(metrics.cashBalance), sub: runway != null ? `${runway}mo runway` : "No burn", cls: "fs-kpi-neutral" },
    { icon: "🔥", label: "Burn Rate",    val: burnRate > 0 ? fmt(burnRate) + "/mo" : "Profitable", sub: burnRate > 0 ? "Monthly cash burn" : "Cash flow positive", cls: burnRate > 0 ? "fs-kpi-negative" : "fs-kpi-positive" },
    { icon: "📅", label: "MRR",          val: fmt(metrics.mrr),         sub: "Monthly Recurring",      cls: "fs-kpi-neutral" },
    { icon: "📆", label: "ARR",          val: fmt(arr),                 sub: "Annual Recurring",       cls: "fs-kpi-neutral" },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 1040 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>📊 Financial Dashboard</h1>
      <p className="workspace-subtitle">Your key financial metrics at a glance. Edit and track over time.</p>

      {/* KPI Grid */}
      <div className="fs-kpi-grid">
        {KPIs.map(k => (
          <div key={k.label} className="fs-kpi-card">
            <div className="fs-kpi-icon">{k.icon}</div>
            <div className="fs-kpi-label">{k.label}</div>
            <div className={`fs-kpi-value ${k.cls}`}>{k.val}</div>
            <div className="fs-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Edit Form */}
      {editing ? (
        <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 className="fs-section-title">✏️ Update Metrics</h2>
          <div className="fs-input-grid">
            {(["revenue","expenses","cashBalance","mrr","customers"] as (keyof Metrics)[]).map(key => (
              <div key={key} className="fs-input-group">
                <label className="fs-label">
                  {key === "cashBalance" ? "Cash Balance" : key === "mrr" ? "MRR" : key.charAt(0).toUpperCase() + key.slice(1)}
                  {key !== "customers" && key !== "churnRate" ? " ($)" : key === "churnRate" ? " (%)" : ""}
                </label>
                <input
                  className="fs-input"
                  type="number"
                  min={0}
                  value={draft[key]}
                  onChange={e => setDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
                />
              </div>
            ))}
            <div className="fs-input-group">
              <label className="fs-label">Churn Rate (%)</label>
              <input
                className="fs-input"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={draft.churnRate}
                onChange={e => setDraft(d => ({ ...d, churnRate: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="workspace-btn" onClick={save}>💾 Save</button>
            <button className="workspace-btn" style={{ background: "#6b7280" }} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button className="workspace-btn" onClick={() => { setDraft(metrics); setEditing(true); }}>✏️ Edit Metrics</button>
          <button className="workspace-btn workspace-save-btn" onClick={saveProject_}>📁 Save Snapshot</button>
        </div>
      )}

      {/* Export */}
      <h2 className="fs-section-title">📤 Export</h2>
      <div className="fs-export-row">
        <button className="fs-export-btn" onClick={exportPDF}>🖨️ PDF</button>
        <button className="fs-export-btn" onClick={exportExcel}>📊 Excel</button>
        <button className="fs-export-btn" onClick={exportCSV}>📄 CSV</button>
        <button className="fs-export-btn" onClick={exportMarkdown}>📝 Markdown</button>
        <button className="fs-export-btn" onClick={exportJSON}>{ }{} JSON</button>
      </div>

      {/* Cross-links */}
      <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="fs-export-btn" onClick={() => setWorkspace("revenueForecast")}>📈 Revenue Forecast →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("financialHealthScore")}>💯 Health Score →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("cashFlowPlanner")}>💸 Cash Flow Planner →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("investorStudio")}>🚀 Investor Studio →</button>
      </div>
    </div>
  );
}
