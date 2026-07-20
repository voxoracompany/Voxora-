import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function PricingStrategy({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("pricingStrategy");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "pricingStrategy");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "pricing_strategy_generated",
      title: "Pricing Strategy Generated",
      description: `Pricing strategy designed for "${product}".`,
      category: "Finance", icon: "🏷️",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Pricing Strategy — ${product}`,
      category: "Pricing Strategy",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("🏷️ Pricing strategy saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>🏷️ Pricing Strategy</h1>
      <p className="workspace-subtitle">Find the optimal price for your product with competitor benchmarking and pricing experiments.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product or service..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Analyzing…" : "🏷️ Build Pricing Strategy"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Pricing Strategy</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🏷️</div>
          <p>Enter your product to get a complete pricing strategy with tiers, benchmarks, and experiments.</p>
        </div>
      )}
    </div>
  );
}
