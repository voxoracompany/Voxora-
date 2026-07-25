// ── V6.1 Investor & Pitch Studio — Funding Calculator ────────────────────────
import { useState, useMemo } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import "./Workspace.css";
import "./InvestorStudio.css";

interface Props { setWorkspace: (w: string) => void }

function fmt(n: number, decimals = 0): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtMoney(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${fmt(n)}`;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function FundingCalculator({ setWorkspace }: Props) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();

  const [amountRaising,     setAmountRaising]     = useState("");
  const [preMoneyValuation, setPreMoneyValuation] = useState("");
  const [monthlyBurnRate,   setMonthlyBurnRate]   = useState("");
  const [currentCash,       setCurrentCash]       = useState("");
  const [companyName,       setCompanyName]       = useState("");

  const raise   = parseFloat(amountRaising.replace(/[^0-9.]/g, "")) || 0;
  const preMoney = parseFloat(preMoneyValuation.replace(/[^0-9.]/g, "")) || 0;
  const burn    = parseFloat(monthlyBurnRate.replace(/[^0-9.]/g, "")) || 0;
  const cash    = parseFloat(currentCash.replace(/[^0-9.]/g, "")) || 0;

  const results = useMemo(() => {
    const postMoney       = preMoney + raise;
    const equityPct       = preMoney > 0 ? (raise / postMoney) * 100 : 0;
    const founderEquity   = 100 - equityPct;
    const runwayMonths    = burn > 0 ? (cash + raise) / burn : 0;
    const runwayYears     = runwayMonths / 12;
    const capitalEfficiency = raise > 0 ? (cash + raise) / raise : 0;
    const monthsCurrentCash = burn > 0 && cash > 0 ? cash / burn : 0;

    return { postMoney, equityPct, founderEquity, runwayMonths, runwayYears, capitalEfficiency, monthsCurrentCash };
  }, [raise, preMoney, burn, cash]);

  const hasResults = raise > 0 || preMoney > 0;

  const METRICS = [
    { label: "Post-Money Valuation",   value: fmtMoney(results.postMoney),         icon: "🏦", color: "#6C63FF" },
    { label: "Equity Offered",         value: results.equityPct > 0 ? `${results.equityPct.toFixed(1)}%` : "—", icon: "📊", color: "#3b82f6" },
    { label: "Founder Equity Retained",value: results.founderEquity > 0 ? `${results.founderEquity.toFixed(1)}%` : "—", icon: "👤", color: "#8b5cf6" },
    { label: "Runway (with raise)",    value: results.runwayMonths > 0 ? `${fmt(results.runwayMonths)} months` : "—", icon: "⏱️", color: "#10b981" },
    { label: "Runway in Years",        value: results.runwayYears > 0 ? `${results.runwayYears.toFixed(1)} years` : "—", icon: "📅", color: "#059669" },
    { label: "Current Cash Runway",    value: results.monthsCurrentCash > 0 ? `${fmt(results.monthsCurrentCash)} months` : "—", icon: "💵", color: "#f59e0b" },
  ];

  const getRunwayColor = (months: number) => {
    if (months >= 24) return "#10b981";
    if (months >= 12) return "#f59e0b";
    return "#ef4444";
  };

  const getRunwayLabel = (months: number) => {
    if (months >= 24) return "✅ Strong runway";
    if (months >= 12) return "⚠️ Adequate runway";
    if (months > 0)   return "🔴 Runway is short — prioritize fundraising";
    return "";
  };

  const save = () => {
    const notes = `## Funding Calculator Results\n
**Amount Raising:** ${fmtMoney(raise)}
**Pre-Money Valuation:** ${fmtMoney(preMoney)}
**Post-Money Valuation:** ${fmtMoney(results.postMoney)}
**Equity Offered:** ${results.equityPct.toFixed(1)}%
**Founder Equity Retained:** ${results.founderEquity.toFixed(1)}%
**Monthly Burn Rate:** ${fmtMoney(burn)}
**Runway (post-raise):** ${fmt(results.runwayMonths)} months (${results.runwayYears.toFixed(1)} years)
**Current Cash Runway:** ${fmt(results.monthsCurrentCash)} months`;

    saveProject({
      id: Date.now().toString(),
      title: `Funding Calculator — ${companyName || "My Company"}`,
      category: "Funding Calculator",
      createdAt: new Date().toISOString(),
      notes,
    });
    addActivity({
      type: "funding_calc_saved",
      title: "Funding Calculation Saved",
      description: `Funding model saved for "${companyName || "company"}".`,
      category: "Investor", icon: "💰",
    });
    showToast("💾 Funding model saved!");
  };

  const exportJSON = () => {
    const data = {
      companyName,
      inputs: { amountRaising: raise, preMoneyValuation: preMoney, monthlyBurnRate: burn, currentCash: cash },
      results: {
        postMoneyValuation: results.postMoney,
        equityOfferedPct: results.equityPct,
        founderEquityRetainedPct: results.founderEquity,
        runwayMonths: results.runwayMonths,
        runwayYears: results.runwayYears,
        currentCashRunwayMonths: results.monthsCurrentCash,
      },
      generatedAt: new Date().toISOString(),
    };
    downloadFile(`${(companyName || "funding").replace(/\s+/g, "-")}-calculator.json`, JSON.stringify(data, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const exportMarkdown = () => {
    const md = `# Funding Calculator — ${companyName || "My Company"}

## Inputs
- Amount Raising: ${fmtMoney(raise)}
- Pre-Money Valuation: ${fmtMoney(preMoney)}
- Monthly Burn Rate: ${fmtMoney(burn)}
- Current Cash: ${fmtMoney(cash)}

## Results
- **Post-Money Valuation:** ${fmtMoney(results.postMoney)}
- **Equity Offered:** ${results.equityPct.toFixed(1)}%
- **Founder Equity Retained:** ${results.founderEquity.toFixed(1)}%
- **Runway (post-raise):** ${fmt(results.runwayMonths)} months
- **Current Cash Runway:** ${fmt(results.monthsCurrentCash)} months

_Generated by Voxora Investor Studio · ${new Date().toLocaleDateString()}_`;
    downloadFile(`${(companyName || "funding").replace(/\s+/g, "-")}-calculator.md`, md, "text/markdown");
    showToast("📄 Markdown exported!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 800 }}>
      <button className="back-btn" onClick={() => setWorkspace("investorStudio")}>← Investor Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
      <h1>Funding Calculator</h1>
      <p className="workspace-subtitle">Enter your raise parameters — equity, runway, and post-money valuation are calculated automatically.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        {/* Inputs */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📥 Inputs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label className="is-label">Company Name</label>
              <input className="workspace-input" placeholder="My Startup Inc." value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label className="is-label">Amount Raising ($)</label>
              <input className="workspace-input" placeholder="e.g. 2000000" value={amountRaising} onChange={e => setAmountRaising(e.target.value)} type="number" min={0} />
              {amountRaising && <p className="is-hint">{fmtMoney(raise)}</p>}
            </div>
            <div>
              <label className="is-label">Pre-Money Valuation ($)</label>
              <input className="workspace-input" placeholder="e.g. 8000000" value={preMoneyValuation} onChange={e => setPreMoneyValuation(e.target.value)} type="number" min={0} />
              {preMoneyValuation && <p className="is-hint">{fmtMoney(preMoney)}</p>}
            </div>
            <div>
              <label className="is-label">Monthly Burn Rate ($)</label>
              <input className="workspace-input" placeholder="e.g. 80000" value={monthlyBurnRate} onChange={e => setMonthlyBurnRate(e.target.value)} type="number" min={0} />
              {monthlyBurnRate && <p className="is-hint">{fmtMoney(burn)}/month</p>}
            </div>
            <div>
              <label className="is-label">Current Cash on Hand ($)</label>
              <input className="workspace-input" placeholder="e.g. 200000" value={currentCash} onChange={e => setCurrentCash(e.target.value)} type="number" min={0} />
              {currentCash && <p className="is-hint">{fmtMoney(cash)}</p>}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📊 Calculated Results</h3>
          {hasResults ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {METRICS.map(m => (
                <div key={m.label} style={{
                  background: "var(--card-bg,#f9fafb)", borderRadius: 12, padding: "12px 16px",
                  border: "1px solid var(--border,#e5e7eb)", display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 18, background: `${m.color}18`,
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted,#6b7280)" }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</p>
                  </div>
                </div>
              ))}

              {/* Runway health */}
              {results.runwayMonths > 0 && (
                <div style={{
                  background: `${getRunwayColor(results.runwayMonths)}18`, borderRadius: 12,
                  padding: "10px 16px", border: `1px solid ${getRunwayColor(results.runwayMonths)}40`,
                }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: getRunwayColor(results.runwayMonths) }}>
                    {getRunwayLabel(results.runwayMonths)}
                  </p>
                </div>
              )}

              {/* Dilution bar */}
              {results.equityPct > 0 && (
                <div style={{ marginTop: 4 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                    Equity split after raise
                  </p>
                  <div style={{ borderRadius: 8, overflow: "hidden", height: 20, display: "flex" }}>
                    <div style={{
                      width: `${results.founderEquity}%`, background: "#6C63FF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#fff", fontWeight: 700, transition: "width 0.3s",
                    }}>
                      {results.founderEquity > 15 ? `Founders ${results.founderEquity.toFixed(0)}%` : ""}
                    </div>
                    <div style={{
                      width: `${results.equityPct}%`, background: "#3b82f6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#fff", fontWeight: 700, transition: "width 0.3s",
                    }}>
                      {results.equityPct > 8 ? `Investors ${results.equityPct.toFixed(0)}%` : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="workspace-empty" style={{ minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>💡</div>
              <p style={{ fontSize: 13 }}>Enter your raise amount and valuation to see calculated results.</p>
            </div>
          )}
        </div>
      </div>

      {/* Funding rules of thumb */}
      <div style={{
        background: "var(--card-bg,#f9fafb)", borderRadius: 16,
        padding: "20px 24px", border: "1px solid var(--border,#e5e7eb)", marginBottom: 24,
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>📏 Fundraising Rules of Thumb</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Ideal Equity at Seed", val: "15–25%" },
            { label: "Ideal Equity at Series A", val: "20–30%" },
            { label: "Target Runway", val: "18–24 months" },
            { label: "Burn Multiple Target", val: "< 2x net new ARR" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg,#fff)", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted,#6b7280)" }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF" }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>

      {hasResults && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save</button>
          <button className="is-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
          <button className="is-export-btn" onClick={exportJSON}>📦 JSON</button>
        </div>
      )}
    </div>
  );
}
