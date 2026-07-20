import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function SocialMediaPost({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [topic,  setTopic]  = useState("");
  const [result, setResult] = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("socialMedia");

  const generate = async () => {
    if (!topic.trim()) return;
    const out = await analyze(topic, "socialMedia");
    if (!out) return;
    setResult(out);
    addActivity({
      type: "social_content_generated",
      title: "Social Media Content Generated",
      description: `Social media content plan created for "${topic}".`,
      category: "Marketing", icon: "📱",
    });
  };

  const save = () => {
    if (!result) return;
    saveProject({
      id: Date.now().toString(),
      title: `Social Media Plan — ${topic}`,
      category: "Social Media",
      createdAt: new Date().toISOString(),
      notes: result,
    });
    showToast("📱 Social media plan saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("marketingHub")}>← Back to Marketing Studio</button>
      <h1>📱 Social Media Post Generator</h1>
      <p className="workspace-subtitle">Generate a complete social content plan for LinkedIn, X, Instagram, and TikTok.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input
          className="workspace-input"
          placeholder="Enter your brand, product, or content topic..."
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          disabled={isLoading}
        />
        <button className="workspace-btn" onClick={generate} disabled={!topic.trim() || isLoading}>
          {isLoading ? "⏳ Generating…" : "📱 Generate Social Content"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Content Plan</button>
        </div>
      )}

      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📱</div>
          <p>Enter your topic to generate posts for LinkedIn, X, Instagram, and TikTok.</p>
        </div>
      )}
    </div>
  );
}
