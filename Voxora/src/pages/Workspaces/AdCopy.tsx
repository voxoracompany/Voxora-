import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function AdCopy({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("adCopy");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "adCopy");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "ad_copy_generated",
      title: "Ad Copy Generated",
      description: `Ad copy created for "${product}".`,
      category: "Marketing", icon: "📢",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Ad Copy — ${product}`,
      category: "Advertising",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📢 Ad copy saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>📢 Ad Copy Generator</h1>
      <p className="workspace-subtitle">Generate high-converting ad copy for Google, Facebook, LinkedIn, and YouTube.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product or offer..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Writing…" : "📢 Generate Ad Copy"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Ad Copy</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📢</div>
          <p>Enter your product to generate ad variations for Google, Facebook, LinkedIn, and YouTube.</p>
        </div>
      )}
    </div>
  );
}
