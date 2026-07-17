import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import type { Project } from "../../context/ProjectContext";
import { useToast } from "../../context/ToastContext";
import "./ExportCenter.css";

interface ExportCenterProps {
  setWorkspace: (workspace: string) => void;
}

type ExportFormat = "pdf" | "md" | "txt";
type ExportScope = "all" | "selected" | "current";

function formatProjectMarkdown(project: Project, favorites: string[], pinned: string[]): string {
  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const lines = [
    `# ${project.title}`,
    ``,
    `**Category:** ${project.category}`,
    `**Created:** ${date}`,
    `**Status:** ${[favorites.includes(project.id) ? "⭐ Favorite" : null, pinned.includes(project.id) ? "📌 Pinned" : null].filter(Boolean).join(", ") || "—"}`,
    ``,
  ];
  if (project.notes.trim()) {
    lines.push(`## Notes & Content`, ``, project.notes.trim(), ``);
  }
  return lines.join("\n");
}

function formatProjectText(project: Project, favorites: string[], pinned: string[]): string {
  const date = new Date(project.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const lines = [
    `=`.repeat(60),
    project.title,
    `=`.repeat(60),
    `Category : ${project.category}`,
    `Created  : ${date}`,
    `Status   : ${[favorites.includes(project.id) ? "Favorite" : null, pinned.includes(project.id) ? "Pinned" : null].filter(Boolean).join(", ") || "None"}`,
  ];
  if (project.notes.trim()) {
    lines.push(``, `-`.repeat(40), `NOTES & CONTENT`, `-`.repeat(40), project.notes.trim());
  }
  return lines.join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(projects: Project[], favorites: string[], pinned: string[]) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Voxora Export</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #111; }
  h1 { font-size: 28px; border-bottom: 3px solid #6C63FF; padding-bottom: 10px; margin-bottom: 8px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
  .badge { display: inline-block; background: #f0eeff; color: #6C63FF; padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; margin-right: 6px; }
  h2 { font-size: 16px; margin: 20px 0 6px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  pre { background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 13px; line-height: 1.6; }
  .project { page-break-after: always; margin-bottom: 40px; }
  .project:last-child { page-break-after: auto; }
  .header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
  .brand { font-size: 20px; font-weight: 800; color: #6C63FF; }
  .export-date { font-size: 13px; color: #9ca3af; }
</style>
</head>
<body>
<div class="header-bar">
  <div class="brand">🚀 Voxora</div>
  <div class="export-date">Exported ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
</div>
${projects
  .map(
    (p) => `
<div class="project">
  <h1>${p.title}</h1>
  <div class="meta">
    <span class="badge">${p.category}</span>
    ${favorites.includes(p.id) ? '<span class="badge">⭐ Favorite</span>' : ""}
    ${pinned.includes(p.id) ? '<span class="badge">📌 Pinned</span>' : ""}
    &nbsp;📅 ${new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
  </div>
  ${p.notes.trim() ? `<h2>Notes & Content</h2><pre>${p.notes.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>` : ""}
</div>`
  )
  .join("")}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }
}

export default function ExportCenter({ setWorkspace }: ExportCenterProps) {
  const { projects, favorites, pinned } = useProjects();
  const { showToast } = useToast();

  const [format, setFormat] = useState<ExportFormat>("md");
  const [scope, setScope] = useState<ExportScope>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const filteredProjects = useMemo(() =>
    projects.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ), [projects, search]);

  const targetProjects = useMemo(() => {
    if (scope === "all") return projects;
    if (scope === "selected") return projects.filter((p) => selectedIds.has(p.id));
    return projects.slice(-1); // current = most recent
  }, [projects, scope, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)));
    }
  };

  const handleExport = async () => {
    if (targetProjects.length === 0) {
      showToast("No projects to export. Select at least one.", "error");
      return;
    }
    setExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const timestamp = new Date().toISOString().slice(0, 10);

      if (format === "md") {
        const content = targetProjects
          .map((p) => formatProjectMarkdown(p, favorites, pinned))
          .join("\n\n---\n\n");
        downloadFile(content, `voxora-export-${timestamp}.md`, "text/markdown");
        showToast(`✅ Exported ${targetProjects.length} project(s) as Markdown`);
      } else if (format === "txt") {
        const content = targetProjects
          .map((p) => formatProjectText(p, favorites, pinned))
          .join("\n\n\n");
        downloadFile(content, `voxora-export-${timestamp}.txt`, "text/plain");
        showToast(`✅ Exported ${targetProjects.length} project(s) as Plain Text`);
      } else {
        exportPDF(targetProjects, favorites, pinned);
        showToast(`✅ PDF opened — use your browser's Print dialog to save`);
      }
    } catch {
      showToast("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const handlePreview = () => {
    if (targetProjects.length === 0) { setPreview(null); return; }
    if (format === "md") {
      setPreview(targetProjects.map((p) => formatProjectMarkdown(p, favorites, pinned)).join("\n\n---\n\n"));
    } else {
      setPreview(targetProjects.map((p) => formatProjectText(p, favorites, pinned)).join("\n\n\n"));
    }
  };

  return (
    <div className="export-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="export-header">
        <h1>📤 Export Center</h1>
        <p className="export-subtitle">Export your projects as PDF, Markdown, or Plain Text.</p>
      </div>

      <div className="export-layout">
        <div className="export-options">
          <div className="export-section">
            <h3>Export Format</h3>
            <div className="format-cards">
              {(["pdf", "md", "txt"] as ExportFormat[]).map((f) => (
                <div
                  key={f}
                  className={`format-card ${format === f ? "active" : ""}`}
                  onClick={() => setFormat(f)}
                >
                  <div className="format-icon">
                    {f === "pdf" ? "📄" : f === "md" ? "📝" : "📃"}
                  </div>
                  <div className="format-name">{f === "pdf" ? "PDF" : f === "md" ? "Markdown" : "Plain Text"}</div>
                  <div className="format-ext">.{f === "md" ? "md" : f}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="export-section">
            <h3>Export Scope</h3>
            <div className="scope-options">
              {([
                { value: "all", label: `All Projects (${projects.length})` },
                { value: "selected", label: `Selected (${selectedIds.size})` },
                { value: "current", label: "Most Recent Project" },
              ] as { value: ExportScope; label: string }[]).map((o) => (
                <label key={o.value} className={`scope-option ${scope === o.value ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="scope"
                    value={o.value}
                    checked={scope === o.value}
                    onChange={() => setScope(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {scope === "selected" && (
            <div className="export-section">
              <h3>Select Projects</h3>
              <input
                className="export-search"
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="project-select-list">
                <label className="project-select-item select-all">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                    onChange={toggleSelectAll}
                  />
                  <span>Select All ({filteredProjects.length})</span>
                </label>
                {filteredProjects.map((p) => (
                  <label key={p.id} className="project-select-item">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                    <span>
                      <strong>{p.title}</strong>
                      <small>{p.category}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="export-actions">
            {format !== "pdf" && (
              <button className="export-preview-btn" onClick={handlePreview}>
                👁 Preview
              </button>
            )}
            <button
              className="export-btn"
              onClick={handleExport}
              disabled={exporting || targetProjects.length === 0}
            >
              {exporting ? "⏳ Exporting..." : `📤 Export ${targetProjects.length} Project${targetProjects.length !== 1 ? "s" : ""}`}
            </button>
          </div>

          {projects.length === 0 && (
            <div className="export-empty">
              <p>📭 No projects to export yet.</p>
              <button className="ac-cta-btn" onClick={() => setWorkspace("dashboard")}>Create Your First Project</button>
            </div>
          )}
        </div>

        {preview && (
          <div className="export-preview-panel">
            <div className="preview-header">
              <h3>Preview</h3>
              <button onClick={() => setPreview(null)}>✕ Close</button>
            </div>
            <pre className="preview-content">{preview}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
