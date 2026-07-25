// ── V6.3 Pricing Strategy Generator ─────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";
import "./FinancialStudio.css";

interface Props { setWorkspace: (w: string) => void }

const MODELS = [
  { id: "subscription", icon: "🔄", label: "Subscription",     color: "#6C63FF", desc: "Recurring monthly or annual payments. Best for SaaS, media, and tools." },
  { id: "freemium",     icon: "🆓", label: "Freemium",         color: "#10b981", desc: "Free core with paid upgrades. Great for viral products needing mass adoption." },
  { id: "one_time",     icon: "💳", label: "One-Time Payment", color: "#f59e0b", desc: "Single purchase, lifetime access. Ideal for desktop apps, templates, courses." },
  { id: "usage",        icon: "📊", label: "Usage-Based",      color: "#3b82f6", desc: "Pay per use / metered billing. Perfect for APIs, AI tools, and cloud services." },
  { id: "enterprise",   icon: "🏢", label: "Enterprise",       color: "#8b5cf6", desc: "Custom contracts and volume discounts for large organisations." },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PricingStrategyGenerator({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { analyze, isLoading, isDemoMode } = useAI("pricingStrategy");

  const [product,       setProduct]       = useState("");
  const [targetAudience,setTargetAudience]= useState("");
  const [competitors,   setCompetitors]   = useState("");
  const [selectedModels,setSelectedModels]= useState<string[]>(["subscription","freemium"]);
  const [result,        setResult]        = useState("");
  const [activeTab,     setActiveTab]     = useState("all");

  const toggleModel = (id: string) =>
    setSelectedModels(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const generate = async () => {
    if (!product.trim()) return;
    const models = selectedModels.length ? MODELS.filter(m => selectedModels.includes(m.id)).map(m => m.label).join(", ") : "all pricing models";
    const prompt = `You are a pricing strategy expert. Analyze this product/service and generate detailed pricing recommendations.\n\nProduct: ${product}\nTarget Audience: ${targetAudience || "General market"}\nCompetitors: ${competitors || "Not specified"}\nPricing models to cover: ${models}\n\nFor each selected pricing model, provide:\n1. Recommended price point(s) with reasoning\n2. Tier structure (if applicable)\n3. Key pros and cons\n4. When this model works best\n5. Implementation tips\n\nEnd with a recommended primary strategy and a note on combining models.`;
    const out = await analyze(prompt, "pricingStrategy");
    if (out) {
      setResult(out);
      addActivity({ type: "pricing_strategy_generated", title: "Pricing Strategy Generated", description: `Pricing strategy created for "${product}".`, category: "Finance", icon: "🏷️" });
    }
  };

  const saveProj = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title: `Pricing Strategy — ${product}`, category: "Pricing Strategy", createdAt: new Date().toISOString(), notes: result });
    showToast("🏷️ Pricing strategy saved!");
  };

  const exportMarkdown = () => {
    downloadBlob(`# Pricing Strategy — ${product}\n\n${result}`, "pricing_strategy.md", "text/markdown");
  };
  const exportJSON = () => {
    downloadBlob(JSON.stringify({ product, targetAudience, competitors, selectedModels, result }, null, 2), "pricing_strategy.json", "application/json");
  };
  const exportCSV = () => {
    downloadBlob(`Product,${product}\nTarget Audience,${targetAudience}\nModels,${selectedModels.join("; ")}\n\nAnalysis\n"${result.replace(/"/g, '""')}"`, "pricing_strategy.csv", "text/csv");
  };
  const exportExcel = () => {
    const html = `<table><tr><th>Field</th><th>Value</th></tr><tr><td>Product</td><td>${product}</td></tr><tr><td>Target Audience</td><td>${targetAudience}</td></tr><tr><td>Models</td><td>${selectedModels.join(", ")}</td></tr><tr><td>Analysis</td><td>${result}</td></tr></table>`;
    downloadBlob(html, "pricing_strategy.xls", "application/vnd.ms-excel");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("financialStudio")}>← Back to Financial Studio</button>
      <h1>🏷️ Pricing Strategy Generator</h1>
      <p className="workspace-subtitle">AI-powered pricing recommendations across subscription, freemium, one-time, usage-based, and enterprise models.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Pricing Model Cards */}
      <h2 className="fs-section-title">📌 Select Pricing Models</h2>
      <div className="cards" style={{ marginBottom: 24 }}>
        {MODELS.map(m => (
          <div
            key={m.id}
            className="feature-card"
            style={{
              cursor: "pointer",
              border: selectedModels.includes(m.id) ? `2px solid ${m.color}` : "1.5px solid var(--color-border, #e5e7eb)",
              background: selectedModels.includes(m.id) ? `${m.color}15` : "var(--color-card, #fff)",
              transition: "all 0.2s",
            }}
            onClick={() => toggleModel(m.id)}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: selectedModels.includes(m.id) ? m.color : "var(--color-text, #111827)" }}>{m.label}</h3>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted, #6b7280)", lineHeight: 1.5 }}>{m.desc}</p>
            {selectedModels.includes(m.id) && (
              <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: m.color }}>✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ background: "var(--color-card, #fff)", border: "1.5px solid var(--color-border, #e5e7eb)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <h2 className="fs-section-title">📝 Product Details</h2>
        <div className="fs-input-group">
          <label className="fs-label">Product / Service Description *</label>
          <textarea
            className="workspace-textarea"
            placeholder="Describe your product or service, key features, and value proposition..."
            value={product}
            onChange={e => setProduct(e.target.value)}
            rows={3}
          />
        </div>
        <div className="fs-input-grid">
          <div className="fs-input-group">
            <label className="fs-label">Target Audience</label>
            <input className="fs-input" placeholder="e.g. SMBs, individual creators, enterprises..." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
          </div>
          <div className="fs-input-group">
            <label className="fs-label">Competitors / Market Context</label>
            <input className="fs-input" placeholder="e.g. Slack charges $7.25/user/mo..." value={competitors} onChange={e => setCompetitors(e.target.value)} />
          </div>
        </div>
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Generating strategy…" : "🤖 Generate Pricing Strategy"}
        </button>
      </div>

      {result && (
        <>
          <h2 className="fs-section-title">💡 AI Pricing Recommendations</h2>

          {/* Filter tabs */}
          <div className="fs-tabs" style={{ marginBottom: 16 }}>
            <button className={`fs-tab${activeTab === "all" ? " active" : ""}`} onClick={() => setActiveTab("all")}>All Models</button>
            {MODELS.filter(m => selectedModels.includes(m.id)).map(m => (
              <button key={m.id} className={`fs-tab${activeTab === m.id ? " active" : ""}`} onClick={() => setActiveTab(m.id)}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="fs-ai-box">{result}</div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            <button className="workspace-btn workspace-save-btn" onClick={saveProj}>💾 Save Strategy</button>
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

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🏷️</div>
          <p>Select one or more pricing models, describe your product, and generate AI-powered pricing recommendations.</p>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button className="fs-export-btn" onClick={() => setWorkspace("breakEvenCalculator")}>⚖️ Break-Even →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("investorStudio")}>🚀 Investor Studio →</button>
        <button className="fs-export-btn" onClick={() => setWorkspace("businessPlanGenerator")}>📋 Business Plan →</button>
      </div>
    </div>
  );
}
