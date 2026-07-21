import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface SidebarProps {
  workspace: string;
  setWorkspace: (workspace: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const MAIN_NAV = [
  { id: "dashboard",     icon: "🏠", label: "Dashboard" },
  { id: "saved",         icon: "📁", label: "Saved Projects" },
  { id: "activity",      icon: "🕒", label: "Activity Center" },
  { id: "analytics",     icon: "📊", label: "Analytics" },
  { id: "search",        icon: "🔍", label: "Smart Search" },
  { id: "export",        icon: "📤", label: "Export Center" },
];

const AI_TOOLS = [
  { id: "assistant",      icon: "🤖", label: "AI Assistant" },
  { id: "content",        icon: "✍️", label: "AI Content" },
  { id: "apps",           icon: "💡", label: "App Ideas" },
  { id: "startup",        icon: "🚀", label: "Startup Ideas" },
  { id: "aiSettings",    icon: "🧠", label: "AI Settings" },
];

const RESEARCH_TOOLS = [
  { id: "research",       icon: "🔬", label: "Customer Research" },
  { id: "market",         icon: "📈", label: "Market Research" },
  { id: "persona",        icon: "👤", label: "Customer Persona" },
  { id: "validation",     icon: "✅", label: "Product Validation" },
  { id: "competitor",     icon: "🏆", label: "Competitor Analysis" },
  { id: "swot",           icon: "📋", label: "SWOT Analysis" },
];

const STRATEGY_TOOLS = [
  { id: "business",       icon: "🏢", label: "Business Model" },
  { id: "productRoadmap", icon: "🗺️", label: "Product Roadmap" },
];

const INVESTOR_TOOLS = [
  { id: "investorHub",         icon: "💼", label: "Investor Hub" },
  { id: "fundraisingStrategy", icon: "🚀", label: "Fundraising Strategy" },
  { id: "investorNarrative",   icon: "📖", label: "Investor Narrative" },
  { id: "termSheet",           icon: "📋", label: "Term Sheet Guide" },
  { id: "dueDiligence",        icon: "✅", label: "Due Diligence" },
  { id: "capTable",            icon: "📊", label: "Cap Table" },
];

const FINANCIAL_TOOLS = [
  { id: "financialHub",      icon: "💰", label: "Financial Hub" },
  { id: "financialForecast", icon: "📊", label: "Financial Forecast" },
  { id: "revenueModel",      icon: "💵", label: "Revenue Model" },
  { id: "pricingStrategy",   icon: "🏷️", label: "Pricing Strategy" },
  { id: "unitEconomics",     icon: "📈", label: "Unit Economics" },
  { id: "breakEven",         icon: "⚖️", label: "Break-Even" },
  { id: "pitchDeck",         icon: "🎯", label: "Pitch Deck" },
  { id: "executiveSummary",  icon: "📄", label: "Executive Summary" },
];

const MARKETING_TOOLS = [
  { id: "marketingHub",      icon: "📣", label: "Marketing Hub" },
  { id: "marketingStrategy", icon: "📊", label: "Marketing Strategy" },
  { id: "emailCampaign",     icon: "📧", label: "Email Campaign" },
  { id: "socialMedia",       icon: "📱", label: "Social Media" },
  { id: "seoPlanner",        icon: "🔍", label: "SEO Planner" },
  { id: "adCopy",            icon: "📢", label: "Ad Copy" },
  { id: "contentCalendar",   icon: "📅", label: "Content Calendar" },
  { id: "brandVoice",        icon: "🎙️", label: "Brand Voice" },
];

const GROWTH_TOOLS = [
  { id: "growthHub",              icon: "📈", label: "Growth Hub" },
  { id: "growthPlanner",          icon: "🌱", label: "Growth Planner" },
  { id: "kpiDashboard",           icon: "📊", label: "KPI Dashboard" },
  { id: "goalTracker",            icon: "🎯", label: "Goal Tracker" },
  { id: "okrManager",             icon: "🏆", label: "OKR Manager" },
  { id: "growthOpportunity",      icon: "🔭", label: "Growth Opportunities" },
  { id: "growthExperiments",      icon: "🧪", label: "Growth Experiments" },
  { id: "abTestPlanner",          icon: "⚖️", label: "A/B Test Planner" },
  { id: "businessMilestones",     icon: "🗓️", label: "Milestones" },
  { id: "weeklyReview",           icon: "📋", label: "Weekly Review" },
  { id: "monthlyGrowthReport",    icon: "📈", label: "Monthly Report" },
  { id: "aiGrowthRecommendations",icon: "🤖", label: "AI Recommendations" },
];

const TEAM_TOOLS = [
  { id: "teamHub",            icon: "🤝", label: "Team Hub" },
  { id: "teamMembers",        icon: "👥", label: "Team Members" },
  { id: "taskBoard",          icon: "📋", label: "Task Board" },
  { id: "meetingNotes",       icon: "📝", label: "Meeting Notes" },
  { id: "teamGoals",          icon: "🎯", label: "Team Goals" },
  { id: "roleAssignment",     icon: "🏷️", label: "Roles & Responsibilities" },
  { id: "teamAnnouncements",  icon: "📢", label: "Announcements" },
  { id: "teamBrief",          icon: "📡", label: "Team Brief" },
  { id: "collaborationPlan",  icon: "🤝", label: "Collaboration Plan" },
  { id: "teamRetrospective",  icon: "🔁", label: "Retrospective" },
];

const INTEGRATIONS_TOOLS = [
  { id: "integrationsHub",  icon: "🔌", label: "Integrations Hub" },
  { id: "intOpenAI",        icon: "🧠", label: "OpenAI" },
  { id: "intGemini",        icon: "♊", label: "Google Gemini" },
  { id: "intAnthropic",     icon: "🤖", label: "Anthropic Claude" },
  { id: "intGoogleDrive",   icon: "🗂️", label: "Google Drive" },
  { id: "intDropbox",       icon: "📦", label: "Dropbox" },
  { id: "intNotion",        icon: "📄", label: "Notion" },
  { id: "intSlack",         icon: "💬", label: "Slack" },
  { id: "intZapier",        icon: "⚡", label: "Zapier" },
  { id: "intWebhooks",      icon: "🔗", label: "Webhooks" },
  { id: "intSettings",      icon: "⚙️", label: "Integration Settings" },
];

const ANALYTICS_TOOLS = [
  { id: "analyticsHub",        icon: "📊", label: "Analytics Hub" },
  { id: "executiveDashboard",  icon: "🏢", label: "Executive Dashboard" },
  { id: "revenueAnalytics",    icon: "💰", label: "Revenue Analytics" },
  { id: "customerAnalytics",   icon: "👥", label: "Customer Analytics" },
  { id: "marketingAnalytics",  icon: "📣", label: "Marketing Analytics" },
  { id: "financialAnalytics",  icon: "📊", label: "Financial Analytics" },
  { id: "aiAnalytics",         icon: "🤖", label: "AI Analytics" },
  { id: "startupAnalytics",    icon: "🚀", label: "Startup Analytics" },
  { id: "trendAnalysis",       icon: "📈", label: "Trend Analysis" },
  { id: "analyticsReports",    icon: "📄", label: "Reports" },
];

const ACCOUNT_TOOLS = [
  { id: "userProfile",      icon: "👤", label: "My Profile" },
  { id: "accountSettings",  icon: "⚙️", label: "Account Settings" },
  { id: "securitySettings", icon: "🔐", label: "Security" },
  { id: "billing",          icon: "💳", label: "Billing & Plans" },
];

const BOTTOM_NAV = [
  { id: "help",           icon: "❓", label: "Help Center" },
  { id: "settings",       icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ workspace, setWorkspace, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen === false ? null : (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar${isOpen === false ? " sidebar--closed" : ""}`}
        aria-label="Main navigation"
        role="navigation"
      >
      <div className="sidebar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <span className="sidebar-logo">🚀</span>
        <span className="sidebar-title">VOXORA</span>
        {onClose && (
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {MAIN_NAV.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">AI Tools</div>
      <nav className="sidebar-nav">
        {AI_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Research</div>
      <nav className="sidebar-nav">
        {RESEARCH_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Strategy</div>
      <nav className="sidebar-nav">
        {STRATEGY_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Investor Studio</div>
      <nav className="sidebar-nav">
        {INVESTOR_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Financial Studio</div>
      <nav className="sidebar-nav">
        {FINANCIAL_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Marketing Studio</div>
      <nav className="sidebar-nav">
        {MARKETING_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Team Collaboration</div>
      <nav className="sidebar-nav">
        {TEAM_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Growth Studio</div>
      <nav className="sidebar-nav">
        {GROWTH_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">My Account</div>
      <nav className="sidebar-nav">
        {ACCOUNT_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Integrations Studio</div>
      <nav className="sidebar-nav">
        {INTEGRATIONS_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Analytics Studio</div>
      <nav className="sidebar-nav">
        {ANALYTICS_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-nav">
        {BOTTOM_NAV.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
        <button
          className="sidebar-item"
          onClick={() => navigate("/")}
          style={{ marginTop: 4 }}
        >
          <span className="sidebar-item-icon">🌐</span>
          <span className="sidebar-item-label">Home Page</span>
        </button>
      </nav>
    </aside>
    </>
  );
}
