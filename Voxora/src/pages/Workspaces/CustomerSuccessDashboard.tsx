// ── V9.2 Customer Success Dashboard ─────────────────────────────────────────
import { useState, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useAIContext } from "../../context/AIContext";
import "./CustomerSuccess.css";

interface Props { setWorkspace: (w: string) => void; }

interface Customer {
  id: string;
  name: string;
  company: string;
  plan: "Free" | "Pro" | "Enterprise";
  healthScore: number;
  onboardingProgress: number;
  lastActive: string;
  churnRisk: "low" | "medium" | "high";
  adoptedFeatures: string[];
  ticketsOpen: number;
  npsScore: number | null;
}

const DEMO_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Alex Rivera", company: "TechFlow Inc", plan: "Enterprise", healthScore: 92, onboardingProgress: 100, lastActive: "2026-07-27", churnRisk: "low", adoptedFeatures: ["AI Assistant","Analytics","CRM","HR Studio","Automations"], ticketsOpen: 0, npsScore: 9 },
  { id: "c2", name: "Sarah Chen", company: "Startup Labs", plan: "Pro", healthScore: 78, onboardingProgress: 80, lastActive: "2026-07-25", churnRisk: "low", adoptedFeatures: ["AI Assistant","Marketing Studio","Pitch Deck"], ticketsOpen: 1, npsScore: 8 },
  { id: "c3", name: "Marcus Johnson", company: "GrowthCo", plan: "Pro", healthScore: 54, onboardingProgress: 60, lastActive: "2026-07-19", churnRisk: "medium", adoptedFeatures: ["AI Assistant","Startup Ideas"], ticketsOpen: 2, npsScore: 6 },
  { id: "c4", name: "Priya Patel", company: "ScaleUp Ltd", plan: "Free", healthScore: 31, onboardingProgress: 35, lastActive: "2026-07-10", churnRisk: "high", adoptedFeatures: ["AI Assistant"], ticketsOpen: 0, npsScore: null },
  { id: "c5", name: "James Wright", company: "Horizon AI", plan: "Enterprise", healthScore: 88, onboardingProgress: 95, lastActive: "2026-07-26", churnRisk: "low", adoptedFeatures: ["AI Agents","Enterprise Memory","CRM","Analytics","Operations"], ticketsOpen: 1, npsScore: 10 },
  { id: "c6", name: "Lena Koch", company: "DesignHub", plan: "Pro", healthScore: 42, onboardingProgress: 50, lastActive: "2026-07-15", churnRisk: "high", adoptedFeatures: ["AI Content","Marketing Studio"], ticketsOpen: 3, npsScore: 5 },
];

const RECOMMENDATIONS = [
  { icon: "📞", title: "Schedule check-in with at-risk accounts", desc: "3 customers have high churn risk and haven't engaged in 7+ days.", action: "View At-Risk" },
  { icon: "🎓", title: "Send onboarding nudge to incomplete accounts", desc: "4 customers are under 75% onboarding completion.", action: "View Incomplete" },
  { icon: "🌟", title: "Request NPS from engaged users", desc: "2 customers have high health scores but no NPS collected yet.", action: "Send NPS" },
  { icon: "📊", title: "Upsell Pro customers with strong adoption", desc: "Sarah Chen is using 3+ Pro features — good candidate for Enterprise.", action: "View Opportunity" },
];

const FEATURE_ADOPTION = [
  { feature: "AI Assistant", adopters: 6, pct: 100 },
  { feature: "Marketing Studio", adopters: 3, pct: 50 },
  { feature: "CRM Studio", adopters: 2, pct: 33 },
  { feature: "Analytics", adopters: 2, pct: 33 },
  { feature: "AI Agents", adopters: 1, pct: 17 },
  { feature: "Enterprise Memory", adopters: 1, pct: 17 },
  { feature: "Operations Studio", adopters: 1, pct: 17 },
  { feature: "HR Studio", adopters: 1, pct: 17 },
];

function HealthBadge({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Healthy" : score >= 50 ? "At Risk" : "Critical";
  return (
    <span className="cs-health-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

function ChurnBadge({ risk }: { risk: Customer["churnRisk"] }) {
  const map = { low: { bg: "#dcfce7", color: "#166534", label: "Low" }, medium: { bg: "#fef3c7", color: "#92400e", label: "Medium" }, high: { bg: "#fee2e2", color: "#991b1b", label: "High" } };
  const s = map[risk];
  return <span className="cs-churn-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function CustomerSuccessDashboard({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const { activities } = useActivity();
  const { usage } = useAIContext();
  const [activeTab, setActiveTab] = useState<"overview" | "customers" | "adoption" | "recommendations">("overview");
  const [riskFilter, setRiskFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const avgHealth = useMemo(() => Math.round(DEMO_CUSTOMERS.reduce((a, c) => a + c.healthScore, 0) / DEMO_CUSTOMERS.length), []);
  const avgOnboarding = useMemo(() => Math.round(DEMO_CUSTOMERS.reduce((a, c) => a + c.onboardingProgress, 0) / DEMO_CUSTOMERS.length), []);
  const highRisk = useMemo(() => DEMO_CUSTOMERS.filter(c => c.churnRisk === "high").length, []);
  const avgNPS = useMemo(() => {
    const scored = DEMO_CUSTOMERS.filter(c => c.npsScore !== null);
    return scored.length ? Math.round(scored.reduce((a, c) => a + (c.npsScore ?? 0), 0) / scored.length * 10) / 10 : 0;
  }, []);

  const filtered = useMemo(() =>
    riskFilter === "all" ? DEMO_CUSTOMERS : DEMO_CUSTOMERS.filter(c => c.churnRisk === riskFilter),
  [riskFilter]);

  return (
    <div className="workspace-container cs-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>💚 Customer Success Dashboard</h1>
      <p className="workspace-subtitle">Monitor customer health, adoption, churn risk, and success outcomes.</p>

      {/* Tabs */}
      <div className="cs-tabs">
        {(["overview","customers","adoption","recommendations"] as const).map(tab => (
          <button key={tab} className={`cs-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab === "overview" ? "📊 Overview" : tab === "customers" ? "👥 Customers" : tab === "adoption" ? "🎯 Adoption" : "💡 Recommendations"}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === "overview" && (
        <>
          <div className="cs-stat-grid">
            <div className="cs-stat-card" onClick={() => setActiveTab("customers")} style={{ cursor: "pointer" }}>
              <div className="cs-stat-icon">💚</div>
              <div className="cs-stat-value" style={{ color: avgHealth >= 75 ? "#10b981" : avgHealth >= 50 ? "#f59e0b" : "#ef4444" }}>{avgHealth}</div>
              <div className="cs-stat-label">Avg Health Score</div>
            </div>
            <div className="cs-stat-card">
              <div className="cs-stat-icon">🚀</div>
              <div className="cs-stat-value">{avgOnboarding}%</div>
              <div className="cs-stat-label">Avg Onboarding</div>
            </div>
            <div className="cs-stat-card" onClick={() => { setRiskFilter("high"); setActiveTab("customers"); }} style={{ cursor: "pointer" }}>
              <div className="cs-stat-icon">⚠️</div>
              <div className="cs-stat-value" style={{ color: highRisk > 0 ? "#ef4444" : "#10b981" }}>{highRisk}</div>
              <div className="cs-stat-label">High Churn Risk</div>
            </div>
            <div className="cs-stat-card">
              <div className="cs-stat-icon">⭐</div>
              <div className="cs-stat-value">{avgNPS}</div>
              <div className="cs-stat-label">Avg NPS Score</div>
            </div>
            <div className="cs-stat-card">
              <div className="cs-stat-icon">👥</div>
              <div className="cs-stat-value">{DEMO_CUSTOMERS.length}</div>
              <div className="cs-stat-label">Total Customers</div>
            </div>
            <div className="cs-stat-card">
              <div className="cs-stat-icon">🎟️</div>
              <div className="cs-stat-value">{DEMO_CUSTOMERS.reduce((a, c) => a + c.ticketsOpen, 0)}</div>
              <div className="cs-stat-label">Open Tickets</div>
            </div>
          </div>

          {/* Health distribution */}
          <div className="cs-panel">
            <h3>🩺 Health Score Distribution</h3>
            <div className="cs-health-bars">
              {DEMO_CUSTOMERS.map(c => (
                <div key={c.id} className="cs-health-row">
                  <div className="cs-health-name">{c.name}</div>
                  <div className="cs-health-bar-wrap">
                    <div className="cs-health-bar" style={{ width: `${c.healthScore}%`, background: c.healthScore >= 75 ? "#10b981" : c.healthScore >= 50 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                  <div className="cs-health-pct">{c.healthScore}</div>
                  <HealthBadge score={c.healthScore} />
                </div>
              ))}
            </div>
          </div>

          {/* Onboarding progress */}
          <div className="cs-panel">
            <h3>🚀 Onboarding Progress</h3>
            <div className="cs-health-bars">
              {DEMO_CUSTOMERS.map(c => (
                <div key={c.id} className="cs-health-row">
                  <div className="cs-health-name">{c.name}</div>
                  <div className="cs-health-bar-wrap">
                    <div className="cs-health-bar" style={{ width: `${c.onboardingProgress}%`, background: "#6C63FF" }} />
                  </div>
                  <div className="cs-health-pct">{c.onboardingProgress}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform activity context */}
          <div className="cs-two-col">
            <div className="cs-panel">
              <h3>📊 Your Platform Activity</h3>
              <div className="cs-mini-stat-list">
                <div className="cs-mini-stat"><span>Total Projects</span><strong>{projects.length}</strong></div>
                <div className="cs-mini-stat"><span>AI Sessions</span><strong>{usage.todayCount}</strong></div>
                <div className="cs-mini-stat"><span>Recent Activities</span><strong>{activities.length}</strong></div>
                <div className="cs-mini-stat"><span>Workspace Version</span><strong>V9.2</strong></div>
              </div>
            </div>
            <div className="cs-panel">
              <h3>💡 Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="workspace-btn" onClick={() => setWorkspace("supportTickets")}>🎫 View Support Tickets</button>
                <button className="workspace-btn" onClick={() => setWorkspace("customerFeedback")}>⭐ Customer Feedback</button>
                <button className="workspace-btn" onClick={() => setWorkspace("supportAnalytics")}>📊 Support Analytics</button>
                <button className="workspace-btn" onClick={() => setActiveTab("recommendations")}>💡 View Recommendations</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Customers ── */}
      {activeTab === "customers" && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {(["all","low","medium","high"] as const).map(f => (
              <button
                key={f}
                className={`cs-filter-btn ${riskFilter === f ? "active" : ""}`}
                onClick={() => setRiskFilter(f)}
              >
                {f === "all" ? "All" : f === "low" ? "🟢 Low Risk" : f === "medium" ? "🟡 Medium Risk" : "🔴 High Risk"}
                <span className="cs-filter-count">
                  {f === "all" ? DEMO_CUSTOMERS.length : DEMO_CUSTOMERS.filter(c => c.churnRisk === f).length}
                </span>
              </button>
            ))}
          </div>

          <div className="cs-customer-list">
            {filtered.map(c => (
              <div key={c.id} className="cs-customer-card">
                <div className="cs-customer-header">
                  <div className="cs-customer-avatar">{c.name[0]}</div>
                  <div className="cs-customer-info">
                    <div className="cs-customer-name">{c.name}</div>
                    <div className="cs-customer-company">{c.company}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="cs-plan-badge">{c.plan}</span>
                    <HealthBadge score={c.healthScore} />
                    <ChurnBadge risk={c.churnRisk} />
                  </div>
                </div>

                <div className="cs-customer-metrics">
                  <div className="cs-metric">
                    <span>Health</span>
                    <div className="cs-mini-bar-wrap"><div className="cs-mini-bar" style={{ width: `${c.healthScore}%`, background: c.healthScore >= 75 ? "#10b981" : c.healthScore >= 50 ? "#f59e0b" : "#ef4444" }} /></div>
                    <strong>{c.healthScore}</strong>
                  </div>
                  <div className="cs-metric">
                    <span>Onboarding</span>
                    <div className="cs-mini-bar-wrap"><div className="cs-mini-bar" style={{ width: `${c.onboardingProgress}%`, background: "#6C63FF" }} /></div>
                    <strong>{c.onboardingProgress}%</strong>
                  </div>
                </div>

                <div className="cs-customer-footer">
                  <span>Last active: {c.lastActive}</span>
                  <span>NPS: {c.npsScore !== null ? c.npsScore : "—"}</span>
                  <span>Open tickets: {c.ticketsOpen}</span>
                  <span>Features: {c.adoptedFeatures.length}</span>
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {c.adoptedFeatures.map(f => (
                    <span key={f} className="cs-feature-tag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Feature Adoption ── */}
      {activeTab === "adoption" && (
        <>
          <div className="cs-panel">
            <h3>🎯 Feature Adoption Rates</h3>
            <div className="cs-health-bars">
              {FEATURE_ADOPTION.map(f => (
                <div key={f.feature} className="cs-health-row">
                  <div className="cs-health-name">{f.feature}</div>
                  <div className="cs-health-bar-wrap">
                    <div className="cs-health-bar" style={{ width: `${f.pct}%`, background: f.pct >= 50 ? "#6C63FF" : f.pct >= 25 ? "#f59e0b" : "#94a3b8" }} />
                  </div>
                  <div className="cs-health-pct">{f.pct}%</div>
                  <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 70 }}>{f.adopters}/{DEMO_CUSTOMERS.length} users</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cs-panel">
            <h3>📈 Adoption Insights</h3>
            <div className="cs-insight-list">
              <div className="cs-insight">
                <span className="cs-insight-icon">✅</span>
                <div><strong>AI Assistant</strong> is adopted by 100% of customers — your highest value feature.</div>
              </div>
              <div className="cs-insight">
                <span className="cs-insight-icon">📣</span>
                <div><strong>Marketing Studio</strong> at 50% — strong opportunity to drive adoption with Pro customers.</div>
              </div>
              <div className="cs-insight">
                <span className="cs-insight-icon">⚠️</span>
                <div><strong>AI Agents &amp; Enterprise Memory</strong> at 17% — these are Enterprise-tier differentiators. Consider a dedicated onboarding flow.</div>
              </div>
              <div className="cs-insight">
                <span className="cs-insight-icon">💡</span>
                <div>Customers using <strong>5+ features</strong> have an average health score of <strong>90+</strong>. Prioritise broad feature adoption in onboarding.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Recommendations ── */}
      {activeTab === "recommendations" && (
        <div className="cs-rec-list">
          {RECOMMENDATIONS.map((r, i) => (
            <div key={i} className="cs-rec-card">
              <div className="cs-rec-icon">{r.icon}</div>
              <div className="cs-rec-body">
                <div className="cs-rec-title">{r.title}</div>
                <div className="cs-rec-desc">{r.desc}</div>
              </div>
              <button className="workspace-btn" style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                {r.action} →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
