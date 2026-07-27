// ── V9.2 Product Analytics ───────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import { WorkspacePreferences } from "../../services/storage/WorkspacePreferences";
import "./ProductAnalytics.css";

interface Props { setWorkspace: (w: string) => void; }

const WORKSPACE_CATEGORIES = [
  { group: "AI Tools", workspaces: ["AI Assistant","AI Content","App Ideas","Startup Ideas"] },
  { group: "Research", workspaces: ["Customer Research","Market Research","Customer Persona","Product Validation"] },
  { group: "Strategy", workspaces: ["Business Model","Product Roadmap","AI Business Plan"] },
  { group: "Marketing Studio", workspaces: ["Brand Identity","Landing Page","Marketing Copy","Email Campaign","Social Media","SEO Toolkit"] },
  { group: "CRM & Sales", workspaces: ["Sales CRM","Lead Manager","Sales Pipeline","Contact Manager"] },
  { group: "Operations", workspaces: ["Operations Studio","Task Manager","Kanban Board","SOP Builder"] },
  { group: "Financial", workspaces: ["Financial Studio","Revenue Forecast","Cash Flow","Financial Health"] },
  { group: "Analytics", workspaces: ["Analytics Hub","Executive Dashboard","Revenue Analytics"] },
];

function getSessionData() {
  const start = localStorage.getItem("voxora-session-start");
  if (!start) return { sessionMins: 0, sessionCount: 1 };
  const mins = Math.round((Date.now() - Number(start)) / 60000);
  const count = Number(localStorage.getItem("voxora-session-count") ?? 1);
  return { sessionMins: mins, sessionCount: count };
}

export default function ProductAnalytics({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const { activities } = useActivity();
  const { usage } = useAIContext();
  const [activeTab, setActiveTab] = useState<"usage" | "ai" | "engagement" | "productivity">("usage");

  const recentWorkspaces = useMemo(() => WorkspacePreferences.getRecent(), []);
  const favoriteWorkspaces = useMemo(() => WorkspacePreferences.getFavorites(), []);
  const { sessionMins, sessionCount } = useMemo(() => getSessionData(), []);

  // Project category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.category] = (counts[p.category] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [projects]);

  // Activity type breakdown
  const activityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => { counts[a.type] = (counts[a.type] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [activities]);

  // AI usage stats
  const aiStats = useMemo(() => ({
    todayRequests: usage.todayCount,
    totalTokens: usage.todayTokens,
    avgResponseTime: usage.avgResponseTime,
    successRate: 100,
    errorRate: 0,
  }), [usage]);

  // Productivity score (composite)
  const productivityScore = useMemo(() => {
    const projectScore  = Math.min(40, projects.length * 4);
    const activityScore = Math.min(30, activities.length * 2);
    const aiScore       = Math.min(20, usage.todayCount * 2);
    const favoriteScore = Math.min(10, favoriteWorkspaces.length * 2);
    return Math.round(projectScore + activityScore + aiScore + favoriteScore);
  }, [projects, activities, usage.todayCount, favoriteWorkspaces]);

  return (
    <div className="workspace-container pa-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>📊 Product Analytics</h1>
      <p className="workspace-subtitle">Workspace usage, AI consumption, feature adoption, and productivity insights.</p>

      {/* Tabs */}
      <div className="pa-tabs">
        {(["usage","ai","engagement","productivity"] as const).map(tab => (
          <button key={tab} className={`pa-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab === "usage" ? "🗂️ Workspace Usage" : tab === "ai" ? "🤖 AI Analytics" : tab === "engagement" ? "💡 Engagement" : "⚡ Productivity"}
          </button>
        ))}
      </div>

      {/* ── Workspace Usage ── */}
      {activeTab === "usage" && (
        <>
          <div className="pa-stat-grid">
            <div className="pa-stat-card">
              <div className="pa-stat-icon">📁</div>
              <div className="pa-stat-value">{projects.length}</div>
              <div className="pa-stat-label">Total Projects</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🕒</div>
              <div className="pa-stat-value">{recentWorkspaces.length}</div>
              <div className="pa-stat-label">Workspaces Used</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">⭐</div>
              <div className="pa-stat-value">{favoriteWorkspaces.length}</div>
              <div className="pa-stat-label">Favourites</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🔔</div>
              <div className="pa-stat-value">{activities.length}</div>
              <div className="pa-stat-label">Activities Logged</div>
            </div>
          </div>

          {/* Project category breakdown */}
          <div className="pa-panel">
            <h3>📂 Project Category Breakdown</h3>
            {categoryCounts.length === 0 ? (
              <p className="pa-empty">No projects yet. Create your first project to see analytics.</p>
            ) : (
              <div className="pa-bar-list">
                {categoryCounts.map(([cat, count]) => {
                  const pct = Math.round((count / projects.length) * 100);
                  return (
                    <div key={cat} className="pa-bar-row">
                      <div className="pa-bar-label">{cat}</div>
                      <div className="pa-bar-track">
                        <div className="pa-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="pa-bar-count">{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently visited workspaces */}
          <div className="pa-panel">
            <h3>🕒 Recently Visited Workspaces</h3>
            {recentWorkspaces.length === 0 ? (
              <p className="pa-empty">Navigate to a few workspaces to see your history here.</p>
            ) : (
              <div className="pa-tag-cloud">
                {recentWorkspaces.map((id, i) => (
                  <button key={id} className="pa-ws-tag" onClick={() => setWorkspace(id)} style={{ opacity: 1 - i * 0.07 }}>
                    {id}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feature group coverage */}
          <div className="pa-panel">
            <h3>🎯 Feature Group Coverage</h3>
            <div className="pa-feature-grid">
              {WORKSPACE_CATEGORIES.map(g => {
                const used = recentWorkspaces.some(r => g.workspaces.some(w => r.toLowerCase().includes(w.split(" ")[0].toLowerCase())));
                return (
                  <div key={g.group} className={`pa-feature-item ${used ? "used" : ""}`}>
                    <span>{used ? "✅" : "○"}</span>
                    <span>{g.group}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── AI Analytics ── */}
      {activeTab === "ai" && (
        <>
          <div className="pa-stat-grid">
            <div className="pa-stat-card">
              <div className="pa-stat-icon">📡</div>
              <div className="pa-stat-value">{aiStats.todayRequests}</div>
              <div className="pa-stat-label">Requests Today</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🔢</div>
              <div className="pa-stat-value">{(aiStats.totalTokens / 1000).toFixed(1)}k</div>
              <div className="pa-stat-label">Tokens Used</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">⚡</div>
              <div className="pa-stat-value">{aiStats.avgResponseTime > 0 ? `${(aiStats.avgResponseTime / 1000).toFixed(1)}s` : "—"}</div>
              <div className="pa-stat-label">Avg Response</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">✅</div>
              <div className="pa-stat-value">{aiStats.successRate}%</div>
              <div className="pa-stat-label">Success Rate</div>
            </div>
          </div>

          <div className="pa-panel">
            <h3>🤖 AI Usage Insights</h3>
            <div className="pa-insight-list">
              <div className="pa-insight">
                <span className="pa-insight-icon">📊</span>
                <div>
                  <strong>Daily AI Requests:</strong> {aiStats.todayRequests} request{aiStats.todayRequests !== 1 ? "s" : ""} made today.
                  {aiStats.todayRequests === 0 ? " Open the AI Assistant to get started." : " Keep up the momentum!"}
                </div>
              </div>
              <div className="pa-insight">
                <span className="pa-insight-icon">💬</span>
                <div><strong>Token Consumption:</strong> {aiStats.totalTokens.toLocaleString()} tokens used today across all AI tools.</div>
              </div>
              <div className="pa-insight">
                <span className="pa-insight-icon">⚡</span>
                <div>
                  <strong>Response Performance:</strong> {aiStats.avgResponseTime > 0 ? `Average ${(aiStats.avgResponseTime / 1000).toFixed(1)}s — ` : "No requests yet — "}
                  {aiStats.avgResponseTime < 2000 && aiStats.avgResponseTime > 0 ? "excellent latency." : aiStats.avgResponseTime === 0 ? "send your first AI request." : "acceptable latency."}
                </div>
              </div>
              <div className="pa-insight">
                <span className="pa-insight-icon">🎯</span>
                <div><strong>AI is running in Demo Mode.</strong> Set a Gemini API key in AI Settings to unlock real AI generation across all 50+ workspace tools.</div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button className="workspace-btn" onClick={() => setWorkspace("aiSettings")}>⚙️ AI Settings</button>
              <button className="workspace-btn" onClick={() => setWorkspace("aiProviderStatus")}>📡 Provider Status</button>
            </div>
          </div>
        </>
      )}

      {/* ── Engagement ── */}
      {activeTab === "engagement" && (
        <>
          <div className="pa-stat-grid">
            <div className="pa-stat-card">
              <div className="pa-stat-icon">⏱️</div>
              <div className="pa-stat-value">{sessionMins}m</div>
              <div className="pa-stat-label">Session Duration</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🔄</div>
              <div className="pa-stat-value">{sessionCount}</div>
              <div className="pa-stat-label">Total Sessions</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">📌</div>
              <div className="pa-stat-value">{Number(localStorage.getItem("voxora-chat-count") ?? 0)}</div>
              <div className="pa-stat-label">AI Conversations</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🔔</div>
              <div className="pa-stat-value">{activities.length}</div>
              <div className="pa-stat-label">Events Logged</div>
            </div>
          </div>

          {/* Activity type breakdown */}
          <div className="pa-panel">
            <h3>🔔 Activity Breakdown</h3>
            {activityBreakdown.length === 0 ? (
              <p className="pa-empty">No activities logged yet. Use any workspace tool to generate activity data.</p>
            ) : (
              <div className="pa-bar-list">
                {activityBreakdown.map(([type, count]) => {
                  const pct = Math.round((count / activities.length) * 100);
                  return (
                    <div key={type} className="pa-bar-row">
                      <div className="pa-bar-label">{type.replace(/_/g, " ")}</div>
                      <div className="pa-bar-track">
                        <div className="pa-bar-fill" style={{ width: `${pct}%`, background: "#10b981" }} />
                      </div>
                      <div className="pa-bar-count">{count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pa-panel">
            <h3>📅 Engagement Patterns</h3>
            <div className="pa-insight-list">
              <div className="pa-insight">
                <span className="pa-insight-icon">🕒</span>
                <div><strong>Session length:</strong> {sessionMins} minutes this session. Power users typically spend 20+ minutes per session.</div>
              </div>
              <div className="pa-insight">
                <span className="pa-insight-icon">📁</span>
                <div><strong>Project velocity:</strong> {projects.length} project{projects.length !== 1 ? "s" : ""} created. {projects.length < 5 ? "Keep building — each project unlocks deeper insights." : "Great momentum!"}</div>
              </div>
              <div className="pa-insight">
                <span className="pa-insight-icon">⭐</span>
                <div><strong>Workspace favourites:</strong> {favoriteWorkspaces.length} saved. Favourites help you return to your most-used tools faster.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Productivity ── */}
      {activeTab === "productivity" && (
        <>
          <div className="pa-panel" style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {productivityScore >= 70 ? "🚀" : productivityScore >= 40 ? "📈" : "🌱"}
            </div>
            <div className="pa-productivity-score" style={{ color: productivityScore >= 70 ? "#10b981" : productivityScore >= 40 ? "#f59e0b" : "#6C63FF" }}>
              {productivityScore}
            </div>
            <div style={{ fontSize: 14, color: "var(--text-secondary,#64748b)", fontWeight: 600 }}>Productivity Score</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {productivityScore >= 70 ? "Excellent — you're a Voxora power user!" : productivityScore >= 40 ? "Good — keep using more features to boost your score." : "Getting started — explore more workspace tools to grow your score."}
            </div>
          </div>

          <div className="pa-stat-grid">
            <div className="pa-stat-card">
              <div className="pa-stat-icon">📁</div>
              <div className="pa-stat-value" style={{ color: "#6C63FF" }}>{Math.min(40, projects.length * 4)}/40</div>
              <div className="pa-stat-label">Projects Score</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🔔</div>
              <div className="pa-stat-value" style={{ color: "#10b981" }}>{Math.min(30, activities.length * 2)}/30</div>
              <div className="pa-stat-label">Activity Score</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">🤖</div>
              <div className="pa-stat-value" style={{ color: "#f59e0b" }}>{Math.min(20, usage.todayCount * 2)}/20</div>
              <div className="pa-stat-label">AI Usage Score</div>
            </div>
            <div className="pa-stat-card">
              <div className="pa-stat-icon">⭐</div>
              <div className="pa-stat-value" style={{ color: "#ef4444" }}>{Math.min(10, favoriteWorkspaces.length * 2)}/10</div>
              <div className="pa-stat-label">Favourites Score</div>
            </div>
          </div>

          <div className="pa-panel">
            <h3>💡 How to improve your score</h3>
            <div className="pa-insight-list">
              {projects.length < 5 && <div className="pa-insight"><span className="pa-insight-icon">📁</span><div>Create more projects using any AI workspace tool to increase your Projects Score.</div></div>}
              {activities.length < 10 && <div className="pa-insight"><span className="pa-insight-icon">🔔</span><div>Use workspace tools actively — each action (generate, save, export) logs an activity point.</div></div>}
              {usage.todayCount < 5 && <div className="pa-insight"><span className="pa-insight-icon">🤖</span><div>Send more AI requests today — each request improves your AI Usage Score.</div></div>}
              {favoriteWorkspaces.length < 3 && <div className="pa-insight"><span className="pa-insight-icon">⭐</span><div>Star your most-used workspaces as favourites from the dashboard to earn Favourites Score points.</div></div>}
              <div className="pa-insight"><span className="pa-insight-icon">🚀</span><div>Explore Studios you haven't visited yet — breadth of usage signals a well-rounded workflow.</div></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="workspace-btn" onClick={() => setWorkspace("assistant")}>🤖 Open AI Assistant</button>
            <button className="workspace-btn" onClick={() => setWorkspace("saved")}>📁 Saved Projects</button>
            <button className="workspace-btn" onClick={() => setWorkspace("activity")}>🔔 Activity Center</button>
          </div>
        </>
      )}
    </div>
  );
}
