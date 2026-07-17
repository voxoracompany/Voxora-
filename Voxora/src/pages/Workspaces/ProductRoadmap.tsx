import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";

export default function ProductRoadmap({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const [productName, setProductName] = useState("");
  const [vision, setVision] = useState("");
  const [mvpFeatures, setMvpFeatures] = useState("");
  const [growthPlan, setGrowthPlan] = useState("");

  const saveRoadmap = () => {
    if (!productName.trim()) { showToast("Please enter a product name.", "error"); return; }
    const notes = `Product Vision:\n${vision}\n\nMVP Features:\n${mvpFeatures}\n\nGrowth Plan:\n${growthPlan}`;
    saveProject({
      id: Date.now().toString(),
      title: `${productName} — Product Roadmap`,
      category: "Product Roadmap",
      createdAt: new Date().toISOString(),
      notes,
    });
    addActivity({
      type: "roadmap_created",
      title: "Product Roadmap Created",
      description: `Roadmap created for "${productName}".`,
      category: "Roadmaps",
      icon: "🗺️",
    });
    showToast(`🗺️ Product roadmap for "${productName}" saved!`);
    setProductName(""); setVision(""); setMvpFeatures(""); setGrowthPlan("");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🗺️ Product Roadmap</h1>
      <p className="workspace-subtitle">Turn your idea into a step-by-step product development plan.</p>

      <div className="workspace-form">
        <input
          className="workspace-input"
          type="text"
          placeholder="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <textarea
          className="workspace-textarea"
          placeholder="Product Vision — What problem does it solve? What's the long-term goal?"
          value={vision}
          onChange={(e) => setVision(e.target.value)}
        />
        <textarea
          className="workspace-textarea"
          placeholder="MVP Features — What are the core features for the first version?"
          value={mvpFeatures}
          onChange={(e) => setMvpFeatures(e.target.value)}
        />
        <textarea
          className="workspace-textarea"
          placeholder="Growth Plan — What features come after launch? How will you scale?"
          value={growthPlan}
          onChange={(e) => setGrowthPlan(e.target.value)}
        />
        <button className="workspace-btn" onClick={saveRoadmap} disabled={!productName.trim()}>
          🗺️ Generate & Save Roadmap
        </button>
      </div>

      {!productName && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🗺️</div>
          <p>Fill in your product details above to create a structured roadmap.</p>
        </div>
      )}
    </div>
  );
}
