// ── V6.2 Marketing Studio — Marketing Copy Generator ─────────────────────────
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

const AD_TYPES = [
  { key: "facebook",    icon: "📘", label: "Facebook Ads",        platform: "Facebook / Meta" },
  { key: "instagram",   icon: "📸", label: "Instagram Ads",       platform: "Instagram / Meta" },
  { key: "linkedin",    icon: "💼", label: "LinkedIn Ads",        platform: "LinkedIn" },
  { key: "google",      icon: "🔍", label: "Google Ads",          platform: "Google Search / Display" },
  { key: "twitter",     icon: "🐦", label: "Twitter / X Posts",   platform: "Twitter / X" },
  { key: "productDesc", icon: "🛍️", label: "Product Descriptions", platform: "E-commerce / Website" },
  { key: "pressRelease",icon: "📰", label: "Press Release",       platform: "PR / Media" },
];

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

export default function MarketingCopyGen({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("marketingCopy");

  const [productName,   setProductName]   = useState("");
  const [description,   setDescription]   = useState("");
  const [targetAudience,setTargetAudience]= useState("");
  const [keyBenefit,    setKeyBenefit]    = useState("");
  const [offer,         setOffer]         = useState("");
  const [activeType,    setActiveType]    = useState("facebook");
  const [results,       setResults]       = useState<Record<string, string>>({});
  const [generating,    setGenerating]    = useState(false);

  const adType = AD_TYPES.find(t => t.key === activeType)!;
  const currentResult = results[activeType] || "";

  const context = `Product/Service: ${productName}\nDescription: ${description}\nTarget audience: ${targetAudience}\nKey benefit: ${keyBenefit}\nOffer/CTA: ${offer || "Not specified"}`;

  const PROMPTS: Record<string, string> = {
    facebook: `Write high-converting Facebook ad copy.\n\n${context}\n\nProvide 3 complete Facebook ad variations:\n\n**Ad 1 — Awareness (Problem-Aware)**\n- Primary Text (≤125 chars for preview, full version 2-3 sentences)\n- Headline (≤40 chars)\n- Description (≤30 chars)\n- CTA button suggestion\n\n**Ad 2 — Consideration (Solution-Aware)**\n(Same structure)\n\n**Ad 3 — Conversion (Retargeting)**\n(Same structure)\n\nAlso include: targeting audience suggestions, bidding strategy note, A/B testing tip.`,
    instagram: `Write Instagram ad and organic post copy.\n\n${context}\n\nProvide:\n\n**3 Instagram Ad Variations:**\n- Caption (engaging, ≤2200 chars, includes hook, value, CTA)\n- Hashtags (20-30 relevant tags)\n- Story ad copy (punchy, swipe-up text)\n\n**3 Organic Post Captions:**\n- Educational post\n- Behind-the-scenes post\n- Social proof post\n\nInclude emoji usage, best posting times, and reel idea suggestions.`,
    linkedin: `Write professional LinkedIn ad and post copy.\n\n${context}\n\nProvide:\n\n**2 LinkedIn Sponsored Content Ads:**\n- Intro text (150 chars for preview)\n- Headline (≤70 chars)\n- Body copy (300-500 chars)\n- CTA\n\n**3 Organic LinkedIn Posts:**\n- Thought leadership post (600-800 words, includes hook, story, insights, CTA)\n- Product/service announcement\n- Customer success story format\n\nInclude hashtag suggestions and engagement tips.`,
    google: `Write Google Search and Display ad copy.\n\n${context}\n\nProvide:\n\n**Google Search Ads (Responsive):**\n- 15 Headlines (≤30 chars each)\n- 4 Descriptions (≤90 chars each)\n- 3 Sitelink extensions (title + description)\n- Callout extensions (10 short phrases)\n- Keywords to target (20 keywords in 3 match types: broad, phrase, exact)\n\n**Google Display Ad Copy:**\n- Short headline (≤25 chars)\n- Long headline (≤90 chars)\n- Description (≤90 chars)\n\nInclude Quality Score tips and ad copy best practices.`,
    twitter: `Write Twitter/X posts for marketing.\n\n${context}\n\nProvide 10 tweet variations:\n- 3 promotional tweets (with and without hashtags)\n- 2 thread starters (with bullet point continuations)\n- 2 engagement tweets (questions, polls)\n- 2 educational/value tweets\n- 1 viral-hook tweet\n\nEach under 280 chars (note if designed for thread). Include hashtag suggestions, best posting times, and engagement tips.`,
    productDesc: `Write compelling product descriptions.\n\n${context}\n\nProvide:\n\n**E-commerce Product Description (Long):**\n- Title (SEO-optimised)\n- Short description (≤160 chars, for preview)\n- Full description (300-500 words, benefits-led)\n- Bullet points (5 key features/benefits)\n- Technical specs template\n\n**App Store / SaaS Description:**\n- Short description (≤80 chars)\n- Full description (≤4000 chars)\n- Keywords\n\n**Amazon-style listing:**\n- Title, bullets, backend keywords\n\nInclude conversion copywriting principles used.`,
    pressRelease: `Write a professional press release.\n\n${context}\n\nFormat:\n\nFOR IMMEDIATE RELEASE\n\n**Headline** (news-worthy, ≤80 chars)\n**Sub-headline** (adds context, ≤120 chars)\n**Dateline** — City, Date — \n\n**Lead paragraph** (who, what, when, where, why — ≤100 words)\n\n**Body** (3-4 paragraphs: product details, market context, customer impact, company background)\n\n**Quote from CEO/Founder** (compelling, newsworthy)\n\n**Quote from Customer/Partner** (optional)\n\n**Boilerplate** (company description, 100 words)\n\n**Contact Information template**\n\n###\n\nAlso provide: 5 email subject lines for pitching to journalists, and a Twitter/LinkedIn announcement version.`,
  };

  const generateCopy = async () => {
    if (!productName.trim() || !description.trim()) return;
    setGenerating(true);
    const result = await generate(PROMPTS[activeType]);
    setResults(prev => ({ ...prev, [activeType]: result ?? "[Generation failed — please retry]" }));
    setGenerating(false);
    addActivity({ type: "marketing_copy_generated", title: "Marketing Copy Generated", description: `${adType.label} copy generated for "${productName}".`, category: "Marketing", icon: "✍️" });
    showToast(`✍️ ${adType.label} copy generated!`);
  };

  const save = () => {
    if (!currentResult) return;
    saveProject({ id: Date.now().toString(), title: `${adType.label} — ${productName}`, category: "Marketing Copy", createdAt: new Date().toISOString(), notes: currentResult });
    addActivity({ type: "marketing_copy_saved", title: "Marketing Copy Saved", description: `${adType.label} for "${productName}" saved.`, category: "Marketing", icon: "✍️" });
    showToast("💾 Saved!");
  };
  const exportMarkdown = () => {
    dlFile(`${productName.replace(/\s+/g, "-")}-${activeType}-copy.md`, `# ${adType.label} — ${productName}\n\n${currentResult}`, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    dlFile(`${productName.replace(/\s+/g, "-")}-marketing-copy.json`, JSON.stringify({ productName, description, targetAudience, keyBenefit, offer, adType: adType.label, copy: currentResult, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };
  const exportAllMarkdown = () => {
    const md = Object.entries(results).map(([k, v]) => {
      const t = AD_TYPES.find(a => a.key === k);
      return `# ${t?.label}\n\n${v}`;
    }).join("\n\n---\n\n");
    dlFile(`${productName.replace(/\s+/g, "-")}-all-marketing-copy.md`, md, "text/markdown");
    showToast("📄 All copy exported!");
  };

  const generatedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>✍️</div>
      <h1>Marketing Copy Generator</h1>
      <p className="workspace-subtitle">AI-generated ad copy for every major platform — Facebook, Instagram, LinkedIn, Google, Twitter/X, product descriptions and press releases.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Input form */}
      <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 14, padding: "20px 22px", border: "1px solid var(--border,#e5e7eb)", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>📝 Product Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input className="workspace-input" placeholder="Product / Service name *" value={productName} onChange={e => setProductName(e.target.value)} />
          <input className="workspace-input" placeholder="Target audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
          <input className="workspace-input" placeholder="Key benefit / USP" value={keyBenefit} onChange={e => setKeyBenefit(e.target.value)} />
          <input className="workspace-input" placeholder="Offer / CTA (e.g. 'Free 14-day trial')" value={offer} onChange={e => setOffer(e.target.value)} />
        </div>
        <textarea className="workspace-textarea" style={{ marginTop: 12 }} placeholder="Describe your product/service in detail *" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        {generatedCount > 0 && (
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            <button className="ms-export-btn" onClick={exportAllMarkdown}>📄 Export All ({generatedCount}) to Markdown</button>
          </div>
        )}
      </div>

      {/* Platform tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {AD_TYPES.map(t => (
          <button key={t.key} onClick={() => setActiveType(t.key)} style={{
            padding: "8px 14px", border: `1.5px solid ${activeType === t.key ? "#6C63FF" : "var(--border,#e5e7eb)"}`,
            borderRadius: 8, background: activeType === t.key ? "#6C63FF" : "var(--card-bg,#fff)",
            color: activeType === t.key ? "#fff" : "var(--text,#374151)",
            fontSize: 12, fontWeight: activeType === t.key ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            {t.icon} {t.label}
            {results[t.key] && <span style={{ background: "#10b981", color: "#fff", borderRadius: 10, fontSize: 9, padding: "1px 5px" }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Active platform card */}
      <div style={{ border: "1px solid var(--border,#e5e7eb)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ background: "var(--card-bg,#f9fafb)", padding: "14px 18px", borderBottom: "1px solid var(--border,#e5e7eb)", display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{adType.icon}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{adType.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted,#6b7280)" }}>{adType.platform}</p>
            </div>
          </div>
          <button className="workspace-btn" onClick={generateCopy} disabled={!productName.trim() || !description.trim() || isLoading || generating} style={{ fontSize: 13, padding: "8px 18px" }}>
            {generating ? "⏳ Generating…" : currentResult ? "🔄 Regenerate" : "⚡ Generate"}
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {currentResult ? (
            <>
              <textarea className="workspace-textarea" value={currentResult} onChange={e => setResults(prev => ({ ...prev, [activeType]: e.target.value }))} rows={16} style={{ fontSize: 14, lineHeight: 1.7 }} />
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button className="workspace-btn workspace-save-btn" style={{ fontSize: 12 }} onClick={save}>💾 Save</button>
                <button className="ms-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
                <button className="ms-export-btn" onClick={exportJSON}>📦 JSON</button>
              </div>
            </>
          ) : generating ? (
            <div className="workspace-empty" style={{ minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>⏳</div>
              <p>Generating {adType.label}…</p>
            </div>
          ) : (
            <div className="workspace-empty" style={{ minHeight: 200 }}>
              <div style={{ fontSize: 36 }}>{adType.icon}</div>
              <p>Click <strong>⚡ Generate</strong> to create {adType.label} copy.</p>
              {!productName.trim() && <p style={{ fontSize: 13, color: "#ef4444" }}>Please fill in product details above first.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
