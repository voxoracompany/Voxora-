// ── V6.3 Revenue Forecast ────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

type Horizon = 12 | 24 | 36;

interface Inputs {
  startingRevenue: number;
  growthRate:      number;
  churnRate:       number;
  horizon:         Horizon;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function project(start: number, monthlyGrowth: number, churn: number, months: number) {
  const rows: number[] = [];
  let cur = start;
  for (let i = 1; i <= months; i++) {
    cur = cur * (1 + (monthlyGrowth - churn) / 100);
    rows.push(Math.max(0, cur));
  }
  return rows;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function monthLabel(i: number) { return `${MONTH_NAMES[i % 12]} Y${Math.floor(i / 12) + 1}`; }

export default function RevenueForecast({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { analyze, isLoading, isDemoMode } = useAI("revenueForecast");

  const [inputs, setInputs] = useState<Inputs>({
    startingRevenue: 10000,
    growthRate:      15,
    churnRate:       2,
    horizon:         12,
  });
  const [aiComment, setAiComment] = useState("");
  const [showAll,   setShowAll]   = useState(false);

  const set = <K extends keyof Inputs>(k: K, v: Inputs[K]) =>
    setInputs(p => ({ ...p, [k]: v }));

  /* Generate 3 scenarios */
  const best     = useMemo(() => project(inputs.startingRevenue, inputs.growthRate * 1.3, inputs.churnRate * 0.5, inputs.horizon), [inputs]);
  const expected = useMemo(() => project(inputs.startingRevenue, inputs.growthRate, inputs.churnRate, inputs.horizon), [inputs]);
  const worst    = useMemo(() => project(inputs.startingRevenue, inputs.growthRate * 0.6, inputs.churnRate * 1.5, inputs.horizon), [inputs]);

  const maxVal = Math.max(...best);

  const finalBest     = best[best.length - 1]     ?? 0;
  const finalExpected = expected[expected.length - 1] ?? 0;
  const finalWorst    = worst[worst.length - 1]   ?? 0;

  const generate = async () => {
    const prompt = `Revenue forecast: Starting revenue $${inputs.startingRevenue}/mo, ${inputs.growthRate}% monthly growth, ${inputs.churnRate}% churn, ${inputs.horizon}-month horizon. Best case: ${fmt(finalBest)}, Expected: ${fmt(finalExpected)}, Worst: ${fmt(finalWorst)}. Provide 3-4 sentences of strategic commentary on these projections, growth risks and opportunities.`;
    const out = await analyze(prompt, "revenueForecast");
    if (out) {
      setAiComment(out);
      addActivity({ type: "revenue_forecast_generated", title: "Revenue Forecast Generated", description: `${inputs.horizon}-month forecast created.`, category: "Finance", icon: "📈" });
    }
  };

  const saveProj = () => {
    const notes = `Revenue Forecast — ${inputs.horizon} months\nStarting: ${fmt(inputs.startingRevenue)} | Growth: ${inputs.growthRate}%/mo | Churn: ${inputs.churnRate}%\n\nBest Case (${inputs.horizon}mo): ${fmt(finalBest)}\nExpected (${inputs.horizon}mo): ${fmt(finalExpected)}\nWorst Case (${inputs.horizon}mo): ${fmt(finalWorst)}${aiComment ? "\n\nAI Commentary:\n" + aiComment : ""}`;
    saveProject({ id: Date.now().toString(), title: `Revenue Forecast — ${inputs.horizon}mo`, category: "Revenue Forecast", createdAt: new Date().toISOString(), notes });
    showToast("📈 Forecast saved!");
  };

  const exportCSV = () => {
    const rows = [["Month","Best Case","Expected","Worst Case"]];
    for (let i = 0; i < inputs.horizon; i++) rows.push([monthLabel(i), best[i].toFixed(0), expected[i].toFixed(0), worst[i].toFixed(0)]);
    downloadBlob(rows.map(r => r.join(",")).join("\n"), `revenue_forecast_${inputs.horizon}mo.csv`, "text/csv");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ inputs, scenarios: { best, expected, worst } }, null, 2), `revenue_forecast_${inputs.horizon}mo.json`, "application/json");
  };
  const exportMarkdown = () => {
    const header = `# Revenue Forecast — ${inputs.horizon} months\n\n| Month | Best | Expected | Worst |\n|-------|------|----------|-------|\n`;
    const rows = Array.from({ length: inputs.horizon }, (_, i) => `| ${monthLabel(i)} | ${fmt(best[i])} | ${fmt(expected[i])} | ${fmt(worst[i])} |`).join("\n");
    downloadBlob(header + rows, `revenue_forecast_${inputs.horizon}mo.md`, "text/markdown");
  };
  const exportExcel = () => {
    const rows = [["Month","Best Case","Expected","Worst Case"], ...Array.from({ length: inputs.horizon }, (_, i) => [monthLabel(i), best[i].toFixed(0), expected[i].toFixed(0), worst[i].toFixed(0)])];
    const html = `<table>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
    downloadBlob(html, `revenue_forecast_${inputs.horizon}mo.xls`, "application/vnd.ms-excel");
  };

  const displayRows = showAll ? inputs.horizon : Math.min(6, inputs.horizon);

  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>📈 Revenue Forecast</h1>
      <p className="workspace-subtitle">Project your revenue across 12, 24 or 36 months with best, expected and worst-case scenarios.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Inputs */}
      <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 className="fs-section-title">⚙️ Forecast Inputs</h2>
        <div className="fs-input-grid">
          <div className="fs-input-group">
            <label className="fs-label">Starting Monthly Revenue ($)</label>
            <input className="fs-input" type="number" min={0} value={inputs.startingRevenue} onChange={e => set("startingRevenue", Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Monthly Growth Rate (%)</label>
            <input className="fs-input" type="number" min={0} max={200} step={0.5} value={inputs.growthRate} onChange={e => set("growthRate", Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Monthly Churn Rate (%)</label>
            <input className="fs-input" type="number" min={0} max={100} step={0.1} value={inputs.churnRate} onChange={e => set("churnRate", Number(e.target.value))} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Forecast Horizon (months)</label>
            <div className="fs-tabs">
              {([12, 24, 36] as Horizon[]).map(h => (
                <button key={h} className={`fs-tab${inputs.horizon === h ? " active" : ""}`} onClick={() => set("horizon", h)}>{h}mo</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scenario summary */}
      <h2 className="fs-section-title">📊 Scenario Summary — Month {inputs.horizon}</h2>
      <div className="fs-scenario-grid" style={{ marginBottom: 24 }}>
        <div className="fs-scenario-card fs-scenario-best">
          <div className="fs-scenario-label">🌟 Best Case</div>
          <div className="fs-scenario-val">{fmt(finalBest)}</div>
          <div className="fs-scenario-sub">{inputs.growthRate * 1.3}% growth / {inputs.churnRate * 0.5}% churn</div>
        </div>
        <div className="fs-scenario-card fs-scenario-expected">
          <div className="fs-scenario-label">📌 Expected</div>
          <div className="fs-scenario-val">{fmt(finalExpected)}</div>
          <div className="fs-scenario-sub">{inputs.growthRate}% growth / {inputs.churnRate}% churn</div>
        </div>
        <div className="fs-scenario-card fs-scenario-worst">
          <div className="fs-scenario-label">⚠️ Worst Case</div>
          <div className="fs-scenario-val">{fmt(finalWorst)}</div>
          <div className="fs-scenario-sub">{(inputs.growthRate * 0.6).toFixed(1)}% growth / {inputs.churnRate * 1.5}% churn</div>
        </div>
      </div>

      {/* Bar Chart */}
      <h2 className="fs-section-title">📉 Visual Forecast</h2>
      <div className="fs-chart" style={{ marginBottom: 24 }}>
        {Array.from({ length: displayRows }, (_, i) => (
          <div key={i}>
            <div className="fs-chart-row">
              <span className="fs-chart-label">{monthLabel(i)}</span>
              <div className="fs-bar-track"><div className="fs-bar-fill fs-bar-best" style={{ width: `${maxVal > 0 ? (best[i] / maxVal) * 100 : 0}%` }} /></div>
              <span className="fs-chart-val">{fmt(best[i])}</span>
            </div>
            <div className="fs-chart-row">
              <span className="fs-chart-label" />
              <div className="fs-bar-track"><div className="fs-bar-fill fs-bar-expected" style={{ width: `${maxVal > 0 ? (expected[i] / maxVal) * 100 : 0}%` }} /></div>
              <span className="fs-chart-val">{fmt(expected[i])}</span>
            </div>
            <div className="fs-chart-row" style={{ marginBottom: 6 }}>
              <span className="fs-chart-label" />
              <div className="fs-bar-track"><div className="fs-bar-fill fs-bar-worst" style={{ width: `${maxVal > 0 ? (worst[i] / maxVal) * 100 : 0}%` }} /></div>
              <span className="fs-chart-val">{fmt(worst[i])}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ cls: "fs-bar-best", label: "Best Case" }, { cls: "fs-bar-expected", label: "Expected" }, { cls: "fs-bar-worst", label: "Worst Case" }].map(l => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ width: 24, height: 8, borderRadius: 4, display: "inline-block" }} className={`fs-bar-fill ${l.cls}`} />
            {l.label}
          </span>
        ))}
      </div>

      {displayRows < inputs.horizon && (
        <button className="fs-export-btn" onClick={() => setShowAll(true)} style={{ marginBottom: 16 }}>Show all {inputs.horizon} months ↓</button>
      )}

      {/* Full table */}
      <h2 className="fs-section-title">📋 Full Projection Table</h2>
      <div className="fs-table-wrap">
        <table className="fs-table">
          <thead>
            <tr><th>Month</th><th>Best Case</th><th>Expected</th><th>Worst Case</th></tr>
          </thead>
          <tbody>
            {Array.from({ length: inputs.horizon }, (_, i) => (
              <tr key={i}>
                <td>{monthLabel(i)}</td>
                <td className="positive">{fmt(best[i])}</td>
                <td>{fmt(expected[i])}</td>
                <td className="negative">{fmt(worst[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Commentary */}
      <button className="workspace-btn" onClick={generate} disabled={isLoading} style={{ marginBottom: 16 }}>
        {isLoading ? "⏳ Generating AI commentary…" : "🤖 Generate AI Commentary"}
      </button>
      {aiComment && (
        <div className="fs-ai-box">
          <strong>🤖 AI Commentary</strong><br /><br />{aiComment}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Forecast</button>
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
