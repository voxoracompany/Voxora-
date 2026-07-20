import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import "./Workspace.css";

export default function MeetingNotes({ setWorkspace }: { setWorkspace: (w: string) => void }) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const [title,       setTitle]       = useState("");
  const [attendees,   setAttendees]   = useState("");
  const [agenda,      setAgenda]      = useState("");
  const [rawNotes,    setRawNotes]    = useState("");
  const [result,      setResult]      = useState("");
  const { analyze, isLoading, isDemoMode } = useAI("meetingNotes");

  const generate = async () => {
    if (!title.trim()) return;
    const prompt = `Meeting: ${title}. Attendees: ${attendees || "team"}. Agenda: ${agenda || "general"}. Notes: ${rawNotes || "structure the meeting notes with action items and decisions."}`;
    const out = await analyze(prompt, "meetingNotes");
    if (!out) return;
    setResult(out);
    addActivity({ type: "meeting_notes_created", title: "Meeting Notes Created", description: title, category: "Team Collaboration", icon: "📝" });
  };

  const save = () => {
    if (!result) return;
    saveProject({ id: Date.now().toString(), title: `Meeting Notes — ${title}`, category: "Meeting Notes", createdAt: new Date().toISOString(), notes: result });
    showToast("📝 Meeting notes saved!");
  };

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("teamHub")}>← Back to Team Hub</button>
      <h1>📝 Meeting Notes</h1>
      <p className="workspace-subtitle">AI-powered meeting notes with action items, decisions, and next steps.</p>
      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}
      <div className="workspace-form">
        <input className="workspace-input" placeholder="Meeting title (e.g. Weekly Standup, Sprint Planning)..." value={title} onChange={e => setTitle(e.target.value)} disabled={isLoading} />
        <input className="workspace-input" placeholder="Attendees (e.g. Alice, Bob, Carol)..." value={attendees} onChange={e => setAttendees(e.target.value)} disabled={isLoading} />
        <textarea className="workspace-textarea" placeholder="Agenda items..." value={agenda} onChange={e => setAgenda(e.target.value)} rows={2} disabled={isLoading} />
        <textarea className="workspace-textarea" placeholder="Raw notes / key points discussed (optional — AI will structure them)..." value={rawNotes} onChange={e => setRawNotes(e.target.value)} rows={4} disabled={isLoading} />
        <button className="workspace-btn" onClick={generate} disabled={!title.trim() || isLoading}>
          {isLoading ? "⏳ Generating Notes…" : "📝 Generate Meeting Notes"}
        </button>
      </div>
      {result && (
        <div className="workspace-results">
          <div className="report-box">{result}</div>
          <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save Meeting Notes</button>
        </div>
      )}
      {!result && !isLoading && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📝</div>
          <p>Enter meeting details to generate structured notes with action items, decisions, and next steps.</p>
        </div>
      )}
    </div>
  );
}
