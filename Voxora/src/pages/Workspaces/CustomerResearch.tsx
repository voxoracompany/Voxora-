import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function CustomerResearch({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [market, setMarket] = useState("");
  const [research, setResearch] = useState<string[]>([]);

  const generateResearch = () => {
    if (!product || !customer || !market) return;
    setResearch([
      `Customer pain points for ${customer} when using ${product} in the ${market} market`,
      `Key unmet needs of ${customer} that ${product} could solve`,
      `Primary buying motivations for ${customer} seeking ${product} solutions`,
      `Challenges ${customer} faces during onboarding with ${product}`,
      `Factors that cause ${customer} to switch from competing ${product} solutions`,
      `What ${customer} values most in a ${product} experience`,
    ]);
    addActivity({
      type: "research_completed",
      title: "Customer Research Completed",
      description: `Research completed for "${product}" targeting ${customer} in the ${market} market.`,
      category: "Research",
      icon: "🔍",
    });
  };

  const saveResearch = () => {
    if (research.length === 0) return;
    const notes = research.join("\n\n");
    saveProject({
      id: Date.now().toString(),
      title: `Customer Research — ${product}`,
      category: "Customer Research",
      createdAt: new Date().toISOString(),
      notes,
    });
    showToast("🔍 Customer research saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🔍 Customer Research</h1>
      <p className="workspace-subtitle">Understand your customers and discover their needs.</p>

      <div className="workspace-form-grid">
        <input className="workspace-input" type="text" placeholder="Product or idea..." value={product} onChange={(e) => setProduct(e.target.value)} />
        <input className="workspace-input" type="text" placeholder="Target customer..." value={customer} onChange={(e) => setCustomer(e.target.value)} />
        <input className="workspace-input" type="text" placeholder="Market or industry..." value={market} onChange={(e) => setMarket(e.target.value)} />
        <button className="workspace-btn" onClick={generateResearch} disabled={!product || !customer || !market}>
          🔍 Generate Research
        </button>
      </div>

      {research.length > 0 && (
        <div className="workspace-results">
          <h3>Customer Insights</h3>
          <div className="insight-list">
            {research.map((item, i) => (
              <div key={i} className="insight-card">
                <span className="insight-num">{i + 1}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <button className="workspace-btn workspace-save-btn" onClick={saveResearch}>
            💾 Save Research
          </button>
        </div>
      )}

      {research.length === 0 && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🔍</div>
          <p>Fill in your product, customer, and market details above to generate insights.</p>
        </div>
      )}
    </div>
  );
}
