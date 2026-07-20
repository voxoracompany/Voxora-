import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

interface SidebarProps {
  workspace: string;
  setWorkspace: (workspace: string) => void;
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

const BOTTOM_NAV = [
  { id: "help",           icon: "❓", label: "Help Center" },
  { id: "settings",       icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ workspace, setWorkspace }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
        <span className="sidebar-logo">🚀</span>
        <span className="sidebar-title">VOXORA</span>
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
  );
}
