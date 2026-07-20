import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function FinancialForecast({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("financialForecast");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "financialForecast");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "financial_forecast_generated",
      title: "Financial Forecast Generated",
      description: `12-month financial forecast created for "${product}".`,
      category: "Finance", icon: "💰",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Financial Forecast — ${product}`,
      category: "Financial Forecast",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("💰 Financial forecast saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>💰 Financial Forecast</h1>
      <p className="workspace-subtitle">Generate a 12-month revenue projection with unit economics, cost drivers, and break-even analysis.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product or startup idea..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Projecting…" : "💰 Generate Forecast"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Forecast</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">💰</div>
          <p>Enter your product to generate a 12-month financial forecast with milestone projections.</p>
        </div>
      )}
    </div>
  );
}
