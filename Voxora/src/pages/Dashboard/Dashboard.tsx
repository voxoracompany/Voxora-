import { useActivity } from "../../context/ActivityContext";
import { lazy, Suspense, useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FeatureCard from "./components/FeatureCard";
import { useProjects } from "../../context/ProjectContext";
import { useAIContext } from "../../context/AIContext";
import { useAuth } from "../../context/AuthContext";
import { useCloud } from "../../context/CloudContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { AIMemory } from "../../services/ai/AIMemory";
import { AIUsage } from "../../services/ai/AIUsage";
import { MemoryService } from "../../services/memory/MemoryService";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { AutomationEngine } from "../../services/automation/AutomationEngine";
import { MonitoringService } from "../../services/admin/MonitoringService";
import { NotificationService } from "../../services/admin/NotificationService";
import { AuditLogService } from "../../services/admin/AuditLogService";
import { ErrorReportingService } from "../../services/admin/ErrorReportingService";
import WelcomeWizard from "../../components/WelcomeWizard";
import WorkspaceErrorBoundary from "../../components/WorkspaceErrorBoundary";
import "./Dashboard.css";

const WIZARD_KEY = "voxora-wizard-done";
const GS_KEY = "voxora-gs-checklist";

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
// ── V6.0 Launch Candidate ─────────────────────────────────────────────────────
const BetaReadinessReport = lazy(() => import("../Workspaces/BetaReadinessReport"));
// ── V5.9 Launch Preparation & Production Readiness ───────────────────────────
const ErrorReporting     = lazy(() => import("../Workspaces/ErrorReporting"));
const HealthCheck        = lazy(() => import("../Workspaces/HealthCheck"));
const DeploymentChecklist = lazy(() => import("../Workspaces/DeploymentChecklist"));
const DocumentationCenter = lazy(() => import("../Workspaces/DocumentationCenter"));
const LaunchChecklist    = lazy(() => import("../Workspaces/LaunchChecklist"));
// ── V5.8 Admin & Monitoring ───────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import("../Workspaces/AdminDashboard"));
const UserManagement     = lazy(() => import("../Workspaces/UserManagement"));
const SystemMonitoring   = lazy(() => import("../Workspaces/SystemMonitoring"));
const AuditLogs          = lazy(() => import("../Workspaces/AuditLogs"));
const NotificationCenter = lazy(() => import("../Workspaces/NotificationCenter"));
const FeatureFlags       = lazy(() => import("../Workspaces/FeatureFlags"));
// ── V5.7 Integrations & Automation ───────────────────────────────────────────
const AutomationWorkspace = lazy(() => import("../Workspaces/AutomationWorkspace"));
const IntGoogleCal        = lazy(() => import("../Workspaces/IntGoogleCal"));
const IntOutlook          = lazy(() => import("../Workspaces/IntOutlook"));
const IntGitHub           = lazy(() => import("../Workspaces/IntGitHub"));
// ── V5.6 Workspace Intelligence & AI Memory ───────────────────────────────────
const PromptLibraryWorkspace = lazy(() => import("../Workspaces/PromptLibraryWorkspace"));
const AIMemorySettings       = lazy(() => import("../Workspaces/AIMemorySettings"));
// ── V5.5 Public Beta Launch ───────────────────────────────────────────────────
const FeedbackCenter     = lazy(() => import("../Workspaces/FeedbackCenter"));
const TrustCenter        = lazy(() => import("../Workspaces/TrustCenter"));
const GettingStarted     = lazy(() => import("../Workspaces/GettingStarted"));
// ── V5.4 Payments & Subscription ─────────────────────────────────────────────
const Billing            = lazy(() => import("../Workspaces/Billing"));
// ── V4.9 Authentication & User Accounts ──────────────────────────────────────
const UserProfile        = lazy(() => import("../Workspaces/UserProfile"));
const AccountSettings    = lazy(() => import("../Workspaces/AccountSettings"));
const SecuritySettings   = lazy(() => import("../Workspaces/SecuritySettings"));
// ── V4.8 Integrations Studio ─────────────────────────────────────────────────
const IntegrationsHub      = lazy(() => import("../Workspaces/IntegrationsHub"));
const IntOpenAI            = lazy(() => import("../Workspaces/IntOpenAI"));
const IntGemini            = lazy(() => import("../Workspaces/IntGemini"));
const IntAnthropic         = lazy(() => import("../Workspaces/IntAnthropic"));
const IntGoogleDrive       = lazy(() => import("../Workspaces/IntGoogleDrive"));
const IntDropbox           = lazy(() => import("../Workspaces/IntDropbox"));
const IntNotion            = lazy(() => import("../Workspaces/IntNotion"));
const IntSlack             = lazy(() => import("../Workspaces/IntSlack"));
const IntZapier            = lazy(() => import("../Workspaces/IntZapier"));
const IntWebhooks          = lazy(() => import("../Workspaces/IntWebhooks"));
const IntegrationSettings  = lazy(() => import("../Workspaces/IntegrationSettings"));
// ── V4.7 Team Collaboration ───────────────────────────────────────────────────
const TeamHub             = lazy(() => import("../Workspaces/TeamHub"));
const TeamMembers         = lazy(() => import("../Workspaces/TeamMembers"));
const TaskBoard           = lazy(() => import("../Workspaces/TaskBoard"));
const MeetingNotes        = lazy(() => import("../Workspaces/MeetingNotes"));
const TeamGoals           = lazy(() => import("../Workspaces/TeamGoals"));
const RoleAssignment      = lazy(() => import("../Workspaces/RoleAssignment"));
const TeamAnnouncements   = lazy(() => import("../Workspaces/TeamAnnouncements"));
const TeamBrief           = lazy(() => import("../Workspaces/TeamBrief"));
const CollaborationPlan   = lazy(() => import("../Workspaces/CollaborationPlan"));
const TeamRetrospective   = lazy(() => import("../Workspaces/TeamRetrospective"));
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
  const { user, getProfileCompletion } = useAuth();
  const userName = user?.name || localStorage.getItem("voxora-name") || "";
  const [workspace, setWorkspace] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem(WIZARD_KEY));
  // Tracks whether admin/monitoring services have been seeded so dependent memos recompute after mount
  const [adminSeeded, setAdminSeeded] = useState(false);

  const handleWizardComplete = useCallback(() => {
    localStorage.setItem(WIZARD_KEY, "1");
    setShowWizard(false);
  }, []);
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();
  const { usage, isDemoMode, activeProvider, health } = useAIContext();
  const { status: cloudStatus, syncNow } = useCloud();
  const {
    currentPlan, subscription, usage: subUsage,
    isTrial, trialDaysRemaining, daysUntilRenewal,
    isDemoBillingMode, isActive: subIsActive,
  } = useSubscription();

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

  // V5.6 — Memory stats
  const memStats = useMemo(() => MemoryService.getStats(), []);
  const convCount = useMemo(() => AIMemory.getAll().length, []);

  // V5.7 — Integration & Automation stats
  const intStats  = useMemo(() => IntegrationService.getStats(), []);
  const autoStats = useMemo(() => AutomationEngine.getStats(), []);

  // V5.8 — Admin & Monitoring stats (seed once on mount, then set flag so dependent memos recompute)
  useEffect(() => {
    AuditLogService.seed();
    NotificationService.seed();
    ErrorReportingService.seed();
    setAdminSeeded(true);
  }, []);
  const sysMetrics    = useMemo(() => MonitoringService.getMetrics(),           [adminSeeded]);
  const unreadNotifs  = useMemo(() => NotificationService.getUnreadCount(),     [adminSeeded]);
  const recentAudits  = useMemo(() => AuditLogService.getAll().slice(0, 3),    [adminSeeded]);

  // V5.9 — Launch Preparation stats
  const errStats = useMemo(() => ErrorReportingService.getStats(), [adminSeeded]);
  const launchChecklistDone = useMemo(() => {
    try { return (JSON.parse(localStorage.getItem("voxora-launch-checklist-v59") || "[]") as string[]).length; }
    catch { return 0; }
  }, []);
  const launchChecklistTotal = 37;
  const launchReadinessScore = useMemo(() => {
    const checklistScore = Math.round((launchChecklistDone / launchChecklistTotal) * 50);
    const healthScore    = sysMetrics.services.filter((s) => s.status === "operational").length /
      Math.max(1, sysMetrics.services.length) * 30;
    const errScore       = errStats.unresolved === 0 ? 20 : errStats.unresolved < 3 ? 15 : 5;
    return Math.min(100, Math.round(checklistScore + healthScore + errScore));
  }, [launchChecklistDone, sysMetrics, errStats]);

  // V5.6 — AI suggestions based on project context
  const aiSuggestions = useMemo(() => {
    const suggestions: { icon: string; text: string; action: string }[] = [];
    if (projects.length === 0) suggestions.push({ icon: "✨", text: "Create your first startup idea to get started.", action: "startup" });
    if (projects.length > 0 && !projects.some(p => p.category === "Customer Research")) suggestions.push({ icon: "🔬", text: "Run customer research to validate your idea.", action: "research" });
    if (projects.length > 0 && !projects.some(p => p.category === "Business Model Canvas")) suggestions.push({ icon: "🏢", text: "Build a Business Model Canvas for your project.", action: "business" });
    if (projects.length > 2 && !projects.some(p => ["Financial Forecast","Revenue Model"].includes(p.category))) suggestions.push({ icon: "💰", text: "Model your financials and revenue streams.", action: "financialForecast" });
    if (usage.todayCount === 0) suggestions.push({ icon: "🤖", text: "Chat with AI Assistant to explore ideas.", action: "assistant" });
    if (convCount === 0) suggestions.push({ icon: "💬", text: "Start an AI conversation to build your memory.", action: "assistant" });
    if (projects.length > 3 && !projects.some(p => p.category === "Pitch Deck")) suggestions.push({ icon: "📊", text: "Create a pitch deck for investors.", action: "pitchDeck" });
    return suggestions.slice(0, 4);
  }, [projects, usage.todayCount, convCount]);

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

  const handleSidebarNav = (id: string) => {
    setWorkspace(id);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      {/* V5.5 Welcome Wizard */}
      {showWizard && (
        <WelcomeWizard onComplete={handleWizardComplete} setWorkspace={(w) => { handleWizardComplete(); setWorkspace(w); }} />
      )}

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar
        setWorkspace={handleSidebarNav}
        workspace={workspace}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <div className="mobile-topbar">
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
          >
            <span /><span /><span />
          </button>
          <span className="mobile-brand">VOXORA</span>
        </div>
        <TopBar setWorkspace={setWorkspace} />

        <WorkspaceErrorBoundary>
        <Suspense fallback={<WorkspaceLoader />}>

          {workspace === "dashboard" && (
            <>
              <div className="welcome-section">
                <h1>Welcome back{userName ? `, ${userName}` : ""}</h1>
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

              {/* ── V5.5 Beta Status & Quick Nav ── */}
              <div style={{ margin: "0 0 28px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🧪 Beta Status
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#4c1d95", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>Public Beta</span>
                </h2>
                <div className="stats">
                  {/* Beta Badge */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("gettingStarted")}>
                    <div className="stat-icon">🧪</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Beta</p>
                    <h3 className="stat-label">Release Stage</h3>
                  </div>
                  {/* Tour Progress */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("gettingStarted")}>
                    <div className="stat-icon">🗺️</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>
                      {(() => {
                        try {
                          const done: string[] = JSON.parse(localStorage.getItem(GS_KEY) || "[]");
                          return `${done.length}/8`;
                        } catch { return "0/8"; }
                      })()}
                    </p>
                    <h3 className="stat-label">Setup Progress</h3>
                  </div>
                  {/* Feedback */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("feedback")}>
                    <div className="stat-icon">💬</div>
                    <p className="stat-value">
                      {(() => {
                        try { return JSON.parse(localStorage.getItem("voxora-feedback-history") || "[]").length; }
                        catch { return 0; }
                      })()}
                    </p>
                    <h3 className="stat-label">Feedback Sent</h3>
                  </div>
                  {/* System Health */}
                  <div className="stat-card">
                    <div className="stat-icon">💚</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>All OK</p>
                    <h3 className="stat-label">System Health</h3>
                  </div>
                  {/* Latest Update */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("help")}>
                    <div className="stat-icon">🆕</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>V5.5</p>
                    <h3 className="stat-label">Latest Update</h3>
                  </div>
                  {/* Getting Started */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("gettingStarted")}>
                    <div className="stat-icon">✨</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Start</p>
                    <h3 className="stat-label">Getting Started</h3>
                  </div>
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
                  {/* V5.2 — Active AI Provider */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiSettings")}>
                    <div className="stat-icon">🤖</div>
                    <p className="stat-value" style={{ fontSize: 13, textTransform: "capitalize" }}>{activeProvider}</p>
                    <h3 className="stat-label">Active AI Provider</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiSettings")}>
                    <div className="stat-icon">📡</div>
                    <p className="stat-value">{usage.todayCount}</p>
                    <h3 className="stat-label">AI Requests Today</h3>
                  </div>
                  {/* V5.2 — Provider Status */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiSettings")}>
                    <div className="stat-icon">
                      {(() => {
                        const h = health.find(x => x.provider === activeProvider);
                        const s = h?.status ?? "unknown";
                        return s === "healthy" ? "🟢" : s === "degraded" ? "🟡" : s === "unavailable" ? "🔴" : "⚪";
                      })()}
                    </div>
                    <p className="stat-value" style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {isDemoMode ? "Demo" : (health.find(x => x.provider === activeProvider)?.status ?? "unknown")}
                    </p>
                    <h3 className="stat-label">Provider Status</h3>
                  </div>
                  {/* V5.2 — Last Successful AI Request */}
                  <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {AIUsage.getLastSuccessfulTimestamp() > 0
                        ? timeAgo(new Date(AIUsage.getLastSuccessfulTimestamp()).toISOString())
                        : "—"}
                    </p>
                    <h3 className="stat-label">Last AI Request</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <p className="stat-value">{msToDisplay(usage.avgResponseTime)}</p>
                    <h3 className="stat-label">Avg Response Time</h3>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔢</div>
                    <p className="stat-value">{(usage.todayTokens / 1000).toFixed(1)}k</p>
                    <h3 className="stat-label">Tokens Today</h3>
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

              {/* ── Team Collaboration Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🤝 Team Collaboration
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("teamMembers")}>
                    <div className="stat-icon">👥</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Manage</p>
                    <h3 className="stat-label">Team Members</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("taskBoard")}>
                    <div className="stat-icon">📋</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Task").length}</p>
                    <h3 className="stat-label">Task Board</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("meetingNotes")}>
                    <div className="stat-icon">📝</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Meeting Notes").length}</p>
                    <h3 className="stat-label">Meeting Notes</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("teamGoals")}>
                    <div className="stat-icon">🎯</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Team Goal").length}</p>
                    <h3 className="stat-label">Team Goals</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("teamRetrospective")}>
                    <div className="stat-icon">🔁</div>
                    <p className="stat-value">{projects.filter(p => p.category === "Retrospective").length}</p>
                    <h3 className="stat-label">Retros</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("teamHub")}>
                    <div className="stat-icon">🤝</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Open</p>
                    <h3 className="stat-label">Team Hub</h3>
                  </div>
                </div>
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

              {/* ── Account & Security Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  👤 Account
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("userProfile")}>
                    <div className="stat-icon">{user?.avatarEmoji || "V"}</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>{user?.name ? user.name.split(" ")[0] : "You"}</p>
                    <h3 className="stat-label">Logged In As</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("userProfile")}>
                    <div className="stat-icon">✅</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>{user?.emailVerified ? "Verified" : "Pending"}</p>
                    <h3 className="stat-label">Account Status</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("userProfile")}>
                    <div className="stat-icon">📊</div>
                    <p className="stat-value">{getProfileCompletion()}%</p>
                    <h3 className="stat-label">Profile Complete</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("securitySettings")}>
                    <div className="stat-icon">🔐</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>{user?.twoFAEnabled ? "Strong" : "Fair"}</p>
                    <h3 className="stat-label">Security</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("securitySettings")}>
                    <div className="stat-icon">💻</div>
                    <p className="stat-value">1</p>
                    <h3 className="stat-label">Active Sessions</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("accountSettings")}>
                    <div className="stat-icon">⚙️</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Manage</p>
                    <h3 className="stat-label">Account Settings</h3>
                  </div>
                </div>
              </div>

              {/* ── V5.4 Subscription & Billing Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  💳 Subscription
                  {isDemoBillingMode && (
                    <span style={{ fontSize: 11, background: "#ede9fe", color: "#4c1d95", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Demo Billing Mode
                    </span>
                  )}
                  {isTrial && (
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Trial
                    </span>
                  )}
                </h2>
                <div className="stats">
                  {/* Current Plan */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">⚡</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>{currentPlan.name}</p>
                    <h3 className="stat-label">Current Plan</h3>
                  </div>
                  {/* Trial / Renewal */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">{isTrial ? "🎉" : "📅"}</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>
                      {isTrial ? `${trialDaysRemaining}d` : `${daysUntilRenewal}d`}
                    </p>
                    <h3 className="stat-label">{isTrial ? "Trial Days Left" : "Days to Renewal"}</h3>
                  </div>
                  {/* AI Usage */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">🤖</div>
                    <p className="stat-value">
                      {subUsage.aiRequests}
                      {currentPlan.limits.aiRequests !== -1 && (
                        <span style={{ fontSize: 11, color: "var(--text-secondary,#64748b)", fontWeight: 400 }}>
                          /{currentPlan.limits.aiRequests}
                        </span>
                      )}
                    </p>
                    <h3 className="stat-label">AI Requests</h3>
                  </div>
                  {/* Storage */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">🗄️</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>
                      {currentPlan.limits.storageGB === -1 ? "∞" : `${currentPlan.limits.storageGB} GB`}
                    </p>
                    <h3 className="stat-label">Storage Limit</h3>
                  </div>
                  {/* Subscription Status */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">{subIsActive ? "✅" : "⚠️"}</div>
                    <p className="stat-value" style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {subscription.status.replace("_", " ")}
                    </p>
                    <h3 className="stat-label">Status</h3>
                  </div>
                  {/* Billing Shortcut */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("billing")}>
                    <div className="stat-icon">💳</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Manage</p>
                    <h3 className="stat-label">Billing</h3>
                  </div>
                </div>
              </div>

              {/* ── V5.3 Cloud & Backend Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  ☁️ Cloud & Backend
                  {cloudStatus.isDemo && (
                    <span style={{ fontSize: 11, background: "#fef3c7", color: "#92400e", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Local Demo Mode
                    </span>
                  )}
                  {!cloudStatus.isDemo && cloudStatus.isOnline && (
                    <span style={{ fontSize: 11, background: "#d1fae5", color: "#065f46", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Cloud Connected
                    </span>
                  )}
                  {!cloudStatus.isDemo && !cloudStatus.isOnline && (
                    <span style={{ fontSize: 11, background: "#fee2e2", color: "#991b1b", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>
                      Offline
                    </span>
                  )}
                </h2>
                <div className="stats">
                  {/* Current User */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("userProfile")}>
                    <div className="stat-icon">{user?.avatarEmoji || "👤"}</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>{user?.name?.split(" ")[0] || "Guest"}</p>
                    <h3 className="stat-label">Current User</h3>
                  </div>
                  {/* Auth Status */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("securitySettings")}>
                    <div className="stat-icon">{user ? "🔓" : "🔒"}</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>{user ? "Authenticated" : "Guest"}</p>
                    <h3 className="stat-label">Auth Status</h3>
                  </div>
                  {/* Cloud Sync Status */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => syncNow()}>
                    <div className="stat-icon">
                      {cloudStatus.isSyncing ? "🔄" : cloudStatus.isDemo ? "💾" : cloudStatus.isOnline ? "☁️" : "📴"}
                    </div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {cloudStatus.isSyncing
                        ? "Syncing…"
                        : cloudStatus.isDemo
                        ? "Local"
                        : cloudStatus.isOnline
                        ? "In Sync"
                        : "Offline"}
                    </p>
                    <h3 className="stat-label">Cloud Sync</h3>
                  </div>
                  {/* Last Sync */}
                  <div className="stat-card">
                    <div className="stat-icon">🕐</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {cloudStatus.lastSync
                        ? timeAgo(cloudStatus.lastSync)
                        : cloudStatus.isDemo
                        ? "Local"
                        : "Never"}
                    </p>
                    <h3 className="stat-label">Last Sync</h3>
                  </div>
                  {/* Pending Changes */}
                  <div className="stat-card">
                    <div className="stat-icon">{cloudStatus.pendingChanges > 0 ? "⏳" : "✅"}</div>
                    <p className="stat-value">{cloudStatus.pendingChanges}</p>
                    <h3 className="stat-label">Pending Changes</h3>
                  </div>
                  {/* Storage Usage */}
                  <div className="stat-card">
                    <div className="stat-icon">🗄️</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {cloudStatus.storageUsed < 1024
                        ? `${cloudStatus.storageUsed}B`
                        : cloudStatus.storageUsed < 1024 * 1024
                        ? `${(cloudStatus.storageUsed / 1024).toFixed(1)}KB`
                        : `${(cloudStatus.storageUsed / (1024 * 1024)).toFixed(1)}MB`}
                    </p>
                    <h3 className="stat-label">Storage Used</h3>
                  </div>
                </div>
                {/* Firebase Status widget */}
                  <div className="stat-card">
                    <div className="stat-icon">
                      {cloudStatus.isDemo ? "💾" : cloudStatus.isOnline ? "🔥" : "📴"}
                    </div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {cloudStatus.isDemo ? "Demo" : cloudStatus.isOnline ? "Connected" : "Offline"}
                    </p>
                    <h3 className="stat-label">Firebase Status</h3>
                  </div>
                {/* Backend provider badge */}
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-secondary, #64748b)" }}>
                  Backend: <strong style={{ textTransform: "capitalize" }}>{cloudStatus.provider === "firebase" ? "Firebase" : "Local Demo"}</strong>
                  {cloudStatus.isDemo && " — Set VITE_FIREBASE_* env vars to connect Firebase Auth & Firestore."}
                </div>
              </div>

              {/* ── V5.8 Admin & Monitoring Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🏛️ Admin & Monitoring
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#6c63ff", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>V5.8</span>
                </h2>
                <div className="stats">
                  {/* System Health */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("systemMonitoring")}>
                    <div className="stat-icon">
                      {sysMetrics.services.every(s => s.status === "operational") ? "💚" : sysMetrics.services.some(s => s.status === "down") ? "🔴" : "🟡"}
                    </div>
                    <p className="stat-value" style={{ fontSize: 12 }}>
                      {sysMetrics.services.every(s => s.status === "operational") ? "All OK" : sysMetrics.services.some(s => s.status === "down") ? "Down" : "Degraded"}
                    </p>
                    <h3 className="stat-label">System Health</h3>
                  </div>
                  {/* Services */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("systemMonitoring")}>
                    <div className="stat-icon">🔧</div>
                    <p className="stat-value">{sysMetrics.services.filter(s => s.status === "operational").length}/{sysMetrics.services.length}</p>
                    <h3 className="stat-label">Services OK</h3>
                  </div>
                  {/* Active Users */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("userManagement")}>
                    <div className="stat-icon">👥</div>
                    <p className="stat-value">{sysMetrics.activeUsers}</p>
                    <h3 className="stat-label">Active Users</h3>
                  </div>
                  {/* Audit Events */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("auditLogs")}>
                    <div className="stat-icon">📋</div>
                    <p className="stat-value">{recentAudits.length}</p>
                    <h3 className="stat-label">Audit Events</h3>
                  </div>
                  {/* Notifications */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("notificationCenter")}>
                    <div className="stat-icon">🔔</div>
                    <p className="stat-value">{unreadNotifs}</p>
                    <h3 className="stat-label">Unread Notifs</h3>
                  </div>
                  {/* Admin Panel */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("adminDashboard")}>
                    <div className="stat-icon">🏛️</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>Open</p>
                    <h3 className="stat-label">Admin Panel</h3>
                  </div>
                </div>
                {/* Recent Audit Events mini-list */}
                {recentAudits.length > 0 && (
                  <div className="dashboard-panel" style={{ marginTop: 16 }}>
                    <div className="panel-header">
                      <h2>📋 Recent Audit Events</h2>
                      <button className="panel-link" onClick={() => setWorkspace("auditLogs")}>View All →</button>
                    </div>
                    <div className="activity-mini-list">
                      {recentAudits.map((e) => (
                        <div key={e.id} className="activity-mini-item">
                          <span className="activity-mini-icon">{e.icon}</span>
                          <div className="activity-mini-body">
                            <span className="activity-mini-title">{e.description}</span>
                            <span className="activity-mini-desc">{e.userName} · {e.type.replace(/_/g, " ")}</span>
                          </div>
                          <span className="activity-mini-time" style={{ color: e.severity === "critical" ? "#ef4444" : e.severity === "warning" ? "#f59e0b" : "#64748b" }}>
                            {e.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── V5.7 Integrations & Automation Widgets ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🔌 Integrations & Automation
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#6c63ff", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>V5.7</span>
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("integrationsHub")}>
                    <div className="stat-icon">🔌</div>
                    <p className="stat-value">{intStats.connected}</p>
                    <h3 className="stat-label">Connected</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("integrationsHub")}>
                    <div className="stat-icon">○</div>
                    <p className="stat-value">{intStats.available}</p>
                    <h3 className="stat-label">Available</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("automation")}>
                    <div className="stat-icon">⚡</div>
                    <p className="stat-value">{autoStats.active}</p>
                    <h3 className="stat-label">Active Workflows</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("automation")}>
                    <div className="stat-icon">🔁</div>
                    <p className="stat-value">{autoStats.totalExecutions}</p>
                    <h3 className="stat-label">Total Executions</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("integrationsHub")}>
                    <div className="stat-icon">{intStats.connected > 0 ? "🟢" : "⚪"}</div>
                    <p className="stat-value" style={{ fontSize: 13 }}>{intStats.connected > 0 ? "Healthy" : "None"}</p>
                    <h3 className="stat-label">Integration Health</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("automation")}>
                    <div className="stat-icon">📊</div>
                    <p className="stat-value">{autoStats.successRate}%</p>
                    <h3 className="stat-label">Automation Rate</h3>
                  </div>
                </div>
                {/* Recent sync activity */}
                {intStats.recentEvents.length > 0 && (
                  <div className="dashboard-panel" style={{ marginTop: 16 }}>
                    <div className="panel-header">
                      <h2>🔄 Recent Sync Activity</h2>
                      <button className="panel-link" onClick={() => setWorkspace("integrationsHub")}>View All →</button>
                    </div>
                    <div className="activity-mini-list">
                      {intStats.recentEvents.map((ev) => (
                        <div key={ev.id} className="activity-mini-item">
                          <span className="activity-mini-icon">
                            {ev.type === "connect" ? "🔗" : ev.type === "sync" ? "🔄" : ev.type === "disconnect" ? "🔌" : "📡"}
                          </span>
                          <div className="activity-mini-body">
                            <span className="activity-mini-title">{ev.integrationName}</span>
                            <span className="activity-mini-desc">{ev.message}</span>
                          </div>
                          <span className="activity-mini-time" style={{ color: ev.status === "success" ? "#10b981" : "#ef4444" }}>
                            {ev.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                  {/* ── V5.9 Launch Readiness ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  ✨ Launch Readiness
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#6c63ff", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>V5.9</span>
                </h2>
                <div className="stats">
                  {/* Launch Readiness Score */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("launchChecklist")}>
                    <div className="stat-icon">🎯</div>
                    <p className="stat-value" style={{ color: launchReadinessScore >= 80 ? "#10b981" : launchReadinessScore >= 50 ? "#f59e0b" : "#ef4444" }}>{launchReadinessScore}%</p>
                    <h3 className="stat-label">Launch Readiness</h3>
                  </div>
                  {/* Launch Checklist */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("launchChecklist")}>
                    <div className="stat-icon">✅</div>
                    <p className="stat-value">{launchChecklistDone}/{launchChecklistTotal}</p>
                    <h3 className="stat-label">Checklist Items</h3>
                  </div>
                  {/* Health Summary */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("healthCheck")}>
                    <div className="stat-icon">🏥</div>
                    <p className="stat-value" style={{ fontSize: 13, color: sysMetrics.services.every(s => s.status === "operational") ? "#10b981" : "#f59e0b" }}>
                      {sysMetrics.services.every(s => s.status === "operational") ? "All OK" : "Warning"}
                    </p>
                    <h3 className="stat-label">Health Status</h3>
                  </div>
                  {/* Deployment Status */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("deploymentChecklist")}>
                    <div className="stat-icon">✨</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>Check</p>
                    <h3 className="stat-label">Deployment</h3>
                  </div>
                  {/* Error Log */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("errorReporting")}>
                    <div className="stat-icon">{errStats.unresolved > 0 ? "🔴" : "🟢"}</div>
                    <p className="stat-value" style={{ color: errStats.unresolved > 0 ? "#ef4444" : "#10b981" }}>{errStats.unresolved}</p>
                    <h3 className="stat-label">Open Errors</h3>
                  </div>
                  {/* Documentation */}
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("documentationCenter")}>
                    <div className="stat-icon">📚</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>6 Guides</p>
                    <h3 className="stat-label">Documentation</h3>
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
                    <div className="stat-icon">✨</div>
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

              {/* ── V5.6 Workspace Intelligence ── */}
              <div style={{ margin: "28px 0 4px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  🧠 Workspace Intelligence
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#6c63ff", borderRadius: 8, padding: "2px 10px", fontWeight: 700 }}>V5.6</span>
                </h2>
                <div className="stats">
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("search")}>
                    <div className="stat-icon">🧠</div>
                    <p className="stat-value">{memStats.total}</p>
                    <h3 className="stat-label">Memory Items</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("search")}>
                    <div className="stat-icon">💬</div>
                    <p className="stat-value">{convCount}</p>
                    <h3 className="stat-label">AI Conversations</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("promptLibrary")}>
                    <div className="stat-icon">📚</div>
                    <p className="stat-value">30+</p>
                    <h3 className="stat-label">Prompt Templates</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("aiMemorySettings")}>
                    <div className="stat-icon">⚙️</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>Configure</p>
                    <h3 className="stat-label">Memory Settings</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("search")}>
                    <div className="stat-icon">🔍</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>Search</p>
                    <h3 className="stat-label">Global Search</h3>
                  </div>
                  <div className="stat-card" style={{ cursor: "pointer" }} onClick={() => setWorkspace("promptLibrary")}>
                    <div className="stat-icon">✨</div>
                    <p className="stat-value" style={{ fontSize: 12 }}>Open</p>
                    <h3 className="stat-label">Prompt Library</h3>
                  </div>
                </div>
              </div>

              {/* ── V5.6 AI Suggestions ── */}
              {aiSuggestions.length > 0 && (
                <div style={{ margin: "24px 0 4px" }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>💡 Suggested Next Steps</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {aiSuggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => setWorkspace(s.action)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          background: "var(--bg-card, #fff)", border: "1.5px solid var(--border, #e2e8f0)",
                          borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "border-color 0.2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#6c63ff")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border, #e2e8f0)")}
                      >
                        <span style={{ fontSize: 22 }}>{s.icon}</span>
                        <span style={{ fontSize: 14, color: "var(--text-primary, #1e293b)", flex: 1 }}>{s.text}</span>
                        <span style={{ fontSize: 13, color: "#6c63ff", fontWeight: 600 }}>Go →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>⚡ Quick Actions</h2>
                <div className="cards">
                  <FeatureCard title="✍️ AI Content Ideas"    description="Generate creative content concepts."                    buttonText="Open"     onClick={() => setWorkspace("content")} />
                  <FeatureCard title="💡 App Ideas"           description="Discover and create new app concepts."                  buttonText="Open"     onClick={() => setWorkspace("apps")} />
                  <FeatureCard title="✨ Startup Ideas"       description="Explore business opportunities."                        buttonText="Open"     onClick={() => setWorkspace("startup")} />
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

          {/* V5.4 Payments & Subscription */}
          {workspace === "billing" && <Billing setWorkspace={setWorkspace} />}

          {/* V5.6 Workspace Intelligence & AI Memory */}
          {workspace === "promptLibrary"    && <PromptLibraryWorkspace setWorkspace={setWorkspace} />}
          {workspace === "aiMemorySettings" && <AIMemorySettings       setWorkspace={setWorkspace} />}

          {/* V5.5 Public Beta Launch */}
          {workspace === "feedback"        && <FeedbackCenter  setWorkspace={setWorkspace} />}
          {workspace === "trust"           && <TrustCenter     setWorkspace={setWorkspace} />}
          {workspace === "gettingStarted"  && <GettingStarted  setWorkspace={setWorkspace} />}

          {/* V4.9 Authentication & User Accounts */}
          {workspace === "userProfile"      && <UserProfile        setWorkspace={setWorkspace} />}
          {workspace === "accountSettings"  && <AccountSettings    setWorkspace={setWorkspace} />}
          {workspace === "securitySettings" && <SecuritySettings   setWorkspace={setWorkspace} />}

          {/* V6.0 Launch Candidate */}
          {workspace === "betaReadinessReport" && <BetaReadinessReport setWorkspace={setWorkspace} />}

          {/* V5.9 Launch Preparation & Production Readiness */}
          {workspace === "errorReporting"      && <ErrorReporting      setWorkspace={setWorkspace} />}
          {workspace === "healthCheck"         && <HealthCheck         setWorkspace={setWorkspace} />}
          {workspace === "deploymentChecklist" && <DeploymentChecklist setWorkspace={setWorkspace} />}
          {workspace === "documentationCenter" && <DocumentationCenter setWorkspace={setWorkspace} />}
          {workspace === "launchChecklist"     && <LaunchChecklist     setWorkspace={setWorkspace} />}

          {/* V5.8 Admin & Monitoring */}
          {workspace === "adminDashboard"     && <AdminDashboard     setWorkspace={setWorkspace} />}
          {workspace === "userManagement"     && <UserManagement     setWorkspace={setWorkspace} />}
          {workspace === "systemMonitoring"   && <SystemMonitoring   setWorkspace={setWorkspace} />}
          {workspace === "auditLogs"          && <AuditLogs          setWorkspace={setWorkspace} />}
          {workspace === "notificationCenter" && <NotificationCenter setWorkspace={setWorkspace} />}
          {workspace === "featureFlags"       && <FeatureFlags       setWorkspace={setWorkspace} />}

          {/* V5.7 Integrations & Automation */}
          {workspace === "automation"      && <AutomationWorkspace setWorkspace={setWorkspace} />}
          {workspace === "intGoogleCal"    && <IntGoogleCal        setWorkspace={setWorkspace} />}
          {workspace === "intOutlook"      && <IntOutlook          setWorkspace={setWorkspace} />}
          {workspace === "intGitHub"       && <IntGitHub           setWorkspace={setWorkspace} />}

          {/* V4.8 Integrations Studio */}
          {workspace === "integrationsHub" && <IntegrationsHub     setWorkspace={setWorkspace} />}
          {workspace === "intOpenAI"       && <IntOpenAI           setWorkspace={setWorkspace} />}
          {workspace === "intGemini"       && <IntGemini           setWorkspace={setWorkspace} />}
          {workspace === "intAnthropic"    && <IntAnthropic        setWorkspace={setWorkspace} />}
          {workspace === "intGoogleDrive"  && <IntGoogleDrive      setWorkspace={setWorkspace} />}
          {workspace === "intDropbox"      && <IntDropbox          setWorkspace={setWorkspace} />}
          {workspace === "intNotion"       && <IntNotion           setWorkspace={setWorkspace} />}
          {workspace === "intSlack"        && <IntSlack            setWorkspace={setWorkspace} />}
          {workspace === "intZapier"       && <IntZapier           setWorkspace={setWorkspace} />}
          {workspace === "intWebhooks"     && <IntWebhooks         setWorkspace={setWorkspace} />}
          {workspace === "intSettings"     && <IntegrationSettings setWorkspace={setWorkspace} />}

          {/* V4.7 Team Collaboration */}
          {workspace === "teamHub"            && <TeamHub            setWorkspace={setWorkspace} />}
          {workspace === "teamMembers"        && <TeamMembers        setWorkspace={setWorkspace} />}
          {workspace === "taskBoard"          && <TaskBoard          setWorkspace={setWorkspace} />}
          {workspace === "meetingNotes"       && <MeetingNotes       setWorkspace={setWorkspace} />}
          {workspace === "teamGoals"          && <TeamGoals          setWorkspace={setWorkspace} />}
          {workspace === "roleAssignment"     && <RoleAssignment     setWorkspace={setWorkspace} />}
          {workspace === "teamAnnouncements"  && <TeamAnnouncements  setWorkspace={setWorkspace} />}
          {workspace === "teamBrief"          && <TeamBrief          setWorkspace={setWorkspace} />}
          {workspace === "collaborationPlan"  && <CollaborationPlan  setWorkspace={setWorkspace} />}
          {workspace === "teamRetrospective"  && <TeamRetrospective  setWorkspace={setWorkspace} />}

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
        </WorkspaceErrorBoundary>
      </main>
    </div>
  );
};

export default Dashboard;
