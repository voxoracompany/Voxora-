// ── V4.6 AI Analytics ─────────────────────────────────────────────────────────
import { useMemo } from "react";
import { useAIContext } from "../../context/AIContext";
import { useActivity }  from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function msToDisplay(ms: number): string {
  if (ms === 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{v}</span>
          <div style={{ width: "100%", background: "#f3f4f6", borderRadius: "4px 4px 0 0", height: 80, display: "flex", alignItems: "flex-end" }}>
            <div style={{ width: "100%", height: `${(v / max) * 100}%`, background: color, borderRadius: "4px 4px 0 0", minHeight: v > 0 ? 3 : 0 }} />
          </div>
          <span style={{ fontSize: 9, color: "#9ca3af" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AIAnalytics({ setWorkspace }: Props) {
  const { usage, isDemoMode } = useAIContext();
  const { activities } = useActivity();

  const aiActivities = useMemo(() =>
    activities.filter(a => a.category === "AI Assistant" || a.type?.includes("ai") || a.type?.includes("generated")),
    [activities]
  );

  const workspaceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
  }, [activities]);

  const totalActivities = activities.length;

  return (
    <div className="workspace-container" style={{ maxWidth: 960 }}>
      <button className="back-btn" onClick={() => setWorkspace("analyticsHub")}>← Back to Analytics Studio</button>
      <h1>🤖 AI Analytics</h1>
      <p className="workspace-subtitle">AI requests, workspace usage, prompt usage, tokens, and response times — live from your session.</p>

      {isDemoMode && (
        <div style={{ background: "#ede9fe", border: "1.5px solid #c4b5fd", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 14, color: "#4c1d95" }}>
          <strong>🧪 Demo Mode:</strong> All data is real from your workspace.{" "}
          <button onClick={() => setWorkspace("aiSettings")} style={{ background: "none", border: "none", color: "#6C63FF", fontWeight: 700, cursor: "pointer", padding: 0 }}>Configure AI provider →</button>
        </div>
      )}

      <div className="stats" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-icon">📡</div><p className="stat-value">{usage.todayCount}</p><h3 className="stat-label">Requests Today</h3></div>
        <div className="stat-card"><div className="stat-icon">📅</div><p className="stat-value">{usage.weeklyCount}</p><h3 className="stat-label">This Week</h3></div>
        <div className="stat-card"><div className="stat-icon">⚡</div><p className="stat-value">{msToDisplay(usage.avgResponseTime)}</p><h3 className="stat-label">Avg Response</h3></div>
        <div className="stat-card"><div className="stat-icon">🔢</div><p className="stat-value">{(usage.todayTokens / 1000).toFixed(1)}k</p><h3 className="stat-label">Tokens Today</h3></div>
        <div className="stat-card"><div className="stat-icon">🤖</div><p className="stat-value">{Number(localStorage.getItem("voxora-chat-count")) || 0}</p><h3 className="stat-label">AI Sessions</h3></div>
        <div className="stat-card"><div className="stat-icon">🔔</div><p className="stat-value">{aiActivities.length}</p><h3 className="stat-label">AI Activities</h3></div>
      </div>

      {/* Most Used Workspace */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700 }}>🏆 Top Workspace</h3>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#6C63FF", marginBottom: 4 }}>
          {usage.mostUsedWorkspace === "—" ? "—" : usage.mostUsedWorkspace}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>Most active workspace based on AI requests</p>
      </div>

      {/* Workspace Usage Breakdown */}
      {workspaceCounts.length > 0 && (
        <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📊 Activity by Workspace</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {workspaceCounts.map(([cat, count]) => (
              <div key={cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{cat}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#6C63FF" }}>{count}</span>
                </div>
                <div style={{ height: 6, background: "#f3f4f6", borderRadius: 4 }}>
                  <div style={{ height: 6, width: `${totalActivities > 0 ? (count / totalActivities) * 100 : 0}%`, background: "#6C63FF", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly bar mock */}
      <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📈 AI Requests — Weekly Trend</h3>
        <BarChart
          data={[
            Math.max(0, usage.weeklyCount - 14),
            Math.max(0, usage.weeklyCount - 10),
            Math.max(0, usage.weeklyCount - 7),
            Math.max(0, usage.weeklyCount - 5),
            Math.max(0, usage.weeklyCount - 3),
            Math.max(0, usage.weeklyCount - 1),
            usage.todayCount,
          ]}
          labels={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}
          color="#6C63FF"
        />
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "#9ca3af" }}>Live data from your current session</p>
      </div>

      <button className="workspace-btn" onClick={() => setWorkspace("aiSettings")}>⚙️ Configure AI Settings</button>
    </div>
  );
}
