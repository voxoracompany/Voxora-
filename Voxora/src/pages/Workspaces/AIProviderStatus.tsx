// ── V9.0 AI Provider Status Dashboard ─────────────────────────────────────────
import { useState, useEffect, useMemo, memo } from "react";
import { useAIContext } from "../../context/AIContext";
import { AIUsage } from "../../services/ai/AIUsage";
import { TokenEstimator } from "../../services/ai/TokenEstimator";
import { EnvironmentValidator } from "../../services/environment/EnvironmentValidator";
import "./Workspace.css";
import "./AIProviderStatus.css";

interface Props { setWorkspace: (w: string) => void; }

const PROVIDERS = ["openai", "gemini", "anthropic", "mock"] as const;

const PROVIDER_META: Record<string, { label: string; icon: string; models: string[] }> = {
  openai:    { label: "OpenAI",    icon: "🟢", models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"] },
  gemini:    { label: "Gemini",    icon: "🔵", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
  anthropic: { label: "Anthropic", icon: "🟣", models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"] },
  mock:      { label: "Demo",      icon: "⚪", models: ["mock"] },
};

function StatusDot({ status }: { status: string }) {
  const color = status === "healthy" ? "#10b981" : status === "degraded" ? "#f59e0b" : status === "unavailable" ? "#ef4444" : "#94a3b8";
  return <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: color, marginRight: 6 }} />;
}

function MetricCard({ icon, label, value, sub, onClick }: {
  icon: string; label: string; value: string; sub?: string; onClick?: () => void;
}) {
  return (
    <div className="aps-metric" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="aps-metric-icon">{icon}</div>
      <div className="aps-metric-value">{value}</div>
      <div className="aps-metric-label">{label}</div>
      {sub && <div className="aps-metric-sub">{sub}</div>}
    </div>
  );
}

export default memo(function AIProviderStatus({ setWorkspace }: Props) {
  const { health, usage, isDemoMode, activeProvider } = useAIContext();
  const [tab, setTab] = useState<"overview" | "health" | "usage" | "tokens" | "env">("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh health every 30s
  useEffect(() => {
    const t = setInterval(() => setRefreshKey(k => k + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const envReport = useMemo(() => EnvironmentValidator.validate(), [refreshKey]);
  const dailyUsed = TokenEstimator.getDailyUsed();
  const dailyBudget = TokenEstimator.getDailyBudget();
  const dailyPct = TokenEstimator.getDailyUsedPct();
  const allUsage = useMemo(() => AIUsage.getAll().slice(-20), [refreshKey]);
  const totalTokens = useMemo(() => allUsage.reduce((a, r) => a + (r.tokensUsed ?? 0), 0), [allUsage]);

  const activeHealth = health.find(h => h.provider === activeProvider);
  const healthyCount = health.filter(h => h.status === "healthy").length;

  const tabs = ["overview", "health", "usage", "tokens", "env"] as const;

  return (
    <div className="workspace-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back</button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>🤖 AI Provider Status</h1>
        <span style={{ fontSize: 11, background: "#ede9fe", color: "#4c1d95", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>V9.0</span>
        {isDemoMode && (
          <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "3px 10px", fontWeight: 700 }}>
            Demo Mode
          </span>
        )}
      </div>
      <p className="workspace-subtitle">Monitor AI provider health, usage, token budget, and environment configuration.</p>

      {/* Tabs */}
      <div className="aps-tabs">
        {tabs.map(t => (
          <button key={t} className={`aps-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "overview" ? "📋 Overview" : t === "health" ? "💚 Health" : t === "usage" ? "📊 Usage" : t === "tokens" ? "🔢 Tokens" : "🔧 Environment"}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <>
          <div className="aps-metrics">
            <MetricCard icon={activeHealth?.status === "healthy" ? "🟢" : "🔴"} label="Active Provider" value={activeProvider} sub={activeHealth?.status ?? "unknown"} onClick={() => setTab("health")} />
            <MetricCard icon="💚" label="Healthy Providers" value={`${healthyCount}/${PROVIDERS.length}`} onClick={() => setTab("health")} />
            <MetricCard icon="📡" label="Requests Today" value={String(usage.todayCount)} sub={`${usage.avgResponseTime}ms avg`} onClick={() => setTab("usage")} />
            <MetricCard icon="🔢" label="Tokens Today" value={TokenEstimator.format(dailyUsed)} sub={`${dailyPct}% of budget`} onClick={() => setTab("tokens")} />
            <MetricCard icon="⚡" label="Avg Response" value={usage.avgResponseTime > 0 ? `${usage.avgResponseTime}ms` : "—"} />
            <MetricCard icon="✅" label="Total Tokens" value={TokenEstimator.format(totalTokens)} />
          </div>

          {/* Provider cards */}
          <h2 style={{ marginTop: 28, marginBottom: 14, fontSize: 16, fontWeight: 700 }}>Provider Status</h2>
          <div className="aps-provider-grid">
            {PROVIDERS.map(p => {
              const h = health.find(x => x.provider === p);
              const meta = PROVIDER_META[p];
              const isActive = p === activeProvider;
              const configured = envReport.checks.some(c =>
                c.key.toLowerCase().includes(p === "openai" ? "openai" : p === "anthropic" ? "anthropic" : p) && c.status === "ok"
              ) || p === "mock";
              return (
                <div key={p} className={`aps-provider-card ${isActive ? "active" : ""}`}>
                  <div className="aps-provider-top">
                    <span className="aps-provider-icon">{meta.icon}</span>
                    <div>
                      <div className="aps-provider-name">{meta.label}</div>
                      {isActive && <span className="aps-active-badge">Active</span>}
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                      <StatusDot status={h?.status ?? "unknown"} />
                      <span style={{ fontSize: 12, textTransform: "capitalize", color: "#64748b" }}>{h?.status ?? "unknown"}</span>
                    </div>
                  </div>
                  <div className="aps-provider-stats">
                    <div><span>Requests:</span> <strong>{h?.requestCount ?? 0}</strong></div>
                    <div><span>Errors:</span> <strong style={{ color: (h?.errorCount ?? 0) > 0 ? "#ef4444" : "inherit" }}>{h?.errorCount ?? 0}</strong></div>
                    <div><span>Avg time:</span> <strong>{h?.latencyMs ? `${h.latencyMs}ms` : "—"}</strong></div>
                    <div><span>Configured:</span> <strong>{configured ? "✅" : "❌"}</strong></div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>
                    Models: {meta.models.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Health ── */}
      {tab === "health" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="btn-secondary" onClick={() => setRefreshKey(k => k + 1)} style={{ fontSize: 12 }}>🔄 Refresh</button>
          </div>
          <div className="aps-health-table">
            <div className="aps-table-header">
              <span>Provider</span><span>Status</span><span>Requests</span><span>Errors</span><span>Avg ms</span><span>Last Success</span>
            </div>
            {PROVIDERS.map(p => {
              const h = health.find(x => x.provider === p);
              const meta = PROVIDER_META[p];
              return (
                <div key={p} className={`aps-table-row ${p === activeProvider ? "active" : ""}`}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {meta.icon} {meta.label}
                    {p === activeProvider && <span className="aps-active-badge">Active</span>}
                  </span>
                  <span>
                    <StatusDot status={h?.status ?? "unknown"} />
                    <span style={{ textTransform: "capitalize" }}>{h?.status ?? "unknown"}</span>
                  </span>
                  <span>{h?.requestCount ?? 0}</span>
                  <span style={{ color: (h?.errorCount ?? 0) > 0 ? "#ef4444" : "inherit" }}>{h?.errorCount ?? 0}</span>
                  <span>{h?.latencyMs ? `${h.latencyMs}ms` : "—"}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {h?.lastChecked ? new Date(h.lastChecked).toLocaleTimeString() : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="aps-info-box" style={{ marginTop: 20 }}>
            <strong>💡 Fallback Logic:</strong> If the active provider fails, Voxora automatically falls back to Demo Mode so the app always works. Configure a real AI key in Settings → AI Settings to enable live responses.
          </div>
        </>
      )}

      {/* ── Usage ── */}
      {tab === "usage" && (
        <>
          <div className="aps-metrics" style={{ marginBottom: 24 }}>
            <MetricCard icon="📡" label="Today's Requests" value={String(usage.todayCount)} />
            <MetricCard icon="⚡" label="Avg Response" value={usage.avgResponseTime > 0 ? `${usage.avgResponseTime}ms` : "—"} />
            <MetricCard icon="🔢" label="Tokens Today" value={TokenEstimator.format(dailyUsed)} />
            <MetricCard icon="📈" label="Total Logged" value={String(allUsage.length)} sub="last 20" />
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Recent Requests</h2>
          {allUsage.length === 0 ? (
            <div className="aps-empty">No AI requests logged yet. Start using AI tools to see usage data here.</div>
          ) : (
            <div className="aps-usage-list">
              {[...allUsage].reverse().map((r, i) => (
                <div key={i} className="aps-usage-row">
                  <span className="aps-usage-provider">{PROVIDER_META[r.provider]?.icon ?? "🤖"} {r.provider}</span>
                  <span className="aps-usage-ws">{r.workspace ?? "general"}</span>
                  <span className="aps-usage-tokens">{TokenEstimator.format(r.tokensUsed ?? 0)} tokens</span>
                  <span className="aps-usage-time">{r.responseTime ? `${r.responseTime}ms` : "—"}</span>
                  <span className="aps-usage-date" style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tokens ── */}
      {tab === "tokens" && (
        <>
          <div className="aps-token-budget">
            <div className="aps-token-header">
              <h2>Daily Token Budget</h2>
              <span style={{ fontSize: 13, color: "#64748b" }}>{TokenEstimator.format(dailyUsed)} / {TokenEstimator.format(dailyBudget)}</span>
            </div>
            <div className="aps-token-bar-track">
              <div
                className="aps-token-bar-fill"
                style={{
                  width: `${dailyPct}%`,
                  background: dailyPct > 90 ? "#ef4444" : dailyPct > 70 ? "#f59e0b" : "#6c63ff",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b", marginTop: 4 }}>
              <span>{dailyPct}% used</span>
              <span>{TokenEstimator.format(TokenEstimator.getDailyRemaining())} remaining</span>
            </div>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "24px 0 12px" }}>Context Windows by Provider</h2>
          <div className="aps-health-table">
            <div className="aps-table-header">
              <span>Provider / Model</span><span>Context Window</span><span>Typical Use</span>
            </div>
            {[
              { p: "OpenAI GPT-4",          tokens: "8,192",       use: "Standard tasks" },
              { p: "OpenAI GPT-4 Turbo",    tokens: "128,000",     use: "Long documents" },
              { p: "OpenAI GPT-3.5",        tokens: "16,385",      use: "Fast & cheap" },
              { p: "Gemini 1.5 Pro",        tokens: "1,048,576",   use: "Very long context" },
              { p: "Gemini 1.5 Flash",      tokens: "1,048,576",   use: "Fast responses" },
              { p: "Claude 3 Opus",         tokens: "200,000",     use: "Complex reasoning" },
              { p: "Claude 3 Sonnet",       tokens: "200,000",     use: "Balanced" },
              { p: "Claude 3 Haiku",        tokens: "200,000",     use: "Fast & efficient" },
              { p: "Demo Mode",             tokens: "4,096",       use: "Simulated" },
            ].map((row, i) => (
              <div key={i} className="aps-table-row">
                <span>{row.p}</span>
                <span>{row.tokens}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{row.use}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Environment ── */}
      {tab === "env" && (
        <>
          <div className="aps-env-summary">
            <div className={`aps-env-score ${envReport.score >= 60 ? "good" : envReport.score >= 30 ? "warn" : "bad"}`}>
              <span>{envReport.score}%</span>
              <small>Config Score</small>
            </div>
            <div className="aps-env-badges">
              <span className={`aps-env-badge ${envReport.firebaseConfigured ? "ok" : "demo"}`}>
                {envReport.firebaseConfigured ? "✅ Firebase" : "⚠️ Firebase (Demo)"}
              </span>
              <span className={`aps-env-badge ${envReport.aiConfigured ? "ok" : "demo"}`}>
                {envReport.aiConfigured ? "✅ AI Configured" : "⚠️ AI (Demo Mode)"}
              </span>
              <span className={`aps-env-badge ${envReport.paymentConfigured ? "ok" : "demo"}`}>
                {envReport.paymentConfigured ? "✅ Payments" : "⚠️ Payments (Demo)"}
              </span>
            </div>
          </div>

          {Object.entries(EnvironmentValidator.byGroup(envReport.checks)).map(([group, checks]) => (
            <div key={group} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#374151" }}>{group}</h3>
              <div className="aps-env-list">
                {checks.map(c => (
                  <div key={c.key} className={`aps-env-item aps-env-item--${c.status}`}>
                    <span className="aps-env-status-dot">
                      {c.status === "ok" ? "✅" : c.status === "missing" ? "❌" : c.status === "demo" ? "⚠️" : "⚠️"}
                    </span>
                    <div className="aps-env-item-body">
                      <span className="aps-env-label">{c.label}</span>
                      {c.value && <code className="aps-env-value">{c.value}</code>}
                      {c.status !== "ok" && <span className="aps-env-hint">{c.hint}</span>}
                    </div>
                    <span className={`aps-env-badge aps-env-badge--${c.status}`}>
                      {c.status === "ok" ? "Set" : c.status === "demo" ? "Optional" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
});
