// ── V6.2 Marketing Studio — Social Media Content Planner ─────────────────────
import { useState, useMemo } from "react";
import { useProjects }  from "../../context/ProjectContext";
import { useActivity }  from "../../context/ActivityContext";
import { useToast }     from "../../context/ToastContext";
import { useAI }        from "../../hooks/useAI";
import { useAIContext } from "../../context/AIContext";
import DemoBanner       from "../../components/DemoBanner";
import "./Workspace.css";
import "./MarketingStudio.css";

interface Props { setWorkspace: (w: string) => void }

interface CalendarPost {
  day: number;
  platform: string;
  type: string;
  caption: string;
  hashtags: string;
  time: string;
  emoji: string;
}

const PLATFORMS = [
  { key: "linkedin",  icon: "💼", label: "LinkedIn",  color: "#0077B5" },
  { key: "facebook",  icon: "📘", label: "Facebook",  color: "#1877F2" },
  { key: "instagram", icon: "📸", label: "Instagram", color: "#E1306C" },
  { key: "twitter",   icon: "🐦", label: "X (Twitter)", color: "#1DA1F2" },
  { key: "tiktok",    icon: "🎵", label: "TikTok",    color: "#000000" },
];

const POST_TYPES = ["Educational","Behind the Scenes","Product Showcase","Customer Story","Question / Poll","Trending / Timely","Motivational","UGC / Community"];
const BEST_TIMES: Record<string, string> = {
  linkedin: "Tue–Thu, 8–10am or 12pm",
  facebook: "Wed–Fri, 1–3pm",
  instagram: "Mon–Fri, 11am–1pm",
  twitter: "Mon–Wed, 8am or 7–9pm",
  tiktok: "Tue/Thu/Fri, 6–10pm",
};

function dlFile(name: string, content: string, mime: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: mime }));
  a.download = name;
  a.click();
}

function parseCalendar(raw: string): CalendarPost[] {
  const posts: CalendarPost[] = [];
  const lines = raw.split("\n").filter(l => l.trim());
  let currentDay = 1;
  let platformIdx = 0;
  let typeIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dayMatch = line.match(/Day\s+(\d+)/i);
    if (dayMatch) currentDay = parseInt(dayMatch[1]);

    const platMatch = PLATFORMS.find(p => line.toLowerCase().includes(p.key) || line.toLowerCase().includes(p.label.toLowerCase()));
    if (platMatch) platformIdx = PLATFORMS.indexOf(platMatch);

    if (line.startsWith("Caption:") || line.startsWith("- Caption:") || (line.startsWith("-") && !line.includes(":"))) {
      const caption = line.replace(/^-?\s*(Caption:\s*)?/, "").trim();
      const nextLine = lines[i + 1] || "";
      const hashLine = nextLine.includes("#") ? nextLine : "";
      const timeRec = BEST_TIMES[PLATFORMS[platformIdx]?.key || "linkedin"];
      posts.push({
        day: currentDay,
        platform: PLATFORMS[platformIdx]?.label || "LinkedIn",
        type: POST_TYPES[typeIdx % POST_TYPES.length],
        caption,
        hashtags: hashLine.replace(/^-?\s*(Hashtags:\s*)?/, "").trim(),
        time: timeRec,
        emoji: PLATFORMS[platformIdx]?.icon || "📱",
      });
      typeIdx++;
    }
  }

  // If parsing didn't find structured posts, create placeholders
  if (posts.length < 5) {
    for (let d = 1; d <= 30; d++) {
      const p = PLATFORMS[(d - 1) % PLATFORMS.length];
      posts.push({
        day: d,
        platform: p.label,
        type: POST_TYPES[(d - 1) % POST_TYPES.length],
        caption: `Day ${d} content for ${p.label}`,
        hashtags: "",
        time: BEST_TIMES[p.key],
        emoji: p.icon,
      });
    }
  }

  return posts.slice(0, 30);
}

export default function SocialMediaPlanner({ setWorkspace }: Props) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { isDemoMode }  = useAIContext();
  const { generate, isLoading } = useAI("socialMedia");

  const [brandName,      setBrandName]      = useState("");
  const [description,    setDescription]    = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [goals,          setGoals]          = useState("Grow brand awareness and drive traffic");
  const [platforms,      setPlatforms]      = useState<string[]>(["linkedin", "instagram"]);
  const [rawCalendar,    setRawCalendar]    = useState("");
  const [calendarPosts,  setCalendarPosts]  = useState<CalendarPost[]>([]);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [generating,     setGenerating]     = useState(false);
  const [view,           setView]           = useState<"form"|"calendar">("form");

  const togglePlatform = (key: string) => {
    setPlatforms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  const generate30Day = async () => {
    if (!brandName.trim() || !description.trim() || platforms.length === 0) return;
    setGenerating(true);

    const selectedPlatforms = PLATFORMS.filter(p => platforms.includes(p.key)).map(p => p.label).join(", ");

    const prompt = `Create a detailed 30-day social media content calendar.

Brand: ${brandName}
Description: ${description}
Target audience: ${targetAudience}
Platforms: ${selectedPlatforms}
Goals: ${goals}

Generate 30 days of content. Spread posts across the selected platforms. For each day provide:

Day [N] — [Platform]
Type: [Post type]
Caption: [Full caption with emojis, 100-200 chars for Twitter, 200-500 for others]
Hashtags: [10-20 relevant hashtags]
Best time: [Recommended posting time]
Visual idea: [Brief description of image/video concept]

Include a variety of:
- Educational / how-to content (20%)
- Behind-the-scenes / authentic content (15%)
- Product/service showcases (15%)
- Customer stories / testimonials (10%)
- Questions / engagement posts (15%)
- Trending / relevant content (10%)
- Motivational / inspirational (10%)
- Community / UGC (5%)

Also include at the end:
- Monthly content pillars (4-5 themes)
- Hashtag strategy (branded, industry, niche)
- Engagement tips for each platform`;

    const result = await generate(prompt);
    if (result) {
      setRawCalendar(result);
      const posts = parseCalendar(result);
      setCalendarPosts(posts);
      setView("calendar");
    }
    setGenerating(false);
    addActivity({ type: "social_calendar_generated", title: "30-Day Social Media Plan Generated", description: `30-day content calendar for "${brandName}" on ${selectedPlatforms}.`, category: "Marketing", icon: "📅" });
    showToast("📅 30-day content calendar generated!");
  };

  const filteredPosts = useMemo(() =>
    filterPlatform === "All" ? calendarPosts : calendarPosts.filter(p => p.platform === filterPlatform),
    [calendarPosts, filterPlatform]
  );

  const save = () => {
    saveProject({ id: Date.now().toString(), title: `30-Day Social Media Plan — ${brandName}`, category: "Social Media Plan", createdAt: new Date().toISOString(), notes: rawCalendar });
    addActivity({ type: "social_calendar_saved", title: "Social Media Plan Saved", description: `30-day calendar for "${brandName}" saved.`, category: "Marketing", icon: "📅" });
    showToast("💾 Plan saved!");
  };
  const exportMarkdown = () => {
    dlFile(`${brandName.replace(/\s+/g, "-")}-30-day-social-plan.md`, `# ${brandName} — 30-Day Social Media Content Calendar\n\n${rawCalendar}`, "text/markdown");
    showToast("📄 Markdown exported!");
  };
  const exportJSON = () => {
    dlFile(`${brandName.replace(/\s+/g, "-")}-social-calendar.json`, JSON.stringify({ brandName, description, targetAudience, goals, platforms, posts: calendarPosts, rawCalendar, generatedAt: new Date().toISOString() }, null, 2), "application/json");
    showToast("📦 JSON exported!");
  };

  if (view === "form") {
    return (
      <div className="workspace-container" style={{ maxWidth: 720 }}>
        <button className="back-btn" onClick={() => setWorkspace("marketingStudio")}>← Marketing Studio</button>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
        <h1>Social Media Content Planner</h1>
        <p className="workspace-subtitle">30-day content calendar with captions, hashtags and posting schedule for all major platforms.</p>
        {isDemoMode && <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />}

        <div className="workspace-form">
          <input className="workspace-input" placeholder="Brand name *" value={brandName} onChange={e => setBrandName(e.target.value)} />
          <textarea className="workspace-textarea" placeholder="Describe your brand and what you do *" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <input className="workspace-input" placeholder="Target audience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
          <input className="workspace-input" placeholder="Content goals (e.g. 'Grow brand awareness and drive sign-ups')" value={goals} onChange={e => setGoals(e.target.value)} />

          <div>
            <label className="ms-label">Select platforms *</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {PLATFORMS.map(p => (
                <button key={p.key} onClick={() => togglePlatform(p.key)} style={{
                  padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${platforms.includes(p.key) ? p.color : "var(--border,#e5e7eb)"}`,
                  background: platforms.includes(p.key) ? `${p.color}15` : "transparent",
                  color: platforms.includes(p.key) ? p.color : "var(--text-muted,#6b7280)",
                  fontWeight: platforms.includes(p.key) ? 700 : 400, fontSize: 13, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <button className="workspace-btn" onClick={generate30Day} disabled={!brandName.trim() || !description.trim() || platforms.length === 0 || isLoading}>
            {isLoading ? "⏳ Generating 30-day calendar…" : "📅 Generate 30-Day Content Calendar"}
          </button>
        </div>

        {/* Best times reference */}
        <div style={{ background: "var(--card-bg,#f9fafb)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border,#e5e7eb)" }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>⏰ Best Posting Times (Reference)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PLATFORMS.map(p => (
              <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <span style={{ width: 80, fontWeight: 600, color: p.color }}>{p.icon} {p.label}</span>
                <span style={{ color: "var(--text-muted,#6b7280)" }}>{BEST_TIMES[p.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calendar view
  return (
    <div className="workspace-container" style={{ maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button className="back-btn" onClick={() => setView("form")}>← Edit Settings</button>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📅 30-Day Content Calendar — {brandName}</h2>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <select className="workspace-input" style={{ width: "auto" }} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="All">All Platforms</option>
          {PLATFORMS.map(p => <option key={p.key} value={p.label}>{p.icon} {p.label}</option>)}
        </select>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="workspace-btn workspace-save-btn" style={{ fontSize: 12 }} onClick={save}>💾 Save</button>
          <button className="ms-export-btn" onClick={exportMarkdown}>📄 MD</button>
          <button className="ms-export-btn" onClick={exportJSON}>📦 JSON</button>
        </div>
      </div>

      {/* Calendar grid */}
      {generating ? (
        <div className="workspace-empty">
          <div style={{ fontSize: 40 }}>⏳</div>
          <p>Generating your 30-day content calendar…</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12, marginBottom: 24 }}>
            {filteredPosts.map((post, i) => {
              const plat = PLATFORMS.find(p => p.label === post.platform);
              return (
                <div key={i} style={{ background: "var(--card-bg,#fff)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border,#e5e7eb)", borderTop: `3px solid ${plat?.color || "#6C63FF"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ background: `${plat?.color || "#6C63FF"}20`, color: plat?.color || "#6C63FF", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>Day {post.day}</span>
                    <span style={{ fontSize: 12, color: plat?.color || "#6C63FF", fontWeight: 600 }}>{post.emoji} {post.platform}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, background: "#f3f4f6", borderRadius: 6, padding: "1px 6px", color: "#6b7280" }}>{post.type}</span>
                  </div>
                  <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.5, color: "var(--text,#374151)" }}>{post.caption || "Click to edit caption"}</p>
                  {post.hashtags && (
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#6C63FF", lineHeight: 1.4 }}>{post.hashtags.substring(0, 80)}{post.hashtags.length > 80 ? "…" : ""}</p>
                  )}
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted,#9ca3af)" }}>⏰ {post.time}</p>
                </div>
              );
            })}
          </div>

          {/* Full raw calendar */}
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>📋 Full Calendar (Editable)</h3>
            <textarea className="workspace-textarea" value={rawCalendar} onChange={e => setRawCalendar(e.target.value)} rows={30} style={{ fontSize: 13, lineHeight: 1.7 }} />
          </div>
        </>
      )}
    </div>
  );
}
