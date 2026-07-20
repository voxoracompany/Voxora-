import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function UnitEconomics({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("unitEconomics");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "unitEconomics");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "unit_economics_generated",
      title: "Unit Economics Analyzed",
      description: `Unit economics analysis completed for "${product}".`,
      category: "Finance", icon: "📊",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Unit Economics — ${product}`,
      category: "Unit Economics",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📊 Unit economics saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>📊 Unit Economics</h1>
      <p className="workspace-subtitle">Analyze your CAC, LTV, payback period, and churn impact — the metrics investors care about most.</p>

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
          {isLoading ? "⏳ Calculating…" : "📊 Analyze Unit Economics"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Analysis</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📊</div>
          <p>Enter your product to analyze CAC, LTV, payback period, and churn impact by channel.</p>
        </div>
      )}
    </div>
  );
}
