import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function RevenueModel({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("revenueModel");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "revenueModel");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "revenue_model_generated",
      title: "Revenue Model Generated",
      description: `Revenue model designed for "${product}".`,
      category: "Finance", icon: "💵",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Revenue Model — ${product}`,
      category: "Revenue Model",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("💵 Revenue model saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>💵 Revenue Model Builder</h1>
      <p className="workspace-subtitle">Design your pricing tiers, revenue streams, and expansion revenue strategy.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product or startup..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Building…" : "💵 Build Revenue Model"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Revenue Model</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">💵</div>
          <p>Enter your product to design a complete revenue model with tiers, streams, and expansion strategy.</p>
        </div>
      )}
    </div>
  );
}
