// ── V6.3 Financial Health Score ──────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface Inputs {
  revenue:        number;
  expenses:       number;
  cashBalance:    number;
  monthlyBurn:    number;
  mrr:            number;
  mrrGrowth:      number;
  churnRate:      number;
  grossMargin:    number;
  debtToEquity:   number;
  customersCount: number;
}

const EMPTY: Inputs = {
  revenue: 50000, expenses: 40000, cashBalance: 100000,
  monthlyBurn: 5000, mrr: 8000, mrrGrowth: 12,
  churnRate: 3, grossMargin: 60, debtToEquity: 0.3, customersCount: 50,
};

interface ScoreItem { label: string; score: number; weight: number; detail: string }

function computeScore(inp: Inputs): { total: number; items: ScoreItem[]; strengths: string[]; risks: string[] } {
  const items: ScoreItem[] = [];

  // Profitability
  const profitMargin = inp.revenue > 0 ? ((inp.revenue - inp.expenses) / inp.revenue) * 100 : 0;
  const profScore = profitMargin > 20 ? 100 : profitMargin > 10 ? 80 : profitMargin > 0 ? 60 : profitMargin > -20 ? 30 : 0;
  items.push({ label: "Profitability", score: profScore, weight: 0.20, detail: `${profitMargin.toFixed(1)}% net margin` });

  // Runway
  const runway = inp.monthlyBurn > 0 ? inp.cashBalance / inp.monthlyBurn : 36;
  const runwayScore = runway > 24 ? 100 : runway > 18 ? 85 : runway > 12 ? 65 : runway > 6 ? 40 : 10;
  items.push({ label: "Cash Runway", score: runwayScore, weight: 0.20, detail: `${Math.min(Math.round(runway), 99)}+ months` });

  // MRR Growth
  const growthScore = inp.mrrGrowth > 20 ? 100 : inp.mrrGrowth > 10 ? 80 : inp.mrrGrowth > 5 ? 60 : inp.mrrGrowth > 0 ? 40 : 10;
  items.push({ label: "MRR Growth", score: growthScore, weight: 0.20, detail: `${inp.mrrGrowth}%/mo growth` });

  // Churn
  const churnScore = inp.churnRate < 1 ? 100 : inp.churnRate < 2 ? 85 : inp.churnRate < 5 ? 65 : inp.churnRate < 10 ? 40 : 10;
  items.push({ label: "Churn Rate", score: churnScore, weight: 0.15, detail: `${inp.churnRate}% monthly churn` });

  // Gross Margin
  const gmScore = inp.grossMargin > 70 ? 100 : inp.grossMargin > 50 ? 80 : inp.grossMargin > 30 ? 60 : inp.grossMargin > 10 ? 35 : 10;
  items.push({ label: "Gross Margin", score: gmScore, weight: 0.15, detail: `${inp.grossMargin}%` });

  // Debt / Leverage
  const debtScore = inp.debtToEquity < 0.1 ? 100 : inp.debtToEquity < 0.3 ? 85 : inp.debtToEquity < 0.6 ? 65 : inp.debtToEquity < 1.0 ? 40 : 15;
  items.push({ label: "Debt to Equity", score: debtScore, weight: 0.10, detail: `${inp.debtToEquity.toFixed(2)} ratio` });

  const total = Math.round(items.reduce((s, i) => s + i.score * i.weight, 0));

  const strengths: string[] = [];
  const risks: string[] = [];
  if (profitMargin > 10) strengths.push(`Strong profitability at ${profitMargin.toFixed(1)}% net margin`);
  else if (profitMargin < 0) risks.push(`Business is losing money — ${Math.abs(profitMargin).toFixed(1)}% net loss`);

  if (runway > 18) strengths.push(`Healthy cash runway of ${Math.round(runway)} months`);
  else if (runway < 9) risks.push(`Low runway — only ${Math.round(runway)} months of cash at current burn`);

  if (inp.mrrGrowth > 15) strengths.push(`Strong MRR growth at ${inp.mrrGrowth}% monthly`);
  else if (inp.mrrGrowth < 5) risks.push(`Slow MRR growth at ${inp.mrrGrowth}% monthly — below benchmark`);

  if (inp.churnRate < 2) strengths.push(`Excellent retention — only ${inp.churnRate}% monthly churn`);
  else if (inp.churnRate > 5) risks.push(`High churn at ${inp.churnRate}% monthly — customer retention needs work`);

  if (inp.grossMargin > 60) strengths.push(`High gross margin of ${inp.grossMargin}% indicates a scalable model`);
  else if (inp.grossMargin < 30) risks.push(`Low gross margin of ${inp.grossMargin}% limits profitability ceiling`);

  if (inp.debtToEquity < 0.3) strengths.push("Healthy balance sheet with low leverage");
  else if (inp.debtToEquity > 0.8) risks.push(`High debt-to-equity ratio of ${inp.debtToEquity} increases financial risk`);

  return { total, items, strengths, risks };
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function FinancialHealthScore({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { analyze, isLoading, isDemoMode } = useAI("financialHealth");

  const [inputs,    setInputs]    = useState<Inputs>(EMPTY);
  const [aiComment, setAiComment] = useState("");
  const [computed,  setComputed]  = useState(false);

  const set = <K extends keyof Inputs>(k: K, v: number) =>
    setInputs(p => ({ ...p, [k]: v }));

  const { total, items, strengths, risks } = useMemo(() => computeScore(inputs), [inputs]);

  const scoreLabel = total >= 80 ? "Excellent" : total >= 65 ? "Good" : total >= 50 ? "Fair" : "Needs Attention";
  const scoreCls   = total >= 80 ? "fs-score-excellent" : total >= 65 ? "fs-score-good" : total >= 50 ? "fs-score-fair" : "fs-score-poor";

  const generate = async () => {
    setComputed(true);
    const summary = `Financial health score: ${total}/100 (${scoreLabel}). Strengths: ${strengths.join("; ")}. Risks: ${risks.join("; ")}. Key metrics — Revenue: $${inputs.revenue}, Expenses: $${inputs.expenses}, Cash: $${inputs.cashBalance}, MRR: $${inputs.mrr}, Growth: ${inputs.mrrGrowth}%/mo, Churn: ${inputs.churnRate}%, Gross margin: ${inputs.grossMargin}%.`;
    const out = await analyze(`${summary} Provide 5 specific, prioritized AI recommendations to improve this company's financial health score. Be concrete and actionable.`, "financialHealth");
    if (out) {
      setAiComment(out);
      addActivity({ type: "financial_health_scored", title: "Financial Health Score Generated", description: `Score: ${total}/100 — ${scoreLabel}`, category: "Finance", icon: "💯" });
    }
  };

  const saveProj = () => {
    const notes = `Financial Health Score: ${total}/100 (${scoreLabel})\n\nStrengths:\n${strengths.map(s => "✅ " + s).join("\n")}\n\nRisks:\n${risks.map(r => "⚠️ " + r).join("\n")}${aiComment ? "\n\nAI Recommendations:\n" + aiComment : ""}`;
    saveProject({ id: Date.now().toString(), title: `Financial Health Score — ${total}/100`, category: "Financial Health", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "financial_health_saved", title: "Financial Health Score Saved", description: `Score: ${total}/100`, category: "Finance", icon: "💯" });
    showToast("💯 Health score saved!");
  };

  const exportMarkdown = () => {
    const md = `# Financial Health Score: ${total}/100\n\n**Rating:** ${scoreLabel}\n\n## Strengths\n${strengths.map(s => "- ✅ " + s).join("\n")}\n\n## Risks\n${risks.map(r => "- ⚠️ " + r).join("\n")}\n\n## Score Breakdown\n${items.map(i => `- ${i.label}: ${i.score}/100 (${i.detail})`).join("\n")}${aiComment ? "\n\n## AI Recommendations\n" + aiComment : ""}`;
    downloadBlob(md, "financial_health_score.md", "text/markdown");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ score: total, label: scoreLabel, inputs, items, strengths, risks, aiRecommendations: aiComment }, null, 2), "financial_health_score.json", "application/json");
  };
  const exportCSV = () => {
    const rows = [["Metric","Score","Weight","Detail"], ...items.map(i => [i.label, i.score, i.weight, i.detail])];
    downloadBlob(rows.map(r => r.join(",")).join("\n"), "financial_health_score.csv", "text/csv");
  };
  const exportExcel = () => {
    const rowsArr = [["Metric","Score","Weight","Detail"], ...items.map(i => [i.label, i.score, i.weight, i.detail])];
    const html = `<table>${rowsArr.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</table>`;
    downloadBlob(html, "financial_health_score.xls", "application/vnd.ms-excel");
  };

  const FIELDS: { key: keyof Inputs; label: string; suffix?: string; step?: number; max?: number }[] = [
    { key: "revenue",        label: "Monthly Revenue ($)" },
    { key: "expenses",       label: "Monthly Expenses ($)" },
    { key: "cashBalance",    label: "Cash Balance ($)" },
    { key: "monthlyBurn",    label: "Monthly Burn Rate ($)" },
    { key: "mrr",            label: "MRR ($)" },
    { key: "mrrGrowth",      label: "MRR Growth Rate (%)", suffix: "%", step: 0.1, max: 200 },
    { key: "churnRate",      label: "Monthly Churn Rate (%)", suffix: "%", step: 0.1, max: 100 },
    { key: "grossMargin",    label: "Gross Margin (%)", suffix: "%", step: 0.5, max: 100 },
    { key: "debtToEquity",   label: "Debt-to-Equity Ratio", step: 0.01, max: 10 },
    { key: "customersCount", label: "Number of Customers" },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>💯 Financial Health Score</h1>
      <p className="workspace-subtitle">Get an instant score out of 100 with strengths, risks, and AI-powered improvement recommendations.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Score Ring */}
      {computed && (
        <div className="fs-score-wrap" style={{ marginBottom: 24 }}>
          <div className={`fs-score-ring ${scoreCls}`}>
            <span className="fs-score-num">{total}</span>
            <span className="fs-score-denom">/ 100</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{scoreLabel}</div>
            <div style={{ fontSize: 14, color: "var(--text-muted, #6b7280)", marginBottom: 12 }}>Based on 6 weighted financial indicators</div>
            {/* Score breakdown bars */}
            {items.map(item => (
              <div key={item.label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: item.score >= 80 ? "#10b981" : item.score >= 60 ? "#6C63FF" : "#ef4444", fontWeight: 700 }}>{item.score}/100 — {item.detail}</span>
                </div>
                <div className="fs-bar-track">
                  <div
                    className="fs-bar-fill"
                    style={{
                      width: `${item.score}%`,
                      background: item.score >= 80 ? "linear-gradient(90deg,#10b981,#34d399)" : item.score >= 60 ? "linear-gradient(90deg,#6C63FF,#8b83ff)" : "linear-gradient(90deg,#ef4444,#f87171)"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inputs */}
      <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 className="fs-section-title">⚙️ Financial Inputs</h2>
        <div className="fs-input-grid">
          {FIELDS.map(f => (
            <div key={f.key} className="fs-input-group">
              <label className="fs-label">{f.label}</label>
              <input
                className="fs-input"
                type="number"
                min={0}
                step={f.step ?? 1}
                max={f.max}
                value={inputs[f.key]}
                onChange={e => set(f.key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
        <button className="workspace-btn" onClick={generate} disabled={isLoading}>
          {isLoading ? "⏳ Calculating score…" : computed ? "🔄 Recalculate Score" : "💯 Calculate Health Score"}
        </button>
      </div>

      {/* Strengths & Risks */}
      {computed && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <h2 className="fs-section-title">✅ Strengths</h2>
              <div className="fs-list">
                {strengths.length > 0 ? strengths.map(s => (
                  <div key={s} className="fs-list-item fs-list-item-strength">✅ {s}</div>
                )) : <div className="fs-list-item fs-list-item-risk">No clear strengths identified — improve your metrics.</div>}
              </div>
            </div>
            <div>
              <h2 className="fs-section-title">⚠️ Risks</h2>
              <div className="fs-list">
                {risks.length > 0 ? risks.map(r => (
                  <div key={r} className="fs-list-item fs-list-item-risk">⚠️ {r}</div>
                )) : <div className="fs-list-item fs-list-item-strength">No major risks detected — great financial position!</div>}
              </div>
            </div>
          </div>

          {aiComment && (
            <>
              <h2 className="fs-section-title">🤖 AI Recommendations</h2>
              <div className="fs-list">
                {aiComment.split("\n").filter(Boolean).map((line, i) => (
                  <div key={i} className="fs-list-item fs-list-item-rec">{line}</div>
                ))}
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Score</button>
          </div>

          <h2 className="fs-section-title" style={{ marginTop: 24 }}>📤 Export</h2>
          <div className="fs-export-row">
            <button className="fs-export-btn" onClick={() => window.print()}>🖨️ PDF</button>
            <button className="fs-export-btn" onClick={exportExcel}>📊 Excel</button>
            <button className="fs-export-btn" onClick={exportCSV}>📄 CSV</button>
            <button className="fs-export-btn" onClick={exportMarkdown}>📝 Markdown</button>
            <button className="fs-export-btn" onClick={exportJSON}>{ }{} JSON</button>
          </div>
        </>
      )}

      {!computed && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">💯</div>
          <p>Fill in your financial metrics above and click "Calculate Health Score" to get your score, strengths, risks and AI recommendations.</p>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="fs-export-btn" onClick={() => setWorkspace("financialDashboard")}>📊 Dashboard →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("cashFlowPlanner")}>💸 Cash Flow →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("investorStudio")}>🚀 Investor Studio →</button>
      </div>
    </div>
  );
}
