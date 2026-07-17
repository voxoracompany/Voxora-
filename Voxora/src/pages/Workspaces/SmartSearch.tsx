import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useProjects } from "../../context/ProjectContext";
import type { Project } from "../../context/ProjectContext";
import "./SmartSearch.css";

interface SmartSearchProps {
  setWorkspace: (workspace: string) => void;
  initialQuery?: string;
}

type SortOption = "newest" | "oldest" | "az" | "za";
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

const FILTER_OPTIONS: FilterOption[] = [
  "All",
  "App Idea",
  "Startup Idea",
  "AI Content",
  "Customer Research",
  "Product Roadmap",
  "SWOT Analysis",
  "Competitor Analysis",
  "Business Model",
  "AI Assistant",
  "Favorites",
  "Pinned",
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az",     label: "A → Z" },
  { value: "za",     label: "Z → A" },
];

const RECENT_KEY = "voxora-recent-searches";
const MAX_RECENT = 8;

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}

function saveRecentSearches(searches: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(searches.slice(0, MAX_RECENT)));
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="search-highlight">{part}</mark>
    ) : (
      part
    )
  );
}

export default function SmartSearch({ setWorkspace, initialQuery = "" }: SmartSearchProps) {
  const { projects, favorites, pinned } = useProjects();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sort, setSort] = useState<SortOption>("newest");
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
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    saveRecentSearches(updated);
    setShowRecent(false);
  }, [recentSearches]);

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const results = useMemo(() => {
    let filtered = [...projects];

    // Category / special filter
    if (filter === "Favorites") {
      filtered = filtered.filter((p) => favorites.includes(p.id));
    } else if (filter === "Pinned") {
      filtered = filtered.filter((p) => pinned.includes(p.id));
    } else if (filter !== "All") {
      filtered = filtered.filter((p) => p.category === filter);
    }

    // Query
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "za") return b.title.localeCompare(a.title);
      return 0;
    });

    return filtered;
  }, [projects, favorites, pinned, debouncedQuery, filter, sort]);

  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const titles = projects.map((p) => p.title).filter((t) => t.toLowerCase().includes(q));
    const cats = [...new Set(projects.map((p) => p.category))].filter((c) => c.toLowerCase().includes(q));
    return [...new Set([...titles, ...cats])].slice(0, 5);
  }, [query, projects]);

  return (
    <div className="search-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>
        ← Back to Dashboard
      </button>

      <div className="search-header">
        <h1>🔍 Smart Search</h1>
        <p className="search-subtitle">Search across all your projects, ideas, and analyses.</p>
      </div>

      <div className="search-input-wrap">
        <div className="search-box">
          <span className="search-icon-left">🔍</span>
          <input
            ref={inputRef}
            className="search-main-input"
            type="text"
            placeholder="Search projects, ideas, research, analyses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setTimeout(() => setShowRecent(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(query);
              if (e.key === "Escape") { setQuery(""); setShowRecent(false); }
            }}
          />
          {query && (
            <button className="search-clear" onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}>×</button>
          )}
          {isSearching && <span className="search-spinner">⏳</span>}
        </div>

        {showRecent && !query && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header">
              <span>Recent Searches</span>
              <button onClick={clearRecent}>Clear</button>
            </div>
            {recentSearches.map((r, i) => (
              <div key={i} className="recent-item" onMouseDown={() => { setQuery(r); handleSearch(r); }}>
                🕒 {r}
              </div>
            ))}
          </div>
        )}

        {showRecent && query && suggestions.length > 0 && (
          <div className="recent-searches">
            {suggestions.map((s, i) => (
              <div key={i} className="recent-item" onMouseDown={() => { setQuery(s); handleSearch(s); }}>
                🔍 {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="search-controls">
        <div className="search-filters">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              className={`search-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <select
          className="search-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="search-results-header">
        {debouncedQuery
          ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${debouncedQuery}"`
          : `${results.length} project${results.length !== 1 ? "s" : ""}`}
      </div>

      {results.length === 0 ? (
        <div className="search-empty">
          <div className="search-empty-icon">🔭</div>
          <h3>No results found</h3>
          <p>
            {debouncedQuery
              ? `No projects match "${debouncedQuery}". Try different keywords or change the filter.`
              : "No projects in this category yet."}
          </p>
          <button className="ac-cta-btn" onClick={() => setWorkspace("dashboard")}>
            Start Creating
          </button>
        </div>
      ) : (
        <div className="search-results">
          {results.map((project) => (
            <SearchResultCard
              key={project.id}
              project={project}
              query={debouncedQuery}
              isFavorite={favorites.includes(project.id)}
              isPinned={pinned.includes(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SearchResultCard({
  project,
  query,
  isFavorite,
  isPinned,
}: {
  project: Project;
  query: string;
  isFavorite: boolean;
  isPinned: boolean;
}) {
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
      {notePreview && (
        <p className="search-result-notes">{highlight(notePreview, query)}{project.notes.trim().length > 120 ? "…" : ""}</p>
      )}
      <p className="search-result-date">
        📅 {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      </p>
    </div>
  );
}
