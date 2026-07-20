// ── V4.7 Team Brief ───────────────────────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

type BriefType = "standup" | "weekly" | "sprint" | "allhands";

const BRIEF_TYPES: { id: BriefType; label: string; icon: string; desc: string }[] = [
  { id: "standup",  icon: "☀️", label: "Daily Standup",  desc: "Quick 15-min standup summary." },
  { id: "weekly",   icon: "📅", label: "Weekly Brief",   desc: "Weekly team status update." },
  { id: "sprint",   icon: "🏃", label: "Sprint Brief",   desc: "Sprint review and planning summary." },
  { id: "allhands", icon: "📣", label: "All-Hands Brief",desc: "Company-wide all-hands update." },
];

export default function TeamBrief({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { projects, saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [briefType, setBriefType] = useState<BriefType>("standup");
  const [teamName,  setTeamName]  = useState("");
  const [context,   setContext]   = useState("");
  const [result,    setResult]    = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("teamBrief");

  const generate = async () => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate()-7);
    const recent = projects.filter(p=>new Date(p.createdAt)>=weekStart).slice(0,5).map(p=>p.title).join(", ");
    const prompt = `Team: ${teamName||"Team"}. Brief type: ${briefType}. Recent work: ${recent||"none"}. Additional context: ${context||"generate a professional brief"}.`;
    const out = await analyze(prompt, "teamBrief");
    if (!out) return;
    setResult(out);
    addActivity({ type:"team_brief_generated", title:"Team Brief Generated", description:`${briefType} brief for ${teamName||"Team"}`, category:"Team Collaboration", icon:"📡" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title:`Team Brief — ${BRIEF_TYPES.find(b=>b.id===briefType)?.label}`, category:"Team Brief", createdAt: new Date().toISOString(), notes: result });
    showToast("📡 Team brief saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={()=>setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>📡 Team Brief</h1>
      <p className="workspace-subtitle">AI-generated team status briefs for standups, weekly syncs, sprints, and all-hands.</p>
      {isDemoMode && <DemoBanner onConfigure={()=>setWorkspace("aiSettings")} />}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12, marginBottom:24 }}>
        {BRIEF_TYPES.map(bt=>(
          <div key={bt.id} onClick={()=>setBriefType(bt.id)}
            style={{ background:briefType===bt.id?"linear-gradient(135deg,#0f172a,#2563eb)":"#fff", border:`1.5px solid ${briefType===bt.id?"#2563eb":"#e5e7eb"}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", transition:"all 0.2s" }}>
            <div style={{ fontSize:24, marginBottom:6 }}>{bt.icon}</div>
            <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color:briefType===bt.id?"#fff":"#111827" }}>{bt.label}</h3>
            <p style={{ margin:0, fontSize:11, color:briefType===bt.id?"rgba(255,255,255,0.75)":"#6b7280", lineHeight:1.4 }}>{bt.desc}</p>
          </div>
        ))}
      </div>

      <div className="workspace-form">
        <input className="workspace-input" placeholder="Team name (e.g. Engineering, Marketing)..."
          value={teamName} onChange={e=>setTeamName(e.target.value)} disabled={isLoading} />
        <textarea className="workspace-textarea" placeholder="Key updates, blockers, priorities, or highlights..."
          value={context} onChange={e=>setContext(e.target.value)} rows={3} disabled={isLoading} />
        <button className="workspace-btn" onClick={generate} disabled={isLoading}>
          {isLoading ? "⏳ Generating Brief…" : `📡 Generate ${BRIEF_TYPES.find(b=>b.id===briefType)?.label}`}
        </button>
      </div>

      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Brief</button>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📡</div>
          <p>Select a brief type, add context, and generate a professional team update in seconds.</p>
        </div>
      )}
    </div>
  );
}
