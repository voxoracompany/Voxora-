import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function CustomerResearch({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product,  setProduct]  = useState("");
  const [customer, setCustomer] = useState("");
  const [market,   setMarket]   = useState("");
  const [report,   setReport]   = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("research");

  const generateResearch = async () => {
    if (!product || !customer || !market) return;
    const subject = `${product} targeting ${customer} in the ${market} market`;
    const output  = await analyze(subject, "research");
    if (!output) return;
    setReport(output);
    addActivity({
      type: "research_completed",
      title: "Customer Research Completed",
      description: `Research completed for "${product}" targeting ${customer} in the ${market} market.`,
      category: "Research", icon: "🔍",
    });
  };

  const saveResearch = () => {
    if (!report) return;
    saveProject({
      id: Date.now().toString(),
      title: `Customer Research — ${product}`,
      category: "Customer Research",
      createdAt: new Date().toISOString(),
      notes: report,
    });
    showToast("🔍 Customer research saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🔍 Customer Research</h1>
      <p className="workspace-subtitle">Understand your customers and discover their needs.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form-grid">
        <input className="workspace-input" type="text" placeholder="Product or idea..." value={product}
          onChange={(e) => setProduct(e.target.value)} disabled={isLoading} />
        <input className="workspace-input" type="text" placeholder="Target customer..." value={customer}
          onChange={(e) => setCustomer(e.target.value)} disabled={isLoading} />
        <input className="workspace-input" type="text" placeholder="Market or industry..." value={market}
          onChange={(e) => setMarket(e.target.value)} disabled={isLoading} />
        <button className="workspace-btn" onClick={generateResearch}
          disabled={!product || !customer || !market || isLoading}>
          {isLoading ? "⏳ Researching…" : "🔍 Generate Research"}
        </button>
      </div>

      {report && (
        <div className="workspace-results">
          <div className="report-box">{report}</div>
          <button className="workspace-btn workspace-save-btn" onClick={saveResearch}>
            💾 Save Research
          </button>
        </div>
      )}

      {!report && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🔍</div>
          <p>Fill in your product, customer, and market details above to generate insights.</p>
        </div>
      )}
    </div>
  );
}
