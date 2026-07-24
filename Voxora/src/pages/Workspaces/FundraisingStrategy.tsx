import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function FundraisingStrategy({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("fundraisingStrategy");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "fundraisingStrategy");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "fundraising_strategy_generated",
      title: "Fundraising Strategy Generated",
      description: `Fundraising strategy created for "${product}".`,
      category: "Investor Studio", icon: "✨",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Fundraising Strategy — ${product}`,
      category: "Fundraising Strategy",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("Fundraising strategy saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("investorHub")}>← Back to Investor Studio</button>
      <h1>✨ Fundraising Strategy</h1>
      <p className="workspace-subtitle">Define how much to raise, who to target, and your 90-day fundraising timeline.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your startup name or product..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Building…" : "✨ Build Fundraising Strategy"}
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
          <div className="workspace-empty-icon">✨</div>
          <p>Enter your startup to generate a complete fundraising strategy with investor targets and timeline.</p>
        </div>
      )}
    </div>
  );
}
