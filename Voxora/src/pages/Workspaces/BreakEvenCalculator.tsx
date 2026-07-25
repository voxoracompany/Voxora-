// ── V6.3 Break-Even Calculator ───────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

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

export default function BreakEvenCalculator({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();

  const [fixedCosts,     setFixedCosts]     = useState(10000);
  const [variableCost,   setVariableCost]   = useState(20);
  const [sellingPrice,   setSellingPrice]   = useState(50);
  const [monthlyUnits,   setMonthlyUnits]   = useState(0);   // estimated monthly sales volume (optional)

  const contributionMargin = useMemo(() => sellingPrice - variableCost, [sellingPrice, variableCost]);
  const breakEvenUnits     = useMemo(() => contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0, [fixedCosts, contributionMargin]);
  const breakEvenRevenue   = useMemo(() => breakEvenUnits * sellingPrice, [breakEvenUnits, sellingPrice]);
  const breakEvenMonth     = useMemo(() => monthlyUnits > 0 ? Math.ceil(breakEvenUnits / monthlyUnits) : null, [breakEvenUnits, monthlyUnits]);
  const marginPct          = useMemo(() => sellingPrice > 0 ? ((contributionMargin / sellingPrice) * 100).toFixed(1) : "0", [contributionMargin, sellingPrice]);

  /* Chart: show units 0 → breakEvenUnits × 1.5 */
  const chartMax   = Math.max(breakEvenUnits * 1.5, 10);
  const chartSteps = 8;
  const chartData  = Array.from({ length: chartSteps + 1 }, (_, i) => {
    const units    = Math.round((chartMax / chartSteps) * i);
    const revenue  = units * sellingPrice;
    const totalCost = fixedCosts + units * variableCost;
    return { units, revenue, totalCost };
  });
  const chartMaxY = Math.max(...chartData.map(d => Math.max(d.revenue, d.totalCost)), 1);

  const valid = sellingPrice > variableCost && fixedCosts > 0;

  const saveProj = () => {
    const notes = `Break-Even Analysis\n\nFixed Costs: ${fmt(fixedCosts)}\nVariable Cost/Unit: $${variableCost}\nSelling Price/Unit: $${sellingPrice}\nContribution Margin: $${contributionMargin} (${marginPct}%)\n\nBreak-Even Units: ${breakEvenUnits.toLocaleString()}\nBreak-Even Revenue: ${fmt(breakEvenRevenue)}${breakEvenMonth != null ? `\nBreak-Even Month: Month ${breakEvenMonth}` : ""}`;
    saveProject({ id: Date.now().toString(), title: "Break-Even Analysis", category: "Break-Even", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "break_even_calculated", title: "Break-Even Calculated", description: `Break-even at ${breakEvenUnits.toLocaleString()} units / ${fmt(breakEvenRevenue)}`, category: "Finance", icon: "⚖️" });
    showToast("⚖️ Break-even analysis saved!");
  };

  const exportCSV = () => {
    const rows = [["Metric","Value"],["Fixed Costs", fixedCosts],["Variable Cost/Unit", variableCost],["Selling Price/Unit", sellingPrice],["Contribution Margin", contributionMargin],["Contribution Margin %", marginPct + "%"],["Break-Even Units", breakEvenUnits],["Break-Even Revenue", breakEvenRevenue],["Break-Even Month", breakEvenMonth ?? "N/A"]];
    downloadBlob(rows.map(r => r.join(",")).join("\n"), "break_even.csv", "text/csv");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ fixedCosts, variableCost, sellingPrice, contributionMargin, contributionMarginPct: marginPct, breakEvenUnits, breakEvenRevenue, breakEvenMonth }, null, 2), "break_even.json", "application/json");
  };
  const exportMarkdown = () => {
    const md = `# Break-Even Analysis\n\n| Metric | Value |\n|--------|-------|\n| Fixed Costs | ${fmt(fixedCosts)} |\n| Variable Cost/Unit | $${variableCost} |\n| Selling Price/Unit | $${sellingPrice} |\n| Contribution Margin | $${contributionMargin} (${marginPct}%) |\n| **Break-Even Units** | **${breakEvenUnits.toLocaleString()}** |\n| **Break-Even Revenue** | **${fmt(breakEvenRevenue)}** |\n| **Break-Even Month** | **${breakEvenMonth ?? "N/A"}** |\n`;
    downloadBlob(md, "break_even.md", "text/markdown");
  };
  const exportExcel = () => {
    const html = `<table><tr><th>Metric</th><th>Value</th></tr><tr><td>Fixed Costs</td><td>${fixedCosts}</td></tr><tr><td>Variable Cost/Unit</td><td>${variableCost}</td></tr><tr><td>Selling Price/Unit</td><td>${sellingPrice}</td></tr><tr><td>Contribution Margin</td><td>${contributionMargin}</td></tr><tr><td>Break-Even Units</td><td>${breakEvenUnits}</td></tr><tr><td>Break-Even Revenue</td><td>${breakEvenRevenue}</td></tr><tr><td>Break-Even Month</td><td>${breakEvenMonth ?? "N/A"}</td></tr></table>`;
    downloadBlob(html, "break_even.xls", "application/vnd.ms-excel");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 860 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>⚖️ Break-Even Calculator</h1>
      <p className="workspace-subtitle">Know exactly how many units you need to sell to cover your costs and when you'll be profitable.</p>

      {/* Inputs */}
      <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 className="fs-section-title">⚙️ Inputs</h2>
        <div className="fs-input-grid">
          <div className="fs-input-group">
            <label className="fs-label">Fixed Costs ($) — monthly or total</label>
            <input className="fs-input" type="number" min={0} value={fixedCosts} onChange={e => setFixedCosts(Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Variable Cost per Unit ($)</label>
            <input className="fs-input" type="number" min={0} step={0.01} value={variableCost} onChange={e => setVariableCost(Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Selling Price per Unit ($)</label>
            <input className="fs-input" type="number" min={0} step={0.01} value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Estimated Monthly Sales Volume (optional)</label>
            <input className="fs-input" type="number" min={0} placeholder="e.g. 200" value={monthlyUnits || ""} onChange={e => setMonthlyUnits(Number(e.target.value))} />
          </div>
        </div>

        {!valid && sellingPrice > 0 && variableCost >= sellingPrice && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 14, color: "#991b1b", marginTop: 8 }}>
            ⚠️ Selling price must be greater than variable cost to reach break-even.
          </div>
        )}
      </div>

      {/* Results */}
      {valid && (
        <>
          <h2 className="fs-section-title">📊 Break-Even Results</h2>
          <div className="fs-kpi-grid" style={{ marginBottom: 24 }}>
            <div className="fs-kpi-card">
              <div className="fs-kpi-icon">📦</div>
              <div className="fs-kpi-label">Break-Even Units</div>
              <div className="fs-kpi-value fs-kpi-neutral">{breakEvenUnits.toLocaleString()}</div>
              <div className="fs-kpi-sub">units to sell</div>
            </div>
            <div className="fs-kpi-card">
              <div className="fs-kpi-icon">💵</div>
              <div className="fs-kpi-label">Break-Even Revenue</div>
              <div className="fs-kpi-value fs-kpi-positive">{fmt(breakEvenRevenue)}</div>
              <div className="fs-kpi-sub">total revenue needed</div>
            </div>
            <div className="fs-kpi-card">
              <div className="fs-kpi-icon">📅</div>
              <div className="fs-kpi-label">Break-Even Month</div>
              <div className="fs-kpi-value fs-kpi-neutral">{breakEvenMonth != null ? `Month ${breakEvenMonth}` : "—"}</div>
              <div className="fs-kpi-sub">{breakEvenMonth != null ? "at current sales pace" : "set monthly volume"}</div>
            </div>
            <div className="fs-kpi-card">
              <div className="fs-kpi-icon">📈</div>
              <div className="fs-kpi-label">Contribution Margin</div>
              <div className="fs-kpi-value fs-kpi-positive">${contributionMargin} ({marginPct}%)</div>
              <div className="fs-kpi-sub">per unit sold</div>
            </div>
          </div>

          {/* Revenue vs Cost Chart */}
          <h2 className="fs-section-title">📉 Revenue vs. Total Cost</h2>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 24, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#10b981,#34d399)", display: "inline-block" }} />Revenue
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 24, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#ef4444,#f87171)", display: "inline-block" }} />Total Cost
              </span>
            </div>
            {chartData.map(d => (
              <div key={d.units} style={{ marginBottom: 6 }}>
                <div className="fs-chart-row">
                  <span className="fs-chart-label">{d.units > 1000 ? `${(d.units / 1000).toFixed(1)}K` : d.units} u</span>
                  <div className="fs-bar-track"><div className="fs-bar-fill fs-bar-best" style={{ width: `${(d.revenue / chartMaxY) * 100}%` }} /></div>
                  <span className="fs-chart-val">{fmt(d.revenue)}</span>
                </div>
                <div className="fs-chart-row" style={{ marginBottom: 2 }}>
                  <span className="fs-chart-label" />
                  <div className="fs-bar-track"><div className="fs-bar-fill" style={{ width: `${(d.totalCost / chartMaxY) * 100}%`, background: "linear-gradient(90deg,#ef4444,#f87171)" }} /></div>
                  <span className="fs-chart-val">{fmt(d.totalCost)}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "14px 18px", background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", border: "1.5px solid #c4b5fd", borderRadius: 12, fontSize: 14, color: "#4c1d95", marginBottom: 24, marginTop: 8 }}>
            💡 At <strong>{breakEvenUnits.toLocaleString()} units</strong>, your revenue of <strong>{fmt(breakEvenRevenue)}</strong> exactly covers your fixed cost of <strong>{fmt(fixedCosts)}</strong> plus all variable costs. Every unit sold above this generates <strong>${contributionMargin} net profit</strong>.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Analysis</button>
          </div>

          <h2 className="fs-section-title">📤 Export</h2>
          <div className="fs-export-row">
            <button className="fs-export-btn" onClick={() => window.print()}>🖨️ PDF</button>
            <button className="fs-export-btn" onClick={exportExcel}>📊 Excel</button>
            <button className="fs-export-btn" onClick={exportCSV}>📄 CSV</button>
            <button className="fs-export-btn" onClick={exportMarkdown}>📝 Markdown</button>
            <button className="fs-export-btn" onClick={exportJSON}>{ }{} JSON</button>
          </div>
        </>
      )}

      {!valid && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">⚖️</div>
          <p>Enter your fixed costs, variable cost per unit and selling price to calculate your break-even point.</p>
        </div>
      )}
    </div>
  );
}
