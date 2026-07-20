import { useActivity } from "../../context/ActivityContext";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FeatureCard from "./components/FeatureCard";
import { useProjects } from "../../context/ProjectContext";
import { useAIContext } from "../../context/AIContext";
import { AIMemory } from "../../services/ai/AIMemory";
import "./Dashboard.css";

// ── Lazy-loaded workspace pages ──────────────────────────────────────────────
const AIContent          = lazy(() => import("../Workspaces/AIContent"));
const AppIdeas           = lazy(() => import("../Workspaces/AppIdeas"));
const StartupIdeas       = lazy(() => import("../Workspaces/StartupIdeas"));
const SavedProjects      = lazy(() => import("../Workspaces/SavedProjects"));
const CustomerResearch   = lazy(() => import("../Workspaces/CustomerResearch"));
const MarketResearch     = lazy(() => import("../Workspaces/MarketResearch"));
const AIAssistant        = lazy(() => import("../Workspaces/AIAssistant"));
const Settings           = lazy(() => import("../Workspaces/Settings"));
const AISettings         = lazy(() => import("../Workspaces/AISettings"));
const ProductValidation  = lazy(() => import("../Workspaces/ProductValidation"));
const CustomerPersona    = lazy(() => import("../Workspaces/CustomerPersona"));
const BusinessModelCanvas = lazy(() => import("../Workspaces/BusinessModelCanvas"));
const CompetitorAnalysis = lazy(() => import("../Workspaces/CompetitorAnalysis"));
const SWOTAnalysis       = lazy(() => import("../Workspaces/SWOTAnalysis"));
const ProductRoadmap     = lazy(() => import("../Workspaces/ProductRoadmap"));
const ActivityCenter     = lazy(() => import("../Workspaces/ActivityCenter"));
const AnalyticsDashboard = lazy(() => import("../Workspaces/AnalyticsDashboard"));
const SmartSearch        = lazy(() => import("../Workspaces/SmartSearch"));
const ExportCenter       = lazy(() => import("../Workspaces/ExportCenter"));
const HelpCenter         = lazy(() => import("../Workspaces/HelpCenter"));
const DevAdmin           = lazy(() => import("../Workspaces/DevAdmin"));
// ── V4.6 Advanced Analytics Studio ───────────────────────────────────────────
const AnalyticsHub         = lazy(() => import("../Workspaces/AnalyticsHub"));
const ExecutiveDashboard   = lazy(() => import("../Workspaces/ExecutiveDashboard"));
const RevenueAnalytics     = lazy(() => import("../Workspaces/RevenueAnalytics"));
const CustomerAnalytics    = lazy(() => import("../Workspaces/CustomerAnalytics"));
const MarketingAnalytics   = lazy(() => import("../Workspaces/MarketingAnalytics"));
const FinancialAnalytics   = lazy(() => import("../Workspaces/FinancialAnalytics"));
const AIAnalytics          = lazy(() => import("../Workspaces/AIAnalytics"));
const StartupAnalytics     = lazy(() => import("../Workspaces/StartupAnalytics"));
const TrendAnalysis        = lazy(() => import("../Workspaces/TrendAnalysis"));
const AnalyticsReports     = lazy(() => import("../Workspaces/AnalyticsReports"));
// ── V4.5 Growth Studio ────────────────────────────────────────────────────────
const GrowthHub                = lazy(() => import("../Workspaces/GrowthHub"));
const GrowthPlanner            = lazy(() => import("../Workspaces/GrowthPlanner"));
const KPIDashboard             = lazy(() => import("../Workspaces/KPIDashboard"));
const GoalTracker              = lazy(() => import("../Workspaces/GoalTracker"));
const OKRManager               = lazy(() => import("../Workspaces/OKRManager"));
const GrowthOpportunity        = lazy(() => import("../Workspaces/GrowthOpportunity"));
const GrowthExperiments        = lazy(() => import("../Workspaces/GrowthExperiments"));
const ABTestPlanner            = lazy(() => import("../Workspaces/ABTestPlanner"));
const BusinessMilestones       = lazy(() => import("../Workspaces/BusinessMilestones"));
const WeeklyReview             = lazy(() => import("../Workspaces/WeeklyReview"));
const MonthlyGrowthReport      = lazy(() => import("../Workspaces/MonthlyGrowthReport"));
const AIGrowthRecommendations  = lazy(() => import("../Workspaces/AIGrowthRecommendations"));
// ── V4.4 Investor Studio ──────────────────────────────────────────────────────
const InvestorHub          = lazy(() => import("../Workspaces/InvestorHub"));
const FundraisingStrategy  = lazy(() => import("../Workspaces/FundraisingStrategy"));
const InvestorNarrative    = lazy(() => import("../Workspaces/InvestorNarrative"));
const TermSheetGuide       = lazy(() => import("../Workspaces/TermSheetGuide"));
const DueDiligence         = lazy(() => import("../Workspaces/DueDiligence"));
const CapTable             = lazy(() => import("../Workspaces/CapTable"));
// ── V4.3 Financial Studio ─────────────────────────────────────────────────────
const FinancialHub       = lazy(() => import("../Workspaces/FinancialHub"));
const FinancialForecast  = lazy(() => import("../Workspaces/FinancialForecast"));
const RevenueModel       = lazy(() => import("../Workspaces/RevenueModel"));
const PricingStrategy    = lazy(() => import("../Workspaces/PricingStrategy"));
const UnitEconomics      = lazy(() => import("../Workspaces/UnitEconomics"));
const BreakEven          = lazy(() => import("../Workspaces/BreakEven"));
const PitchDeck          = lazy(() => import("../Workspaces/PitchDeck"));
const ExecutiveSummary   = lazy(() => import("../Workspaces/ExecutiveSummary"));
// ── V4.2 Marketing Studio ─────────────────────────────────────────────────────
const MarketingHub       = lazy(() => import("../Workspaces/MarketingHub"));
const MarketingStrategy  = lazy(() => import("../Workspaces/MarketingStrategy"));
const EmailCampaign      = lazy(() => import("../Workspaces/EmailCampaign"));
const SocialMediaPost    = lazy(() => import("../Workspaces/SocialMediaPost"));
const SEOPlanner         = lazy(() => import("../Workspaces/SEOPlanner"));
const AdCopy             = lazy(() => import("../Workspaces/AdCopy"));
const ContentCalendar    = lazy(() => import("../Workspaces/ContentCalendar"));
const BrandVoice         = lazy(() => import("../Workspaces/BrandVoice"));

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function msToDisplay(ms: number): string {
  if (ms === 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function WorkspaceLoader() {
  return (
    <div className="workspace-loader">
      <div className="workspace-loader-spinner" />
    </div>
  );
}

const Dashboard = () => {
  const userName = localStorage.getItem("voxora-name") || "";
  const [workspace, setWorkspace] = useState("dashboard");
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();
  const { usage, isDemoMode } = useAIContext();

  const stats = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const aiSessions = Number(localStorage.getItem("voxora-chat-count")) || 0;
    const thisWeek = projects.filter((p) => new Date(p.createdAt) >= weekStart).length;
    return { aiSessions, thisWeek };
  }, [projects]);

  const recentProjects = useMemo(() => [...projects].reverse().slice(0, 3), [projects]);

  // Recent AI conversations from AIMemory
  const recentConvs = useMemo(() => AIMemory.getRecent(3), []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const map: Record<string, string> = {
        k: "search", n: "assistant", s: "saved", e: "export", h: "help",
      };

      if (e.key in map) { e.preventDefault(); setWorkspace(map[e.key]); return; }
      if (e.shiftKey && e.key === "D") { e.preventDefault(); setWorkspace("admin"); }
      if (e.key === "Escape") setWorkspace("dashboard");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="dashboard">
      <Sidebar setWorkspace={setWorkspace} workspace={workspace} />

      <main className="main-content">
        <TopBar setWorkspace={setWorkspace} />

        <Suspense fallback={<WorkspaceLoader />}>

          {workspace === "dashboard" && (
            <>
              <div className="welcome-section">
                <h1>Welcome back{userName ? `, ${userName}` : ""} 🚀</h1>
                <p className="welcome-sub">Your AI-powered workspace for ideas, research, and strategy.</p>
              </div>

              {/* Project stats row */}
              <div className="stats">
                <div className="stat-card">
                  <div className="stat-icon">📁</div>
                  <p className="stat-value">{projects.length}</p>
                  <h3 className="stat-label">Total Projects</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <p className="stat-value">{favorites.length}</p>
                  <h3 className="stat-label">Favorites</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📌</div>
                  <p className="stat-value">{pinned.length}</p>
                  <h3 className="stat-label">Pinned</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🤖</div>
                  <p className="stat-value">{stats.aiSessions}</p>
                  <h3 className="stat-label">AI Sessions</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔔</div>
                  <p className="stat-value">{activities.length}</p>
                  <h3 className="stat-label">Activities</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <p className="stat-value">{stats.thisWeek}</p>
                  <h3 className="stat-label">This Week</h3>
                </div>
              </div>

              {/* ── AI Overview Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🧠 AI Overview
                  {isDemoMode && (
                    <span style={{ fontSize: 11, background: "#ede9fe", color: "#4c1d95", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Demo Mode
                    </span>
                  )}
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiSettings")}>
                    <div className="stat-icon">📡</div>
                    <p className="stat-value">{usage.todayCount}</p>
                    <h3 className="stat-label">AI Requests Today</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <p className="stat-value" style={{ fontSize: usage.mostUsedWorkspace.length > 6 ? 13 : undefined }}>
                      {usage.mostUsedWorkspace === "—" ? "—" : usage.mostUsedWorkspace}
                    </p>
                    <h3 className="stat-label">Top Workspace</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <p className="stat-value">{msToDisplay(usage.avgResponseTime)}</p>
                    <h3 className="stat-label">Avg Response Time</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <p className="stat-value">{usage.weeklyCount}</p>
                    <h3 className="stat-label">This Week</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔢</div>
                    <p className="stat-value">{(usage.todayTokens / 1000).toFixed(1)}k</p>
                    <h3 className="stat-label">Tokens Today</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiSettings")}>
                    <div className="stat-icon">🧠</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Configure</p>
                    <h3 className="stat-label">AI Settings</h3>
                  </div>
                </div>

                {/* Recent AI Conversations */}
                {recentConvs.length > 0 && (
                  <div className="dashboard-panel" style={{ marginTop: 16 }}>
                    <div className="panel-header">
                      <h2>💬 Recent AI Conversations</h2>
                      <button className="panel-link" onClick={() => setWorkspace("assistant")}>Open Chat →</button>
                    </div>
                    <div className="activity-mini-list">
                      {recentConvs.map((c) => (
                        <div key={c.id} className="activity-mini-item">
                          <span className="activity-mini-icon">{c.pinned ? "📌" : "🤖"}</span>
                          <div className="activity-mini-body">
                            <span className="activity-mini-title">{c.title}</span>
                            <span className="activity-mini-desc">{c.messages.length} messages · {c.workspace}</span>
                          </div>
                          <span className="activity-mini-time">{timeAgo(new Date(c.updatedAt).toISOString())}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Growth Studio Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  📈 Growth Studio
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("kpiDashboard")}>
                    <div className="stat-icon">📊</div>
                    <p className="stat-value">{Math.min(100, Math.round((Math.min(projects.length, 20) / 20) * 100))}%</p>
                    <h3 className="stat-label">Growth Score</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("kpiDashboard")}>
                    <div className="stat-icon">📌</div>
                    <p className="stat-value">9</p>
                    <h3 className="stat-label">KPI Metrics</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("goalTracker")}>
                    <div className="stat-icon">🎯</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Goal").length}</p>
                    <h3 className="stat-label">Active Goals</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("businessMilestones")}>
                    <div className="stat-icon">🗓️</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Business Milestone").length}</p>
                    <h3 className="stat-label">Milestones</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("monthlyGrowthReport")}>
                    <div className="stat-icon">📈</div>
                    <p className="stat-value">{projects.filter(p => ["Monthly Report","Weekly Review","Growth Plan"].includes(p.category)).length}</p>
                    <h3 className="stat-label">Growth Reports</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("growthHub")}>
                    <div className="stat-icon">🌱</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Open</p>
                    <h3 className="stat-label">Growth Studio</h3>
                  </div>
                </div>
              </div>

              {/* ── Analytics Studio Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  📊 Analytics Studio
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("executiveDashboard")}>
                    <div className="stat-icon">🏢</div>
                    <p className="stat-value">{Math.min(100, Math.round((Math.min(projects.length, 20) / 20) * 30 + (Math.min(activities.length, 50) / 50) * 30 + (Math.min(usage.todayCount, 10) / 10) * 25 + (favorites.length > 0 ? 15 : 0)))}%</p>
                    <h3 className="stat-label">Health Score</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("revenueAnalytics")}>
                    <div className="stat-icon">💰</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Track</p>
                    <h3 className="stat-label">Revenue</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("trendAnalysis")}>
                    <div className="stat-icon">📈</div>
                    <p className="stat-value">{projects.filter(p => { const d = new Date(); d.setDate(d.getDate() - 7); return new Date(p.createdAt) >= d; }).length}</p>
                    <h3 className="stat-label">Weekly Insights</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiAnalytics")}>
                    <div className="stat-icon">🤖</div>
                    <p className="stat-value">{usage.todayCount}</p>
                    <h3 className="stat-label">AI Usage</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("startupAnalytics")}>
                    <div className="stat-icon">🚀</div>
                    <p className="stat-value">{Math.min(100, Math.round(
                      (projects.filter(p => ["Customer Research","Product Validation","Business Model Canvas","Market Research"].includes(p.category)).length / 4) * 50 +
                      (projects.filter(p => ["Pitch Deck","Executive Summary","Fundraising Strategy"].includes(p.category)).length / 3) * 50
                    ))}%</p>
                    <h3 className="stat-label">Startup Score</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("analyticsHub")}>
                    <div className="stat-icon">📊</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Open</p>
                    <h3 className="stat-label">Analytics Studio</h3>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>⚡ Quick Actions</h2>
                <div className="cards">
                  <FeatureCard title="✍️ AI Content Ideas"    description="Generate creative content concepts."                    buttonText="Open"     onClick={() => setWorkspace("content")} />
                  <FeatureCard title="💡 App Ideas"           description="Discover and create new app concepts."                  buttonText="Open"     onClick={() => setWorkspace("apps")} />
                  <FeatureCard title="🚀 Startup Ideas"       description="Explore business opportunities."                        buttonText="Open"     onClick={() => setWorkspace("startup")} />
                  <FeatureCard title="🔬 Customer Research"   description="Understand customers and their needs."                  buttonText="Research" onClick={() => setWorkspace("research")} />
                  <FeatureCard title="📋 SWOT Analysis"       description="Analyze strengths, weaknesses, and opportunities."     buttonText="Analyze"  onClick={() => setWorkspace("swot")} />
                  <FeatureCard title="🏆 Competitor Analysis" description="Analyze competitors before building."                   buttonText="Analyze"  onClick={() => setWorkspace("competitor")} />
                  <FeatureCard title="📊 Business Model"      description="Generate a complete Business Model Canvas."             buttonText="Open"     onClick={() => setWorkspace("business")} />
                  <FeatureCard title="🗺️ Product Roadmap"    description="Build a step-by-step development plan."                 buttonText="Plan"     onClick={() => setWorkspace("productRoadmap")} />
                  <FeatureCard title="🤖 AI Assistant"        description="Ask Voxora anything about your business."              buttonText="Chat"     onClick={() => setWorkspace("assistant")} />
                  <FeatureCard title="📤 Export Center"       description="Export projects as PDF, Markdown, or Text."            buttonText="Export"   onClick={() => setWorkspace("export")} />
                </div>
              </div>

              {/* Recent Projects + Activity */}
              <div className="dashboard-row">
                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h2>📁 Recent Projects</h2>
                    <button className="panel-link" onClick={() => setWorkspace("saved")}>View All →</button>
                  </div>
                  {recentProjects.length === 0 ? (
                    <div className="panel-empty">
                      <p>📭 No projects yet. Start from a Quick Action above.</p>
                    </div>
                  ) : (
                    <div className="recent-projects-list">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="recent-project-card">
                          <div className="rpc-top">
                            <span className="rpc-category">{project.category}</span>
                            <div className="rpc-badges">
                              {pinned.includes(project.id) && <span>📌</span>}
                              {favorites.includes(project.id) && <span>⭐</span>}
                            </div>
                          </div>
                          <h3 className="rpc-title">{project.title}</h3>
                          <p className="rpc-date">
                            📅 {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h2>🕒 Recent Activity</h2>
                    <button className="panel-link" onClick={() => setWorkspace("activity")}>View All →</button>
                  </div>
                  {activities.length === 0 ? (
                    <div className="panel-empty">
                      <p>📭 No activity yet. Actions you take will appear here.</p>
                    </div>
                  ) : (
                    <div className="activity-mini-list">
                      {activities.slice(0, 5).map((a) => (
                        <div key={a.id} className="activity-mini-item">
                          <span className="activity-mini-icon">{a.icon}</span>
                          <div className="activity-mini-body">
                            <span className="activity-mini-title">{a.title}</span>
                            <span className="activity-mini-desc">{a.description}</span>
                          </div>
                          <span className="activity-mini-time">{timeAgo(a.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {workspace === "content"        && <AIContent          setWorkspace={setWorkspace} />}
          {workspace === "apps"           && <AppIdeas           setWorkspace={setWorkspace} />}
          {workspace === "startup"        && <StartupIdeas       setWorkspace={setWorkspace} />}
          {workspace === "validation"     && <ProductValidation  setWorkspace={setWorkspace} />}
          {workspace === "persona"        && <CustomerPersona    setWorkspace={setWorkspace} />}
          {workspace === "saved"          && <SavedProjects      setWorkspace={setWorkspace} />}
          {workspace === "research"       && <CustomerResearch   setWorkspace={setWorkspace} />}
          {workspace === "assistant"      && <AIAssistant        setWorkspace={setWorkspace} />}
          {workspace === "business"       && <BusinessModelCanvas setWorkspace={setWorkspace} />}
          {workspace === "settings"       && <Settings           setWorkspace={setWorkspace} />}
          {workspace === "aiSettings"     && <AISettings         setWorkspace={setWorkspace} />}
          {workspace === "competitor"     && <CompetitorAnalysis setWorkspace={setWorkspace} />}
          {workspace === "market"         && <MarketResearch     setWorkspace={setWorkspace} />}
          {workspace === "swot"           && <SWOTAnalysis       setWorkspace={setWorkspace} />}
          {workspace === "productRoadmap" && <ProductRoadmap     setWorkspace={setWorkspace} />}
          {workspace === "activity"       && <ActivityCenter     setWorkspace={setWorkspace} />}
          {workspace === "analytics"      && <AnalyticsDashboard setWorkspace={setWorkspace} />}
          {workspace === "search"         && <SmartSearch        setWorkspace={setWorkspace} />}
          {workspace === "export"         && <ExportCenter       setWorkspace={setWorkspace} />}
          {workspace === "help"           && <HelpCenter         setWorkspace={setWorkspace} />}
          {workspace === "admin"          && <DevAdmin           setWorkspace={setWorkspace} />}

          {/* V4.6 Advanced Analytics Studio */}
          {workspace === "analyticsHub"        && <AnalyticsHub        setWorkspace={setWorkspace} />}
          {workspace === "executiveDashboard"  && <ExecutiveDashboard  setWorkspace={setWorkspace} />}
          {workspace === "revenueAnalytics"    && <RevenueAnalytics    setWorkspace={setWorkspace} />}
          {workspace === "customerAnalytics"   && <CustomerAnalytics   setWorkspace={setWorkspace} />}
          {workspace === "marketingAnalytics"  && <MarketingAnalytics  setWorkspace={setWorkspace} />}
          {workspace === "financialAnalytics"  && <FinancialAnalytics  setWorkspace={setWorkspace} />}
          {workspace === "aiAnalytics"         && <AIAnalytics         setWorkspace={setWorkspace} />}
          {workspace === "startupAnalytics"    && <StartupAnalytics    setWorkspace={setWorkspace} />}
          {workspace === "trendAnalysis"       && <TrendAnalysis       setWorkspace={setWorkspace} />}
          {workspace === "analyticsReports"    && <AnalyticsReports    setWorkspace={setWorkspace} />}

          {/* V4.5 Growth Studio */}
          {workspace === "growthHub"               && <GrowthHub               setWorkspace={setWorkspace} />}
          {workspace === "growthPlanner"           && <GrowthPlanner           setWorkspace={setWorkspace} />}
          {workspace === "kpiDashboard"            && <KPIDashboard            setWorkspace={setWorkspace} />}
          {workspace === "goalTracker"             && <GoalTracker             setWorkspace={setWorkspace} />}
          {workspace === "okrManager"              && <OKRManager              setWorkspace={setWorkspace} />}
          {workspace === "growthOpportunity"       && <GrowthOpportunity       setWorkspace={setWorkspace} />}
          {workspace === "growthExperiments"       && <GrowthExperiments       setWorkspace={setWorkspace} />}
          {workspace === "abTestPlanner"           && <ABTestPlanner           setWorkspace={setWorkspace} />}
          {workspace === "businessMilestones"      && <BusinessMilestones      setWorkspace={setWorkspace} />}
          {workspace === "weeklyReview"            && <WeeklyReview            setWorkspace={setWorkspace} />}
          {workspace === "monthlyGrowthReport"     && <MonthlyGrowthReport     setWorkspace={setWorkspace} />}
          {workspace === "aiGrowthRecommendations" && <AIGrowthRecommendations setWorkspace={setWorkspace} />}

          {/* V4.4 Investor Studio */}
          {workspace === "investorHub"         && <InvestorHub         setWorkspace={setWorkspace} />}
          {workspace === "fundraisingStrategy" && <FundraisingStrategy setWorkspace={setWorkspace} />}
          {workspace === "investorNarrative"   && <InvestorNarrative   setWorkspace={setWorkspace} />}
          {workspace === "termSheet"           && <TermSheetGuide      setWorkspace={setWorkspace} />}
          {workspace === "dueDiligence"        && <DueDiligence        setWorkspace={setWorkspace} />}
          {workspace === "capTable"            && <CapTable            setWorkspace={setWorkspace} />}

          {/* V4.3 Financial Studio */}
          {workspace === "financialHub"      && <FinancialHub      setWorkspace={setWorkspace} />}
          {workspace === "financialForecast" && <FinancialForecast setWorkspace={setWorkspace} />}
          {workspace === "revenueModel"      && <RevenueModel      setWorkspace={setWorkspace} />}
          {workspace === "pricingStrategy"   && <PricingStrategy   setWorkspace={setWorkspace} />}
          {workspace === "unitEconomics"     && <UnitEconomics     setWorkspace={setWorkspace} />}
          {workspace === "breakEven"         && <BreakEven         setWorkspace={setWorkspace} />}
          {workspace === "pitchDeck"         && <PitchDeck         setWorkspace={setWorkspace} />}
          {workspace === "executiveSummary"  && <ExecutiveSummary  setWorkspace={setWorkspace} />}

          {/* V4.2 Marketing Studio */}
          {workspace === "marketingHub"      && <MarketingHub       setWorkspace={setWorkspace} />}
          {workspace === "marketingStrategy" && <MarketingStrategy  setWorkspace={setWorkspace} />}
          {workspace === "emailCampaign"     && <EmailCampaign      setWorkspace={setWorkspace} />}
          {workspace === "socialMedia"       && <SocialMediaPost    setWorkspace={setWorkspace} />}
          {workspace === "seoPlanner"        && <SEOPlanner         setWorkspace={setWorkspace} />}
          {workspace === "adCopy"            && <AdCopy             setWorkspace={setWorkspace} />}
          {workspace === "contentCalendar"   && <ContentCalendar    setWorkspace={setWorkspace} />}
          {workspace === "brandVoice"        && <BrandVoice         setWorkspace={setWorkspace} />}

        </Suspense>
      </main>
    </div>
  );
};

export default Dashboard;
