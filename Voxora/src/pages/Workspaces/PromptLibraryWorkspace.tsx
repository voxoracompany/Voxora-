// ── V5.6 Smart Prompt Library Workspace ──────────────────────────────────────
import { useState, useMemo, useCallback } from "react";
import { PROMPT_TEMPLATES } from "../../services/ai/PromptLibrary";
import { AIMemory } from "../../services/ai/AIMemory";
import { useToast } from "../../context/ToastContext";
import "./PromptLibraryWorkspace.css";

interface Props { setWorkspace: (w: string) => void }

type CategoryKey = "All" | "Favorites" | "Startup" | "Marketing" | "Finance" | "Investor" | "Growth" | "Analytics" | "Product" | "Research";

const CATEGORIES: CategoryKey[] = ["All","Startup","Marketing","Finance","Investor","Growth","Analytics","Product","Research"];

const WORKSPACE_CATEGORY_MAP: Record<string, CategoryKey> = {
  assistant:          "Startup",
  startup:            "Startup",
  validation:         "Startup",
  business:           "Startup",
  executiveSummary:   "Startup",
  general:            "Startup",
  content:            "Marketing",
  emailCampaign:      "Marketing",
  socialMedia:        "Marketing",
  seoPlanning:        "Marketing",
  adCopy:             "Marketing",
  contentCalendar:    "Marketing",
  brandVoice:         "Marketing",
  financialHub:       "Finance",
  financial:          "Finance",
  financialForecast:  "Finance",
  revenueModel:       "Finance",
  pricingStrategy:    "Finance",
  unitEconomics:      "Finance",
  breakEven:          "Finance",
  pitchDeck:          "Investor",
  fundraisingStrategy:"Investor",
  investorNarrative:  "Investor",
  termSheet:          "Investor",
  dueDiligence:       "Investor",
  capTable:           "Investor",
  growthHub:          "Growth",
  growthPlanner:      "Growth",
  growthOpportunity:  "Growth",
  aiGrowthRecommendations: "Growth",
  collaborationPlan:  "Growth",
  analyticsReports:   "Analytics",
  roadmap:            "Product",
  productRoadmap:     "Product",
  apps:               "Product",
  swot:               "Research",
  competitor:         "Research",
  market:             "Research",
  research:           "Research",
  persona:            "Research",
};

const FAV_KEY = "voxora-plw-favs";

function loadFavs(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
  catch { return new Set(); }
}
function saveFavs(s: Set<string>): void {
  localStorage.setItem(FAV_KEY, JSON.stringify([...s]));
}

// Custom prompts
const CUSTOM_KEY = "voxora-custom-prompts";
interface CustomPrompt { id: string; label: string; category: CategoryKey; workspace: string; system: string; template: string; createdAt: number }
function loadCustom(): CustomPrompt[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); }
  catch { return []; }
}
function saveCustom(items: CustomPrompt[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(items));
}

const ALL_TEMPLATES = Object.values(PROMPT_TEMPLATES).map(t => ({
  id: t.id,
  label: t.label,
  workspace: t.workspace,
  system: t.system,
  isBuiltIn: true as const,
}));

export default function PromptLibraryWorkspace({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [category, setCategory] = useState<CategoryKey>("All");
  const [search, setSearch] = useState("");
  const [favs, setFavs] = useState<Set<string>>(loadFavs);
  const [custom, setCustom] = useState<CustomPrompt[]>(loadCustom);
  const [showNew, setShowNew] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryKey>("Startup");
  const [newWorkspace, setNewWorkspace] = useState("assistant");
  const [newTemplate, setNewTemplate] = useState("");
  const [newSystem, setNewSystem] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const toggleFav = useCallback((id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavs(next);
      return next;
    });
  }, []);

  const deleteCustom = useCallback((id: string) => {
    const next = loadCustom().filter(p => p.id !== id);
    saveCustom(next);
    setCustom(next);
    showToast("Prompt deleted.", "info");
  }, [showToast]);

  const duplicateCustom = useCallback((id: string) => {
    const src = custom.find(p => p.id === id);
    if (!src) return;
    const dup: CustomPrompt = { ...src, id: `cp_${Date.now()}`, label: `${src.label} (copy)`, createdAt: Date.now() };
    const next = [dup, ...custom];
    saveCustom(next);
    setCustom(next);
    showToast("Prompt duplicated.", "success");
  }, [custom, showToast]);

  const saveNew = useCallback(() => {
    if (!newLabel.trim() || !newTemplate.trim()) { showToast("Label and template are required.", "error"); return; }
    if (editId) {
      const next = custom.map(p => p.id === editId ? { ...p, label: newLabel, category: newCategory, workspace: newWorkspace, template: newTemplate, system: newSystem } : p);
      saveCustom(next); setCustom(next); showToast("Prompt updated!");
    } else {
      const p: CustomPrompt = { id: `cp_${Date.now()}`, label: newLabel, category: newCategory, workspace: newWorkspace, system: newSystem, template: newTemplate, createdAt: Date.now() };
      const next = [p, ...custom]; saveCustom(next); setCustom(next); showToast("Prompt saved!");
    }
    setShowNew(false); setEditId(null); setNewLabel(""); setNewTemplate(""); setNewSystem("");
  }, [newLabel, newCategory, newWorkspace, newTemplate, newSystem, editId, custom, showToast]);

  const startEdit = (p: CustomPrompt) => {
    setEditId(p.id); setNewLabel(p.label); setNewCategory(p.category);
    setNewWorkspace(p.workspace); setNewTemplate(p.template); setNewSystem(p.system);
    setShowNew(true);
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify({ custom, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "voxora-prompts.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data.custom)) {
          const existing = loadCustom();
          const ids = new Set(existing.map(p => p.id));
          const toAdd = data.custom.filter((p: CustomPrompt) => !ids.has(p.id));
          const next = [...toAdd, ...existing];
          saveCustom(next); setCustom(next);
          showToast(`Imported ${toAdd.length} prompts.`, "success");
        }
      } catch { showToast("Invalid prompt file.", "error"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const usePrompt = (workspaceId: string) => {
    AIMemory.addRecentPrompt(`[Prompt Library] ${workspaceId}`, workspaceId);
    setWorkspace(workspaceId);
    showToast("Opening workspace…", "info");
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const builtIn = ALL_TEMPLATES.filter(t => {
      const catMatch = category === "All" || category === "Favorites"
        ? (category === "Favorites" ? favs.has(t.id) : true)
        : (WORKSPACE_CATEGORY_MAP[t.workspace] ?? "Startup") === category;
      const qMatch = !q || t.label.toLowerCase().includes(q) || t.workspace.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
    const cust = custom.filter(p => {
      const catMatch = category === "All" ? true : category === "Favorites" ? favs.has(p.id) : p.category === category;
      const qMatch = !q || p.label.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
    return { builtIn, cust };
  }, [category, search, favs, custom]);

  return (
    <div className="plw-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="plw-header">
        <div>
          <h1>📚 Prompt Library</h1>
          <p className="plw-subtitle">Reusable AI prompt templates across every studio. Save favourites, create custom prompts, and more.</p>
        </div>
        <div className="plw-header-actions">
          <button className="plw-btn plw-btn--outline" onClick={exportAll}>⬇ Export</button>
          <label className="plw-btn plw-btn--outline" style={{ cursor: "pointer" }}>
            ⬆ Import <input type="file" accept=".json" onChange={importFile} style={{ display: "none" }} />
          </label>
          <button className="plw-btn plw-btn--primary" onClick={() => { setShowNew(true); setEditId(null); setNewLabel(""); setNewTemplate(""); setNewSystem(""); }}>
            + New Prompt
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="plw-search-row">
        <input className="plw-search" placeholder="Search prompts…" value={search} onChange={e => setSearch(e.target.value)} />
        <span className="plw-count">{filtered.builtIn.length + filtered.cust.length} prompts</span>
      </div>

      {/* Category tabs */}
      <div className="plw-tabs">
        {[...CATEGORIES, "Favorites" as const].map(c => (
          <button key={c} className={`plw-tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c as CategoryKey)}>
            {c === "Favorites" ? "⭐ Favorites" : c}
          </button>
        ))}
      </div>

      {/* New/Edit form */}
      {showNew && (
        <div className="plw-form-card">
          <h3>{editId ? "Edit Prompt" : "New Custom Prompt"}</h3>
          <div className="plw-form-grid">
            <div className="plw-field">
              <label>Label *</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="e.g. My Growth Plan" />
            </div>
            <div className="plw-field">
              <label>Category</label>
              <select value={newCategory} onChange={e => setNewCategory(e.target.value as CategoryKey)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="plw-field">
              <label>Target Workspace</label>
              <input value={newWorkspace} onChange={e => setNewWorkspace(e.target.value)} placeholder="e.g. assistant" />
            </div>
          </div>
          <div className="plw-field">
            <label>System Prompt (optional)</label>
            <textarea rows={2} value={newSystem} onChange={e => setNewSystem(e.target.value)} placeholder="You are a…" />
          </div>
          <div className="plw-field">
            <label>Prompt Template *</label>
            <textarea rows={4} value={newTemplate} onChange={e => setNewTemplate(e.target.value)} placeholder="Write your prompt template here… use {input} as a placeholder." />
          </div>
          <div className="plw-form-actions">
            <button className="plw-btn plw-btn--ghost" onClick={() => { setShowNew(false); setEditId(null); }}>Cancel</button>
            <button className="plw-btn plw-btn--primary" onClick={saveNew}>{editId ? "Save Changes" : "Save Prompt"}</button>
          </div>
        </div>
      )}

      {/* Custom prompts */}
      {filtered.cust.length > 0 && (
        <section className="plw-section">
          <h2 className="plw-section-title">✏️ My Custom Prompts</h2>
          <div className="plw-grid">
            {filtered.cust.map(p => (
              <div key={p.id} className="plw-card plw-card--custom">
                <div className="plw-card-top">
                  <span className="plw-card-badge plw-card-badge--custom">Custom</span>
                  <button className={`plw-fav-btn ${favs.has(p.id) ? "active" : ""}`} onClick={() => toggleFav(p.id)} title="Favourite">⭐</button>
                </div>
                <h3 className="plw-card-label">{p.label}</h3>
                <p className="plw-card-meta">{p.category} · {p.workspace}</p>
                {p.template && <p className="plw-card-preview">{p.template.slice(0, 100)}{p.template.length > 100 ? "…" : ""}</p>}
                <div className="plw-card-actions">
                  <button className="plw-action-btn" onClick={() => usePrompt(p.workspace)}>Use →</button>
                  <button className="plw-action-btn plw-action-btn--ghost" onClick={() => startEdit(p)}>Edit</button>
                  <button className="plw-action-btn plw-action-btn--ghost" onClick={() => duplicateCustom(p.id)}>Duplicate</button>
                  <button className="plw-action-btn plw-action-btn--danger" onClick={() => deleteCustom(p.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Built-in prompts */}
      {filtered.builtIn.length > 0 && (
        <section className="plw-section">
          <h2 className="plw-section-title">🤖 Built-in Templates <span className="plw-section-count">{filtered.builtIn.length}</span></h2>
          <div className="plw-grid">
            {filtered.builtIn.map(t => (
              <div key={t.id} className="plw-card">
                <div className="plw-card-top">
                  <span className="plw-card-badge">{WORKSPACE_CATEGORY_MAP[t.workspace] ?? "Startup"}</span>
                  <button className={`plw-fav-btn ${favs.has(t.id) ? "active" : ""}`} onClick={() => toggleFav(t.id)} title="Favourite">⭐</button>
                </div>
                <h3 className="plw-card-label">{t.label}</h3>
                <p className="plw-card-meta">{t.workspace}</p>
                <div className="plw-card-actions">
                  <button className="plw-action-btn" onClick={() => usePrompt(t.workspace)}>Use →</button>
                  <button className="plw-action-btn plw-action-btn--ghost" onClick={() => { showToast("Duplicated to My Prompts!"); const p: CustomPrompt = { id: `cp_${Date.now()}`, label: t.label + " (copy)", category: WORKSPACE_CATEGORY_MAP[t.workspace] ?? "Startup", workspace: t.workspace, system: t.system, template: "", createdAt: Date.now() }; const next = [p, ...custom]; saveCustom(next); setCustom(next); }}>Duplicate</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {filtered.builtIn.length === 0 && filtered.cust.length === 0 && (
        <div className="plw-empty">
          <div style={{ fontSize: 48 }}>📚</div>
          <h3>No prompts found</h3>
          <p>Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
}
