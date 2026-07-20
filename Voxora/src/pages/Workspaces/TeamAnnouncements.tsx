// ── V4.7 Team Announcements ───────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

type Level = "Info" | "Important" | "Urgent";

interface Announcement {
  id: string; title: string; body: string;
  author: string; level: Level; pinned: boolean; createdAt: string;
}

const LEVEL_COLOR: Record<Level,string> = { Info:"#3b82f6", Important:"#f59e0b", Urgent:"#ef4444" };
const LEVEL_ICON:  Record<Level,string> = { Info:"ℹ️", Important:"⚠️", Urgent:"🚨" };

export default function TeamAnnouncements({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [items, setItems]   = useState<Announcement[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ title:"", body:"", author:"", level:"Info" as Level });

  const add = () => {
    if (!form.title.trim()) return;
    const a: Announcement = { ...form, id: Date.now().toString(), pinned: false, createdAt: new Date().toISOString() };
    setItems(prev => [a, ...prev]);
    setForm({ title:"", body:"", author:"", level:"Info" });
    setAdding(false);
    addActivity({ type:"announcement_posted", title:"Announcement Posted", description: form.title, category:"Team Collaboration", icon:"📢" });
    showToast("📢 Announcement posted!");
  };

  const togglePin = (id:string) => setItems(prev => prev.map(a => a.id===id ? {...a, pinned:!a.pinned} : a));
  const remove    = (id:string) => { setItems(prev=>prev.filter(a=>a.id!==id)); showToast("🗑️ Announcement removed."); };

  const sorted = [...items].sort((a,b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const timeAgo = (iso:string) => {
    const ms = Date.now() - new Date(iso).getTime();
    const m = Math.floor(ms/60000); if (m<1) return "just now";
    if (m<60) return `${m}m ago`;
    const h = Math.floor(m/60); if (h<24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div className="workspace-container" style={{ maxWidth:900 }}>
      <button className="back-btn" onClick={()=>setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>📢 Team Announcements</h1>
      <p className="workspace-subtitle">Post and manage team announcements, updates, and important notices.</p>

      <div className="stats" style={{ marginBottom:24 }}>
        <div className="stat-card"><div className="stat-icon">📢</div><p className="stat-value">{items.length}</p><h3 className="stat-label">Total</h3></div>
        <div className="stat-card"><div className="stat-icon">📌</div><p className="stat-value">{items.filter(a=>a.pinned).length}</p><h3 className="stat-label">Pinned</h3></div>
        <div className="stat-card"><div className="stat-icon">🚨</div><p className="stat-value">{items.filter(a=>a.level==="Urgent").length}</p><h3 className="stat-label">Urgent</h3></div>
        <div className="stat-card"><div className="stat-icon">⚠️</div><p className="stat-value">{items.filter(a=>a.level==="Important").length}</p><h3 className="stat-label">Important</h3></div>
      </div>

      <button className="workspace-btn" style={{ marginBottom:20 }} onClick={()=>setAdding(v=>!v)}>
        {adding ? "✕ Cancel" : "+ Post Announcement"}
      </button>

      {adding && (
        <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"20px 22px", marginBottom:24 }}>
          <div className="workspace-form">
            <input className="workspace-input" placeholder="Announcement title *" value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <input className="workspace-input" placeholder="Your name / team" value={form.author} onChange={e=>setForm(v=>({...v,author:e.target.value}))} />
              <select className="workspace-input" value={form.level} onChange={e=>setForm(v=>({...v,level:e.target.value as Level}))}>
                <option>Info</option><option>Important</option><option>Urgent</option>
              </select>
            </div>
            <textarea className="workspace-textarea" placeholder="Announcement body (details, links, action required)..." value={form.body} onChange={e=>setForm(v=>({...v,body:e.target.value}))} rows={3} />
            <button className="workspace-btn" onClick={add} disabled={!form.title.trim()}>📢 Post Announcement</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="workspace-empty"><div className="workspace-empty-icon">📢</div><p>No announcements yet. Post your first update to keep the team informed.</p></div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {sorted.map(a => (
            <div key={a.id} style={{ background:"#fff", border:`1.5px solid ${a.pinned?"#6C63FF":"#e5e7eb"}`, borderRadius:14, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.04)", position:"relative" }}>
              {a.pinned && <span style={{ position:"absolute", top:14, right:56, fontSize:12, color:"#6C63FF", fontWeight:700 }}>📌 Pinned</span>}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1, paddingRight:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:18 }}>{LEVEL_ICON[a.level]}</span>
                    <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{a.title}</h3>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, background:LEVEL_COLOR[a.level]+"20", color:LEVEL_COLOR[a.level] }}>{a.level}</span>
                  </div>
                  {a.body && <p style={{ margin:"0 0 8px", fontSize:13, color:"#374151", lineHeight:1.5 }}>{a.body}</p>}
                  <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>
                    {a.author && `by ${a.author} · `}{timeAgo(a.createdAt)}
                  </p>
                </div>
                <div style={{ display:"flex", gap:4 }}>
                  <button onClick={()=>togglePin(a.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, opacity:a.pinned?1:0.4 }}>📌</button>
                  <button onClick={()=>remove(a.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:18 }}>🗑️</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
