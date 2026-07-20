// ── V4.6 Startup Analytics ────────────────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }


export default function StartupAnalytics({ setWorkspace }: Props) {
  const { projects } = useProjects();

  const autoScores = useMemo(() => {
    const has = (cats: string[]) => Math.min(1, projects.filter(p => cats.includes(p.category)).length);

    const validationScore = Math.round(
      has(["Customer Research","Product Validation","Market Research","Customer Persona"]) * 25 +
      has(["SWOT Analysis"]) * 15 +
      has(["Competitor Analysis"]) * 15 +
      has(["Business Model Canvas"]) * 20 +
      has(["App Idea","Startup Idea"]) * 25
    );
    const bizModelScore = Math.round(
      has(["Business Model Canvas"]) * 30 +
      has(["Revenue Model"]) * 25 +
      has(["Pricing Strategy"]) * 20 +
      has(["Unit Economics"]) * 15 +
      has(["Break-Even Analysis"]) * 10
    );
    const competitorScore = Math.round(
      has(["Competitor Analysis"]) * 40 +
      has(["SWOT Analysis"]) * 30 +
      has(["Market Research"]) * 30
    );
    const marketScore = Math.round(
      has(["Market Research"]) * 35 +
      has(["Customer Research"]) * 25 +
      has(["Customer Persona"]) * 25 +
      has(["Product Roadmap"]) * 15
    );
    const investorScore = Math.round(
      has(["Fundraising Strategy"]) * 20 +
      has(["Pitch Deck","Investor Pitch"]) * 25 +
      has(["Executive Summary"]) * 20 +
      has(["Due Diligence"]) * 15 +
      has(["Cap Table"]) * 10 +
      has(["Term Sheet"]) * 10
    );
    const readinessScore = Math.round((validationScore + bizModelScore + investorScore) / 3);
    return { validationScore, bizModelScore, competitorScore, marketScore, investorScore, readinessScore };
  }, [projects]);

  const [overrides, setOverrides] = useState<Partial<typeof autoScores>>({});
  const scores = { ...autoScores, ...overrides };

  const update = (key: keyof typeof autoScores, val: number) =>
    setOverrides(p => ({ ...p, [key]: val }));

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>🚀 Startup Analytics</h1>
      <p className="workspace-subtitle">Scores are auto-calculated from your workspace projects. Drag to adjust manually.</p>

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <p className="stat-value" style={{ color: scores.readinessScore >= 70 ? "#10b981" : scores.readinessScore >= 40 ? "#f59e0b" : "#ef4444" }}>{scores.readinessScore}%</p>
          <h3 className="stat-label">Startup Readiness</h3>
        </div>
        <div className="stat-card"><div className="stat-icon">📁</div><p className="stat-value">{projects.length}</p><h3 className="stat-label">Total Projects</h3></div>
        <div className="stat-card"><div className="stat-icon">💼</div><p className="stat-value">{scores.investorScore}%</p><h3 className="stat-label">Investor Ready</h3></div>
        <div className="stat-card"><div className="stat-icon">📊</div><p className="stat-value">{scores.bizModelScore}%</p><h3 className="stat-label">Biz Model</h3></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {[
          { key: "readinessScore" as const, label: "Startup Readiness", color: "#6C63FF", icon: "🚀" },
          { key: "validationScore" as const, label: "Validation Score", color: "#10b981", icon: "✅" },
          { key: "bizModelScore" as const, label: "Business Model Score", color: "#3b82f6", icon: "🏢" },
          { key: "competitorScore" as const, label: "Competitor Score", color: "#f59e0b", icon: "🏆" },
          { key: "marketScore" as const, label: "Market Opportunity Score", color: "#ec4899", icon: "📈" },
          { key: "investorScore" as const, label: "Investor Readiness", color: "#1d4ed8", icon: "💼" },
        ].map(s => (
          <div key={s.key} style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{s.icon} {s.label}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{scores[s.key]}%</span>
            </div>
            <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, marginBottom: 6 }}>
              <div style={{ height: 10, width: `${scores[s.key]}%`, background: s.color, borderRadius: 6, transition: "width 0.5s" }} />
            </div>
            <input type="range" min={0} max={100} value={scores[s.key]}
              onChange={e => update(s.key, Number(e.target.value))}
              style={{ width: "100%", accentColor: s.color }} />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div style={{ background: "linear-gradient(135deg, #eff6ff, #eef2ff)", border: "1.5px solid #bfdbfe", borderRadius: 14, padding: "18px 22px" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "#1e40af" }}>💡 Improvement Actions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {scores.validationScore < 50 && <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>→ Complete <strong>Customer Research</strong> and <strong>Product Validation</strong> to boost your Validation Score</p>}
          {scores.bizModelScore < 50 && <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>→ Build a <strong>Business Model Canvas</strong> and <strong>Revenue Model</strong> to improve your Business Model Score</p>}
          {scores.investorScore < 50 && <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>→ Create your <strong>Pitch Deck</strong> and <strong>Executive Summary</strong> to raise your Investor Readiness</p>}
          {scores.competitorScore < 50 && <p style={{ margin: 0, fontSize: 13, color: "#1e40af" }}>→ Run a <strong>Competitor Analysis</strong> and <strong>SWOT Analysis</strong> to strengthen your positioning</p>}
          {scores.readinessScore >= 70 && <p style={{ margin: 0, fontSize: 13, color: "#065f46", fontWeight: 700 }}>✅ Great progress! Your startup readiness score is strong. Keep building.</p>}
        </div>
      </div>
    </div>
  );
}
