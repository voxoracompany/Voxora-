import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
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
  { id: "startup",        icon: "✨", label: "Startup Ideas" },
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
  { id: "business",            icon: "🏢", label: "Business Model"       },
  { id: "productRoadmap",      icon: "🗺️", label: "Product Roadmap"      },
  { id: "businessPlanGenerator", icon: "📋", label: "AI Business Plan"   },
];

const MARKETING_STUDIO_TOOLS = [
  { id: "marketingStudio",    icon: "📣", label: "Marketing Studio"          },
  { id: "brandIdentityGen",   icon: "🎨", label: "Brand Identity Generator"  },
  { id: "landingPageGen",     icon: "🖥️", label: "Landing Page Generator"   },
  { id: "marketingCopyGen",   icon: "✍️", label: "Marketing Copy Generator" },
  { id: "emailCampaignGen",   icon: "📧", label: "Email Campaign Generator"  },
  { id: "socialMediaPlanner", icon: "📅", label: "Social Media Planner"      },
  { id: "seoToolkit",         icon: "🔍", label: "SEO Toolkit"               },
];

const INVESTOR_STUDIO_TOOLS = [
  { id: "investorStudio",     icon: "🚀", label: "Investor Studio"         },
  { id: "pitchDeckGenerator", icon: "🎯", label: "Pitch Deck Generator"    },
  { id: "execSummaryGen",     icon: "📄", label: "Executive Summary"       },
  { id: "elevatorPitch",      icon: "🎤", label: "Elevator Pitch"          },
  { id: "fundingCalculator",  icon: "💰", label: "Funding Calculator"      },
  { id: "investorReadiness",  icon: "📊", label: "Investor Readiness Score"},
];

const INVESTOR_TOOLS = [
  { id: "investorHub",         icon: "💼", label: "Investor Hub" },
  { id: "fundraisingStrategy", icon: "✨", label: "Fundraising Strategy" },
  { id: "investorNarrative",   icon: "📖", label: "Investor Narrative" },
  { id: "termSheet",           icon: "📋", label: "Term Sheet Guide" },
  { id: "dueDiligence",        icon: "✅", label: "Due Diligence" },
  { id: "capTable",            icon: "📊", label: "Cap Table" },
];

const OPS_TOOLS = [
  { id: "opsStudio",       icon: "⚙️",  label: "Operations Studio"    },
  { id: "opsTaskManager",  icon: "✅",  label: "Task Manager"          },
  { id: "opsKanban",       icon: "📋",  label: "Kanban Board"          },
  { id: "opsSOP",          icon: "📄",  label: "SOP Builder"           },
  { id: "opsWorkflow",     icon: "🔄",  label: "Workflow Builder"      },
  { id: "opsTeam",         icon: "👥",  label: "Team Manager"          },
  { id: "opsPerformance",  icon: "📊",  label: "Performance Dashboard" },
];

const HR_PEOPLE_TOOLS = [
  { id: "hrStudio",      icon: "👥",  label: "HR & People Studio"   },
  { id: "hrEmployees",   icon: "👤",  label: "Employee Manager"     },
  { id: "hrRecruitment", icon: "🎯",  label: "Recruitment Manager"  },
  { id: "hrAttendance",  icon: "🕐",  label: "Attendance Manager"   },
  { id: "hrLeave",       icon: "🏖️", label: "Leave Manager"        },
  { id: "hrPayroll",     icon: "💵",  label: "Payroll Manager"      },
  { id: "hrPerformance", icon: "⭐",  label: "Performance Review"   },
  { id: "hrReports",     icon: "📊",  label: "HR Reports"           },
];

const SALES_CRM_TOOLS = [
  { id: "salesCRM",             icon: "🤝", label: "Sales & CRM Studio"    },
  { id: "crmLeadManager",       icon: "👤", label: "Lead Manager"           },
  { id: "crmPipeline",          icon: "📊", label: "Sales Pipeline"         },
  { id: "crmContacts",          icon: "📇", label: "Contact Manager"        },
  { id: "crmMeetings",          icon: "📅", label: "Meeting Planner"        },
  { id: "crmProposals",         icon: "📝", label: "Proposal Generator"     },
  { id: "crmAnalytics",         icon: "📈", label: "CRM Analytics"          },
  { id: "crmTasks",             icon: "✅", label: "Task Manager"           },
  { id: "crmExport",            icon: "📤", label: "CRM Export"             },
];

const FINANCIAL_STUDIO_V63 = [
  { id: "financialStudio",          icon: "💰", label: "Financial Studio"         },
  { id: "financialDashboard",       icon: "📊", label: "Financial Dashboard"      },
  { id: "revenueForecast",          icon: "📈", label: "Revenue Forecast"         },
  { id: "startupCostCalculator",    icon: "🧮", label: "Startup Cost Calculator"  },
  { id: "breakEvenCalculator",      icon: "⚖️", label: "Break-Even Calculator"   },
  { id: "pricingStrategyGenerator", icon: "🏷️", label: "Pricing Strategy"        },
  { id: "cashFlowPlanner",          icon: "💸", label: "Cash Flow Planner"        },
  { id: "financialHealthScore",     icon: "💯", label: "Financial Health Score"   },
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
  // ── V8.3 Integrations Marketplace ────────────────────────────────────────
  { id: "intDashboard",     icon: "📊", label: "Integrations Dashboard" },
  { id: "integrationsHub",  icon: "🔌", label: "Integrations Hub" },
  { id: "intMonitoring",    icon: "📡", label: "Monitoring" },
  { id: "intWebhooks",      icon: "🔗", label: "Webhooks" },
  { id: "intSettings",      icon: "⚙️", label: "Integration Settings" },
  // ── Automation ────────────────────────────────────────────────────────────
  { id: "automation",       icon: "⚡", label: "Automation Engine" },
  // ── AI Providers ──────────────────────────────────────────────────────────
  { id: "intOpenAI",        icon: "🧠", label: "OpenAI" },
  { id: "intGemini",        icon: "♊", label: "Google Gemini" },
  { id: "intAnthropic",     icon: "🤖", label: "Anthropic Claude" },
  // ── Cloud Storage ─────────────────────────────────────────────────────────
  { id: "intGoogleDrive",   icon: "🗂️", label: "Google Drive" },
  { id: "intDropbox",       icon: "📦", label: "Dropbox" },
  { id: "intNotion",        icon: "📄", label: "Notion" },
  // ── Communication & Developer ─────────────────────────────────────────────
  { id: "intSlack",         icon: "💬", label: "Slack" },
  { id: "intZapier",        icon: "⚡", label: "Zapier" },
  { id: "intGoogleCal",     icon: "📅", label: "Google Calendar" },
  { id: "intOutlook",       icon: "📧", label: "Microsoft Outlook" },
  { id: "intGitHub",        icon: "🐙", label: "GitHub" },
];

const ANALYTICS_TOOLS = [
  { id: "analyticsHub",        icon: "📊", label: "Analytics Hub" },
  { id: "executiveDashboard",  icon: "🏢", label: "Executive Dashboard" },
  { id: "revenueAnalytics",    icon: "💰", label: "Revenue Analytics" },
  { id: "customerAnalytics",   icon: "👥", label: "Customer Analytics" },
  { id: "marketingAnalytics",  icon: "📣", label: "Marketing Analytics" },
  { id: "financialAnalytics",  icon: "📊", label: "Financial Analytics" },
  { id: "aiAnalytics",         icon: "🤖", label: "AI Analytics" },
  { id: "startupAnalytics",    icon: "✨", label: "Startup Analytics" },
  { id: "trendAnalysis",       icon: "📈", label: "Trend Analysis" },
  { id: "analyticsReports",    icon: "📄", label: "Reports" },
];

const ACCOUNT_TOOLS = [
  { id: "userProfile",      icon: "👤", label: "My Profile" },
  { id: "accountSettings",  icon: "⚙️", label: "Account Settings" },
  { id: "securitySettings", icon: "🔐", label: "Security" },
  { id: "billing",          icon: "💳", label: "Billing & Plans" },
];

const BETA_TOOLS = [
  { id: "gettingStarted", icon: "🗺️", label: "Getting Started" },
  { id: "feedback",       icon: "💬", label: "Feedback Center" },
  { id: "trust",          icon: "🔒", label: "Trust Center" },
];

const ADMIN_TOOLS = [
  { id: "adminDashboard",     icon: "🏛️", label: "Admin Dashboard"     },
  { id: "userManagement",     icon: "👥", label: "User Management"     },
  { id: "systemMonitoring",   icon: "📡", label: "System Monitoring"   },
  { id: "auditLogs",          icon: "📋", label: "Audit Logs"          },
  { id: "notificationCenter", icon: "🔔", label: "Notification Center" },
  { id: "featureFlags",       icon: "🚩", label: "Feature Flags"       },
  { id: "admin",              icon: "🛠️", label: "Dev Panel"           },
];

const LAUNCH_TOOLS = [
  { id: "launchChecklist",     icon: "✅", label: "Launch Checklist"    },
  { id: "healthCheck",         icon: "🏥", label: "Health Check"        },
  { id: "deploymentChecklist", icon: "✨", label: "Deployment Checklist"},
  { id: "errorReporting",      icon: "🚨", label: "Error Reporting"     },
  { id: "documentationCenter", icon: "📚", label: "Documentation"       },
  { id: "betaReadinessReport", icon: "📋", label: "Beta Readiness"      },
];

// ── V9.0 Public Beta Launch ────────────────────────────────────────────────────
const V90_TOOLS = [
  { id: "aiProviderStatus",    icon: "🤖", label: "AI Provider Status"  },
  { id: "gettingStarted",      icon: "🗺️", label: "Getting Started"    },
  { id: "feedback",            icon: "💬", label: "Feedback Center"     },
];

const SUPPORT_STUDIO_TOOLS = [
  { id: "supportStudio",        icon: "🎧", label: "Customer Support Studio" },
  { id: "aiSupportAssistant",   icon: "🤖", label: "AI Support Assistant"    },
  { id: "supportTickets",       icon: "🎫", label: "Ticket Manager"          },
  { id: "supportKB",            icon: "📚", label: "Knowledge Base"          },
  { id: "liveChat",             icon: "💬", label: "Live Chat Manager"       },
  { id: "customerFeedback",     icon: "⭐", label: "Customer Feedback"       },
  { id: "supportAnalytics",     icon: "📊", label: "Support Analytics"       },
];

// ── V8.2 Enterprise AI Automation ─────────────────────────────────────────────
const ENTERPRISE_AI_TOOLS = [
  { id: "aiAgents",          icon: "🤖", label: "AI Agents"            },
  { id: "automation",        icon: "⚡", label: "Automation Engine"     },
  { id: "scheduledTasks",    icon: "⏰", label: "Scheduled Tasks"       },
  { id: "enterpriseMemory",  icon: "🧠", label: "Enterprise AI Memory" },
];

const BOTTOM_NAV = [
  { id: "help",           icon: "❓", label: "Help Center" },
  { id: "settings",       icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ workspace, setWorkspace, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) closeButtonRef.current?.focus();
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
        <span className="sidebar-logo">V</span>
        <span className="sidebar-title">VOXORA</span>
        {onClose && (
          <button
            ref={closeButtonRef}
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
            aria-current={workspace === item.id ? "page" : undefined}
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
            aria-current={workspace === item.id ? "page" : undefined}
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

      <div className="sidebar-section-label">📣 Marketing Studio (V6.2)</div>
      <nav className="sidebar-nav">
        {MARKETING_STUDIO_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">🚀 Pitch Studio (V6.1)</div>
      <nav className="sidebar-nav">
        {INVESTOR_STUDIO_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">⚙️ Operations Studio (V6.5)</div>
      <nav className="sidebar-nav">
        {OPS_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">👥 HR &amp; People Studio (V6.6)</div>
      <nav className="sidebar-nav">
        {HR_PEOPLE_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">🤝 Sales & CRM Studio (V6.4)</div>
      <nav className="sidebar-nav">
        {SALES_CRM_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">💰 Financial Studio (V6.3)</div>
      <nav className="sidebar-nav">
        {FINANCIAL_STUDIO_V63.map((item) => (
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

      <div className="sidebar-section-label">Financial Studio (Legacy)</div>
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

      <div className="sidebar-section-label">🤖 Enterprise AI (V8.2)</div>
      <nav className="sidebar-nav">
        {ENTERPRISE_AI_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">Launch & Quality</div>
      <nav className="sidebar-nav">
        {LAUNCH_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">Admin & Monitoring</div>
      <nav className="sidebar-nav">
        {ADMIN_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">🎧 Customer Support Studio (V6.7)</div>
      <nav className="sidebar-nav">
        {SUPPORT_STUDIO_TOOLS.map((item) => (
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

      <div className="sidebar-section-label">🚀 V9.0 Public Beta</div>
      <nav className="sidebar-nav">
        {V90_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
            aria-label={item.label}
          >
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-label">Beta & Support</div>
      <nav className="sidebar-nav">
        {BETA_TOOLS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${workspace === item.id ? "active" : ""}`}
            onClick={() => setWorkspace(item.id)}
            aria-label={item.label}
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

        {isAuthenticated && (
          <button
            className="sidebar-item sidebar-item--logout"
            onClick={handleLogout}
            style={{ marginTop: 4 }}
          >
            <span className="sidebar-item-icon">🚪</span>
            <span className="sidebar-item-label">Log Out</span>
          </button>
        )}
      </nav>
    </aside>
    </>
  );
}
