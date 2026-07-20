// ── V4.7 Team Goals ───────────────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type Priority = "High" | "Medium" | "Low";
type Status   = "On Track" | "At Risk" | "Completed" | "Not Started";

interface TeamGoal {
  id: string; title: string; owner: string; dueDate: string;
  progress: number; priority: Priority; status: Status; description: string;
}

const STATUS_COLOR: Record<Status, string>   = { "On Track":"#10b981","At Risk":"#ef4444","Completed":"#6C63FF","Not Started":"#6b7280" };
const PRIORITY_COLOR: Record<Priority,string> = { High:"#ef4444", Medium:"#f59e0b", Low:"#10b981" };

export default function TeamGoals({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [goals, setGoals] = useState<TeamGoal[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title:"", owner:"", dueDate:"", priority:"Medium" as Priority, description:"" });

  const add = () => {
    if (!form.title.trim()) return;
    const g: TeamGoal = { ...form, id: Date.now().toString(), progress: 0, status: "Not Started" };
    setGoals(prev => [...prev, g]);
    setForm({ title:"", owner:"", dueDate:"", priority:"Medium", description:"" });
    setAdding(false);
    addActivity({ type:"team_goal_created", title:"Team Goal Created", description: form.title, category:"Team Collaboration", icon:"🎯" });
    showToast("🎯 Team goal added!");
  };

  const update = (id: string, field: keyof TeamGoal, val: string | number) =>
    setGoals(prev => prev.map(g => g.id === id ? { ...g, [field]: val } : g));

  const remove = (id: string) => { setGoals(prev => prev.filter(g => g.id !== id)); showToast("🗑️ Goal removed."); };

  return (
    <div className="workspace-container" style={{ maxWidth: 900 }}>
      <button className="back-btn" onClick={() => setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>🎯 Team Goals</h1>
      <p className="workspace-subtitle">Set shared team goals with ownership, progress tracking, and status.</p>

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-icon">🎯</div><p className="stat-value">{goals.length}</p><h3 className="stat-label">Total Goals</h3></div>
        <div className="stat-card"><div className="stat-icon">✅</div><p className="stat-value">{goals.filter(g=>g.status==="Completed").length}</p><h3 className="stat-label">Completed</h3></div>
        <div className="stat-card"><div className="stat-icon">🟢</div><p className="stat-value">{goals.filter(g=>g.status==="On Track").length}</p><h3 className="stat-label">On Track</h3></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><p className="stat-value">{goals.filter(g=>g.status==="At Risk").length}</p><h3 className="stat-label">At Risk</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom: 20 }} onClick={() => setAdding(v=>!v)}>
        {adding ? "✕ Cancel" : "+ Add Team Goal"}
      </button>

      {adding && (
        <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"20px 22px", marginBottom:24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Goal title *" value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <input className="workspace-input" placeholder="Owner (name or team)" value={form.owner} onChange={e=>setForm(v=>({...v,owner:e.target.value}))} />
              <input type="date" className="workspace-input" value={form.dueDate} onChange={e=>setForm(v=>({...v,dueDate:e.target.value}))} />
              <select className="workspace-input" value={form.priority} onChange={e=>setForm(v=>({...v,priority:e.target.value as Priority}))}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <textarea className="workspace-textarea" placeholder="Goal description..." value={form.description} onChange={e=>setForm(v=>({...v,description:e.target.value}))} rows={2} />
            <button className="workspace-btn" onClick={add} disabled={!form.title.trim()}>🎯 Add Goal</button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">🎯</div><p>No team goals yet. Add your first goal to align the team.</p></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {goals.map(g => (
            <div key={g.id} style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"18px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{g.title}</h3>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, background:PRIORITY_COLOR[g.priority]+"20", color:PRIORITY_COLOR[g.priority] }}>{g.priority}</span>
                  </div>
                  <p style={{ margin:0, fontSize:12, color:"#6b7280" }}>
                    {g.owner && `👤 ${g.owner}`}{g.dueDate && `  📅 ${new Date(g.dueDate+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}`}
                  </p>
                  {g.description && <p style={{ margin:"4px 0 0", fontSize:13, color:"#374151" }}>{g.description}</p>}
                </div>
                <button onClick={()=>remove(g.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:18, marginLeft:12 }}>🗑️</button>
              </div>

              <div style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>Progress</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>{g.progress}%</span>
                </div>
                <input type="range" min={0} max={100} value={g.progress} onChange={e=>update(g.id,"progress",Number(e.target.value))} style={{ width:"100%", accentColor:"#6C63FF" }} />
                <div style={{ height:6, background:"#f3f4f6", borderRadius:4, marginTop:4 }}>
                  <div style={{ height:6, width:`${g.progress}%`, background: g.progress===100?"#10b981":"#6C63FF", borderRadius:4, transition:"width 0.3s" }} />
                </div>
              </div>

              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {(["Not Started","On Track","At Risk","Completed"] as Status[]).map(s=>(
                  <button key={s} onClick={()=>update(g.id,"status",s)}
                    style={{ fontSize:11, padding:"4px 10px", borderRadius:20, border:`1.5px solid ${STATUS_COLOR[s]}`, background:g.status===s?STATUS_COLOR[s]:"transparent", color:g.status===s?"#fff":STATUS_COLOR[s], cursor:"pointer", fontWeight:600 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
