import React, { useState } from "react";
import { useProjects } from "../../context/ProjectContext";

interface CustomerResearchProps {
  setWorkspace: (workspace: string) => void;
}

export default function CustomerResearch({
  setWorkspace,
}: CustomerResearchProps) {
  const { saveProject } = useProjects();

  const [product, setProduct] = useState("");
  const [customer, setCustomer] = useState("");
  const [market, setMarket] = useState("");
  const [research, setResearch] = useState<string[]>([]);

  const generateResearch = () => {
    if (!product || !customer || !market) return;

    setResearch([
      `Customer pain points for ${customer} using ${product}`,
      `Key needs of ${customer} in the ${market} market`,
      `Buying motivations for customers interested in ${product}`,
      `Possible challenges customers may face with ${product}`,
    ]);
  };

  const saveResearch = () => {
    research.forEach((item) => {
      saveProject({
        id: Date.now().toString() + Math.random(),
        title: `🔍 ${item}`,
        category: "Customer Research",
        createdAt: new Date().toLocaleString(),
        notes: "",
      });
    });
  };

  return (
    <div>
      <p
        onClick={() => setWorkspace("dashboard")}
        style={{ cursor: "pointer" }}
      >
        ← Back to Dashboard
      </p>

      <h1>Customer Research AI</h1>

      <p>
        Understand your customers and discover their needs.
      </p>

      <input
        type="text"
        placeholder="Product or idea..."
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />

      <input
        type="text"
        placeholder="Target customer..."
        value={customer}
        onChange={(e) => setCustomer(e.target.value)}
      />

      <input
        type="text"
        placeholder="Market..."
        value={market}
        onChange={(e) => setMarket(e.target.value)}
      />

      <button onClick={generateResearch}>
        Generate Research
      </button>

      {research.length > 0 && (
        <div>
          <h2>Customer Insights</h2>

          {research.map((item, index) => (
            <p key={index}>{item}</p>
          ))}

          <button onClick={saveResearch}>
            💾 Save Research
          </button>
        </div>
      )}
    </div>
  );
}