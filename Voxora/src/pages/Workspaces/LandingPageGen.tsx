// ── V6.2 Marketing Studio — Landing Page Generator ───────────────────────────
import { useState } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import { escapeHtml }   from "../../services/storage/SafeStorage";
import "./Workspace.css";
import "./MarketingStudio.css";

interface Props { setWorkspace: (w: string) => void }

const SECTIONS = [
  { key: "hero",         icon: "🚀", label: "Hero Section"    },
  { key: "headlines",    icon: "📰", label: "Headlines"       },
  { key: "features",     icon: "⚙️", label: "Features"       },
  { key: "benefits",     icon: "✅", label: "Benefits"        },
  { key: "testimonials", icon: "💬", label: "Testimonials"    },
  { key: "faqs",         icon: "❓", label: "FAQs"            },
  { key: "cta",          icon: "🎯", label: "Call-to-Action"  },
  { key: "footer",       icon: "🔗", label: "Footer"          },
];

type Sections = Record<string, string>;
const EMPTY: Sections = Object.fromEntries(SECTIONS.map(s => [s.key, ""]));

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

export default function LandingPageGen({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("landingPage");

  const [productName,   setProductName]   = useState("");
  const [description,   setDescription]   = useState("");
  const [targetAudience,setTargetAudience]= useState("");
  const [keyBenefit,    setKeyBenefit]    = useState("");
  const [cta,           setCta]           = useState("Start Free Trial");
  const [sections,      setSections]      = useState<Sections>(EMPTY);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const [generating,    setGenerating]    = useState(false);
  const [genIndex,      setGenIndex]      = useState(0);

  const generateAll = async () => {
    if (!productName.trim() || !description.trim()) return;
    setGenerating(true);
    const fresh: Sections = { ...EMPTY };

    const context = `Product/Company: ${productName}\nDescription: ${description}\nTarget audience: ${targetAudience}\nKey benefit: ${keyBenefit}\nPrimary CTA: ${cta}`;

    const prompts: Record<string, string> = {
      hero: `Write a compelling hero section for a landing page.\n\n${context}\n\nInclude:\n- H1 headline (powerful, benefit-driven, ≤10 words)\n- H2 sub-headline (expands on H1, 1-2 sentences)\n- Hero body copy (2-3 sentences describing the core value prop)\n- Primary CTA button text\n- Secondary CTA (optional)\n- Social proof line (e.g. "Trusted by 1,000+ founders")`,
      headlines: `Write 15 headline variations for a landing page.\n\n${context}\n\nInclude 5 each of:\n- Benefit-focused headlines\n- Problem-focused headlines\n- Curiosity / question headlines\n\nFor each headline note which formula it uses (e.g. "Before → After", "How to", "The [X] for [audience]").`,
      features: `Write the features section for a landing page.\n\n${context}\n\nCreate 6 features:\n- Feature name (2-4 words)\n- Feature icon suggestion (emoji)\n- Short description (1-2 sentences, benefit-focused not just feature-focused)\n- One-line proof point\n\nAlso write an intro heading and sub-heading for the features section.`,
      benefits: `Write the benefits section for a landing page.\n\n${context}\n\nCreate:\n- Section heading\n- 5 key benefits, each with:\n  - Benefit headline (short, punchy)\n  - 2-3 sentence description focusing on the outcome for the customer\n  - Relevant emoji\n- A before/after comparison table showing life without vs with the product`,
      testimonials: `Write 6 realistic, compelling customer testimonials for a landing page.\n\n${context}\n\nFor each testimonial include:\n- Customer name (make up a realistic name)\n- Job title and company\n- Star rating (4-5 stars)\n- Quote (3-5 sentences, specific outcomes and numbers where possible)\n- Key result highlighted in bold\n\nMake them diverse (different industries, use cases, outcomes).`,
      faqs: `Write 10 frequently asked questions and answers for a landing page.\n\n${context}\n\nCover:\n- Product/feature questions\n- Pricing and value questions\n- Getting started questions\n- Support/reliability questions\n- Comparison questions (vs alternatives)\n\nAnswers should be 2-4 sentences, confident and conversion-focused. Also provide FAQ schema JSON markup.`,
      cta: `Write conversion-focused call-to-action copy for a landing page.\n\n${context}\n\nProvide:\n- 5 CTA button text variations (with notes on when to use each)\n- CTA section heading\n- CTA section sub-copy (2-3 sentences)\n- Risk reversal copy (e.g. no credit card, free trial language)\n- Urgency/scarcity element (if appropriate)\n- Exit intent popup copy\n- Sticky header CTA text`,
      footer: `Write the footer copy for a landing page.\n\n${context}\n\nInclude:\n- Company tagline (1 line)\n- Footer navigation links (grouped by category)\n- Social proof snippet\n- Newsletter signup micro-copy\n- Legal/compliance links\n- Copyright line\n- Trust badges description (e.g. SSL, G2, BBB)\n- One final conversion CTA`,
    };

    for (let i = 0; i < SECTIONS.length; i++) {
      const s = SECTIONS[i];
      setGenIndex(i);
      const result = await generate(prompts[s.key]);
      fresh[s.key] = result ?? "[Generation failed — please retry]";
      setSections(prev => ({ ...prev, [s.key]: fresh[s.key] }));
    }

    setGenerating(false);
    setActiveSection(SECTIONS[0].key);
    addActivity({ type: "landing_page_generated", title: "Landing Page Generated", description: `Landing page copy generated for "${productName}".`, category: "Marketing", icon: "🖥️" });
    showToast("🖥️ Landing page copy generated!");
  };

  const allGenerated = SECTIONS.every(s => sections[s.key]);

  const save = () => {
    const notes = SECTIONS.map(s => `## ${s.label}\n\n${sections[s.key]}`).join("\n\n---\n\n");
    saveProject({ id: Date.now().toString(), title: `Landing Page — ${productName}`, category: "Landing Page", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "landing_page_saved", title: "Landing Page Saved", description: `Landing page for "${productName}" saved.`, category: "Marketing", icon: "🖥️" });
    showToast("💾 Landing page saved!");
  };
  const exportMarkdown = () => {
    const md = `# ${productName} — Landing Page Copy\n\n` + SECTIONS.map(s => `## ${s.label}\n\n${sections[s.key]}`).join("\n\n---\n\n");
    dlFile(`${productName.replace(/\s+/g, "-")}-landing-page.md`, md, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    dlFile(`${productName.replace(/\s+/g, "-")}-landing-page.json`, JSON.stringify({ productName, description, targetAudience, keyBenefit, cta, sections, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };
  const exportPDF = () => {
    const safeProductName = escapeHtml(productName);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeProductName} — Landing Page</title><style>body{font-family:-apple-system,sans-serif;padding:48px;max-width:820px;margin:auto;color:#111;font-size:15px;line-height:1.7}h1{color:#6C63FF;font-size:28px}h2{color:#0f766e;font-size:18px;margin-top:32px;border-bottom:2px solid #6C63FF;padding-bottom:6px}pre{white-space:pre-wrap;font-family:inherit}footer{margin-top:48px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}</style></head><body>
<h1>🖥️ ${safeProductName} — Landing Page Copy</h1>
${SECTIONS.map(s => `<h2>${s.icon} ${escapeHtml(s.label)}</h2><pre>${escapeHtml(sections[s.key])}</pre>`).join("")}
<footer>Generated by Voxora Marketing Studio · ${new Date().toLocaleDateString()}</footer></body></html>`;
    const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    showToast("🖨️ PDF print dialog opened!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 880 }}>
      <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🖥️</div>
      <h1>Landing Page Generator</h1>
      <p className="workspace-subtitle">AI-generated landing page copy — hero, headlines, features, benefits, testimonials, FAQs, CTAs and footer.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {!generating && !allGenerated && (
        <div className="workspace-form">
          <input className="workspace-input" placeholder="Product / Company name *" value={productName} onChange={e => setProductName(e.target.value)} />
          <textarea className="workspace-textarea" placeholder="What does your product do? Who does it help and how? *" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          <div className="workspace-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <input className="workspace-input" placeholder="Target audience (e.g. 'SaaS founders')" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
            <input className="workspace-input" placeholder="Key benefit (e.g. 'Save 10 hrs/week')" value={keyBenefit} onChange={e => setKeyBenefit(e.target.value)} />
          </div>
          <input className="workspace-input" placeholder="Primary CTA text (e.g. 'Start Free Trial')" value={cta} onChange={e => setCta(e.target.value)} />
          <button className="workspace-btn" onClick={generateAll} disabled={!productName.trim() || !description.trim() || isLoading}>
            {isLoading ? "⏳ Generating…" : "🖥️ Generate Full Landing Page Copy"}
          </button>
          <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 10, padding: "12px 16px", border: "1px solid var(--border,#e5e7eb)" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Sections generated:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {SECTIONS.map((s, i) => <div key={s.key} style={{ fontSize: 12, color: "var(--text-muted,#6b7280)" }}><span style={{ background: "#6C63FF", color: "#fff", borderRadius: 4, padding: "0 5px", fontSize: 10, fontWeight: 700, marginRight: 4 }}>{i + 1}</span>{s.icon} {s.label}</div>)}
            </div>
          </div>
        </div>
      )}

      {(generating || allGenerated) && (
        <div style={{ display: "flex", gap: 0, minHeight: 500, border: "1px solid var(--border,#e5e7eb)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ width: 190, flexShrink: 0, background: "var(--sidebar-bg,#f9fafb)", borderRight: "1px solid var(--border,#e5e7eb)", padding: "12px 0" }}>
            {SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
                width: "100%", textAlign: "left", padding: "10px 14px", border: "none",
                background: activeSection === s.key ? "var(--accent-light,#ede9fe)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                borderLeft: activeSection === s.key ? "3px solid #6C63FF" : "3px solid transparent",
              }}>
                <span>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: activeSection === s.key ? 600 : 400 }}>{s.label}</span>
                {sections[s.key] && <span style={{ marginLeft: "auto", color: "#10b981", fontSize: 10 }}>✓</span>}
                {generating && genIndex === i && !sections[s.key] && <span style={{ marginLeft: "auto", fontSize: 10 }}>⏳</span>}
              </button>
            ))}
            {allGenerated && (
              <div style={{ padding: "12px", borderTop: "1px solid var(--border,#e5e7eb)", marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                <button className="workspace-btn workspace-save-btn" style={{ width: "100%", fontSize: 11 }} onClick={save}>💾 Save</button>
                <button className="ms-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
                <button className="ms-export-btn" onClick={exportJSON}>📦 JSON</button>
                <button className="ms-export-btn" onClick={exportPDF}>🖨️ PDF</button>
                <button className="ms-export-btn" style={{ marginTop: 4 }} onClick={() => { setSections(EMPTY); setGenerating(false); }}>🔄 New</button>
              </div>
            )}
          </div>
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            {(() => {
              const s = SECTIONS.find(s => s.key === activeSection)!;
              return generating && !sections[activeSection] ? (
                <div className="workspace-empty">
                  <div style={{ fontSize: 36 }}>⏳</div>
                  <p>Generating {s.label}…</p>
                  <div style={{ width: "100%", maxWidth: 300, background: "#e5e7eb", borderRadius: 8, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${(genIndex / SECTIONS.length) * 100}%`, height: "100%", background: "#6C63FF", transition: "width 0.4s" }} />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>{s.icon} {s.label}</h3>
                  <textarea className="workspace-textarea" value={sections[activeSection] || ""} onChange={e => setSections(prev => ({ ...prev, [activeSection]: e.target.value }))} rows={18} style={{ fontSize: 14, lineHeight: 1.7 }} />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {!generating && !allGenerated && !description && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🖥️</div>
          <p>Fill in your product details to generate a complete landing page copy kit.</p>
        </div>
      )}
    </div>
  );
}
