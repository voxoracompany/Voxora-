// ── V6.7 Support Knowledge Base ───────────────────────────────────────────────
import { useState, useMemo } from "react";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["Getting Started", "Billing", "Account & Security", "Technical", "Integrations", "FAQs"];

const LS_KEY = "voxora-support-kb";
function uid() { return Math.random().toString(36).slice(2, 10); }
function nowISO() { return new Date().toISOString(); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString(); }

const SEED: Article[] = [
  {
    id: uid(), title: "How to reset your password", category: "Account & Security",
    content: "## Resetting Your Password\n\n1. Go to the login page and click **Forgot Password**.\n2. Enter the email address associated with your account.\n3. Check your inbox for a password reset link (valid for 24 hours).\n4. Click the link and enter your new password.\n\n**Tip:** Check your spam folder if the email doesn't arrive within 2 minutes.",
    tags: ["password", "login", "security"], views: 245, helpful: 89, notHelpful: 3, status: "published",
    createdAt: "2025-07-01T00:00:00Z", updatedAt: "2025-07-10T00:00:00Z",
  },
  {
    id: uid(), title: "Understanding your invoice", category: "Billing",
    content: "## Invoice Guide\n\nInvoices are generated automatically on your billing date and emailed to you.\n\n### Where to find invoices\n1. Go to **Billing & Plans** in the sidebar.\n2. Click **Invoice History**.\n3. Download any invoice as a PDF.\n\n### Invoice items\n- **Subscription fee** — your monthly or annual plan cost\n- **Taxes** — applicable taxes based on your location",
    tags: ["billing", "invoice", "payment"], views: 178, helpful: 64, notHelpful: 5, status: "published",
    createdAt: "2025-07-02T00:00:00Z", updatedAt: "2025-07-12T00:00:00Z",
  },
  {
    id: uid(), title: "Exporting your data", category: "Technical",
    content: "## Data Export\n\nVoxora lets you export data from most workspaces.\n\n### Supported formats\n- **CSV** — for spreadsheet applications\n- **JSON** — for developers and API integrations\n- **PDF** — for sharing and printing\n- **Markdown** — for documentation tools\n\n### How to export\n1. Open the **Export Center** from the sidebar.\n2. Select the data source.\n3. Choose your format.\n4. Click **Export**.",
    tags: ["export", "data", "csv", "pdf"], views: 132, helpful: 51, notHelpful: 2, status: "published",
    createdAt: "2025-07-03T00:00:00Z", updatedAt: "2025-07-15T00:00:00Z",
  },
];

function load(): Article[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null") ?? SEED; } catch { return SEED; }
}
function save(a: Article[]) { localStorage.setItem(LS_KEY, JSON.stringify(a)); }

const EMPTY: Omit<Article, "id" | "views" | "helpful" | "notHelpful" | "createdAt" | "updatedAt"> = {
  title: "", category: "Getting Started", content: "", tags: [], status: "draft",
};

export default function SupportKnowledgeBase({ setWorkspace }: Props) {
  const [articles, setArticles]   = useState<Article[]>(load);
  const [form, setForm]           = useState({ ...EMPTY, tagsStr: "" });
  const [editing, setEditing]     = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [reading, setReading]     = useState<string | null>(null);

  const persist = (a: Article[]) => { setArticles(a); save(a); };

  const filtered = useMemo(() => articles.filter(a => {
    if (filterCat !== "all" && a.category !== filterCat) return false;
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.tags.some(t => t.includes(q));
  }), [articles, filterCat, search]);

  const openNew = () => { setForm({ ...EMPTY, tagsStr: "" }); setEditing(null); setShowForm(true); setReading(null); };
  const openEdit = (a: Article) => {
    const { id, views, helpful, notHelpful, createdAt, updatedAt, tags, ...rest } = a;
    setForm({ ...rest, tags: [], tagsStr: tags.join(", ") });
    setEditing(a.id); setShowForm(true); setReading(null);
  };

  const submit = () => {
    if (!form.title.trim()) return;
    const tags = form.tagsStr.split(",").map(t => t.trim()).filter(Boolean);
    if (editing) {
      persist(articles.map(a => a.id === editing ? { ...a, ...form, tags, updatedAt: nowISO() } : a));
    } else {
      persist([{ id: uid(), ...form, tags, views: 0, helpful: 0, notHelpful: 0, createdAt: nowISO(), updatedAt: nowISO() }, ...articles]);
    }
    setShowForm(false);
  };

  const remove = (id: string) => { if (confirm("Delete this article?")) persist(articles.filter(a => a.id !== id)); };

  const vote = (id: string, key: "helpful" | "notHelpful") => {
    persist(articles.map(a => a.id === id ? { ...a, [key]: a[key] + 1, views: a.views + 1 } : a));
  };

  const readingArticle = reading ? articles.find(a => a.id === reading) : null;

  const renderMarkdown = (md: string) =>
    md.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h2 key={i} style={{ fontSize: 18, fontWeight: 700, margin: "16px 0 8px" }}>{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, margin: "12px 0 6px" }}>{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} style={{ marginLeft: 20, marginBottom: 4, fontSize: 14 }}>{line.slice(2).split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</li>;
      if (/^\d+\./.test(line)) return <li key={i} style={{ marginLeft: 20, marginBottom: 4, fontSize: 14 }}>{line.replace(/^\d+\.\s/, "").split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</li>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i} style={{ margin: "4px 0", fontSize: 14 }}>{line.split(/\*\*(.+?)\*\*/g).map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
    });

  return (
    <div className="workspace-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("supportStudio")}>← Back to Customer Support Studio</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>📚 Knowledge Base</h1>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted,#6b7280)", fontSize: 14 }}>{articles.filter(a => a.status === "published").length} published articles · {articles.filter(a => a.status === "draft").length} drafts</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ New Article</button>
      </div>

      {/* Reading view */}
      {readingArticle && (
        <div style={{ background: "var(--bg-secondary,#f9fafb)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 14, padding: 28, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginBottom: 6 }}>{readingArticle.category}</div>
              <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>{readingArticle.title}</h2>
              <div style={{ lineHeight: 1.7 }}>{renderMarkdown(readingArticle.content)}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted,#6b7280)" }}>Was this helpful?</span>
                <button onClick={() => vote(readingArticle.id, "helpful")} style={{ padding: "6px 14px", background: "#d1fae5", color: "#059669", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>👍 Yes ({readingArticle.helpful})</button>
                <button onClick={() => vote(readingArticle.id, "notHelpful")} style={{ padding: "6px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>👎 No ({readingArticle.notHelpful})</button>
                <span style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginLeft: "auto" }}>Updated {fmtDate(readingArticle.updatedAt)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => openEdit(readingArticle)}>Edit</button>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setReading(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles…" style={{ flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Articles list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted,#6b7280)" }}>No articles found. Click "+ New Article" to get started.</div>}
        {filtered.map(a => (
          <div key={a.id} style={{ background: "var(--bg-primary,#fff)", border: "1px solid var(--border-color,#e5e7eb)", borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, background: a.status === "published" ? "#d1fae5" : "#fef3c7", color: a.status === "published" ? "#059669" : "#d97706", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{a.status}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted,#6b7280)" }}>{a.category}</span>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 15, color: "var(--text-primary,#111827)", padding: 0, textAlign: "left", marginBottom: 4 }} onClick={() => setReading(a.id === reading ? null : a.id)}>{a.title}</button>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-muted,#6b7280)" }}>
                <span>👁 {a.views} views</span>
                <span>👍 {a.helpful}</span>
                <span>Updated {fmtDate(a.updatedAt)}</span>
                {a.tags.slice(0, 3).map(t => <span key={t} style={{ background: "var(--bg-secondary,#f9fafb)", padding: "1px 8px", borderRadius: 10 }}>#{t}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => openEdit(a)}>Edit</button>
              <button style={{ padding: "6px 12px", fontSize: 12, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => remove(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-primary,#fff)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>{editing ? "Edit Article" : "New Article"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Article title" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as "published" | "draft" }))} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13 }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Tags (comma-separated)</label>
                <input value={form.tagsStr} onChange={e => setForm(p => ({ ...p, tagsStr: e.target.value }))} placeholder="billing, account, password" style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Content (Markdown supported)</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your article content here. Use ## for headings, **bold**, - for bullet lists." rows={10} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-color,#e5e7eb)", background: "var(--bg-primary,#fff)", color: "var(--text-primary,#111827)", fontSize: 13, resize: "vertical", boxSizing: "border-box", fontFamily: "monospace" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>{editing ? "Save Changes" : "Create Article"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
