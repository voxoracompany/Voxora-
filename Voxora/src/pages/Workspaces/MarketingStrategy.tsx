import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function MarketingStrategy({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("marketingStrategy");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "marketingStrategy");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "marketing_strategy_generated",
      title: "Marketing Strategy Generated",
      description: `Full marketing strategy created for "${product}".`,
      category: "Marketing", icon: "📣",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Marketing Strategy — ${product}`,
      category: "Marketing Strategy",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📣 Marketing strategy saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>📣 Marketing Strategy</h1>
      <p className="workspace-subtitle">Build a complete go-to-market strategy with channels, messaging, and 30-day action plan.</p>

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
          {isLoading ? "⏳ Building…" : "📣 Generate Marketing Strategy"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Strategy</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📣</div>
          <p>Enter your product to generate a full marketing strategy with channels, funnel, and 30-day plan.</p>
        </div>
      )}
    </div>
  );
}
