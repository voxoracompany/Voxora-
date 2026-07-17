import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useToast } from "../../context/ToastContext";
import "./SavedProjects.css";

export default function SavedProjects({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { projects, deleteProject, favoriteProject, pinProject, updateNotes, favorites, pinned } = useProjects();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(projects.map((p) => p.category))];
    return ["All", ...cats];
  }, [projects]);

  const filtered = useMemo(() => {
    let result = [...projects];
    if (filter !== "All") result = result.filter((p) => p.category === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const ap = pinned.includes(a.id) ? 1 : 0;
      const bp = pinned.includes(b.id) ? 1 : 0;
      if (bp !== ap) return bp - ap;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [projects, filter, search, pinned]);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteProject(id);
    showToast(`🗑️ "${title}" deleted.`);
  };

  const handleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    favoriteProject(id);
    showToast(isFav ? "Removed from favorites" : "⭐ Added to favorites");
  };

  const handlePin = (id: string) => {
    const isPinned = pinned.includes(id);
    pinProject(id);
    showToast(isPinned ? "Unpinned" : "📌 Pinned to top");
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      "AI Content": "#7c3aed",
      "App Idea": "#2563eb",
      "Startup Idea": "#059669",
      "Customer Research": "#d97706",
      "Competitor Analysis": "#dc2626",
      "Market Research": "#0891b2",
      "SWOT Analysis": "#7c3aed",
      "Product Roadmap": "#be185d",
      "Business Model": "#1d4ed8",
      "AI Assistant": "#4f46e5",
    };
    return map[cat] || "#6b7280";
  };

  return (
    <div className="sp-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="sp-header">
        <div>
          <h1>📁 Saved Projects</h1>
          <p className="sp-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""} saved</p>
        </div>
      </div>

      <div className="sp-controls">
        <div className="sp-search-wrap">
          <span>🔍</span>
          <input
            className="sp-search"
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sp-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`sp-filter-btn ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-icon">📭</div>
          <h3>{search || filter !== "All" ? "No matching projects" : "No saved projects yet"}</h3>
          <p>
            {search || filter !== "All"
              ? "Try adjusting your search or filter."
              : "Start using AI workspaces to save your first project."}
          </p>
          {!search && filter === "All" && (
            <button className="ac-cta-btn" onClick={() => setWorkspace("apps")}>
              Generate Your First Idea
            </button>
          )}
        </div>
      ) : (
        <div className="sp-list">
          {filtered.map((project) => (
            <div key={project.id} className={`sp-card ${pinned.includes(project.id) ? "pinned" : ""}`}>
              <div className="sp-card-top">
                <div className="sp-card-meta">
                  {pinned.includes(project.id) && <span className="sp-badge sp-pinned">📌 Pinned</span>}
                  {favorites.includes(project.id) && <span className="sp-badge sp-fav">⭐ Favorite</span>}
                  <span
                    className="sp-category"
                    style={{ background: getCategoryColor(project.category) }}
                  >
                    {project.category}
                  </span>
                </div>
                <div className="sp-actions">
                  <button
                    className={`sp-icon-btn ${favorites.includes(project.id) ? "active-fav" : ""}`}
                    onClick={() => handleFavorite(project.id)}
                    title={favorites.includes(project.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    ⭐
                  </button>
                  <button
                    className={`sp-icon-btn ${pinned.includes(project.id) ? "active-pin" : ""}`}
                    onClick={() => handlePin(project.id)}
                    title={pinned.includes(project.id) ? "Unpin" : "Pin to top"}
                  >
                    📌
                  </button>
                  <button
                    className="sp-icon-btn sp-delete"
                    onClick={() => handleDelete(project.id, project.title)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <h2 className="sp-card-title">{project.title}</h2>
              <p className="sp-card-date">
                📅 {new Date(project.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>

              <button
                className="sp-toggle-notes"
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              >
                {expandedId === project.id ? "▲ Hide Notes" : "▼ Show Notes"}
              </button>

              {expandedId === project.id && (
                <div className="sp-notes-wrap">
                  <textarea
                    className="sp-notes"
                    placeholder="Add notes..."
                    defaultValue={project.notes}
                    onBlur={(e) => {
                      updateNotes(project.id, e.target.value);
                      showToast("📝 Notes saved");
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
