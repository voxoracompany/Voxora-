// ── V6.4 CRM Proposal Generator ──────────────────────────────────────────────
import { useState } from "react";
import { useAI } from "../../hooks/useAI";
import { useProjects } from "../../context/ProjectContext";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import DemoBanner from "../../components/DemoBanner";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

type ProposalType = "sales" | "service" | "product" | "partnership";

const PROPOSAL_TYPES: { value: ProposalType; label: string; icon: string; color: string; desc: string }[] = [
  { value: "sales",       label: "Sales Proposal",        icon: "💼", color: "#6C63FF", desc: "Pitch your product/service to a prospect." },
  { value: "service",     label: "Service Proposal",      icon: "🛠️", color: "#3b82f6", desc: "Outline scope, timeline, and pricing for a service engagement." },
  { value: "product",     label: "Product Proposal",      icon: "📦", color: "#10b981", desc: "Present a new product to a potential buyer or investor." },
  { value: "partnership", label: "Partnership Proposal",  icon: "🤝", color: "#f59e0b", desc: "Propose a strategic partnership or co-marketing agreement." },
];

export default function CRMProposalGenerator({ setWorkspace }: Props) {
  const { generate, isLoading, isDemoMode } = useAI("crm");
  const { saveProject } = useProjects();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [proposalType, setProposalType] = useState<ProposalType>("sales");
  const [clientName, setClientName]     = useState("");
  const [company, setCompany]           = useState("");
  const [yourName, setYourName]         = useState("");
  const [yourCompany, setYourCompany]   = useState("");
  const [dealValue, setDealValue]       = useState("");
  const [painPoint, setPainPoint]       = useState("");
  const [solution, setSolution]         = useState("");
  const [output, setOutput]             = useState("");

  const selectedType = PROPOSAL_TYPES.find(t => t.value === proposalType)!;

  const buildPrompt = (): string => {
    const typeMap: Record<ProposalType, string> = {
      sales:       "a persuasive sales proposal",
      service:     "a professional service proposal with scope, timeline, and pricing section",
      product:     "a compelling product proposal for a potential buyer",
      partnership: "a strategic partnership proposal with mutual benefits clearly stated",
    };
    return `Write ${typeMap[proposalType]} as a complete, professional document.

Sender: ${yourName || "Your Name"} from ${yourCompany || "Your Company"}
Recipient: ${clientName || "Client Name"} at ${company || "Client Company"}
${dealValue ? `Proposal Value: $${dealValue}` : ""}
${painPoint ? `Problem / Pain Point: ${painPoint}` : ""}
${solution ? `Proposed Solution: ${solution}` : ""}

Format the proposal with these sections:
1. Executive Summary
2. Understanding Your Needs / Problem Statement
3. Proposed Solution
4. Scope of Work / Deliverables
5. Timeline
6. Pricing
7. Why Choose Us
8. Next Steps
9. Terms & Conditions (brief)

Make it professional, persuasive, and ready to send. Use formal business language.`;
  };

  const handleGenerate = async () => {
    const result = await generate(buildPrompt());
    if (!result) return;
    setOutput(result);
  };

  const handleSave = () => {
    if (!output) return;
    const title = `${selectedType.label}${clientName ? ` — ${clientName}` : ""}${company ? ` at ${company}` : ""}`;
    saveProject({
      id: Date.now().toString(),
      title,
      category: `${selectedType.label}`,
      createdAt: new Date().toISOString(),
      notes: output,
    });
    addActivity({ type: "research_completed", title: "Proposal Saved", description: title, category: "Sales & CRM", icon: "📝" });
    showToast("📝 Proposal saved to projects!");
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => showToast("📋 Copied to clipboard!"));
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `proposal-${proposalType}-${Date.now()}.txt`;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("salesCRM")}>← Back to CRM Studio</button>
      <h1>📝 Proposal Generator</h1>
      <p className="workspace-subtitle">AI-powered proposals ready to send in minutes.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      {/* Proposal type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {PROPOSAL_TYPES.map(t => (
          <div
            key={t.value}
            onClick={() => setProposalType(t.value)}
            style={{
              border: `2px solid ${proposalType === t.value ? t.color : "var(--border,#e5e7eb)"}`,
              background: proposalType === t.value ? t.color + "10" : "var(--bg-card,#fff)",
              borderRadius: 14, padding: "14px 16px", cursor: "pointer",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: proposalType === t.value ? t.color : "var(--text,#111827)" }}>{t.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted,#6b7280)", marginTop: 4 }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div style={{
        background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
        borderRadius: 16, padding: 24, marginBottom: 24,
      }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Proposal Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>YOUR NAME</label>
            <input className="workspace-input" placeholder="Your name" value={yourName} onChange={e => setYourName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>YOUR COMPANY</label>
            <input className="workspace-input" placeholder="Your company" value={yourCompany} onChange={e => setYourCompany(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>CLIENT NAME</label>
            <input className="workspace-input" placeholder="Client / prospect name" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>CLIENT COMPANY</label>
            <input className="workspace-input" placeholder="Client company" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>DEAL VALUE (optional)</label>
            <input className="workspace-input" placeholder="e.g. 15,000" value={dealValue} onChange={e => setDealValue(e.target.value)} style={{ maxWidth: 200 }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>CLIENT PAIN POINT / PROBLEM</label>
            <textarea className="workspace-textarea" placeholder="Describe the problem your client is facing…" value={painPoint} onChange={e => setPainPoint(e.target.value)} style={{ minHeight: 80 }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted,#6b7280)", display: "block", marginBottom: 4 }}>YOUR SOLUTION</label>
            <textarea className="workspace-textarea" placeholder="Describe what you're offering…" value={solution} onChange={e => setSolution(e.target.value)} style={{ minHeight: 80 }} />
          </div>
        </div>
        <button
          className="workspace-btn"
          onClick={handleGenerate}
          disabled={isLoading}
          style={{ marginTop: 16, background: selectedType.color, minWidth: 200 }}
        >
          {isLoading ? "⏳ Generating…" : `${selectedType.icon} Generate ${selectedType.label}`}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="workspace-results">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>📄 {selectedType.label}</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCopy} style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>📋 Copy</button>
              <button onClick={handleDownload} style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151" }}>⬇️ Download</button>
              <button onClick={handleSave} className="workspace-btn workspace-save-btn" style={{ padding: "8px 16px", fontSize: 13 }}>💾 Save</button>
            </div>
          </div>
          <div style={{
            background: "var(--bg-card,#fff)", border: "1.5px solid var(--border,#e5e7eb)",
            borderRadius: 14, padding: 24, whiteSpace: "pre-line", lineHeight: 1.7,
            fontSize: 14, color: "var(--text,#374151)", maxHeight: 600, overflowY: "auto",
          }}>
            {output}
          </div>
        </div>
      )}

      {!output && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📝</div>
          <p>Select a proposal type, fill in the details, and click Generate.</p>
        </div>
      )}
    </div>
  );
}
