// ── V4.7 Team Retrospective ───────────────────────────────────────────────────
import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

type RetroFormat = "start-stop-continue" | "4ls" | "mad-sad-glad" | "ai-generated";

interface RetroItem { id: string; text: string; votes: number; }
interface RetroBoard {
  format: RetroFormat;
  columns: { key: string; label: string; icon: string; color: string; items: RetroItem[] }[];
}

const FORMATS: { id: RetroFormat; label: string; icon: string; desc: string; cols: { key: string; label: string; icon: string; color: string }[] }[] = [
  {
    id: "start-stop-continue", icon: "🔁", label: "Start / Stop / Continue", desc: "Classic retro format.",
    cols: [
      { key:"start",    label:"Start",    icon:"🚀", color:"#10b981" },
      { key:"stop",     label:"Stop",     icon:"🛑", color:"#ef4444" },
      { key:"continue", label:"Continue", icon:"✅", color:"#3b82f6" },
    ],
  },
  {
    id: "4ls", icon: "🌊", label: "4 Ls", desc: "Liked, Learned, Lacked, Longed For.",
    cols: [
      { key:"liked",   label:"Liked",      icon:"❤️", color:"#ec4899" },
      { key:"learned", label:"Learned",    icon:"📚", color:"#3b82f6" },
      { key:"lacked",  label:"Lacked",     icon:"⚠️", color:"#f59e0b" },
      { key:"longed",  label:"Longed For", icon:"💫", color:"#8b5cf6" },
    ],
  },
  {
    id: "mad-sad-glad", icon: "😊", label: "Mad / Sad / Glad", desc: "Emotion-based retrospective.",
    cols: [
      { key:"mad",  label:"Mad",  icon:"😡", color:"#ef4444" },
      { key:"sad",  label:"Sad",  icon:"😢", color:"#3b82f6" },
      { key:"glad", label:"Glad", icon:"😊", color:"#10b981" },
    ],
  },
  {
    id: "ai-generated", icon: "🤖", label: "AI-Generated", desc: "Let AI run the retrospective.",
    cols: [],
  },
];

function buildBoard(format: RetroFormat): RetroBoard {
  const fmt = FORMATS.find(f => f.id === format)!;
  return {
    format,
    columns: fmt.cols.map(c => ({ ...c, items: [] })),
  };
}

export default function TeamRetrospective({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { projects, saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [format,    setFormat]    = useState<RetroFormat>("start-stop-continue");
  const [board,     setBoard]     = useState<RetroBoard>(() => buildBoard("start-stop-continue"));
  const [inputs,    setInputs]    = useState<Record<string,string>>({});
  const [sprintName,setSprintName]= useState("");
  const [context,   setContext]   = useState("");
  const [aiResult,  setAiResult]  = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("teamRetrospective");

  const selectFormat = (f: RetroFormat) => {
    setFormat(f);
    setBoard(buildBoard(f));
    setInputs({});
    setAiResult("");
  };

  const addItem = (colKey: string) => {
    const text = inputs[colKey]?.trim();
    if (!text) return;
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c =>
        c.key === colKey
          ? { ...c, items: [...c.items, { id: Date.now().toString(), text, votes: 0 }] }
          : c
      ),
    }));
    setInputs(prev => ({ ...prev, [colKey]: "" }));
  };

  const vote = (colKey: string, itemId: string) => {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c =>
        c.key === colKey
          ? { ...c, items: c.items.map(it => it.id===itemId ? {...it, votes:it.votes+1} : it) }
          : c
      ),
    }));
  };

  const removeItem = (colKey: string, itemId: string) => {
    setBoard(prev => ({
      ...prev,
      columns: prev.columns.map(c =>
        c.key === colKey ? { ...c, items: c.items.filter(it => it.id!==itemId) } : c
      ),
    }));
  };

  const generateAI = async () => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate()-14);
    const recent = projects.filter(p=>new Date(p.createdAt)>=weekStart).slice(0,5).map(p=>p.title).join(", ");
    const prompt = `Sprint/period: ${sprintName||"last sprint"}. Recent work: ${recent||"none"}. Context: ${context||"run a thorough retrospective"}.`;
    const out = await analyze(prompt, "teamRetrospective");
    if (!out) return;
    setAiResult(out);
    addActivity({ type:"retro_generated", title:"Retrospective Completed", description:sprintName||"Sprint retro", category:"Team Collaboration", icon:"🔁" });
  };

  const saveRetro = () => {
    const content = format === "ai-generated"
      ? aiResult
      : board.columns.map(c => `## ${c.icon} ${c.label}\n${c.items.map(it=>`- ${it.text} (${it.votes} votes)`).join("\n")||"No items"}`).join("\n\n");
    if (!content) return;
    saveProject({ id: Date.now().toString(), title:`Retrospective — ${sprintName||"Sprint"}`, category:"Retrospective", createdAt: new Date().toISOString(), notes: content });
    showToast("🔁 Retrospective saved!");
  };

  const totalItems = board.columns.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="workspace-container" style={{ maxWidth:1100 }}>
      <button className="back-btn" onClick={()=>setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>🔁 Team Retrospective</h1>
      <p className="workspace-subtitle">Run structured team retrospectives — identify what worked, what didn't, and what to change.</p>
      {isDemoMode && format==="ai-generated" && <DemoBanner onConfigure={()=>setWorkspace("aiSettings")} />}

      {/* Format picker */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px, 1fr))", gap:10, marginBottom:24 }}>
        {FORMATS.map(f => (
          <div key={f.id} onClick={()=>selectFormat(f.id)}
            style={{ background:format===f.id?"linear-gradient(135deg,#0f172a,#1e3a5f)":"#fff", border:`1.5px solid ${format===f.id?"#2563eb":"#e5e7eb"}`, borderRadius:12, padding:"12px 14px", cursor:"pointer", transition:"all 0.2s" }}>
            <div style={{ fontSize:22, marginBottom:5 }}>{f.icon}</div>
            <h3 style={{ margin:"0 0 3px", fontSize:13, fontWeight:700, color:format===f.id?"#fff":"#111827" }}>{f.label}</h3>
            <p style={{ margin:0, fontSize:11, color:format===f.id?"rgba(255,255,255,0.7)":"#9ca3af" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        <input className="workspace-input" style={{ flex:1 }} placeholder="Sprint / period name (e.g. Sprint 14, Q2 Week 3)..."
          value={sprintName} onChange={e=>setSprintName(e.target.value)} />
        <button className="workspace-btn workspace-save-btn" onClick={saveRetro} disabled={totalItems===0 && !aiResult} style={{ whiteSpace:"nowrap" }}>
          💾 Save Retro
        </button>
      </div>

      {/* Board (non-AI) */}
      {format !== "ai-generated" && (
        <>
          {totalItems > 0 && (
            <div className="stats" style={{ marginBottom:20 }}>
              {board.columns.map(c => (
                <div key={c.key} className="stat-card">
                  <div className="stat-icon">{c.icon}</div>
                  <p className="stat-value">{c.items.length}</p>
                  <h3 className="stat-label">{c.label}</h3>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.columns.length}, 1fr)`, gap:14 }}>
            {board.columns.map(col => (
              <div key={col.key} style={{ background:"#f9fafb", borderRadius:14, padding:"14px 12px", border:"1.5px solid #e5e7eb" }}>
                <h3 style={{ margin:"0 0 12px", fontSize:14, fontWeight:800, color:col.color }}>{col.icon} {col.label}</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                  {col.items.sort((a,b)=>b.votes-a.votes).map(it=>(
                    <div key={it.id} style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:10, padding:"10px 12px" }}>
                      <p style={{ margin:"0 0 6px", fontSize:13, color:"#374151" }}>{it.text}</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <button onClick={()=>vote(col.key, it.id)} style={{ fontSize:12, background:"#f3f4f6", border:"none", borderRadius:6, padding:"3px 8px", cursor:"pointer", color:"#6b7280", fontWeight:600 }}>👍 {it.votes}</button>
                        <button onClick={()=>removeItem(col.key, it.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:14 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={inputs[col.key]||""} onChange={e=>setInputs(prev=>({...prev,[col.key]:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&addItem(col.key)}
                    placeholder="Add item…" style={{ flex:1, fontSize:12, padding:"7px 10px", border:"1.5px solid #e5e7eb", borderRadius:8, outline:"none", background:"#fff" }} />
                  <button onClick={()=>addItem(col.key)} style={{ fontSize:18, padding:"4px 10px", background:col.color, border:"none", borderRadius:8, cursor:"pointer", color:"#fff", fontWeight:700 }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* AI-generated */}
      {format === "ai-generated" && (
        <>
          <div className="workspace-form">
            <textarea className="workspace-textarea" placeholder="What happened this sprint? Highlights, blockers, incidents, wins…"
              value={context} onChange={e=>setContext(e.target.value)} rows={4} disabled={isLoading} />
            <button className="workspace-btn" onClick={generateAI} disabled={isLoading}>
              {isLoading ? "⏳ Running Retro…" : "🤖 Generate AI Retrospective"}
            </button>
          </div>
          {aiResult && <div className="workspace-results"><div className="report-box">{aiResult}</div></div>}
          {!aiResult && !isLoading && (
            <div className="workspace-empty"><div className="workspace-empty-icon">🤖</div><p>Describe your sprint and let AI run a structured retrospective with insights and action items.</p></div>
          )}
        </>
      )}
    </div>
  );
}
