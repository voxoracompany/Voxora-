// ── V4.7 Collaboration Plan ───────────────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

type TeamSize = "Solo" | "2-5" | "6-15" | "16-50" | "50+";
type Stage    = "Pre-seed" | "Seed" | "Series A" | "Series B+" | "Bootstrapped" | "Enterprise";

export default function CollaborationPlan({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [business,   setBusiness]  = useState("");
  const [teamSize,   setTeamSize]  = useState<TeamSize>("2-5");
  const [stage,      setStage]     = useState<Stage>("Seed");
  const [challenges, setChallenges]= useState("");
  const [tools,      setTools]     = useState("");
  const [result,     setResult]    = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("collaborationPlan");

  const generate = async () => {
    const prompt = [
      `Business: ${business || "My Startup"}`,
      `Team size: ${teamSize}`,
      `Stage: ${stage}`,
      challenges ? `Collaboration challenges: ${challenges}` : "",
      tools ? `Current tools: ${tools}` : "",
    ].filter(Boolean).join(". ");
    const out = await analyze(prompt, "collaborationPlan");
    if (!out) return;
    setResult(out);
    addActivity({ type:"collab_plan_created", title:"Collaboration Plan Created", description: business||"My Startup", category:"Team Collaboration", icon:"🤝" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title:`Collaboration Plan — ${business||"My Startup"}`, category:"Collaboration Plan", createdAt: new Date().toISOString(), notes: result });
    showToast("🤝 Collaboration plan saved!");
  };

  const exportMd = () => {
    if (!result) return;
    const md = `# Collaboration Plan — ${business || "My Startup"}\n\n**Team Size:** ${teamSize}  \n**Stage:** ${stage}\n\n${result}`;
    const blob = new Blob([md], { type:"text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="collaboration-plan.md"; a.click();
    showToast("📥 Exported as Markdown!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={()=>setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>🤝 Collaboration Plan</h1>
      <p className="workspace-subtitle">AI-powered team collaboration strategy — communication norms, rituals, tools, and async/sync balance.</p>
      {isDemoMode && <DemoBanner onConfigure={()=>setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Business or product name..."
          value={business} onChange={e=>setBusiness(e.target.value)} disabled={isLoading} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:6 }}>TEAM SIZE</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {(["Solo","2-5","6-15","16-50","50+"] as TeamSize[]).map(s=>(
                <button key={s} onClick={()=>setTeamSize(s)}
                  style={{ padding:"6px 14px", borderRadius:20, border:`1.5px solid ${teamSize===s?"#6C63FF":"#e5e7eb"}`, background:teamSize===s?"#6C63FF":"transparent", color:teamSize===s?"#fff":"#374151", fontWeight:600, fontSize:13, cursor:"pointer" }}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:6 }}>COMPANY STAGE</label>
            <select className="workspace-input" value={stage} onChange={e=>setStage(e.target.value as Stage)} disabled={isLoading}>
              {(["Pre-seed","Seed","Series A","Series B+","Bootstrapped","Enterprise"] as Stage[]).map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <textarea className="workspace-textarea" placeholder="Current collaboration challenges (e.g. remote team, async issues, meetings overload)..."
          value={challenges} onChange={e=>setChallenges(e.target.value)} rows={2} disabled={isLoading} />
        <input className="workspace-input" placeholder="Tools you use (e.g. Slack, Notion, Linear, Zoom)..."
          value={tools} onChange={e=>setTools(e.target.value)} disabled={isLoading} />
        <button className="workspace-btn" onClick={generate} disabled={isLoading}>
          {isLoading ? "⏳ Building Plan…" : "🤝 Generate Collaboration Plan"}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
            <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Plan</button>
            <button className="workspace-btn workspace-save-btn" onClick={exportMd}>📥 Export Markdown</button>
          </div>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🤝</div>
          <p>Describe your team and generate a tailored collaboration strategy with communication norms, rituals, and tooling recommendations.</p>
        </div>
      )}
    </div>
  );
}
