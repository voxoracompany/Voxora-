// ── V6.4 CRM Export Center ───────────────────────────────────────────────────
// Supports PDF (print dialog), CSV, Excel (.xlsx), JSON, Markdown.
import { useState } from "react";
import * as XLSX from "xlsx";
import { useCRM, type Lead, type Contact, type Meeting, type CRMTask } from "../../hooks/useCRM";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type DataSet = "leads" | "contacts" | "meetings" | "tasks" | "all";
type ExportFmt = "csv" | "xlsx" | "json" | "markdown" | "pdf";

const DATASETS: { value: DataSet; label: string; icon: string }[] = [
  { value: "leads",    label: "Leads",    icon: "👤" },
  { value: "contacts", label: "Contacts", icon: "📇" },
  { value: "meetings", label: "Meetings", icon: "📅" },
  { value: "tasks",    label: "Tasks",    icon: "✅" },
  { value: "all",      label: "All Data", icon: "📦" },
];

const FORMATS: { value: ExportFmt; label: string; icon: string; color: string }[] = [
  { value: "csv",      label: "CSV",         icon: "📊", color: "#10b981" },
  { value: "xlsx",     label: "Excel (.xlsx)",icon: "🟢", color: "#1d6f42" },
  { value: "json",     label: "JSON",         icon: "🔷", color: "#3b82f6" },
  { value: "markdown", label: "Markdown",     icon: "📝", color: "#8b5cf6" },
  { value: "pdf",      label: "PDF (print)",  icon: "📄", color: "#ef4444" },
];

// ── Formatters ─────────────────────────────────────────────────────────────────
function leadsToCsv(leads: Lead[]): string {
  const header = "Name,Company,Email,Phone,Source,Status,Value,Tags,Notes,Created";
  const rows = leads.map(l =>
    [l.name, l.company, l.email, l.phone, l.source, l.status, l.value,
     l.tags.join("|"), l.notes.replace(/\n/g," "), l.createdAt.slice(0,10)]
      .map(v => `"${String(v ?? "").replace(/"/g,'""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function contactsToCsv(contacts: Contact[]): string {
  const header = "Name,Type,Company,Email,Phone,Favorite,Notes,Created";
  const rows = contacts.map(c =>
    [c.name, c.type, c.company, c.email, c.phone, c.isFavorite ? "Yes" : "No",
     c.notes.replace(/\n/g," "), c.createdAt.slice(0,10)]
      .map(v => `"${String(v ?? "").replace(/"/g,'""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function meetingsToCsv(meetings: Meeting[]): string {
  const header = "Title,Date,Time,Participants,Status,Agenda,Notes,Follow-up,Created";
  const rows = meetings.map(m =>
    [m.title, m.date, m.time, m.participants, m.status,
     m.agenda.replace(/\n/g," "), m.notes.replace(/\n/g," "),
     m.followUpActions.replace(/\n/g," "), m.createdAt.slice(0,10)]
      .map(v => `"${String(v ?? "").replace(/"/g,'""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function tasksToCsv(tasks: CRMTask[]): string {
  const header = "Title,Type,Priority,Status,Due Date,Notes,Created";
  const rows = tasks.map(t =>
    [t.title, t.type, t.priority, t.status, t.dueDate,
     t.notes.replace(/\n/g," "), t.createdAt.slice(0,10)]
      .map(v => `"${String(v ?? "").replace(/"/g,'""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function toMarkdown(leads: Lead[], contacts: Contact[], meetings: Meeting[], tasks: CRMTask[], ds: DataSet): string {
  const lines: string[] = ["# Voxora CRM Export", `\n_Exported: ${new Date().toLocaleString()}_\n`];

  if (ds === "leads" || ds === "all") {
    lines.push("## Leads", "");
    if (leads.length === 0) { lines.push("_(none)_", ""); }
    else leads.forEach(l => {
      lines.push(`### ${l.name} — ${l.company}`,
        `- **Status:** ${l.status}  **Source:** ${l.source}  **Value:** $${l.value || 0}`,
        `- **Email:** ${l.email}  **Phone:** ${l.phone}`,
        l.tags.length ? `- **Tags:** ${l.tags.join(", ")}` : "",
        l.notes ? `- **Notes:** ${l.notes}` : "",
        "");
    });
  }

  if (ds === "contacts" || ds === "all") {
    lines.push("## Contacts", "");
    if (contacts.length === 0) { lines.push("_(none)_", ""); }
    else contacts.forEach(c => {
      lines.push(`### ${c.name} (${c.type})`,
        `- **Company:** ${c.company}  **Email:** ${c.email}  **Phone:** ${c.phone}`,
        c.isFavorite ? "- ⭐ Favorite" : "",
        c.notes ? `- **Notes:** ${c.notes}` : "",
        "");
    });
  }

  if (ds === "meetings" || ds === "all") {
    lines.push("## Meetings", "");
    if (meetings.length === 0) { lines.push("_(none)_", ""); }
    else meetings.forEach(m => {
      lines.push(`### ${m.title}`,
        `- **Date:** ${m.date} ${m.time}  **Status:** ${m.status}`,
        m.participants ? `- **Participants:** ${m.participants}` : "",
        m.agenda ? `- **Agenda:** ${m.agenda.replace(/\n/g, " ")}` : "",
        m.followUpActions ? `- **Follow-up:** ${m.followUpActions.replace(/\n/g, " ")}` : "",
        "");
    });
  }

  if (ds === "tasks" || ds === "all") {
    lines.push("## Tasks", "");
    if (tasks.length === 0) { lines.push("_(none)_", ""); }
    else tasks.forEach(t => {
      lines.push(`### ${t.title}`,
        `- **Type:** ${t.type}  **Priority:** ${t.priority}  **Status:** ${t.status}`,
        t.dueDate ? `- **Due:** ${t.dueDate}` : "",
        t.notes ? `- **Notes:** ${t.notes}` : "",
        "");
    });
  }

  return lines.filter(l => l !== "").join("\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function CRMExport({ setWorkspace }: Props) {
  const { leads, contacts, meetings, tasks } = useCRM();
  const { showToast } = useToast();

  const [dataset, setDataset] = useState<DataSet>("all");
  const [format,  setFormat]  = useState<ExportFmt>("csv");

  const counts = {
    leads: leads.length, contacts: contacts.length, meetings: meetings.length, tasks: tasks.length,
    all: leads.length + contacts.length + meetings.length + tasks.length,
  };

  const handleExport = () => {
    const ts = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      const data: Record<string, unknown> = {};
      if (dataset === "leads"    || dataset === "all") data.leads    = leads;
      if (dataset === "contacts" || dataset === "all") data.contacts = contacts;
      if (dataset === "meetings" || dataset === "all") data.meetings = meetings;
      if (dataset === "tasks"    || dataset === "all") data.tasks    = tasks;
      downloadBlob(JSON.stringify(data, null, 2), `voxora-crm-${dataset}-${ts}.json`, "application/json");
      showToast("✅ JSON exported!");
      return;
    }

    if (format === "markdown") {
      const md = toMarkdown(leads, contacts, meetings, tasks, dataset);
      downloadBlob(md, `voxora-crm-${dataset}-${ts}.md`, "text/markdown");
      showToast("✅ Markdown exported!");
      return;
    }

    if (format === "csv") {
      let csv = "";
      if (dataset === "leads")    csv = leadsToCsv(leads);
      else if (dataset === "contacts") csv = contactsToCsv(contacts);
      else if (dataset === "meetings") csv = meetingsToCsv(meetings);
      else if (dataset === "tasks")    csv = tasksToCsv(tasks);
      else csv = [
        "=== LEADS ===", leadsToCsv(leads),
        "\n=== CONTACTS ===", contactsToCsv(contacts),
        "\n=== MEETINGS ===", meetingsToCsv(meetings),
        "\n=== TASKS ===", tasksToCsv(tasks),
      ].join("\n");
      downloadBlob(csv, `voxora-crm-${dataset}-${ts}.csv`, "text/csv");
      showToast("✅ CSV exported!");
      return;
    }

    if (format === "xlsx") {
      const wb = XLSX.utils.book_new();
      if (dataset === "leads" || dataset === "all") {
        const ws = XLSX.utils.json_to_sheet(leads.map(l => ({
          Name: l.name, Company: l.company, Email: l.email, Phone: l.phone,
          Source: l.source, Status: l.status, Value: l.value,
          Tags: l.tags.join(", "), Notes: l.notes, Created: l.createdAt.slice(0, 10),
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
      }
      if (dataset === "contacts" || dataset === "all") {
        const ws = XLSX.utils.json_to_sheet(contacts.map(c => ({
          Name: c.name, Type: c.type, Company: c.company, Email: c.email,
          Phone: c.phone, Favorite: c.isFavorite ? "Yes" : "No",
          Notes: c.notes, Created: c.createdAt.slice(0, 10),
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Contacts");
      }
      if (dataset === "meetings" || dataset === "all") {
        const ws = XLSX.utils.json_to_sheet(meetings.map(m => ({
          Title: m.title, Date: m.date, Time: m.time, Participants: m.participants,
          Status: m.status, Agenda: m.agenda, Notes: m.notes,
          "Follow-up": m.followUpActions, Created: m.createdAt.slice(0, 10),
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Meetings");
      }
      if (dataset === "tasks" || dataset === "all") {
        const ws = XLSX.utils.json_to_sheet(tasks.map(t => ({
          Title: t.title, Type: t.type, Priority: t.priority, Status: t.status,
          "Due Date": t.dueDate, Notes: t.notes, Created: t.createdAt.slice(0, 10),
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Tasks");
      }
      XLSX.writeFile(wb, `voxora-crm-${dataset}-${ts}.xlsx`);
      showToast("✅ Excel file exported!");
      return;
    }

    if (format === "pdf") {
      const md = toMarkdown(leads, contacts, meetings, tasks, dataset);
      const html = `<!DOCTYPE html><html><head><title>Voxora CRM Export</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#111827;line-height:1.6}
h1{color:#6C63FF}h2{color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:8px}
h3{color:#4b5563}li{margin:4px 0}
</style></head><body><pre style="white-space:pre-wrap;font-size:13px">${md.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
<script>window.onload=()=>{window.print()}</script></body></html>`;
      const w = window.open("", "_blank");
      if (w) { w.document.write(html); w.document.close(); }
      showToast("✅ Print dialog opened for PDF.");
      return;
    }
  };

  const selectedDs = DATASETS.find(d => d.value === dataset)!;
  const selectedFmt = FORMATS.find(f => f.value === format)!;

  return (
    <div className="workspace-container" style={{ maxWidth: 800 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📤 CRM Export Center</h1>
      <p className="workspace-subtitle">Export your CRM data in multiple formats.</p>

      {/* Dataset selector */}
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>1. Choose Data</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {DATASETS.map(d => (
          <button
            key={d.value}
            onClick={() => setDataset(d.value)}
            style={{
              padding: "10px 18px", border: `2px solid ${dataset === d.value ? "#6C63FF" : "var(--border,#e5e7eb)"}`,
              background: dataset === d.value ? "#ede9fe" : "var(--bg-card,#fff)",
              color: dataset === d.value ? "#6C63FF" : "var(--text,#374151)",
              borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span>{d.icon}</span>
            <span>{d.label}</span>
            <span style={{ fontSize: 11, background: dataset === d.value ? "#6C63FF" : "#f3f4f6", color: dataset === d.value ? "#fff" : "#6b7280", borderRadius: 20, padding: "1px 7px" }}>
              {counts[d.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Format selector */}
      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>2. Choose Format</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
        {FORMATS.map(f => (
          <button
            key={f.value}
            onClick={() => setFormat(f.value)}
            style={{
              padding: "10px 18px", border: `2px solid ${format === f.value ? f.color : "var(--border,#e5e7eb)"}`,
              background: format === f.value ? f.color + "10" : "var(--bg-card,#fff)",
              color: format === f.value ? f.color : "var(--text,#374151)",
              borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Summary + Export */}
      <div style={{
        background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
        borderRadius: 16, padding: 24, marginBottom: 20,
      }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>Export Summary</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, marginBottom: 20 }}>
          <div>📂 <strong>Dataset:</strong> {selectedDs.icon} {selectedDs.label} ({counts[dataset]} records)</div>
          <div>📄 <strong>Format:</strong> {selectedFmt.icon} {selectedFmt.label}</div>
          {format === "pdf" && (
            <div style={{ fontSize: 12, color: "#f59e0b", background: "#fef3c7", borderRadius: 8, padding: "8px 12px", marginTop: 4 }}>
              💡 PDF opens a print dialog. Use "Save as PDF" in your browser's print settings.
            </div>
          )}
        </div>
        <button
          className="workspace-btn"
          onClick={handleExport}
          disabled={counts[dataset] === 0}
          style={{ background: selectedFmt.color, minWidth: 200 }}
        >
          {counts[dataset] === 0 ? "No data to export" : `${selectedFmt.icon} Export ${selectedDs.label} as ${selectedFmt.label}`}
        </button>
      </div>

      {/* Format tips */}
      <div style={{ background: "#f9fafb", border: "1px solid var(--border,#e5e7eb)", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted,#6b7280)", marginBottom: 8 }}>FORMAT GUIDE</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text,#374151)" }}>
          <div>📊 <strong>CSV</strong> — Open in Excel, Google Sheets, or any spreadsheet app</div>
          <div>🟢 <strong>Excel</strong> — Multi-sheet .xlsx file, one sheet per data type</div>
          <div>🔷 <strong>JSON</strong> — Full data with all fields, ideal for developers</div>
          <div>📝 <strong>Markdown</strong> — Formatted text, readable in Notion, GitHub, etc.</div>
          <div>📄 <strong>PDF</strong> — Opens browser print dialog; choose "Save as PDF"</div>
        </div>
      </div>
    </div>
  );
}
