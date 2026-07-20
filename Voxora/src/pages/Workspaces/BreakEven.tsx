import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function BreakEven({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("breakEven");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "breakEven");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "break_even_generated",
      title: "Break-Even Analysis Generated",
      description: `Break-even analysis completed for "${product}".`,
      category: "Finance", icon: "📈",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Break-Even Analysis — ${product}`,
      category: "Break-Even Analysis",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📈 Break-even analysis saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>📈 Break-Even Analysis</h1>
      <p className="workspace-subtitle">Know exactly how many customers you need and when you'll be profitable.</p>

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
          {isLoading ? "⏳ Calculating…" : "📈 Calculate Break-Even"}
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
          <div className="workspace-empty-icon">📈</div>
          <p>Enter your product to calculate fixed costs, contribution margin, and time to break-even.</p>
        </div>
      )}
    </div>
  );
}
