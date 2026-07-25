// ── V6.0 AI Business Platform — Business Plan Generator ───────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth }     from "../../context/AuthContext";
import { useToast }    from "../../context/ToastContext";
import { useAIContext } from "../../context/AIContext";
import { useAI }        from "../../hooks/useAI";
import { aiService }    from "../../services/ai/AIService";
import DemoBanner       from "../../components/DemoBanner";
import {
  fetchPlans, savePlan, deletePlan, newPlanId,
  type BusinessPlan,
} from "../../services/businessPlan/BusinessPlanService";
import "./BusinessPlanGenerator.css";
import "./Workspace.css";

// ── Section definitions ───────────────────────────────────────────────────────
const SECTIONS = [
  { key: "executiveSummary",    label: "Executive Summary"           },
  { key: "companyDescription",  label: "Company Description"         },
  { key: "problemStatement",    label: "Problem Statement"           },
  { key: "solution",            label: "Solution"                    },
  { key: "marketAnalysis",      label: "Market Analysis"             },
  { key: "targetAudience",      label: "Target Audience"             },
  { key: "customerPersonas",    label: "Customer Personas"           },
  { key: "competitiveAnalysis", label: "Competitive Analysis"        },
  { key: "swotAnalysis",        label: "SWOT Analysis"               },
  { key: "businessModel",       label: "Business Model"              },
  { key: "revenueStreams",      label: "Revenue Streams"             },
  { key: "marketingStrategy",   label: "Marketing Strategy"          },
  { key: "salesStrategy",       label: "Sales Strategy"              },
  { key: "operationsPlan",      label: "Operations Plan"             },
  { key: "productRoadmap",      label: "Product Roadmap"             },
  { key: "financialForecast",   label: "Financial Forecast (12-Month)" },
  { key: "startupBudget",       label: "Startup Budget"              },
  { key: "riskAssessment",      label: "Risk Assessment"             },
  { key: "fundingStrategy",     label: "Funding Strategy"            },
  { key: "actionPlan",          label: "30/60/90-Day Action Plan"    },
];

const INDUSTRIES = [
  "Technology", "SaaS", "E-Commerce", "Healthcare", "FinTech",
  "EdTech", "Real Estate", "Food & Beverage", "Retail", "Marketing",
  "Consulting", "Manufacturing", "Media & Entertainment", "Travel",
  "Non-Profit", "Legal", "Other",
];

type View = "list" | "create" | "view" | "edit";

interface Props { setWorkspace: (w: string) => void; }

export default function BusinessPlanGenerator({ setWorkspace }: Props) {
  const { user }          = useAuth();
  const { showToast }     = useToast();
  const { activeProvider, isDemoMode } = useAIContext();
  const { isLoading, error, clearError } = useAI("businessPlan");

  const uid = user?.id ?? "demo";

  // ── View state ──────────────────────────────────────────────────────────────
  const [view,         setView]         = useState<View>("list");
  const [plans,        setPlans]        = useState<BusinessPlan[]>([]);
  const [currentPlan,  setCurrentPlan]  = useState<BusinessPlan | null>(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterIndustry, setFilterIndustry] = useState("All");
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);

  // ── Create / Edit form ──────────────────────────────────────────────────────
  const [formTitle,  setFormTitle]  = useState("");
  const [formIdea,   setFormIdea]   = useState("");
  const [formIndustry, setFormIndustry] = useState("Technology");

  // ── Generation state ────────────────────────────────────────────────────────
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [genProgress,   setGenProgress]   = useState(0);
  const [genStatus,     setGenStatus]     = useState("");
  const cancelRef = useRef(false);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave   = useRef<BusinessPlan | null>(null);

  // ── Load plans ──────────────────────────────────────────────────────────────
  const loadPlans = useCallback(async () => {
    const data = await fetchPlans(uid);
    setPlans(data);
  }, [uid]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  // ── Auto-save logic ─────────────────────────────────────────────────────────
  const scheduleAutoSave = useCallback((plan: BusinessPlan) => {
    pendingSave.current = plan;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!pendingSave.current) return;
      await savePlan(pendingSave.current);
      pendingSave.current = null;
      showToast("💾 Auto-saved");
    }, 30_000);
  }, [showToast]);

  useEffect(() => () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
  }, []);

  // ── Generate all sections ───────────────────────────────────────────────────
  const generatePlan = useCallback(async (plan: BusinessPlan): Promise<BusinessPlan> => {
    setIsGenerating(true);
    cancelRef.current = false;
    setGenProgress(0);

    const sections: Record<string, string> = { ...plan.generatedSections };

    for (let i = 0; i < SECTIONS.length; i++) {
      if (cancelRef.current) break;
      const sec = SECTIONS[i];
      setGenStatus(`Generating: ${sec.label}…`);
      setGenProgress(Math.round(((i) / SECTIONS.length) * 100));

      const prompt = `You are a professional business consultant. Generate the "${sec.label}" section for a business plan.

Business Idea: ${plan.businessIdea}
Industry: ${plan.industry}
Business Title: ${plan.title}

Write a detailed, professional, and actionable "${sec.label}" section. Be specific and data-driven where applicable. Format the response with clear sub-headings and bullet points where appropriate.`;

      try {
        const res = await aiService.generate({ prompt, workspace: "businessPlan" });
        sections[sec.key] = res.content;
      } catch {
        sections[sec.key] = `[Generation failed for this section. Click Retry to regenerate.]`;
      }
    }

    setGenProgress(100);
    setGenStatus("Complete!");
    setIsGenerating(false);

    return {
      ...plan,
      generatedSections: sections,
      aiProvider: activeProvider,
      updatedAt: new Date().toISOString(),
    };
  }, [activeProvider]);

  // ── Create new plan ─────────────────────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (!formTitle.trim() || !formIdea.trim()) {
      showToast("⚠️ Please fill in the title and business idea.");
      return;
    }
    const plan: BusinessPlan = {
      id: newPlanId(),
      title: formTitle.trim(),
      businessIdea: formIdea.trim(),
      industry: formIndustry,
      generatedSections: {},
      aiProvider: activeProvider,
      ownerUid: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const generated = await generatePlan(plan);
    if (cancelRef.current) {
      showToast("⛔ Generation cancelled.");
      return;
    }

    const saved = await savePlan(generated);
    setPlans(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
    setCurrentPlan(saved);
    setView("view");
    setActiveSection(SECTIONS[0].key);
    showToast("✅ Business Plan created successfully!");
    setFormTitle(""); setFormIdea(""); setFormIndustry("Technology");
  }, [formTitle, formIdea, formIndustry, uid, activeProvider, generatePlan, showToast]);

  // ── Retry a single section ──────────────────────────────────────────────────
  const retrySection = useCallback(async (sectionKey: string) => {
    if (!currentPlan) return;
    const sec = SECTIONS.find(s => s.key === sectionKey);
    if (!sec) return;
    setIsGenerating(true);
    setGenStatus(`Retrying: ${sec.label}…`);
    setGenProgress(50);

    const prompt = `You are a professional business consultant. Generate the "${sec.label}" section for a business plan.

Business Idea: ${currentPlan.businessIdea}
Industry: ${currentPlan.industry}
Business Title: ${currentPlan.title}

Write a detailed, professional, and actionable "${sec.label}" section. Be specific and data-driven where applicable. Format the response with clear sub-headings and bullet points where appropriate.`;

    try {
      const res = await aiService.generate({ prompt, workspace: "businessPlan" });
      const updated: BusinessPlan = {
        ...currentPlan,
        generatedSections: { ...currentPlan.generatedSections, [sectionKey]: res.content },
        aiProvider: activeProvider,
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      setCurrentPlan(updated);
      setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast(`✅ ${sec.label} regenerated!`);
    } catch {
      showToast("❌ Retry failed. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenProgress(0);
      setGenStatus("");
    }
  }, [currentPlan, activeProvider, showToast]);

  // ── Delete plan ─────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (planId: string) => {
    if (!confirm("Delete this business plan? This cannot be undone.")) return;
    await deletePlan(uid, planId);
    setPlans(prev => prev.filter(p => p.id !== planId));
    if (currentPlan?.id === planId) { setCurrentPlan(null); setView("list"); }
    showToast("🗑️ Business plan deleted.");
  }, [uid, currentPlan, showToast]);

  // ── Update / save edits ─────────────────────────────────────────────────────
  const handleSaveEdit = useCallback(async () => {
    if (!currentPlan) return;
    const updated: BusinessPlan = {
      ...currentPlan,
      title: formTitle || currentPlan.title,
      businessIdea: formIdea || currentPlan.businessIdea,
      industry: formIndustry || currentPlan.industry,
      updatedAt: new Date().toISOString(),
    };
    await savePlan(updated);
    setCurrentPlan(updated);
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    setView("view");
    showToast("✅ Changes saved!");
  }, [currentPlan, formTitle, formIdea, formIndustry, showToast]);

  const openEdit = (plan: BusinessPlan) => {
    setCurrentPlan(plan);
    setFormTitle(plan.title);
    setFormIdea(plan.businessIdea);
    setFormIndustry(plan.industry);
    setView("edit");
  };

  // ── Section edit ────────────────────────────────────────────────────────────
  const updateSectionContent = useCallback(async (key: string, content: string) => {
    if (!currentPlan) return;
    const updated: BusinessPlan = {
      ...currentPlan,
      generatedSections: { ...currentPlan.generatedSections, [key]: content },
      updatedAt: new Date().toISOString(),
    };
    setCurrentPlan(updated);
    setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
    scheduleAutoSave(updated);
  }, [currentPlan, scheduleAutoSave]);

  // ── HTML escape helper (prevents XSS in PDF export) ─────────────────────────
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  const exportMarkdown = (plan: BusinessPlan) => {
    let md = `# ${plan.title}\n\n`;
    md += `**Industry:** ${plan.industry}  \n**AI Provider:** ${plan.aiProvider}  \n**Created:** ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
    md += `## Business Idea\n${plan.businessIdea}\n\n`;
    SECTIONS.forEach(sec => {
      const content = plan.generatedSections[sec.key] || "";
      md += `## ${sec.label}\n${content}\n\n`;
    });
    downloadText(md, `${plan.title}.md`, "text/markdown");
    showToast("📥 Exported as Markdown!");
  };

  const exportPlainText = (plan: BusinessPlan) => {
    let txt = `${plan.title}\n${"=".repeat(plan.title.length)}\n\n`;
    txt += `Industry: ${plan.industry} | AI Provider: ${plan.aiProvider} | Created: ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
    txt += `Business Idea\n${plan.businessIdea}\n\n`;
    SECTIONS.forEach(sec => {
      const content = plan.generatedSections[sec.key] || "";
      txt += `${sec.label}\n${"-".repeat(sec.label.length)}\n${content}\n\n`;
    });
    downloadText(txt, `${plan.title}.txt`, "text/plain");
    showToast("📥 Exported as Plain Text!");
  };

  const exportPDF = (plan: BusinessPlan) => {
    const win = window.open("", "_blank");
    if (!win) { showToast("❌ Popup blocked. Please allow popups."); return; }
    const sectionsHtml = SECTIONS.map(sec => {
      const content = escapeHtml(plan.generatedSections[sec.key] || "").replace(/\n/g, "<br/>");
      return `<h2>${escapeHtml(sec.label)}</h2><div class="section-body">${content}</div>`;
    }).join("");
    win.document.write(`<!DOCTYPE html><html><head><title>${escapeHtml(plan.title)}</title>
<style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;color:#111;line-height:1.7}
h1{color:#6C63FF;border-bottom:2px solid #6C63FF;padding-bottom:8px}
h2{color:#444;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:4px}
.meta{color:#666;margin-bottom:24px}.section-body{white-space:pre-wrap}
@media print{body{margin:20px}}</style></head><body>
<h1>${escapeHtml(plan.title)}</h1>
<p class="meta"><strong>Industry:</strong> ${escapeHtml(plan.industry)} &nbsp;|&nbsp; <strong>AI Provider:</strong> ${escapeHtml(plan.aiProvider)} &nbsp;|&nbsp; <strong>Created:</strong> ${escapeHtml(new Date(plan.createdAt).toLocaleDateString())}</p>
<h2>Business Idea</h2><p>${escapeHtml(plan.businessIdea)}</p>
${sectionsHtml}
</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    showToast("📄 PDF export ready — use your browser's print dialog.");
  };

  function downloadText(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = plans.filter(p => {
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessIdea.toLowerCase().includes(searchQuery.toLowerCase());
    const matchIndustry = filterIndustry === "All" || p.industry === filterIndustry;
    return matchSearch && matchIndustry;
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="workspace-container bpg-root">
      {/* Header */}
      <div className="bpg-header">
        <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back</button>
        <div className="bpg-header-title">
          <h1>📋 AI Business Plan Generator</h1>
          <span className={`bpg-provider-badge bpg-provider-${activeProvider}`}>
            {isDemoMode ? "🔲 Demo Mode" : `⚡ ${activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)}`}
          </span>
        </div>
        {view === "list" && (
          <button className="bpg-btn-primary" onClick={() => setView("create")}>
            + New Business Plan
          </button>
        )}
        {(view === "view" || view === "edit") && (
          <div className="bpg-header-actions">
            {view === "view" && currentPlan && (
              <>
                <button className="bpg-btn-secondary" onClick={() => openEdit(currentPlan)}>✏️ Edit</button>
                <div className="bpg-export-group">
                  <button className="bpg-btn-secondary" onClick={() => exportPDF(currentPlan!)}>📄 PDF</button>
                  <button className="bpg-btn-secondary" onClick={() => exportMarkdown(currentPlan!)}>📝 Markdown</button>
                  <button className="bpg-btn-secondary" onClick={() => exportPlainText(currentPlan!)}>📋 Text</button>
                </div>
                <button className="bpg-btn-danger" onClick={() => handleDelete(currentPlan!.id)}>🗑️ Delete</button>
              </>
            )}
            {view === "edit" && (
              <>
                <button className="bpg-btn-primary" onClick={handleSaveEdit}>💾 Save Changes</button>
                <button className="bpg-btn-ghost" onClick={() => setView("view")}>Cancel</button>
              </>
            )}
            <button className="bpg-btn-ghost" onClick={() => { setView("list"); setCurrentPlan(null); }}>← All Plans</button>
          </div>
        )}
      </div>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* ── Generating overlay ─────────────────────────────────────────────── */}
      {isGenerating && (
        <div className="bpg-generating-overlay">
          <div className="bpg-generating-card">
            <div className="bpg-generating-spinner" />
            <h3>Generating Your Business Plan</h3>
            <p className="bpg-gen-status">{genStatus}</p>
            <div className="bpg-progress-bar-wrap">
              <div className="bpg-progress-bar" style={{ width: `${genProgress}%` }} />
            </div>
            <p className="bpg-progress-label">{genProgress}% complete</p>
            <button className="bpg-btn-danger" onClick={() => { cancelRef.current = true; setIsGenerating(false); }}>
              ⛔ Cancel Generation
            </button>
          </div>
        </div>
      )}

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="bpg-error-banner">
          ⚠️ {error}
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="bpg-list-view">
          <div className="bpg-filters">
            <input
              className="workspace-input bpg-search"
              type="search"
              placeholder="🔍 Search plans…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="bpg-select"
              value={filterIndustry}
              onChange={e => setFilterIndustry(e.target.value)}
            >
              <option value="All">All Industries</option>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="workspace-empty">
              <div className="workspace-empty-icon">📋</div>
              <p>{plans.length === 0
                ? "No business plans yet. Create your first AI-powered plan!"
                : "No plans match your search."
              }</p>
              {plans.length === 0 && (
                <button className="bpg-btn-primary" onClick={() => setView("create")}>
                  + Create Business Plan
                </button>
              )}
            </div>
          ) : (
            <div className="bpg-plan-grid">
              {filtered.map(plan => (
                <div key={plan.id} className="bpg-plan-card" onClick={() => { setCurrentPlan(plan); setView("view"); setActiveSection(SECTIONS[0].key); }}>
                  <div className="bpg-plan-card-header">
                    <span className="bpg-plan-industry-tag">{plan.industry}</span>
                    <span className={`bpg-provider-badge bpg-provider-${plan.aiProvider}`} style={{ fontSize: "0.7rem" }}>{plan.aiProvider}</span>
                  </div>
                  <h3 className="bpg-plan-card-title">{plan.title}</h3>
                  <p className="bpg-plan-card-idea">{plan.businessIdea.slice(0, 120)}{plan.businessIdea.length > 120 ? "…" : ""}</p>
                  <div className="bpg-plan-card-meta">
                    <span>{Object.keys(plan.generatedSections).length}/{SECTIONS.length} sections</span>
                    <span>{new Date(plan.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="bpg-plan-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="bpg-btn-sm" onClick={() => openEdit(plan)}>✏️ Edit</button>
                    <button className="bpg-btn-sm" onClick={() => exportPDF(plan)}>📄 PDF</button>
                    <button className="bpg-btn-sm bpg-btn-sm-danger" onClick={() => handleDelete(plan.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CREATE VIEW ───────────────────────────────────────────────────── */}
      {view === "create" && (
        <div className="bpg-create-view">
          <h2>Create New Business Plan</h2>
          <p className="workspace-subtitle">Fill in the details below. AI will generate all 20 sections automatically.</p>

          <div className="workspace-form">
            <label className="bpg-label">Business Plan Title *</label>
            <input
              className="workspace-input"
              placeholder="e.g. TechFlow — AI Project Management SaaS"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              disabled={isGenerating}
            />
            <label className="bpg-label">Business Idea *</label>
            <textarea
              className="workspace-input bpg-textarea"
              placeholder="Describe your business idea in detail. What does it do? Who is it for? What problem does it solve?"
              value={formIdea}
              onChange={e => setFormIdea(e.target.value)}
              disabled={isGenerating}
              rows={5}
            />
            <label className="bpg-label">Industry</label>
            <select
              className="bpg-select bpg-select-full"
              value={formIndustry}
              onChange={e => setFormIndustry(e.target.value)}
              disabled={isGenerating}
            >
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>

            <div className="bpg-sections-preview">
              <p className="bpg-label">Will generate {SECTIONS.length} sections:</p>
              <div className="bpg-sections-chips">
                {SECTIONS.map(s => <span key={s.key} className="bpg-chip">{s.label}</span>)}
              </div>
            </div>

            <div className="bpg-form-actions">
              <button
                className="bpg-btn-primary"
                onClick={handleCreate}
                disabled={!formTitle.trim() || !formIdea.trim() || isGenerating || isLoading}
              >
                {isGenerating ? "⏳ Generating…" : "🚀 Generate Business Plan"}
              </button>
              <button className="bpg-btn-ghost" onClick={() => setView("list")} disabled={isGenerating}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT METADATA VIEW ────────────────────────────────────────────── */}
      {view === "edit" && currentPlan && (
        <div className="bpg-create-view">
          <h2>Edit Business Plan</h2>
          <div className="workspace-form">
            <label className="bpg-label">Title</label>
            <input className="workspace-input" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
            <label className="bpg-label">Business Idea</label>
            <textarea className="workspace-input bpg-textarea" rows={5} value={formIdea} onChange={e => setFormIdea(e.target.value)} />
            <label className="bpg-label">Industry</label>
            <select className="bpg-select bpg-select-full" value={formIndustry} onChange={e => setFormIndustry(e.target.value)}>
              {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── VIEW / READ PLAN ─────────────────────────────────────────────── */}
      {view === "view" && currentPlan && (
        <div className="bpg-view-layout">
          {/* Sidebar nav */}
          <nav className="bpg-section-nav">
            <div className="bpg-section-nav-title">Sections</div>
            {SECTIONS.map((sec, idx) => {
              const done = !!currentPlan.generatedSections[sec.key];
              return (
                <button
                  key={sec.key}
                  className={`bpg-section-nav-item${activeSection === sec.key ? " active" : ""}${done ? "" : " empty"}`}
                  onClick={() => setActiveSection(sec.key)}
                >
                  <span className="bpg-section-nav-num">{idx + 1}</span>
                  <span className="bpg-section-nav-label">{sec.label}</span>
                  {done ? <span className="bpg-check">✓</span> : <span className="bpg-missing">!</span>}
                </button>
              );
            })}
          </nav>

          {/* Content area */}
          <div className="bpg-section-content">
            {SECTIONS.filter(s => s.key === activeSection).map(sec => {
              const content = currentPlan.generatedSections[sec.key] || "";
              const hasFailed = content.includes("[Generation failed");
              return (
                <div key={sec.key} className="bpg-section-panel">
                  <div className="bpg-section-panel-header">
                    <h2>{sec.label}</h2>
                    <div className="bpg-section-panel-actions">
                      <button
                        className="bpg-btn-secondary"
                        onClick={() => retrySection(sec.key)}
                        disabled={isGenerating}
                      >
                        🔄 {hasFailed ? "Retry" : "Regenerate"}
                      </button>
                    </div>
                  </div>
                  {content ? (
                    <textarea
                      className="bpg-section-editor"
                      value={content}
                      onChange={e => updateSectionContent(sec.key, e.target.value)}
                      rows={20}
                      placeholder="Section content will appear here…"
                    />
                  ) : (
                    <div className="workspace-empty">
                      <div className="workspace-empty-icon">📄</div>
                      <p>This section has not been generated yet.</p>
                      <button className="bpg-btn-primary" onClick={() => retrySection(sec.key)} disabled={isGenerating}>
                        ⚡ Generate Section
                      </button>
                    </div>
                  )}
                  <div className="bpg-section-footer">
                    <span className="bpg-autosave-hint">✏️ Edits auto-save every 30 seconds</span>
                    <span>{content.length} characters</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
