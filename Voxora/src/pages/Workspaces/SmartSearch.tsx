// ── V5.6 Smart Search — Projects + Conversations + Memory ─────────────────────
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useProjects } from "../../context/ProjectContext";
import type { Project } from "../../context/ProjectContext";
import { AIMemory } from "../../services/ai/AIMemory";
import { MemoryService } from "../../services/memory/MemoryService";
import type { Conversation } from "../../services/ai/types/AITypes";
import type { MemoryItem } from "../../services/memory/MemoryTypes";
import { MEMORY_TYPE_LABELS, MEMORY_TYPE_ICONS } from "../../services/memory/MemoryTypes";
import "./SmartSearch.css";

interface SmartSearchProps {
  setWorkspace: (workspace: string) => void;
  initialQuery?: string;
}

type SortOption = "newest" | "oldest" | "az" | "za" | "relevance";
type FilterOption =
  | "All"
  | "App Idea"
  | "Startup Idea"
  | "AI Content"
  | "Customer Research"
  | "Product Roadmap"
  | "SWOT Analysis"
  | "Competitor Analysis"
  | "Business Model"
  | "AI Assistant"
  | "Favorites"
  | "Pinned";

type TabType = "projects" | "conversations" | "memory" | "all";

const FILTER_OPTIONS: FilterOption[] = [
  "All","App Idea","Startup Idea","AI Content","Customer Research",
  "Product Roadmap","SWOT Analysis","Competitor Analysis","Business Model","AI Assistant","Favorites","Pinned",
];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
];
const RECENT_KEY = "voxora-recent-searches";
const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); }
  catch { return []; }
}
function saveRecentSearches(searches: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
}

function tsAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SmartSearch({ setWorkspace, initialQuery = "" }: SmartSearchProps) {
  const { projects, favorites, pinned } = useProjects();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [tab, setTab] = useState<TabType>("projects");
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [showRecent, setShowRecent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter(r => r !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    saveRecentSearches(updated);
    setShowRecent(false);
  }, [recentSearches]);

  const clearRecent = () => { setRecentSearches([]); localStorage.removeItem(RECENT_KEY); };

  // ── Project results ──────────────────────────────────────────────────────────
  const projectResults = useMemo(() => {
    let filtered = [...projects];
    if (filter === "Favorites") filtered = filtered.filter(p => favorites.includes(p.id));
    else if (filter === "Pinned") filtered = filtered.filter(p => pinned.includes(p.id));
    else if (filter !== "All") filtered = filtered.filter(p => p.category === filter);
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => {
      if (sort === "newest" || sort === "relevance") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      return 0;
    });
    return filtered;
  }, [projects, favorites, pinned, debouncedQuery, filter, sort]);

  // ── Conversation results ─────────────────────────────────────────────────────
  const convResults = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();
    let convs = AIMemory.getAll();
    if (q) convs = convs.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q))
    );
    return convs.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [debouncedQuery]);

  // ── Memory results ───────────────────────────────────────────────────────────
  const memResults = useMemo(() => {
    return MemoryService.searchMemory(debouncedQuery);
  }, [debouncedQuery]);

  // ── Suggestions ──────────────────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const titles = projects.map(p => p.title).filter(t => t.toLowerCase().includes(q));
    const cats = [...new Set(projects.map(p => p.category))].filter(c => c.toLowerCase().includes(q));
    return [...new Set([...titles, ...cats])].slice(0, 5);
  }, [query, projects]);

  const tabCounts = {
    projects: projectResults.length,
    conversations: convResults.length,
    memory: memResults.length,
    all: projectResults.length + convResults.length + memResults.length,
  };

  return (
    <div className="search-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="search-header">
        <h1>🔍 Smart Search</h1>
        <p className="search-subtitle">Search across projects, AI conversations, and memory.</p>
      </div>

      {/* Search input */}
      <div className="search-input-wrap">
        <div className="search-box">
          <span className="search-icon-left">🔍</span>
          <input
            ref={inputRef}
            className="search-main-input"
            type="text"
            placeholder="Search projects, conversations, memory…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 150)}
            onKeyDown={e => {
              if (e.key === "Enter") handleSearch(query);
              if (e.key === "Escape") { setQuery(""); setShowRecent(false); }
            }}
          />
          {query && <button className="search-clear" onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}>×</button>}
          {isSearching && <span className="search-spinner">⏳</span>}
        </div>

        {showRecent && !query && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header"><span>Recent Searches</span><button onClick={clearRecent}>Clear</button></div>
            {recentSearches.map((r, i) => (
              <div key={i} className="recent-item" onMouseDown={() => { setQuery(r); handleSearch(r); }}>🕒 {r}</div>
            ))}
          </div>
        )}
        {showRecent && query && suggestions.length > 0 && (
          <div className="recent-searches">
            {suggestions.map((s, i) => (
              <div key={i} className="recent-item" onMouseDown={() => { setQuery(s); handleSearch(s); }}>🔍 {s}</div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="search-tabs">
        {(["all","projects","conversations","memory"] as TabType[]).map(t => (
          <button
            key={t}
            className={`search-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "all" ? "All" : t === "projects" ? "📁 Projects" : t === "conversations" ? "🤖 Conversations" : "🧠 Memory"}
            <span className="search-tab-count">{tabCounts[t]}</span>
          </button>
        ))}
      </div>

      {/* Filters (projects only) */}
      {(tab === "projects" || tab === "all") && (
        <div className="search-controls">
          <div className="search-filters">
            {FILTER_OPTIONS.map(f => (
              <button key={f} className={`search-filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <select className="search-sort" value={sort} onChange={e => setSort(e.target.value as SortOption)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* Results */}
      <div className="search-results-area">

        {/* Projects */}
        {(tab === "projects" || tab === "all") && (
          <section>
            {tab === "all" && <h3 className="search-section-title">📁 Projects <span className="search-section-count">{projectResults.length}</span></h3>}
            {!tab.includes("all") && (
              <div className="search-results-header">
                {debouncedQuery ? `${projectResults.length} result${projectResults.length !== 1 ? "s" : ""} for "${debouncedQuery}"` : `${projectResults.length} project${projectResults.length !== 1 ? "s" : ""}`}
              </div>
            )}
            {projectResults.length === 0 && tab === "projects" ? (
              <div className="search-empty">
                <div className="search-empty-icon">🔭</div>
                <h3>No projects found</h3>
                <p>{debouncedQuery ? `No projects match "${debouncedQuery}".` : "No projects in this category yet."}</p>
                <button className="ac-cta-btn" onClick={() => setWorkspace("dashboard")}>Start Creating</button>
              </div>
            ) : (
              <div className="search-results">
                {projectResults.map(project => (
                  <SearchResultCard key={project.id} project={project} query={debouncedQuery} isFavorite={favorites.includes(project.id)} isPinned={pinned.includes(project.id)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Conversations */}
        {(tab === "conversations" || tab === "all") && (
          <section>
            {tab === "all" && <h3 className="search-section-title">🤖 AI Conversations <span className="search-section-count">{convResults.length}</span></h3>}
            {tab === "conversations" && (
              <div className="search-results-header">
                {debouncedQuery ? `${convResults.length} conversation${convResults.length !== 1 ? "s" : ""} for "${debouncedQuery}"` : `${convResults.length} conversation${convResults.length !== 1 ? "s" : ""}`}
              </div>
            )}
            {convResults.length === 0 && tab === "conversations" ? (
              <div className="search-empty">
                <div className="search-empty-icon">💬</div>
                <h3>No conversations found</h3>
                <p>{debouncedQuery ? `No conversations match "${debouncedQuery}".` : "Start chatting with AI to see conversations here."}</p>
                <button className="ac-cta-btn" onClick={() => setWorkspace("assistant")}>Open AI Assistant</button>
              </div>
            ) : (
              <div className="search-results">
                {convResults.map(conv => (
                  <ConvResultCard key={conv.id} conv={conv} query={debouncedQuery} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Memory */}
        {(tab === "memory" || tab === "all") && (
          <section>
            {tab === "all" && <h3 className="search-section-title">🧠 Memory <span className="search-section-count">{memResults.length}</span></h3>}
            {tab === "memory" && (
              <div className="search-results-header">
                {debouncedQuery ? `${memResults.length} memory item${memResults.length !== 1 ? "s" : ""} for "${debouncedQuery}"` : `${memResults.length} memory item${memResults.length !== 1 ? "s" : ""}`}
              </div>
            )}
            {memResults.length === 0 && tab === "memory" ? (
              <div className="search-empty">
                <div className="search-empty-icon">🧠</div>
                <h3>No memory items found</h3>
                <p>{debouncedQuery ? `No memory items match "${debouncedQuery}".` : "AI-generated content and project context will appear here."}</p>
              </div>
            ) : (
              <div className="search-results">
                {memResults.map(item => (
                  <MemResultCard key={item.id} item={item} query={debouncedQuery} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All-tab empty state */}
        {tab === "all" && tabCounts.all === 0 && (
          <div className="search-empty">
            <div className="search-empty-icon">🔭</div>
            <h3>No results found</h3>
            <p>Try different keywords across projects, conversations, or memory.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Project card ─────────────────────────────────────────────────────────── */
function SearchResultCard({ project, query, isFavorite, isPinned }: { project: Project; query: string; isFavorite: boolean; isPinned: boolean }) {
  const notePreview = project.notes.trim().slice(0, 120);
  return (
    <div className="search-result-card">
      <div className="search-result-top">
        <div>
          <h3 className="search-result-title">{highlight(project.title, query)}</h3>
          <span className="search-result-category">{highlight(project.category, query)}</span>
        </div>
        <div className="search-result-badges">
          {isFavorite && <span className="badge">⭐ Favorite</span>}
          {isPinned && <span className="badge">📌 Pinned</span>}
        </div>
      </div>
      {notePreview && <p className="search-result-notes">{highlight(notePreview, query)}{project.notes.trim().length > 120 ? "…" : ""}</p>}
      <p className="search-result-date">📅 {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
    </div>
  );
}

/* ── Conversation card ────────────────────────────────────────────────────── */
function ConvResultCard({ conv, query }: { conv: Conversation; query: string }) {
  const matchMsg = query.trim()
    ? conv.messages.find(m => m.content.toLowerCase().includes(query.toLowerCase()))
    : conv.messages[conv.messages.length - 1];
  const preview = matchMsg?.content.slice(0, 140) ?? "";
  return (
    <div className="search-result-card">
      <div className="search-result-top">
        <div>
          <h3 className="search-result-title">{highlight(conv.title, query)}</h3>
          <span className="search-result-category">🤖 {conv.workspace} · {conv.messages.length} messages</span>
        </div>
        <div className="search-result-badges">
          {conv.pinned && <span className="badge">📌 Pinned</span>}
          {conv.favourite && <span className="badge">⭐ Fav</span>}
        </div>
      </div>
      {preview && <p className="search-result-notes">{highlight(preview, query)}{(matchMsg?.content.length ?? 0) > 140 ? "…" : ""}</p>}
      <p className="search-result-date">🕒 {tsAgo(conv.updatedAt)}</p>
    </div>
  );
}

/* ── Memory card ──────────────────────────────────────────────────────────── */
function MemResultCard({ item, query }: { item: MemoryItem; query: string }) {
  const preview = item.content.trim().slice(0, 140);
  const icon = MEMORY_TYPE_ICONS[item.type] ?? "📝";
  const label = MEMORY_TYPE_LABELS[item.type] ?? item.type;
  return (
    <div className="search-result-card">
      <div className="search-result-top">
        <div>
          <h3 className="search-result-title">{icon} {highlight(item.title, query)}</h3>
          <span className="search-result-category">{label}{item.workspace ? ` · ${item.workspace}` : ""}</span>
        </div>
        <div className="search-result-badges">
          {item.favourite && <span className="badge">⭐ Fav</span>}
          {item.tags.slice(0, 2).map(t => <span key={t} className="badge">#{t}</span>)}
        </div>
      </div>
      {preview && <p className="search-result-notes">{highlight(preview, query)}{item.content.trim().length > 140 ? "…" : ""}</p>}
      <p className="search-result-date">🕒 {tsAgo(item.updatedAt)}</p>
    </div>
  );
}
