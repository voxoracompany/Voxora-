import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface ProductRoadmapProps {
  setWorkspace: (workspace: string) => void;
}

export default function ProductRoadmap({
  setWorkspace,
}: ProductRoadmapProps) {
  const { saveProject } = useProjects();

  const [productName, setProductName] = useState("");
  const [vision, setVision] = useState("");
  const [mvpFeatures, setMvpFeatures] = useState("");
  const [growthPlan, setGrowthPlan] = useState("");

  const saveAnalysis = () => {
  saveProject({
    id: Date.now().toString(),
    title: `${productName} Product Roadmap`,
    category: "Product Roadmap",
    createdAt: new Date().toISOString(),
    notes: `
Product Vision:
${vision}

MVP Features:
${mvpFeatures}

Growth Plan:
${growthPlan}
    `,
  });

  alert("Product Roadmap saved successfully ✅");
};

return (
    <div
      style={{
        padding: "25px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>Product Roadmap Generator</h1>

      <p style={{ marginBottom: "25px" }}>
        Turn your idea into a step-by-step product development plan.
      </p>

      <input
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
        }}
        type="text"
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <textarea
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          minHeight: "120px",
        }}
        placeholder="Product Vision"
        value={vision}
        onChange={(e) => setVision(e.target.value)}
      />

      <textarea
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          minHeight: "120px",
        }}
        placeholder="MVP Features (First Version)"
        value={mvpFeatures}
        onChange={(e) => setMvpFeatures(e.target.value)}
      />

      <textarea
        style={{
          display: "block",
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          minHeight: "120px",
        }}
        placeholder="Growth Plan (Future Features)"
        value={growthPlan}
        onChange={(e) => setGrowthPlan(e.target.value)}
      />

      <button
        style={{
          padding: "12px 20px",
          marginRight: "15px",
          cursor: "pointer",
        }}
        onClick={saveAnalysis}
      >
        Generate & Save Roadmap
      </button>

      <button
        style={{
          padding: "12px 20px",
          cursor: "pointer",
        }}
        onClick={() => setWorkspace("dashboard")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}