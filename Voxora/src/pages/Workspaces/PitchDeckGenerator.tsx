// ── V6.1 Investor & Pitch Studio — Pitch Deck Generator ──────────────────────
import { useState, useCallback } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import "./Workspace.css";
import "./InvestorStudio.css";

interface Props { setWorkspace: (w: string) => void }

const SLIDES = [
  { key: "companyOverview",      icon: "🏢", label: "Company Overview",       hint: "Name, mission, one-line description, founding date, location." },
  { key: "problem",              icon: "❗", label: "Problem",                hint: "The specific pain point your customers face. Be concrete with data." },
  { key: "solution",             icon: "💡", label: "Solution",               hint: "How your product/service solves the problem. Key differentiators." },
  { key: "marketOpportunity",    icon: "📈", label: "Market Opportunity",     hint: "TAM, SAM, SOM — total addressable, serviceable, obtainable market." },
  { key: "businessModel",        icon: "💰", label: "Business Model",         hint: "How you make money — pricing, revenue streams, margins." },
  { key: "goToMarket",           icon: "🚀", label: "Go-To-Market Strategy",  hint: "How you acquire customers: channels, CAC, early traction plan." },
  { key: "competitorAnalysis",   icon: "🏆", label: "Competitor Analysis",    hint: "Key competitors, your differentiation, and why you win." },
  { key: "financialProjections", icon: "📊", label: "Financial Projections",  hint: "3-year revenue forecast, key metrics, path to profitability." },
  { key: "team",                 icon: "👥", label: "Team",                   hint: "Founders and key hires — backgrounds, roles, why this team." },
  { key: "fundingAsk",           icon: "🤝", label: "Funding Ask",            hint: "Amount raising, valuation, use of funds, milestones to hit." },
];

type Slides = Record<string, string>;
type View = "form" | "deck";

const EMPTY_SLIDES: Slides = Object.fromEntries(SLIDES.map(s => [s.key, ""]));

function downloadFile(filename: string, content: string, mimeType: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function PitchDeckGenerator({ setWorkspace }: Props) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const { isDemoMode }   = useAIContext();
  const { generate, isLoading } = useAI("pitchDeck");

  const [view,          setView]          = useState<View>("form");
  const [companyName,   setCompanyName]   = useState("");
  const [industry,      setIndustry]      = useState("Technology");
  const [stage,         setStage]         = useState("Pre-Seed");
  const [description,   setDescription]  = useState("");
  const [slides,        setSlides]        = useState<Slides>(EMPTY_SLIDES);
  const [activeSlide,   setActiveSlide]   = useState(SLIDES[0].key);
  const [generating,    setGenerating]    = useState(false);
  const [genIndex,      setGenIndex]      = useState(0);

  const INDUSTRIES = ["Technology","SaaS","FinTech","HealthTech","EdTech","E-Commerce","CleanTech","Consumer","B2B","Other"];
  const STAGES     = ["Idea","Pre-Seed","Seed","Series A","Series B","Growth"];

  const generateAll = useCallback(async () => {
    if (!companyName.trim() || !description.trim()) return;
    setGenerating(true);
    setView("deck");
    const fresh: Slides = { ...EMPTY_SLIDES };

    for (let i = 0; i < SLIDES.length; i++) {
      const s = SLIDES[i];
      setGenIndex(i);
      const prompt = `You are an expert pitch deck writer. Generate the "${s.label}" slide for a ${stage} ${industry} startup called "${companyName}".

Business description: ${description}

Write compelling, investor-ready content for this slide. Be specific, data-driven where possible, and concise.
Use clear bullet points or short paragraphs suitable for a pitch deck slide.
Focus only on the "${s.label}" section. Aim for 150–300 words.

Hint: ${s.hint}`;

      const result = await generate(prompt);
      fresh[s.key] = result ?? "[Generation failed — please retry]";
      setSlides(prev => ({ ...prev, [s.key]: fresh[s.key] }));
    }

    setGenerating(false);
    setActiveSlide(SLIDES[0].key);
    addActivity({
      type: "pitch_deck_generated",
      title: "Pitch Deck Generated",
      description: `10-slide pitch deck generated for "${companyName}".`,
      category: "Investor", icon: "🎯",
    });
    showToast("🎯 Pitch deck generated!");
  }, [companyName, description, industry, stage, generate, addActivity, showToast]);

  const saveDeck = () => {
    const fullText = SLIDES.map(s => `## ${s.label}\n\n${slides[s.key]}`).join("\n\n---\n\n");
    saveProject({
      id: Date.now().toString(),
      title: `Pitch Deck — ${companyName}`,
      category: "Pitch Deck",
      createdAt: new Date().toISOString(),
      notes: fullText,
    });
    addActivity({
      type: "pitch_deck_saved",
      title: "Pitch Deck Saved",
      description: `Pitch deck for "${companyName}" saved to projects.`,
      category: "Investor", icon: "🎯",
    });
    showToast("💾 Pitch deck saved!");
  };

  const exportMarkdown = () => {
    const md = `# ${companyName} — Investor Pitch Deck\n_${stage} · ${industry}_\n\n` +
      SLIDES.map(s => `## Slide ${SLIDES.indexOf(s) + 1}: ${s.label}\n\n${slides[s.key]}`).join("\n\n---\n\n");
    downloadFile(`${companyName.replace(/\s+/g, "-")}-pitch-deck.md`, md, "text/markdown");
    showToast("📄 Markdown exported!");
  };

  const exportJSON = () => {
    const data = { company: companyName, industry, stage, description, slides, generatedAt: new Date().toISOString() };
    downloadFile(`${companyName.replace(/\s+/g, "-")}-pitch-deck.json`, JSON.stringify(data, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const exportPDF = () => {
    const content = SLIDES.map(s =>
      `<div class="slide"><h2>${SLIDES.find(sl => sl.key === s.key)?.label}</h2><div class="content">${slides[s.key].replace(/\n/g, "<br/>")}</div></div>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${companyName} — Pitch Deck</title>
<style>
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; margin: 0; padding: 0; color: #111; }
  .slide { page-break-after: always; padding: 60px; min-height: 90vh; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-size: 36px; color: #6C63FF; margin: 0 0 8px; }
  h2 { font-size: 28px; color: #1e3a8a; margin: 0 0 20px; padding-bottom: 12px; border-bottom: 3px solid #6C63FF; }
  .content { font-size: 16px; line-height: 1.8; white-space: pre-wrap; }
  .cover { background: linear-gradient(135deg,#1e3a8a,#6C63FF); color: #fff; }
  .cover h1 { font-size: 48px; color: #fff; }
  @media print { .slide { page-break-after: always; } }
</style></head><body>
<div class="slide cover">
  <h1>${companyName}</h1>
  <p style="font-size:20px;opacity:.8">${stage} · ${industry}</p>
  <p style="font-size:14px;opacity:.6;margin-top:40px">Generated by Voxora Investor Studio</p>
</div>
${content}
</body></html>`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
    showToast("🖨️ PDF print dialog opened!");
  };

  const allGenerated = SLIDES.every(s => slides[s.key]);

  // ── Form view ─────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="workspace-container" style={{ maxWidth: 700 }}>
        <button className="back-btn" onClick={() => setWorkspace("investorStudio")}>← Investor Studio</button>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
        <h1>Pitch Deck Generator</h1>
        <p className="workspace-subtitle">AI-generated 10-slide investor pitch deck. Fill in the basics and we'll build the rest.</p>

        {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

        <div className="workspace-form">
          <input
            className="workspace-input"
            placeholder="Company name *"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
          <div className="workspace-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <select className="workspace-input" value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
            <select className="workspace-input" value={stage} onChange={e => setStage(e.target.value)}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <textarea
            className="workspace-textarea"
            placeholder="Describe your business in 2–4 sentences — what you do, who you serve, and why it matters. *"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
          />
          <button
            className="workspace-btn"
            onClick={generateAll}
            disabled={!companyName.trim() || !description.trim() || isLoading}
          >
            {isLoading ? "⏳ Generating…" : "🎯 Generate 10-Slide Pitch Deck"}
          </button>
        </div>

        <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 12, padding: "16px 20px", border: "1px solid var(--border,#e5e7eb)" }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>📋 Slides that will be generated:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {SLIDES.map((s, i) => (
              <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ background: "#6C63FF", color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                <span>{s.icon} {s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Deck view ─────────────────────────────────────────────────────────────
  const activeSlideObj = SLIDES.find(s => s.key === activeSlide)!;

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 600 }}>
      {/* Slide nav */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: "1px solid var(--border,#e5e7eb)",
        overflowY: "auto", padding: "16px 0",
        background: "var(--sidebar-bg,#f9fafb)",
      }}>
        <div style={{ padding: "0 16px 12px", borderBottom: "1px solid var(--border,#e5e7eb)", marginBottom: 8 }}>
          <button className="back-btn" style={{ fontSize: 12 }} onClick={() => setWorkspace("investorStudio")}>← Studio</button>
          <p style={{ margin: "6px 0 0", fontWeight: 700, fontSize: 13 }}>{companyName || "Pitch Deck"}</p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted,#6b7280)" }}>{stage} · {industry}</p>
        </div>
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setActiveSlide(s.key)}
            style={{
              width: "100%", textAlign: "left", padding: "10px 16px",
              background: activeSlide === s.key ? "var(--accent-light,#ede9fe)" : "transparent",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              borderLeft: activeSlide === s.key ? "3px solid #6C63FF" : "3px solid transparent",
              transition: "background 0.15s",
            }}
          >
            <span style={{
              background: slides[s.key] ? "#10b981" : (generating && genIndex === i ? "#f59e0b" : "#e5e7eb"),
              color: slides[s.key] ? "#fff" : "#374151",
              borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 700, minWidth: 20, textAlign: "center",
            }}>{i + 1}</span>
            <span style={{ fontSize: 12, fontWeight: activeSlide === s.key ? 600 : 400 }}>{s.icon} {s.label}</span>
          </button>
        ))}

        {/* Actions */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border,#e5e7eb)", marginTop: 8 }}>
          {allGenerated && (
            <>
              <button className="workspace-btn workspace-save-btn" style={{ width: "100%", fontSize: 12, marginBottom: 6 }} onClick={saveDeck}>
                💾 Save
              </button>
              <button className="workspace-btn" style={{ width: "100%", fontSize: 12, marginBottom: 6, background: "#374151" }} onClick={exportMarkdown}>
                📄 Markdown
              </button>
              <button className="workspace-btn" style={{ width: "100%", fontSize: 12, marginBottom: 6, background: "#374151" }} onClick={exportJSON}>
                📦 JSON
              </button>
              <button className="workspace-btn" style={{ width: "100%", fontSize: 12, background: "#374151" }} onClick={exportPDF}>
                🖨️ Print / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {generating && !slides[activeSlide] ? (
          <div className="workspace-empty">
            <div style={{ fontSize: 40 }}>⏳</div>
            <p>Generating slide {genIndex + 1} of {SLIDES.length}…</p>
            <p style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>
              Creating: {SLIDES[genIndex]?.label}
            </p>
            <div style={{ width: "100%", maxWidth: 300, background: "#e5e7eb", borderRadius: 8, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${((genIndex) / SLIDES.length) * 100}%`, height: "100%", background: "#6C63FF", transition: "width 0.3s" }} />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{activeSlideObj.icon}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{activeSlideObj.label}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted,#6b7280)" }}>{activeSlideObj.hint}</p>
              </div>
            </div>
            <textarea
              className="workspace-textarea"
              value={slides[activeSlide] || ""}
              onChange={e => setSlides(prev => ({ ...prev, [activeSlide]: e.target.value }))}
              rows={16}
              placeholder={generating ? "Generating…" : "Content will appear here after generation."}
              style={{ fontSize: 14, lineHeight: 1.7 }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {activeSlide !== SLIDES[0].key && (
                <button className="workspace-btn" style={{ background: "#374151", fontSize: 13 }}
                  onClick={() => { const i = SLIDES.findIndex(s => s.key === activeSlide); setActiveSlide(SLIDES[i - 1].key); }}>
                  ← Prev
                </button>
              )}
              {activeSlide !== SLIDES[SLIDES.length - 1].key && (
                <button className="workspace-btn" style={{ fontSize: 13 }}
                  onClick={() => { const i = SLIDES.findIndex(s => s.key === activeSlide); setActiveSlide(SLIDES[i + 1].key); }}>
                  Next →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
