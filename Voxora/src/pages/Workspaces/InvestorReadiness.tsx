// ── V6.1 Investor & Pitch Studio — Investor Readiness Score ──────────────────
import { useState } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import "./Workspace.css";
import "./InvestorStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface ReadinessResult {
  score: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  rawText: string;
}

function parseResult(text: string): ReadinessResult {
  // Extract score
  const scoreMatch = text.match(/(?:Score|SCORE)[:\s]+(\d+)/i) || text.match(/(\d+)\s*\/\s*100/);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 50;

  // Grade
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  // Extract lists
  const extractList = (section: string): string[] => {
    const regex = new RegExp(`(?:${section})[:\\s\\n]+([\\s\\S]*?)(?=(?:Weaknesses|Recommendations|Score|SCORE|$))`, "i");
    const match = text.match(regex);
    if (!match) return [];
    return match[1]
      .split("\n")
      .map(l => l.replace(/^[-•*\d.]+\s*/, "").trim())
      .filter(l => l.length > 10)
      .slice(0, 5);
  };

  const strengths        = extractList("Strengths");
  const weaknesses       = extractList("Weaknesses");
  const recommendations  = extractList("Recommendations");

  return { score, grade, strengths, weaknesses, recommendations, rawText: text };
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function InvestorReadiness({ setWorkspace }: Props) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const { isDemoMode }   = useAIContext();
  const { generate, isLoading } = useAI("investorReadiness");

  const [companyName,   setCompanyName]   = useState("");
  const [businessPlan,  setBusinessPlan]  = useState("");
  const [customerResearch, setCustomerResearch] = useState("");
  const [swot,          setSwot]          = useState("");
  const [businessModel, setBusinessModel] = useState("");
  const [result,        setResult]        = useState<ReadinessResult | null>(null);

  const analyze = async () => {
    if (!companyName.trim() || !businessPlan.trim()) return;

    const prompt = `You are an expert venture capital analyst assessing startup investor readiness.

Analyze this startup and provide a detailed investor readiness score.

Company: ${companyName}

## Business Plan
${businessPlan}

## Customer Research
${customerResearch || "Not provided"}

## SWOT Analysis
${swot || "Not provided"}

## Business Model
${businessModel || "Not provided"}

Provide your analysis in this EXACT format:

Score: [number out of 100]

Strengths:
- [strength 1]
- [strength 2]
- [strength 3]
- [strength 4]
- [strength 5]

Weaknesses:
- [weakness 1]
- [weakness 2]
- [weakness 3]
- [weakness 4]

Recommendations:
- [recommendation 1]
- [recommendation 2]
- [recommendation 3]
- [recommendation 4]
- [recommendation 5]

Detailed Assessment:
[Write 3–4 paragraphs explaining your assessment, covering: market opportunity quality, team/execution capability, competitive moat, financial readiness, and overall investment thesis. Be specific and actionable.]

Scoring Criteria Used:
- Business plan clarity & completeness (20 pts)
- Market opportunity size & validation (20 pts)
- Competitive differentiation (15 pts)
- Customer research & validation (15 pts)
- Business model & unit economics (15 pts)
- Team & execution capability (15 pts)`;

    const text = await generate(prompt);
    if (!text) return;

    const parsed = parseResult(text);
    setResult(parsed);

    addActivity({
      type: "investor_readiness_scored",
      title: "Investor Readiness Scored",
      description: `${companyName} scored ${parsed.score}/100 on investor readiness.`,
      category: "Investor", icon: "📊",
    });
    showToast(`📊 Investor readiness score: ${parsed.score}/100`);
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Investor Readiness Score — ${companyName} (${result.score}/100)`,
      category: "Investor Readiness",
      createdAt: new Date().toISOString(),
      notes: result.rawText,
    });
    addActivity({
      type: "investor_readiness_saved",
      title: "Investor Readiness Report Saved",
      description: `Readiness report for "${companyName}" saved.`,
      category: "Investor", icon: "📊",
    });
    showToast("💾 Report saved!");
  };

  const exportMarkdown = () => {
    if (!result) return;
    const md = `# Investor Readiness Report — ${companyName}\n\n**Score: ${result.score}/100 (${result.grade})**\n\n${result.rawText}`;
    downloadFile(`${companyName.replace(/\s+/g, "-")}-investor-readiness.md`, md, "text/markdown");
    showToast("📄 Markdown exported!");
  };

  const exportJSON = () => {
    if (!result) return;
    const data = { companyName, score: result.score, grade: result.grade, strengths: result.strengths, weaknesses: result.weaknesses, recommendations: result.recommendations, generatedAt: new Date().toISOString() };
    downloadFile(`${companyName.replace(/\s+/g, "-")}-investor-readiness.json`, JSON.stringify(data, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const getScoreColor = (s: number) => s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
  const getScoreLabel = (s: number) => s >= 90 ? "Raise-Ready" : s >= 80 ? "Nearly Ready" : s >= 60 ? "Needs Work" : "Early Stage";

  return (
    <div className="workspace-container" style={{ maxWidth: 760 }}>
      <button className="back-btn" onClick={() => setWorkspace("investorStudio")}>← Investor Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
      <h1>Investor Readiness Score</h1>
      <p className="workspace-subtitle">AI analysis of your startup — scored out of 100 with actionable strengths, weaknesses, and recommendations.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Company name *"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
        />
        <div>
          <label className="is-label">Business Plan Summary *</label>
          <textarea
            className="workspace-textarea"
            placeholder="Summarize your business plan — problem, solution, market, model, team, traction…"
            value={businessPlan}
            onChange={e => setBusinessPlan(e.target.value)}
            rows={5}
          />
        </div>
        <div>
          <label className="is-label">Customer Research <span style={{ fontWeight: 400, color: "var(--text-muted,#9ca3af)" }}>(optional — improves score accuracy)</span></label>
          <textarea
            className="workspace-textarea"
            placeholder="What did you learn from customer interviews? What evidence validates the problem and demand?"
            value={customerResearch}
            onChange={e => setCustomerResearch(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="is-label">SWOT Analysis <span style={{ fontWeight: 400, color: "var(--text-muted,#9ca3af)" }}>(optional)</span></label>
          <textarea
            className="workspace-textarea"
            placeholder="Paste your SWOT analysis here…"
            value={swot}
            onChange={e => setSwot(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="is-label">Business Model Canvas <span style={{ fontWeight: 400, color: "var(--text-muted,#9ca3af)" }}>(optional)</span></label>
          <textarea
            className="workspace-textarea"
            placeholder="Paste your business model canvas or description…"
            value={businessModel}
            onChange={e => setBusinessModel(e.target.value)}
            rows={3}
          />
        </div>
        <button
          className="workspace-btn"
          onClick={analyze}
          disabled={!companyName.trim() || !businessPlan.trim() || isLoading}
        >
          {isLoading ? "⏳ Analyzing…" : "📊 Calculate Investor Readiness Score"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          {/* Score card */}
          <div style={{
            background: `linear-gradient(135deg, ${getScoreColor(result.score)}22, ${getScoreColor(result.score)}08)`,
            border: `2px solid ${getScoreColor(result.score)}40`,
            borderRadius: 20, padding: "28px 32px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 28,
          }}>
            {/* Score circle */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width={120} height={120} viewBox="0 0 120 120">
                <circle cx={60} cy={60} r={52} fill="none" stroke="#e5e7eb" strokeWidth={10} />
                <circle
                  cx={60} cy={60} r={52} fill="none"
                  stroke={getScoreColor(result.score)} strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(result.score) }}>{result.score}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted,#6b7280)" }}>/ 100</span>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{
                  background: getScoreColor(result.score), color: "#fff",
                  padding: "2px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700,
                }}>
                  Grade {result.grade}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{getScoreLabel(result.score)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted,#6b7280)", lineHeight: 1.5 }}>
                Based on business plan, customer research, SWOT analysis, and business model completeness.
              </p>
            </div>
          </div>

          {/* Strengths, Weaknesses, Recommendations */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* Strengths */}
            <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "18px 20px", border: "1px solid #bbf7d0" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#166534" }}>✅ Strengths</h3>
              {result.strengths.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.strengths.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#15803d", lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>See full report below.</p>
              )}
            </div>

            {/* Weaknesses */}
            <div style={{ background: "#fff7ed", borderRadius: 14, padding: "18px 20px", border: "1px solid #fed7aa" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#9a3412" }}>⚠️ Weaknesses</h3>
              {result.weaknesses.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.weaknesses.map((w, i) => (
                    <li key={i} style={{ fontSize: 13, color: "#c2410c", lineHeight: 1.5 }}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>See full report below.</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div style={{ background: "#ede9fe", borderRadius: 14, padding: "18px 20px", border: "1px solid #c4b5fd", marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#4c1d95" }}>🎯 Recommendations</h3>
              <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {result.recommendations.map((r, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#5b21b6", lineHeight: 1.5 }}>{r}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Full report */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📋 Full Assessment Report</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="is-export-btn" onClick={exportMarkdown}>📄 MD</button>
                <button className="is-export-btn" onClick={exportJSON}>📦 JSON</button>
              </div>
            </div>
            <textarea
              className="workspace-textarea"
              value={result.rawText}
              onChange={e => setResult(prev => prev ? { ...prev, rawText: e.target.value } : prev)}
              rows={16}
              style={{ fontSize: 13, lineHeight: 1.7 }}
            />
            <button className="workspace-btn workspace-save-btn" onClick={save}>
              💾 Save Report
            </button>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Fill in your startup details above to get your investor readiness score.</p>
          <p style={{ fontSize: 13, color: "var(--text-muted,#6b7280)", margin: "-8px 0 0" }}>
            More inputs = more accurate score. At minimum, provide your business plan.
          </p>
        </div>
      )}
    </div>
  );
}
