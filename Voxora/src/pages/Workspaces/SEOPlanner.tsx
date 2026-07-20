import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function SEOPlanner({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [topic,  setTopic]  = useState("");
  const [result, setResult] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("seoPlanner");

  const generate = async () => {
    if (!topic.trim()) return;
    const out = await analyze(topic, "seoPlanner");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "seo_plan_generated",
      title: "SEO Plan Generated",
      description: `SEO strategy created for "${topic}".`,
      category: "Marketing", icon: "🔍",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `SEO Plan — ${topic}`,
      category: "SEO Strategy",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("🔍 SEO plan saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>🔍 SEO Keyword Planner</h1>
      <p className="workspace-subtitle">Build a complete SEO strategy with keyword clusters, content plan, and 90-day calendar.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your product, niche, or target topic..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!topic.trim() || isLoading}>
          {isLoading ? "⏳ Planning…" : "🔍 Generate SEO Plan"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save SEO Plan</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🔍</div>
          <p>Enter your product or niche to get a keyword strategy, content cluster, and 90-day SEO plan.</p>
        </div>
      )}
    </div>
  );
}
