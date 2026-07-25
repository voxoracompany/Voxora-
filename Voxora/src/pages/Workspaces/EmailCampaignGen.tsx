// ── V6.2 Marketing Studio — Email Campaign Generator ─────────────────────────
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

const EMAIL_TYPES = [
  { key: "welcome",     icon: "👋", label: "Welcome Email",      desc: "First impression after sign-up"          },
  { key: "launch",      icon: "🚀", label: "Launch Email",       desc: "Product / feature announcement"          },
  { key: "promotional", icon: "🏷️", label: "Promotional Email", desc: "Offer, discount or limited-time deal"     },
  { key: "newsletter",  icon: "📰", label: "Newsletter",         desc: "Regular value-packed update"              },
  { key: "followup",    icon: "🔄", label: "Follow-up Email",    desc: "Re-engage inactive or post-purchase"      },
];

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

export default function EmailCampaignGen({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("emailCampaign");

  const [companyName,    setCompanyName]    = useState("");
  const [productDesc,    setProductDesc]    = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [offer,          setOffer]          = useState("");
  const [tone,           setTone]           = useState("Friendly & Professional");
  const [activeType,     setActiveType]     = useState("welcome");
  const [results,        setResults]        = useState<Record<string, string>>({});
  const [generating,     setGenerating]     = useState(false);

  const TONES = ["Friendly & Professional","Conversational","Formal & Corporate","Bold & Exciting","Warm & Personal","Minimalist"];
  const emailType = EMAIL_TYPES.find(t => t.key === activeType)!;
  const currentResult = results[activeType] || "";

  const context = `Company: ${companyName}\nProduct/Service: ${productDesc}\nTarget audience: ${targetAudience}\nOffer: ${offer || "N/A"}\nTone: ${tone}`;

  const PROMPTS: Record<string, string> = {
    welcome: `Write a high-converting welcome email sequence.\n\n${context}\n\nProvide:\n\n**Email 1 — Immediate Welcome (sent instantly)**\n- Subject line (3 variations, A/B test ready)\n- Preview text\n- Full email body (personal, warm, 200-300 words)\n- CTA button text\n\n**Email 2 — Getting Started (Day 1)**\n- Subject line\n- Full email (how to get started, key feature spotlight)\n\n**Email 3 — Value Delivery (Day 3)**\n- Subject line\n- Full email (tip, case study, or educational content)\n\nAlso include: sender name recommendation, best send times, unsubscribe language.`,
    launch: `Write a product launch email campaign.\n\n${context}\n\nProvide:\n\n**Teaser Email (1 week before launch)**\n- Subject line (3 variations)\n- Preview text\n- Full email (build anticipation, hint at what's coming)\n\n**Launch Day Email**\n- Subject line (5 variations — pick the best)\n- Preview text\n- Full email (announcement, what's new, how to access)\n- CTA button text\n\n**Follow-up Email (48 hours after launch)**\n- Subject line\n- Full email (social proof, FAQs, urgency)\n\nAlso include: countdown timer copy, social sharing language.`,
    promotional: `Write a promotional email for a special offer.\n\n${context}\n\nProvide:\n\n**Main Promotional Email**\n- 5 subject line variations (urgency, curiosity, benefit-led)\n- Preview text (3 variations)\n- Full email body (hook, offer details, benefits, CTA, scarcity)\n- Primary CTA button text\n- Secondary CTA\n\n**Reminder Email (24 hours before offer ends)**\n- Subject line\n- Short urgency-focused email\n\n**Last Chance Email (1 hour before expiry)**\n- Subject line\n- Very short, high-urgency email\n\nInclude: discount code placeholder template, anti-spam tips.`,
    newsletter: `Write a complete newsletter template.\n\n${context}\n\nProvide:\n\n**Newsletter Issue Template:**\n- Subject line formula + 3 examples\n- Preview text template\n- Email header / brand statement\n- Sections:\n  1. Intro / editor's note (2-3 sentences)\n  2. Main story / feature article (300-400 words on a relevant topic)\n  3. Quick tips (3-5 bullet points)\n  4. Curated resources (3 items with descriptions)\n  5. Product/service spotlight\n  6. Community/social section\n  7. Closing CTA\n- Footer text\n\nAlso provide: content calendar for 4 newsletter topics, engagement metrics to track.`,
    followup: `Write follow-up email sequences.\n\n${context}\n\nProvide:\n\n**Post-Purchase Follow-up Sequence:**\n- Email 1: Order/sign-up confirmation (immediate)\n- Email 2: Onboarding tips (Day 2)\n- Email 3: Check-in / success milestone (Day 7)\n- Email 4: Testimonial / referral request (Day 14)\n- Email 5: Upsell / cross-sell (Day 30)\n\n**Re-engagement Sequence (Inactive Users):**\n- Email 1: "We miss you" (30 days inactive)\n- Email 2: Value reminder + offer (37 days)\n- Email 3: Last chance / breakup email (44 days)\n\nFor each email: subject line, preview text, full body, CTA.`,
  };

  const generateEmail = async () => {
    if (!companyName.trim() || !productDesc.trim()) return;
    setGenerating(true);
    const result = await generate(PROMPTS[activeType]);
    setResults(prev => ({ ...prev, [activeType]: result ?? "[Generation failed — please retry]" }));
    setGenerating(false);
    addActivity({ type: "email_campaign_generated", title: "Email Campaign Generated", description: `${emailType.label} generated for "${companyName}".`, category: "Marketing", icon: "📧" });
    showToast(`📧 ${emailType.label} generated!`);
  };

  const save = () => {
    if (!currentResult) return;
    saveProject({ id: Date.now().toString(), title: `${emailType.label} — ${companyName}`, category: "Email Campaign", createdAt: new Date().toISOString(), notes: currentResult });
    showToast("💾 Saved!");
  };
  const exportMarkdown = () => {
    dlFile(`${companyName.replace(/\s+/g, "-")}-${activeType}-email.md`, `# ${emailType.label} — ${companyName}\n\n${currentResult}`, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    dlFile(`${companyName.replace(/\s+/g, "-")}-email-campaign.json`, JSON.stringify({ companyName, productDesc, targetAudience, offer, tone, emailType: emailType.label, copy: currentResult, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const generatedCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="workspace-container" style={{ maxWidth: 880 }}>
      <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📧</div>
      <h1>Email Campaign Generator</h1>
      <p className="workspace-subtitle">AI-written email sequences — welcome, launch, promotional, newsletter and follow-up.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Inputs */}
      <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 14, padding: "20px 22px", border: "1px solid var(--border,#e5e7eb)", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>📝 Campaign Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input className="workspace-input" placeholder="Company / Brand name *" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          <input className="workspace-input" placeholder="Target audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
          <input className="workspace-input" placeholder="Offer / Promotion (optional)" value={offer} onChange={e => setOffer(e.target.value)} />
          <select className="workspace-input" value={tone} onChange={e => setTone(e.target.value)}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <textarea className="workspace-textarea" style={{ marginTop: 12 }} placeholder="Describe your product/service *" value={productDesc} onChange={e => setProductDesc(e.target.value)} rows={3} />
      </div>

      {/* Email type selector */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border,#e5e7eb)", marginBottom: 20 }}>
        {EMAIL_TYPES.map(t => (
          <button key={t.key} onClick={() => setActiveType(t.key)} style={{
            padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer",
            borderBottom: activeType === t.key ? "2px solid #6C63FF" : "2px solid transparent",
            marginBottom: -2, fontWeight: activeType === t.key ? 700 : 400, fontSize: 13,
            color: activeType === t.key ? "#6C63FF" : "var(--text-muted,#6b7280)", display: "flex", alignItems: "center", gap: 6,
          }}>
            {t.icon} {t.label}
            {results[t.key] && <span style={{ background: "#10b981", color: "#fff", borderRadius: 10, fontSize: 9, padding: "1px 5px" }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Active email type */}
      <div style={{ marginBottom: 12, padding: "12px 16px", background: "var(--card-bg,#f9fafb)", borderRadius: 10, border: "1px solid var(--border,#e5e7eb)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{emailType.icon} {emailType.label}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted,#6b7280)" }}>{emailType.desc}</p>
        </div>
        <button className="workspace-btn" onClick={generateEmail} disabled={!companyName.trim() || !productDesc.trim() || isLoading || generating} style={{ fontSize: 13 }}>
          {generating ? "⏳ Generating…" : currentResult ? "🔄 Regenerate" : "📧 Generate"}
        </button>
      </div>

      {currentResult ? (
        <>
          <textarea className="workspace-textarea" value={currentResult} onChange={e => setResults(prev => ({ ...prev, [activeType]: e.target.value }))} rows={20} style={{ fontSize: 14, lineHeight: 1.7 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="workspace-btn workspace-save-btn" style={{ fontSize: 12 }} onClick={save}>💾 Save</button>
            <button className="ms-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
            <button className="ms-export-btn" onClick={exportJSON}>📦 JSON</button>
            {generatedCount > 1 && <span style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", paddingTop: 8 }}>{generatedCount}/{EMAIL_TYPES.length} emails generated</span>}
          </div>
        </>
      ) : generating ? (
        <div className="workspace-empty">
          <div style={{ fontSize: 36 }}>⏳</div>
          <p>Generating {emailType.label}…</p>
        </div>
      ) : (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📧</div>
          <p>Select an email type above and click <strong>Generate</strong> to create your campaign copy.</p>
        </div>
      )}
    </div>
  );
}
