import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function ExecutiveSummary({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("executiveSummary");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "executiveSummary");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "exec_summary_generated",
      title: "Executive Summary Generated",
      description: `Executive summary created for "${product}".`,
      category: "Finance", icon: "📄",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Executive Summary — ${product}`,
      category: "Executive Summary",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📄 Executive summary saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>📄 Executive Summary</h1>
      <p className="workspace-subtitle">Generate a one-page executive summary for investors, partners, and stakeholders.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your company or startup name..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Writing…" : "📄 Generate Executive Summary"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Summary</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📄</div>
          <p>Enter your company name to generate a one-page executive summary for investors and partners.</p>
        </div>
      )}
    </div>
  );
}
