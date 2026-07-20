// ── V4.6 Analytics Reports ────────────────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type ReportType = "weekly" | "monthly" | "quarterly" | "annual";

const REPORT_TYPES: { id: ReportType; label: string; icon: string; desc: string }[] = [
  { id: "weekly",    icon: "📅", label: "Weekly Report",    desc: "7-day summary of projects, activity, and AI usage." },
  { id: "monthly",   icon: "📆", label: "Monthly Report",   desc: "Monthly growth, top categories, and milestones." },
  { id: "quarterly", icon: "🗓️", label: "Quarterly Report", desc: "Quarterly OKR review, trends, and projections." },
  { id: "annual",    icon: "📊", label: "Annual Report",    desc: "Full-year performance summary with next-year strategy." },
];

export default function AnalyticsReports({ setWorkspace }: Props) {
  const { projects, favorites } = useProjects();
  const { activities } = useActivity();
  const { usage } = useAIContext();
  const { showToast } = useToast();
  const [selectedType, setSelectedType] = useState<ReportType>("monthly");
  const [business, setBusiness]         = useState("");
  const [result,   setResult]           = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("analyticsReports");

  const generateReport = async () => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = projects.filter(p => new Date(p.createdAt) >= weekStart).length;

    const context = `
Business: ${business || "My Business"}
Report type: ${selectedType}
Total projects: ${projects.length}
Projects this week: ${thisWeek}
Favorites: ${favorites.length}
Total activities: ${activities.length}
AI requests today: ${usage.todayCount}
AI requests this week: ${usage.weeklyCount}
Most used workspace: ${usage.mostUsedWorkspace}
Top project categories: ${[...new Set(projects.map(p => p.category))].slice(0, 5).join(", ")}
    `.trim();

    const out = await analyze(context, "analyticsReports");
    if (!out) return;
    setResult(out);
    showToast(`📄 ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} report generated!`);
  };

  const exportAs = (format: "txt" | "md" | "json") => {
    if (!result) return;
    let content = result;
    let mime = "text/plain";
    let ext = "txt";
    if (format === "md") { content = `# Voxora ${selectedType} Report\n\n${result}`; mime = "text/markdown"; ext = "md"; }
    if (format === "json") { content = JSON.stringify({ type: selectedType, business, generatedAt: new Date().toISOString(), content: result }, null, 2); mime = "application/json"; ext = "json"; }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `voxora-${selectedType}-report.${ext}`; a.click();
    showToast(`📥 Report exported as .${ext}`);
  };

  const exportCSV = () => {
    if (!result) return;
    const rows = [
      ["Report Type", selectedType],
      ["Business", business || "My Business"],
      ["Generated At", new Date().toISOString()],
      ["Total Projects", projects.length],
      ["AI Requests Today", usage.todayCount],
      ["Content", `"${result.replace(/"/g, '""')}"`],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `voxora-${selectedType}-report.csv`; a.click();
    showToast("📥 Exported as CSV!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>📄 Analytics Reports</h1>
      <p className="workspace-subtitle">Generate weekly, monthly, quarterly, and annual reports powered by your live workspace data.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Report type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {REPORT_TYPES.map(rt => (
          <div key={rt.id} onClick={() => setSelectedType(rt.id)} style={{ background: selectedType === rt.id ? "linear-gradient(135deg, #6C63FF, #a855f7)" : "#fff", border: `1.5px solid ${selectedType === rt.id ? "#6C63FF" : "#e5e7eb"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{rt.icon}</div>
            <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: selectedType === rt.id ? "#fff" : "#111827" }}>{rt.label}</h3>
            <p style={{ margin: 0, fontSize: 12, color: selectedType === rt.id ? "rgba(255,255,255,0.8)" : "#6b7280", lineHeight: 1.4 }}>{rt.desc}</p>
          </div>
        ))}
      </div>

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Business or product name (optional)..."
          value={business} onChange={e => setBusiness(e.target.value)} disabled={isLoading} />
        <button className="workspace-btn" onClick={generateReport} disabled={isLoading}>
          {isLoading ? `⏳ Generating ${selectedType} report…` : `📄 Generate ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Report`}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button className="workspace-btn workspace-save-btn" onClick={() => exportAs("txt")}>📥 Export TXT</button>
            <button className="workspace-btn workspace-save-btn" onClick={() => exportAs("md")}>📥 Export Markdown</button>
            <button className="workspace-btn workspace-save-btn" onClick={exportCSV}>📥 Export CSV</button>
            <button className="workspace-btn workspace-save-btn" onClick={() => exportAs("json")}>📥 Export JSON</button>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📄</div>
          <p>Select a report type and click generate. Your report will be built using live data from your workspace.</p>
        </div>
      )}
    </div>
  );
}
