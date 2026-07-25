// ── V6.1 Investor & Pitch Studio — Elevator Pitch Generator ──────────────────
import { useState } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import "./Workspace.css";
import "./InvestorStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface Pitches {
  thirty: string;
  sixty: string;
  twoMin: string;
}

const EMPTY_PITCHES: Pitches = { thirty: "", sixty: "", twoMin: "" };

function downloadFile(filename: string, content: string, mimeType: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mimeType }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ElevatorPitch({ setWorkspace }: Props) {
  const { saveProject }  = useProjects();
  const { addActivity }  = useActivity();
  const { showToast }    = useToast();
  const { isDemoMode }   = useAIContext();
  const { generate, isLoading } = useAI("elevatorPitch");

  const [companyName,  setCompanyName]  = useState("");
  const [problem,      setProblem]      = useState("");
  const [solution,     setSolution]     = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [traction,     setTraction]     = useState("");
  const [audience,     setAudience]     = useState("Investor");
  const [pitches,      setPitches]      = useState<Pitches>(EMPTY_PITCHES);
  const [activeTab,    setActiveTab]    = useState<keyof Pitches>("thirty");
  const [generating,   setGenerating]   = useState(false);

  const AUDIENCES = ["Investor","Customer","Partner","Conference","Cold Email"];

  const generatePitches = async () => {
    if (!companyName.trim() || !problem.trim() || !solution.trim()) return;
    setGenerating(true);
    setPitches(EMPTY_PITCHES);

    const base = `Company: ${companyName}
Problem we solve: ${problem}
Our solution: ${solution}
Target market: ${targetMarket}
Traction: ${traction || "Early stage"}
Audience: ${audience}`;

    const prompts: [keyof Pitches, string, string][] = [
      ["thirty",  "30-second",   "75–100 words. Punchy, memorable, ends with a hook. Perfect for an elevator ride or hallway introduction."],
      ["sixty",   "60-second",   "130–160 words. Covers the problem, solution, market, and a call to action."],
      ["twoMin",  "2-minute",    "280–320 words. Full pitch: problem, solution, market opportunity, traction, team credibility, and clear ask."],
    ];

    for (const [key, duration, instructions] of prompts) {
      const prompt = `You are an expert pitch coach. Write a ${duration} elevator pitch for a startup.

${base}

Requirements:
- Duration: ${duration} (${instructions})
- Tone: Confident, clear, and compelling
- Audience: ${audience}
- Start with a hook (surprising stat, bold claim, or relatable pain point)
- Do NOT use section headers — write it as natural spoken dialogue
- End with a specific call to action

Write the pitch now:`;

      const result = await generate(prompt);
      setPitches(prev => ({ ...prev, [key]: result ?? "[Generation failed — please retry]" }));
    }

    setGenerating(false);
    setActiveTab("thirty");
    addActivity({
      type: "elevator_pitch_generated",
      title: "Elevator Pitches Generated",
      description: `3 elevator pitches generated for "${companyName}".`,
      category: "Investor", icon: "🎤",
    });
    showToast("🎤 Elevator pitches generated!");
  };

  const save = () => {
    if (!pitches.thirty && !pitches.sixty && !pitches.twoMin) return;
    const notes = `## 30-Second Pitch\n\n${pitches.thirty}\n\n---\n\n## 60-Second Pitch\n\n${pitches.sixty}\n\n---\n\n## 2-Minute Pitch\n\n${pitches.twoMin}`;
    saveProject({
      id: Date.now().toString(),
      title: `Elevator Pitch — ${companyName}`,
      category: "Elevator Pitch",
      createdAt: new Date().toISOString(),
      notes,
    });
    addActivity({
      type: "elevator_pitch_saved",
      title: "Elevator Pitches Saved",
      description: `Pitches for "${companyName}" saved.`,
      category: "Investor", icon: "🎤",
    });
    showToast("💾 Pitches saved!");
  };

  const exportMarkdown = () => {
    const md = `# ${companyName} — Elevator Pitches\n_Audience: ${audience}_\n\n## 30-Second Pitch\n\n${pitches.thirty}\n\n---\n\n## 60-Second Pitch\n\n${pitches.sixty}\n\n---\n\n## 2-Minute Pitch\n\n${pitches.twoMin}`;
    downloadFile(`${companyName.replace(/\s+/g, "-")}-elevator-pitches.md`, md, "text/markdown");
    showToast("📄 Markdown exported!");
  };

  const exportJSON = () => {
    const data = { companyName, problem, solution, targetMarket, traction, audience, pitches, generatedAt: new Date().toISOString() };
    downloadFile(`${companyName.replace(/\s+/g, "-")}-elevator-pitches.json`, JSON.stringify(data, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  const allGenerated = pitches.thirty && pitches.sixty && pitches.twoMin;

  const TABS: { key: keyof Pitches; label: string; duration: string; words: string }[] = [
    { key: "thirty",  label: "30 Seconds", duration: "~30s", words: "~90 words"   },
    { key: "sixty",   label: "60 Seconds", duration: "~60s", words: "~150 words"  },
    { key: "twoMin",  label: "2 Minutes",  duration: "~2m",  words: "~300 words"  },
  ];

  return (
    <div className="workspace-container" style={{ maxWidth: 760 }}>
      <button className="back-btn" onClick={() => setWorkspace("investorStudio")}>← Investor Studio</button>
      <div style={{ fontSize: 36, marginBottom: 8 }}>🎤</div>
      <h1>Elevator Pitch Generator</h1>
      <p className="workspace-subtitle">Generate 30-second, 60-second, and 2-minute pitches — tailored to your audience.</p>

      {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

      <div className="workspace-form">
        <div className="workspace-form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <input
            className="workspace-input"
            placeholder="Company name *"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />
          <select className="workspace-input" value={audience} onChange={e => setAudience(e.target.value)}>
            {AUDIENCES.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <textarea
          className="workspace-textarea"
          placeholder="The problem you solve *"
          value={problem}
          onChange={e => setProblem(e.target.value)}
          rows={2}
        />
        <textarea
          className="workspace-textarea"
          placeholder="Your solution *"
          value={solution}
          onChange={e => setSolution(e.target.value)}
          rows={2}
        />
        <input
          className="workspace-input"
          placeholder="Target market (e.g. 'SMBs in the US, 2M+ businesses')"
          value={targetMarket}
          onChange={e => setTargetMarket(e.target.value)}
        />
        <input
          className="workspace-input"
          placeholder="Traction (optional — e.g. '$50K MRR, 200 customers')"
          value={traction}
          onChange={e => setTraction(e.target.value)}
        />
        <button
          className="workspace-btn"
          onClick={generatePitches}
          disabled={!companyName.trim() || !problem.trim() || !solution.trim() || isLoading || generating}
        >
          {generating ? "⏳ Generating all 3 pitches…" : "🎤 Generate All 3 Pitches"}
        </button>
      </div>

      {(generating || allGenerated) && (
        <div className="workspace-results">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid var(--border,#e5e7eb)" }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: "10px 18px", border: "none", background: "transparent",
                  cursor: "pointer", fontWeight: activeTab === t.key ? 700 : 400,
                  fontSize: 14, color: activeTab === t.key ? "#6C63FF" : "var(--text-muted,#6b7280)",
                  borderBottom: activeTab === t.key ? "2px solid #6C63FF" : "2px solid transparent",
                  marginBottom: -2, transition: "color 0.15s",
                }}
              >
                {t.label}
                <span style={{ display: "block", fontSize: 10, color: "var(--text-muted,#9ca3af)", fontWeight: 400 }}>
                  {t.duration} · {t.words}
                </span>
              </button>
            ))}
          </div>

          {TABS.map(t => (
            activeTab === t.key && (
              <div key={t.key}>
                {generating && !pitches[t.key] ? (
                  <div className="workspace-empty" style={{ minHeight: 160 }}>
                    <div style={{ fontSize: 32 }}>⏳</div>
                    <p>Generating {t.label} pitch…</p>
                  </div>
                ) : (
                  <textarea
                    className="workspace-textarea"
                    value={pitches[t.key]}
                    onChange={e => setPitches(prev => ({ ...prev, [t.key]: e.target.value }))}
                    rows={12}
                    style={{ fontSize: 15, lineHeight: 1.8 }}
                  />
                )}
              </div>
            )
          ))}

          {allGenerated && (
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button className="workspace-btn workspace-save-btn" onClick={save}>💾 Save</button>
              <button className="is-export-btn" onClick={exportMarkdown}>📄 Markdown</button>
              <button className="is-export-btn" onClick={exportJSON}>📦 JSON</button>
            </div>
          )}
        </div>
      )}

      {!generating && !allGenerated && (
        <div className="workspace-empty">
          <div className="workspace-empty-icon">🎤</div>
          <p>Fill in your startup details above to generate all three pitch lengths at once.</p>
        </div>
      )}
    </div>
  );
}
