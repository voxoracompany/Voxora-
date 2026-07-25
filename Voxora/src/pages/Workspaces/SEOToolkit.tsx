// ── V6.2 Marketing Studio — SEO Toolkit ──────────────────────────────────────
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

const TOOLS = [
  { key: "seoTitle",      icon: "🏷️", label: "SEO Title & Meta Description" },
  { key: "keywords",      icon: "🔑", label: "Keyword Research"              },
  { key: "blogOutline",   icon: "📝", label: "Blog Post Outline"             },
  { key: "faqSchema",     icon: "❓", label: "FAQ Schema Markup"             },
  { key: "internalLinks", icon: "🔗", label: "Internal Linking Strategy"     },
];

type Results = Record<string, string>;
const EMPTY: Results = Object.fromEntries(TOOLS.map(t => [t.key, ""]));

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

function CharCounter({ text, max, warn }: { text: string; max: number; warn: number }) {
  const len = text.length;
  const color = len > max ? "#ef4444" : len > warn ? "#f59e0b" : "#10b981";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color }}>
      {len}/{max}
    </span>
  );
}

export default function SEOToolkit({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("seoToolkit");

  const [topic,         setTopic]         = useState("");
  const [url,           setUrl]           = useState("");
  const [industry,      setIndustry]      = useState("Technology");
  const [audience,      setAudience]      = useState("");
  const [activeTool,    setActiveTool]    = useState("seoTitle");
  const [results,       setResults]       = useState<Results>(EMPTY);
  const [generating,    setGenerating]    = useState(false);
  const [seoTitle,      setSeoTitle]      = useState("");
  const [metaDesc,      setMetaDesc]      = useState("");
  const [editingMeta,   setEditingMeta]   = useState(false);

  const INDUSTRIES = ["Technology","SaaS","FinTech","HealthTech","EdTech","E-Commerce","Consulting","Marketing","Legal","Real Estate","Other"];
  const tool = TOOLS.find(t => t.key === activeTool)!;
  const currentResult = results[activeTool] || "";

  const context = `Topic/Page: ${topic}\nURL slug: ${url || "not provided"}\nIndustry: ${industry}\nTarget audience: ${audience || "general"}`;

  const PROMPTS: Record<string, string> = {
    seoTitle: `Generate optimised SEO titles and meta descriptions.\n\n${context}\n\nProvide:\n\n**10 SEO Title Variations:**\n- Each title under 60 characters\n- Include primary keyword\n- Vary styles: question, number, how-to, benefit-led, brand+keyword\n- Note character count for each\n\n**5 Meta Description Variations:**\n- Each 150-160 characters\n- Include primary keyword naturally\n- Include a soft CTA\n- Note character count\n\n**Structured Data — Title Tag best practices** (3 bullet points)\n**Primary keyword recommendations** (5 keywords with search intent notes)`,
    keywords: `Perform keyword research for SEO.\n\n${context}\n\nProvide:\n\n**Primary Keywords (high-volume):**\n- 10 keywords with estimated monthly search volume range\n- Search intent (informational/navigational/commercial/transactional)\n- Competition level (low/medium/high)\n- Recommended for: page title / H1\n\n**Long-tail Keywords:**\n- 20 long-tail keywords (3-5 words)\n- Lower competition, higher conversion intent\n- Group into 4-5 topic clusters\n\n**LSI / Semantic Keywords:**\n- 15 related terms to use naturally in content\n\n**Question Keywords (PAA - People Also Ask):**\n- 15 questions people search around this topic\n\n**Keyword Mapping:**\n- Which keywords to target per page type (home, product, blog, landing)\n\n**Competitor Gap Analysis:**\n- 5 keyword opportunities competitors may be ranking for`,
    blogOutline: `Create a comprehensive blog post outline for SEO.\n\n${context}\n\nProvide a full SEO-optimised blog post outline:\n\n**Meta Info:**\n- Recommended title (with primary keyword)\n- Target keyword & secondary keywords\n- Word count target\n- Estimated reading time\n- Content type recommendation\n\n**Full Outline:**\n- H1: (main title)\n- Introduction hook strategy (2-3 sentence hook, what the reader will learn)\n- H2 sections (6-8 main sections)\n  - Each H2 with 2-4 H3 sub-sections\n  - Content notes for each section\n  - Word count per section\n- Conclusion format\n- CTA placement\n\n**On-page SEO Checklist:**\n- Internal linking opportunities\n- Image alt text suggestions (3 images)\n- Schema markup recommendation\n- Featured snippet optimisation tip\n\n**Promotion Strategy:**\n- 3 ways to promote this post after publishing`,
    faqSchema: `Generate FAQ content and JSON-LD schema markup.\n\n${context}\n\nProvide:\n\n**15 FAQs with Answers:**\n- Cover: beginner questions, advanced questions, pricing/value, comparisons, getting-started\n- Each answer: 2-4 sentences, naturally includes relevant keywords\n- Optimised for Google's People Also Ask feature\n\n**JSON-LD FAQ Schema Markup:**\n\`\`\`json\n[Complete valid JSON-LD schema for all 15 FAQs]\n\`\`\`\n\n**Implementation Instructions:**\n- Where to place the schema\n- How to validate it (Google Rich Results Test)\n- Expected impact on search results\n\n**Voice Search Optimisation Tips:**\n- 5 tips for optimising FAQ answers for voice search`,
    internalLinks: `Create an internal linking strategy.\n\n${context}\n\nProvide:\n\n**Internal Linking Architecture:**\n- Pillar page recommendations (3-4 main hub pages)\n- Cluster content topics (5-8 supporting pages per pillar)\n- Hub-and-spoke diagram description\n\n**Specific Linking Recommendations:**\n- 15 internal linking opportunities with:\n  - Source page type\n  - Destination page type\n  - Recommended anchor text (3 variations)\n  - Placement recommendation (intro, body, conclusion)\n\n**Anchor Text Strategy:**\n- 5 rules for natural anchor text\n- Keyword distribution guidelines\n- Avoid these anchor text mistakes\n\n**PageRank Flow Strategy:**\n- How to pass authority from high-traffic pages\n- Orphan page identification checklist\n\n**Technical Internal Linking:**\n- XML sitemap recommendations\n- Crawl depth guidelines\n- Redirect chain avoidance tips`,
  };

  const generateTool = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    const result = await generate(PROMPTS[activeTool]);
    const raw = result ?? "[Generation failed — please retry]";
    setResults(prev => ({ ...prev, [activeTool]: raw }));

    // Auto-extract title and meta if seoTitle tool
    if (activeTool === "seoTitle" && raw) {
      const titleMatch = raw.match(/^.{10,60}$/m);
      const metaMatch = raw.match(/^.{100,160}$/m);
      if (titleMatch) setSeoTitle(titleMatch[0].replace(/^\d+\.\s*/, "").trim());
      if (metaMatch) setMetaDesc(metaMatch[0].replace(/^\d+\.\s*/, "").trim());
    }

    setGenerating(false);
    addActivity({ type: "seo_tool_used", title: "SEO Toolkit Used", description: `${tool.label} generated for "${topic}".`, category: "Marketing", icon: "🔍" });
    showToast(`🔍 ${tool.label} generated!`);
  };

  const save = () => {
    if (!currentResult) return;
    saveProject({ id: Date.now().toString(), title: `SEO — ${tool.label}: ${topic}`, category: "SEO Toolkit", createdAt: new Date().toISOString(), notes: currentResult });
    showToast("💾 Saved!");
  };
  const exportMarkdown = () => {
    dlFile(`${topic.replace(/\s+/g, "-")}-seo-${activeTool}.md`, `# SEO: ${tool.label}\n_Topic: ${topic}_\n\n${currentResult}`, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    const allResults = Object.fromEntries(TOOLS.map(t => [t.key, results[t.key]]));
    dlFile(`${topic.replace(/\s+/g, "-")}-seo-toolkit.json`, JSON.stringify({ topic, url, industry, audience, results: allResults, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const generatedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
      <h1>SEO Toolkit</h1>
      <p className="workspace-subtitle">AI-powered SEO tools — titles, meta descriptions, keywords, blog outlines, FAQ schema and internal linking.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Quick meta preview (when seoTitle generated) */}
      {seoTitle && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>GOOGLE SEARCH PREVIEW</p>
          <div style={{ fontFamily: "arial,sans-serif" }}>
            <p style={{ margin: "0 0 2px", color: "#6C63FF", fontSize: 18, lineHeight: 1.2, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              {seoTitle}
              <span style={{ fontSize: 12, color: "#6b7280" }}><CharCounter text={seoTitle} max={60} warn={50} /></span>
            </p>
            <p style={{ margin: "0 0 2px", fontSize: 14, color: "#006621" }}>{url || "yoursite.com/page-slug"}</p>
            <p style={{ margin: 0, fontSize: 14, color: "#545454", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span>{metaDesc || "Meta description will appear here."}</span>
              <span style={{ fontSize: 12, color: "#6b7280", flexShrink: 0 }}><CharCounter text={metaDesc} max={160} warn={140} /></span>
            </p>
          </div>
          <button style={{ marginTop: 8, fontSize: 11, color: "#6C63FF", background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => setEditingMeta(!editingMeta)}>
            {editingMeta ? "▲ Hide editor" : "✏️ Edit preview"}
          </button>
          {editingMeta && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input className="workspace-input" style={{ flex: 1 }} value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="SEO Title" maxLength={65} />
                <CharCounter text={seoTitle} max={60} warn={50} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <textarea className="workspace-textarea" style={{ flex: 1, minHeight: 60 }} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Meta Description" maxLength={165} rows={2} />
                <CharCounter text={metaDesc} max={160} warn={140} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inputs */}
      <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border,#e5e7eb)", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <input className="workspace-input" placeholder="Topic, page title, or keyword *" value={topic} onChange={e => setTopic(e.target.value)} />
          <select className="workspace-input" value={industry} onChange={e => setIndustry(e.target.value)}>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <input className="workspace-input" placeholder="URL slug (e.g. /blog/how-to-grow)" value={url} onChange={e => setUrl(e.target.value)} />
          <input className="workspace-input" placeholder="Target audience" value={audience} onChange={e => setAudience(e.target.value)} />
        </div>
        {generatedCount > 0 && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#10b981", fontWeight: 600 }}>✓ {generatedCount}/{TOOLS.length} SEO tools generated</p>}
      </div>

      {/* Tool tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border,#e5e7eb)", marginBottom: 20, overflowX: "auto" }}>
        {TOOLS.map(t => (
          <button key={t.key} onClick={() => setActiveTool(t.key)} style={{
            padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
            borderBottom: activeTool === t.key ? "2px solid #6C63FF" : "2px solid transparent",
            marginBottom: -2, fontWeight: activeTool === t.key ? 700 : 400, fontSize: 12,
            color: activeTool === t.key ? "#6C63FF" : "var(--text-muted,#6b7280)", display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.icon} {t.label}
            {results[t.key] && <span style={{ background: "#10b981", color: "#fff", borderRadius: 10, fontSize: 9, padding: "1px 5px" }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Active tool */}
      <div style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: "var(--card-bg,#f9fafb)", padding: "12px 18px", borderBottom: "1px solid var(--border,#e5e7eb)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{tool.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{tool.label}</span>
          </div>
          <button className="workspace-btn" onClick={generateTool} disabled={!topic.trim() || isLoading || generating} style={{ fontSize: 13, padding: "8px 18px" }}>
            {generating ? "⏳ Generating…" : currentResult ? "🔄 Regenerate" : "🔍 Generate"}
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {currentResult ? (
            <>
              <textarea className="workspace-textarea" value={currentResult} onChange={e => setResults(prev => ({ ...prev, [activeTool]: e.target.value }))} rows={18} style={{ fontSize: 13, lineHeight: 1.7, fontFamily: activeTool === "faqSchema" ? "monospace" : "inherit" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button className="workspace-btn workspace-save-btn" style={{ fontSize: 12 }} onClick={save}>💾 Save</button>
                <button className="ms-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
                <button className="ms-export-btn" onClick={exportJSON}>📦 JSON</button>
              </div>
            </>
          ) : generating ? (
            <div className="workspace-empty" style={{ minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>⏳</div>
              <p>Generating {tool.label}…</p>
            </div>
          ) : (
            <div className="workspace-empty" style={{ minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>{tool.icon}</div>
              <p>Enter your topic above and click <strong>Generate</strong>.</p>
              {!topic.trim() && <p style={{ fontSize: 13, color: "#ef4444" }}>Please enter a topic or page title first.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
