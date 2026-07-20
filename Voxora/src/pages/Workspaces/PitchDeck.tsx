import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function PitchDeck({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [result,  setResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("pitchDeck");

  const generate = async () => {
    if (!product.trim()) return;
    const out = await analyze(product, "pitchDeck");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "pitch_deck_generated",
      title: "Pitch Deck Generated",
      description: `Investor pitch deck outline created for "${product}".`,
      category: "Finance", icon: "🎯",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Investor Pitch Deck — ${product}`,
      category: "Investor Pitch",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("🎯 Pitch deck outline saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("financialHub")}>← Back to Financial Studio</button>
      <h1>🎯 Investor Pitch Deck</h1>
      <p className="workspace-subtitle">Generate a complete 12-slide pitch deck outline with talking points for every slide.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your startup or product..."
          value={product}
          onChange={e => setProduct(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Building…" : "🎯 Generate Pitch Deck"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Pitch Deck</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🎯</div>
          <p>Enter your startup to generate a 12-slide investor pitch deck outline with key talking points.</p>
        </div>
      )}
    </div>
  );
}
