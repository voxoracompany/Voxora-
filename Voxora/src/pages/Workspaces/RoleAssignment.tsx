// ── V4.7 Role & Responsibility ────────────────────────────────────────────────
import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import "./Workspace.css";

interface RoleEntry {
  id: string; role: string; person: string; department: string;
  responsibilities: string; kpis: string;
}

interface RACIRow {
  id: string; task: string; responsible: string; accountable: string;
  consulted: string; informed: string;
}


const DEPTS = ["Engineering","Product","Marketing","Finance","Operations","Design","Sales","Leadership","Advisory"];

export default function RoleAssignment({ setWorkspace }: { setWorkspace:(w:string)=>void }) {
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const [tab, setTab] = useState<"roles"|"raci">("roles");
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [raci, setRaci]   = useState<RACIRow[]>([]);
  const [addingRole, setAddingRole] = useState(false);
  const [addingRaci, setAddingRaci] = useState(false);
  const [roleForm, setRoleForm] = useState({ role:"", person:"", department:"Engineering", responsibilities:"", kpis:"" });
  const [raciForm, setRaciForm] = useState({ task:"", responsible:"", accountable:"", consulted:"", informed:"" });

  const addRole = () => {
    if (!roleForm.role.trim()) return;
    setRoles(prev => [...prev, { ...roleForm, id: Date.now().toString() }]);
    setRoleForm({ role:"", person:"", department:"Engineering", responsibilities:"", kpis:"" });
    setAddingRole(false);
    addActivity({ type:"role_defined", title:"Role Defined", description:roleForm.role, category:"Team Collaboration", icon:"🏷️" });
    showToast("🏷️ Role added!");
  };

  const addRaciRow = () => {
    if (!raciForm.task.trim()) return;
    setRaci(prev => [...prev, { ...raciForm, id: Date.now().toString() }]);
    setRaciForm({ task:"", responsible:"", accountable:"", consulted:"", informed:"" });
    setAddingRaci(false);
    showToast("✅ RACI row added!");
  };

  const removeRole = (id:string) => { setRoles(prev=>prev.filter(r=>r.id!==id)); showToast("🗑️ Role removed."); };
  const removeRaci = (id:string) => { setRaci(prev=>prev.filter(r=>r.id!==id)); showToast("🗑️ Row removed."); };

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>🏷️ Role & Responsibility</h1>
      <p className="workspace-subtitle">Define roles, assign responsibilities, and build your RACI matrix.</p>

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:8, marginBottom:24, background:"#f3f4f6", borderRadius:12, padding:4, width:"fit-content" }}>
        {(["roles","raci"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 20px", borderRadius:10, border:"none", fontWeight:700, fontSize:13, cursor:"pointer", background:tab===t?"#fff":"transparent", color:tab===t?"#6C63FF":"#6b7280", boxShadow:tab===t?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>
            {t === "roles" ? "👥 Role Matrix" : "📊 RACI Matrix"}
          </button>
        ))}
      </div>

      {tab === "roles" && (
        <>
          <button className="workspace-btn" style={{ marginBottom:20 }} onClick={() => setAddingRole(v=>!v)}>
            {addingRole ? "✕ Cancel" : "+ Define Role"}
          </button>
          {addingRole && (
            <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"20px 22px", marginBottom:20 }}>
              <div className="workspace-form">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <input className="workspace-input" placeholder="Role title *" value={roleForm.role} onChange={e=>setRoleForm(v=>({...v,role:e.target.value}))} />
                  <input className="workspace-input" placeholder="Person / Name" value={roleForm.person} onChange={e=>setRoleForm(v=>({...v,person:e.target.value}))} />
                  <select className="workspace-input" value={roleForm.department} onChange={e=>setRoleForm(v=>({...v,department:e.target.value}))}>
                    {DEPTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <textarea className="workspace-textarea" placeholder="Key responsibilities..." value={roleForm.responsibilities} onChange={e=>setRoleForm(v=>({...v,responsibilities:e.target.value}))} rows={2} />
                <input className="workspace-input" placeholder="KPIs / success metrics..." value={roleForm.kpis} onChange={e=>setRoleForm(v=>({...v,kpis:e.target.value}))} />
                <button className="workspace-btn" onClick={addRole} disabled={!roleForm.role.trim()}>🏷️ Add Role</button>
              </div>
            </div>
          )}
          {roles.length === 0 ? (
            <div className="workspace-empty"><div className="workspace-empty-icon">🏷️</div><p>No roles defined yet. Add your first role to build the team structure.</p></div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {roles.map(r => (
                <div key={r.id} style={{ background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                        <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{r.role}</h3>
                        <span style={{ fontSize:11, background:"#ede9fe", color:"#6C63FF", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>{r.department}</span>
                      </div>
                      {r.person && <p style={{ margin:"0 0 4px", fontSize:13, color:"#374151" }}>👤 {r.person}</p>}
                      {r.responsibilities && <p style={{ margin:"0 0 4px", fontSize:13, color:"#6b7280" }}><strong>Responsibilities:</strong> {r.responsibilities}</p>}
                      {r.kpis && <p style={{ margin:0, fontSize:13, color:"#6b7280" }}><strong>KPIs:</strong> {r.kpis}</p>}
                    </div>
                    <button onClick={()=>removeRole(r.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:18 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "raci" && (
        <>
          <button className="workspace-btn" style={{ marginBottom:20 }} onClick={()=>setAddingRaci(v=>!v)}>
            {addingRaci ? "✕ Cancel" : "+ Add RACI Row"}
          </button>
          {addingRaci && (
            <div style={{ background:"#f9fafb", border:"1.5px solid #e5e7eb", borderRadius:14, padding:"20px 22px", marginBottom:20 }}>
              <div className="workspace-form">
                <input className="workspace-input" placeholder="Task / activity *" value={raciForm.task} onChange={e=>setRaciForm(v=>({...v,task:e.target.value}))} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <input className="workspace-input" placeholder="Responsible (does the work)" value={raciForm.responsible} onChange={e=>setRaciForm(v=>({...v,responsible:e.target.value}))} />
                  <input className="workspace-input" placeholder="Accountable (owns outcome)" value={raciForm.accountable} onChange={e=>setRaciForm(v=>({...v,accountable:e.target.value}))} />
                  <input className="workspace-input" placeholder="Consulted (gives input)" value={raciForm.consulted} onChange={e=>setRaciForm(v=>({...v,consulted:e.target.value}))} />
                  <input className="workspace-input" placeholder="Informed (kept updated)" value={raciForm.informed} onChange={e=>setRaciForm(v=>({...v,informed:e.target.value}))} />
                </div>
                <button className="workspace-btn" onClick={addRaciRow} disabled={!raciForm.task.trim()}>📊 Add Row</button>
              </div>
            </div>
          )}
          {raci.length === 0 ? (
            <div className="workspace-empty"><div className="workspace-empty-icon">📊</div><p>No RACI rows yet. Add tasks to build your responsibility matrix.</p></div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f9fafb" }}>
                    {["Task / Activity","🟢 Responsible","🔵 Accountable","🟡 Consulted","🔷 Informed",""].map(h=>(
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:700, color:"#374151", border:"1px solid #e5e7eb", fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raci.map(row=>(
                    <tr key={row.id}>
                      <td style={{ padding:"10px 14px", border:"1px solid #e5e7eb", fontWeight:600 }}>{row.task}</td>
                      {[row.responsible,row.accountable,row.consulted,row.informed].map((v,i)=>(
                        <td key={i} style={{ padding:"10px 14px", border:"1px solid #e5e7eb", color:["#10b981","#6C63FF","#f59e0b","#3b82f6"][i] }}>{v||"—"}</td>
                      ))}
                      <td style={{ padding:"10px 14px", border:"1px solid #e5e7eb" }}>
                        <button onClick={()=>removeRaci(row.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#ef4444", fontSize:16 }}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
