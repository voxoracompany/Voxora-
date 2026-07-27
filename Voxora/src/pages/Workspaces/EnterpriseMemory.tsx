// ── V8.2 Enterprise AI Memory Workspace ───────────────────────────────────────
import { memo, useState, useCallback } from "react";
import { EnterpriseMemory } from "../../services/ai/EnterpriseMemory";
import type { EnterpriseProfile, WritingTone, ProductEntry } from "../../services/ai/EnterpriseMemory";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type TabId = "company" | "products" | "brand" | "customer" | "writing" | "context";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "company",  label: "Company",        icon: "🏢" },
  { id: "products", label: "Products",       icon: "📦" },
  { id: "brand",    label: "Brand Tone",     icon: "🎨" },
  { id: "customer", label: "Customer",       icon: "👤" },
  { id: "writing",  label: "Writing Style",  icon: "✍️" },
  { id: "context",  label: "AI Context",     icon: "🧠" },
];

const STAGES = ["idea", "pre-seed", "seed", "series-a", "series-b", "growth", "enterprise"];
const TONES: WritingTone[] = ["professional", "conversational", "technical", "inspirational", "bold", "empathetic"];
const WRITING_STYLES = ["formal", "casual", "data-driven", "storytelling", "bullet-points"];
const PRODUCT_STAGES = ["concept", "beta", "live", "deprecated"];

// ── Completion bar ────────────────────────────────────────────────────────────
const CompletionBar = memo(function CompletionBar({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#6C63FF";
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Profile Completeness</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s ease" }} />
      </div>
      {score < 50 && (
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
          Complete your profile to give AI agents the context they need for personalised responses.
        </p>
      )}
    </div>
  );
});

// ── Field helpers ─────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", color: "#1e293b",
};
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", minHeight: 72, lineHeight: 1.5,
};
const selectStyle: React.CSSProperties = { ...inputStyle };

// ── Main Workspace ────────────────────────────────────────────────────────────
export default function EnterpriseMemoryWorkspace({ setWorkspace: _setWorkspace }: Props) {
  const [profile, setProfile] = useState<EnterpriseProfile>(() => EnterpriseMemory.get());
  const [tab, setTab] = useState<TabId>("company");
  const [saved, setSaved] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<ProductEntry, "id" | "addedAt">>({
    name: "", description: "", category: "", targetAudience: "", pricePoint: "", stage: "live",
  });

  const score = EnterpriseMemory.getCompletionScore();

  const handleSave = useCallback(() => {
    EnterpriseMemory.save(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [profile]);

  const patch = useCallback((updates: Partial<EnterpriseProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleAddProduct = useCallback(() => {
    if (!newProduct.name.trim()) return;
    const entry = EnterpriseMemory.addProduct(newProduct);
    setProfile((prev) => ({ ...prev, products: [entry, ...prev.products] }));
    setNewProduct({ name: "", description: "", category: "", targetAudience: "", pricePoint: "", stage: "live" });
    setShowAddProduct(false);
  }, [newProduct]);

  const handleRemoveProduct = useCallback((id: string) => {
    EnterpriseMemory.removeProduct(id);
    setProfile((prev) => ({ ...prev, products: prev.products.filter((p) => p.id !== id) }));
  }, []);

  const handleKeywordInput = useCallback((field: "brandKeywords" | "brandAvoid", value: string) => {
    const arr = value.split(",").map((s) => s.trim()).filter(Boolean);
    patch({ [field]: arr });
  }, [patch]);

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div>
          <h1 className="workspace-title">🧠 Enterprise AI Memory</h1>
          <p className="workspace-subtitle">Store your company context so AI agents deliver personalised, accurate results every time.</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: saved ? "#10b981" : "#6C63FF", color: "#fff",
            border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s",
          }}
        >
          {saved ? "✅ Saved!" : "Save Profile"}
        </button>
      </div>

      <CompletionBar score={score} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 14px", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
            background: "none", color: tab === t.id ? "#6C63FF" : "#64748b", fontFamily: "inherit",
            borderBottom: tab === t.id ? "2px solid #6C63FF" : "2px solid transparent",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 680 }}>

        {/* ── Company Tab ── */}
        {tab === "company" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 0 }}>
              <Field label="Company Name">
                <input style={inputStyle} value={profile.companyName} onChange={(e) => patch({ companyName: e.target.value })} placeholder="e.g. Voxora Inc." />
              </Field>
              <Field label="Industry">
                <input style={inputStyle} value={profile.industry} onChange={(e) => patch({ industry: e.target.value })} placeholder="e.g. AI / SaaS" />
              </Field>
              <Field label="Stage">
                <select style={selectStyle} value={profile.stage} onChange={(e) => patch({ stage: e.target.value as EnterpriseProfile["stage"] })}>
                  {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}</option>)}
                </select>
              </Field>
              <Field label="Founded Year">
                <input style={inputStyle} value={profile.foundedYear} onChange={(e) => patch({ foundedYear: e.target.value })} placeholder="e.g. 2024" />
              </Field>
              <Field label="Team Size">
                <input style={inputStyle} value={profile.teamSize} onChange={(e) => patch({ teamSize: e.target.value })} placeholder="e.g. 5–10" />
              </Field>
              <Field label="Location">
                <input style={inputStyle} value={profile.location} onChange={(e) => patch({ location: e.target.value })} placeholder="e.g. London, UK" />
              </Field>
              <Field label="Website">
                <input style={inputStyle} value={profile.website} onChange={(e) => patch({ website: e.target.value })} placeholder="https://yourcompany.com" />
              </Field>
            </div>
            <Field label="Company Description">
              <textarea style={textareaStyle} value={profile.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Describe what your company does in 2–3 sentences…" rows={3} />
            </Field>
          </div>
        )}

        {/* ── Products Tab ── */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>{profile.products.length} product{profile.products.length !== 1 ? "s" : ""} in memory</span>
              <button onClick={() => setShowAddProduct(true)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#6C63FF", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>+ Add Product</button>
            </div>
            {profile.products.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                <p style={{ fontSize: 13 }}>No products added yet. Add your products or services so AI agents can reference them.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {profile.products.map((p) => (
                  <div key={p.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{p.name}</span>
                        <span style={{ fontSize: 10, background: p.stage === "live" ? "#dcfce7" : "#f1f5f9", color: p.stage === "live" ? "#166534" : "#64748b", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>{p.stage.toUpperCase()}</span>
                        {p.category && <span style={{ fontSize: 11, color: "#94a3b8" }}>{p.category}</span>}
                      </div>
                      {p.description && <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 4px" }}>{p.description}</p>}
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                        {p.targetAudience && <span>🎯 {p.targetAudience}</span>}
                        {p.pricePoint && <span>💰 {p.pricePoint}</span>}
                      </div>
                    </div>
                    <button onClick={() => handleRemoveProduct(p.id)} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, background: "#fef2f2", color: "#dc2626", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            {showAddProduct && (
              <div style={{ marginTop: 20, padding: 20, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Add Product / Service</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Name *"><input style={inputStyle} value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="Product name" /></Field>
                  <Field label="Category"><input style={inputStyle} value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. SaaS, Service" /></Field>
                  <Field label="Stage">
                    <select style={selectStyle} value={newProduct.stage} onChange={(e) => setNewProduct((p) => ({ ...p, stage: e.target.value as ProductEntry["stage"] }))}>
                      {PRODUCT_STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </Field>
                  <Field label="Price Point"><input style={inputStyle} value={newProduct.pricePoint} onChange={(e) => setNewProduct((p) => ({ ...p, pricePoint: e.target.value }))} placeholder="e.g. $49/mo" /></Field>
                </div>
                <Field label="Description"><textarea style={textareaStyle} value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} placeholder="Brief product description" rows={2} /></Field>
                <Field label="Target Audience"><input style={inputStyle} value={newProduct.targetAudience} onChange={(e) => setNewProduct((p) => ({ ...p, targetAudience: e.target.value }))} placeholder="e.g. Startup founders, B2B sales teams" /></Field>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button onClick={() => setShowAddProduct(false)} style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 12, background: "#e2e8f0", color: "#374151", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  <button onClick={handleAddProduct} style={{ flex: 2, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#6C63FF", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Add Product</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Brand Tone Tab ── */}
        {tab === "brand" && (
          <div>
            <Field label="Brand Mission">
              <textarea style={textareaStyle} value={profile.brandMission} onChange={(e) => patch({ brandMission: e.target.value })} placeholder="e.g. Empower businesses to make better decisions using AI." rows={2} />
            </Field>
            <Field label="Brand Tone">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TONES.map((tone) => (
                  <button key={tone} onClick={() => patch({ brandTone: tone })} style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: profile.brandTone === tone ? "#6C63FF" : "#f1f5f9",
                    color: profile.brandTone === tone ? "#fff" : "#374151",
                  }}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</button>
                ))}
              </div>
            </Field>
            <Field label="Brand Keywords (comma-separated)">
              <input style={inputStyle} value={profile.brandKeywords.join(", ")} onChange={(e) => handleKeywordInput("brandKeywords", e.target.value)} placeholder="e.g. innovative, AI-powered, enterprise-ready" />
            </Field>
            <Field label="Words/Phrases to Avoid (comma-separated)">
              <input style={inputStyle} value={profile.brandAvoid.join(", ")} onChange={(e) => handleKeywordInput("brandAvoid", e.target.value)} placeholder="e.g. cheap, basic, simple" />
            </Field>
          </div>
        )}

        {/* ── Customer Tab ── */}
        {tab === "customer" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Ideal Customer Title">
                <input style={inputStyle} value={profile.customerIdealTitle} onChange={(e) => patch({ customerIdealTitle: e.target.value })} placeholder="e.g. Head of Marketing" />
              </Field>
              <Field label="Customer Industry">
                <input style={inputStyle} value={profile.customerIndustry} onChange={(e) => patch({ customerIndustry: e.target.value })} placeholder="e.g. B2B SaaS, E-commerce" />
              </Field>
              <Field label="Age Range">
                <input style={inputStyle} value={profile.customerAgeRange} onChange={(e) => patch({ customerAgeRange: e.target.value })} placeholder="e.g. 25–45" />
              </Field>
              <Field label="Geography">
                <input style={inputStyle} value={profile.customerGeography} onChange={(e) => patch({ customerGeography: e.target.value })} placeholder="e.g. North America, UK" />
              </Field>
            </div>
            <Field label="Customer Pain Points">
              <textarea style={textareaStyle} value={profile.customerPainPoints} onChange={(e) => patch({ customerPainPoints: e.target.value })} placeholder="What are the biggest problems your customers face?" rows={3} />
            </Field>
            <Field label="Customer Goals">
              <textarea style={textareaStyle} value={profile.customerGoals} onChange={(e) => patch({ customerGoals: e.target.value })} placeholder="What outcomes are your customers trying to achieve?" rows={3} />
            </Field>
          </div>
        )}

        {/* ── Writing Style Tab ── */}
        {tab === "writing" && (
          <div>
            <Field label="Writing Style">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {WRITING_STYLES.map((style) => (
                  <button key={style} onClick={() => patch({ writingStyle: style as EnterpriseProfile["writingStyle"] })} style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: profile.writingStyle === style ? "#6C63FF" : "#f1f5f9",
                    color: profile.writingStyle === style ? "#fff" : "#374151",
                  }}>{style.charAt(0).toUpperCase() + style.slice(1).replace("-", " ")}</button>
                ))}
              </div>
            </Field>
            <Field label="Writing Persona">
              <input style={inputStyle} value={profile.writingPersona} onChange={(e) => patch({ writingPersona: e.target.value })} placeholder="e.g. Authoritative thought leader, Friendly startup founder" />
            </Field>
            <Field label="Voice Notes / Additional Instructions">
              <textarea style={textareaStyle} value={profile.writingVoiceNotes} onChange={(e) => patch({ writingVoiceNotes: e.target.value })} placeholder="Any specific instructions for how content should be written…" rows={4} />
            </Field>
          </div>
        )}

        {/* ── AI Context Tab ── */}
        {tab === "context" && (
          <div>
            <div style={{ background: "#ede9fe", border: "1px solid #c4b5fd", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "#5b21b6", margin: 0, lineHeight: 1.6 }}>
                <strong>How AI Context works:</strong> Everything you add here is injected into AI agent system prompts as background context. This helps agents give you personalised, accurate, company-specific responses instead of generic answers.
              </p>
            </div>
            <Field label="Additional AI Context">
              <textarea
                style={{ ...textareaStyle, minHeight: 150 }}
                value={profile.previousAIContext}
                onChange={(e) => patch({ previousAIContext: e.target.value })}
                placeholder={`Add any additional context you want AI agents to always know. Examples:\n- "We are currently fundraising a £500k pre-seed round"\n- "Our main competitor is Notion"\n- "We use a usage-based pricing model"\n- "We are targeting Series A companies in the UK"`}
                rows={6}
              />
            </Field>
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 14px" }}>
              <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 6px", fontWeight: 600 }}>Current AI Context Preview:</p>
              <pre style={{ fontSize: 11, color: "#374151", whiteSpace: "pre-wrap", margin: 0, lineHeight: 1.6 }}>
                {EnterpriseMemory.buildAIContext() || "(No context configured yet — fill in the tabs above)"}
              </pre>
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
          <button onClick={handleSave} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: saved ? "#10b981" : "#6C63FF", color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {saved ? "✅ Saved!" : "Save Profile"}
          </button>
          <button onClick={() => { if (confirm("Reset all enterprise memory? This cannot be undone.")) { EnterpriseMemory.reset(); setProfile(EnterpriseMemory.get()); } }} style={{ padding: "10px 16px", borderRadius: 10, fontSize: 13, background: "#fef2f2", color: "#dc2626", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
