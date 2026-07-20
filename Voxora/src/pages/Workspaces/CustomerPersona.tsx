import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function CustomerPersona({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [product, setProduct] = useState("");
  const [persona, setPersona] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("persona");

  const generatePersona = async () => {
    if (!product.trim()) return;
    const output = await analyze(product, "persona");
    if (!output) return;
    setPersona(output);
    addActivity({
      type: "persona_generated",
      title: "Customer Persona Created",
      description: `Customer persona generated for "${product}".`,
      category: "Research", icon: "👤",
    });
  };

  const savePersona = () => {
    if (!persona) return;
    saveProject({
      id: Date.now().toString(),
      title: `Customer Persona — ${product}`,
      category: "Customer Research",
      createdAt: new Date().toISOString(),
      notes: persona,
    });
    showToast("👤 Customer persona saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>👤 Customer Persona</h1>
      <p className="workspace-subtitle">Generate your ideal customer profile.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Enter your product or service..."
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generatePersona()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generatePersona} disabled={!product.trim() || isLoading}>
          {isLoading ? "⏳ Generating…" : "👤 Generate Persona"}
        </button>
      </div>

      {persona && (
        <div className="workspace-results">
          <div className="report-box">{persona}</div>
          <button className="workspace-btn workspace-save-btn" onClick={savePersona}>
            💾 Save Persona
          </button>
        </div>
      )}

      {!persona && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">👤</div>
          <p>Enter your product above to generate a detailed customer persona.</p>
        </div>
      )}
    </div>
  );
}
