// ── V6.2 Marketing Studio — Brand Identity Generator ─────────────────────────
import { useState } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import "./Workspace.css";
import "./MarketingStudio.css";

interface Props { setWorkspace: (w: string) => void }

const SECTIONS = [
  { key: "companyNames",    icon: "🏢", label: "Company Name Suggestions"  },
  { key: "taglines",        icon: "✨", label: "Taglines"                   },
  { key: "missionStatement",icon: "🎯", label: "Mission Statement"          },
  { key: "visionStatement", icon: "🔭", label: "Vision Statement"           },
  { key: "brandVoice",      icon: "🎙️", label: "Brand Voice"               },
  { key: "brandPersonality",icon: "💎", label: "Brand Personality"          },
  { key: "colorPalette",    icon: "🎨", label: "Colour Palette Suggestions" },
];

type Sections = Record<string, string>;
const EMPTY: Sections = Object.fromEntries(SECTIONS.map(s => [s.key, ""]));

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

export default function BrandIdentityGen({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("brandIdentity");

  const [industry,     setIndustry]     = useState("Technology");
  const [description,  setDescription]  = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone,         setTone]         = useState("Professional & Trustworthy");
  const [sections,     setSections]     = useState<Sections>(EMPTY);
  const [activeSection,setActiveSection]= useState(SECTIONS[0].key);
  const [generating,   setGenerating]   = useState(false);
  const [genIndex,     setGenIndex]     = useState(0);

  const INDUSTRIES = ["Technology","SaaS","FinTech","HealthTech","EdTech","E-Commerce","Food & Beverage","Fashion","Consulting","Non-Profit","Media","Real Estate","Other"];
  const TONES = ["Professional & Trustworthy","Friendly & Approachable","Bold & Disruptive","Luxurious & Premium","Playful & Fun","Inspirational & Motivating","Minimalist & Clean"];

  const generateAll = async () => {
    if (!description.trim()) return;
    setGenerating(true);
    const fresh: Sections = { ...EMPTY };

    const prompts: Record<string, string> = {
      companyNames: `Generate 10 unique, memorable company name suggestions for a ${industry} company.\n\nDescription: ${description}\nTarget audience: ${targetAudience}\nTone: ${tone}\n\nFor each name provide:\n- The name\n- Why it works (1 sentence)\n- Domain availability tip\n\nFormat as a numbered list.`,
      taglines: `Write 10 powerful taglines for a ${industry} brand.\n\nDescription: ${description}\nTone: ${tone}\n\nMake them catchy, memorable, and under 10 words each. Provide a brief note on what makes each one work.`,
      missionStatement: `Write 3 compelling mission statement options for a ${industry} company.\n\nDescription: ${description}\nTarget audience: ${targetAudience}\nTone: ${tone}\n\nEach should be 1-2 sentences, action-oriented, and focused on the impact on customers.`,
      visionStatement: `Write 3 inspiring vision statement options for a ${industry} company.\n\nDescription: ${description}\nTone: ${tone}\n\nEach should be 1-2 sentences describing the long-term future the company is working toward.`,
      brandVoice: `Define the complete brand voice for a ${industry} company.\n\nDescription: ${description}\nTone: ${tone}\nTarget audience: ${targetAudience}\n\nInclude:\n- Voice in 4 words\n- Tone description (2-3 sentences)\n- Do's (5 bullet points)\n- Don'ts (5 bullet points)\n- Example sentences showing the brand voice in action`,
      brandPersonality: `Define the brand personality for a ${industry} company.\n\nDescription: ${description}\nTone: ${tone}\n\nInclude:\n- Brand archetype (e.g. The Hero, The Sage, The Creator)\n- 5 key personality traits with explanations\n- Celebrity or brand comparisons\n- How this personality shows up in marketing\n- Brand values (5 core values with descriptions)`,
      colorPalette: `Suggest brand colour palettes for a ${industry} company.\n\nDescription: ${description}\nTone: ${tone}\n\nProvide 3 complete palette options:\n- Primary colour (hex code + name + psychology)\n- Secondary colour (hex code + name)\n- Accent colour (hex code + name)\n- Neutral colours (2-3 options)\n- Typography pairing recommendation\n- Where to use each colour\n\nExplain the psychology behind each palette choice.`,
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
    addActivity({ type: "brand_identity_generated", title: "Brand Identity Generated", description: `Brand identity generated for a ${industry} company.`, category: "Marketing", icon: "🎨" });
    showToast("🎨 Brand identity generated!");
  };

  const allGenerated = SECTIONS.every(s => sections[s.key]);

  const save = () => {
    const notes = SECTIONS.map(s => `## ${s.label}\n\n${sections[s.key]}`).join("\n\n---\n\n");
    saveProject({ id: Date.now().toString(), title: `Brand Identity — ${industry}`, category: "Brand Identity", createdAt: new Date().toISOString(), notes });
    addActivity({ type: "brand_identity_saved", title: "Brand Identity Saved", description: `Brand identity for ${industry} saved.`, category: "Marketing", icon: "🎨" });
    showToast("💾 Brand identity saved!");
  };

  const exportMarkdown = () => {
    const md = `# Brand Identity\n_${industry} · ${tone}_\n\n` + SECTIONS.map(s => `## ${s.label}\n\n${sections[s.key]}`).join("\n\n---\n\n");
    dlFile("brand-identity.md", md, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    dlFile("brand-identity.json", JSON.stringify({ industry, description, targetAudience, tone, sections, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };
  const exportPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Brand Identity</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:48px;max-width:820px;margin:auto;color:#111;font-size:15px;line-height:1.7}h1{color:#6C63FF;font-size:30px}h2{color:#1e3a8a;font-size:18px;margin-top:32px;border-bottom:2px solid #6C63FF;padding-bottom:6px}pre{white-space:pre-wrap;font-family:inherit}footer{margin-top:48px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}</style></head><body>
<h1>🎨 Brand Identity</h1><p><strong>${industry}</strong> · ${tone}</p>
${SECTIONS.map(s => `<h2>${s.icon} ${s.label}</h2><pre>${sections[s.key]}</pre>`).join("")}
<footer>Generated by Voxora Marketing Studio · ${new Date().toLocaleDateString()}</footer></body></html>`;
    const w = window.open("", "_blank"); if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
    showToast("🖨️ PDF print dialog opened!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 860 }}>
      <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
      <h1>Brand Identity Generator</h1>
      <p className="workspace-subtitle">AI-generated brand identity: names, taglines, mission, vision, voice, personality & colour palette.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {!generating && !allGenerated && (
        <div className="workspace-form">
          <div className="workspace-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <select className="workspace-input" value={industry} onChange={e => setIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
            <select className="workspace-input" value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <textarea className="workspace-textarea" placeholder="Describe your business — what you do, who you serve, and the problem you solve. *" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          <textarea className="workspace-textarea" placeholder="Target audience (e.g. 'Early-stage founders aged 25–40')" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} rows={2} />
          <button className="workspace-btn" onClick={generateAll} disabled={!description.trim() || isLoading}>
            {isLoading ? "⏳ Generating…" : "🎨 Generate Full Brand Identity"}
          </button>
        </div>
      )}

      {(generating || allGenerated) && (
        <div style={{ display: "flex", gap: 0, minHeight: 500, border: "1px solid var(--border,#e5e7eb)", borderRadius: 14, overflow: "hidden" }}>
          {/* Section nav */}
          <div style={{ width: 200, flexShrink: 0, background: "var(--sidebar-bg,#f9fafb)", borderRight: "1px solid var(--border,#e5e7eb)", padding: "12px 0" }}>
            {SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)} style={{
                width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: activeSection === s.key ? "var(--accent-light,#ede9fe)" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                borderLeft: activeSection === s.key ? "3px solid #6C63FF" : "3px solid transparent", transition: "background 0.15s",
              }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: activeSection === s.key ? 600 : 400, lineHeight: 1.3 }}>{s.label}</span>
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
                <button className="ms-export-btn" style={{ marginTop: 4 }} onClick={() => { setSections(EMPTY); setGenerating(false); }}>🔄 Regenerate</button>
              </div>
            )}
          </div>
          {/* Content */}
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
                  <h3 style={{ margin: "0 0 14px", fontSize: 17, fontWeight: 700 }}>{s.icon} {s.label}</h3>
                  <textarea className="workspace-textarea" value={sections[activeSection] || ""} onChange={e => setSections(prev => ({ ...prev, [activeSection]: e.target.value }))} rows={18} style={{ fontSize: 14, lineHeight: 1.7 }} placeholder="Generating…" />
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {!generating && !allGenerated && (
        <div className="workspace-empty" style={{ marginTop: 16 }}>
          <div className="workspace-empty-icon">🎨</div>
          <p>Fill in your business details above to generate a complete brand identity.</p>
        </div>
      )}
    </div>
  );
}
