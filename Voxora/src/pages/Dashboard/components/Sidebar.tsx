import "./Sidebar.css";

interface SidebarProps {
  setWorkspace: (workspace: string) => void;
  workspace: string;
}

type NavItem = {
  label: string;
  icon: string;
  id: string;
};

const NAV_ITEMS: NavItem[] = [
  { icon: "🏠", label: "Dashboard",          id: "dashboard" },
  { icon: "📁", label: "Saved Projects",     id: "saved" },
  { icon: "✍️", label: "AI Content",         id: "content" },
  { icon: "💡", label: "App Ideas",          id: "apps" },
  { icon: "🚀", label: "Startup Ideas",      id: "startup" },
  { icon: "👤", label: "Customer Persona",   id: "persona" },
  { icon: "🔍", label: "Customer Research",  id: "research" },
  { icon: "📊", label: "Market Research",    id: "market" },
  { icon: "📈", label: "Product Validation", id: "validation" },
  { icon: "🗺️", label: "Product Roadmap",   id: "productRoadmap" },
  { icon: "📊", label: "Business Model",     id: "business" },
  { icon: "📋", label: "SWOT Analysis",      id: "swot" },
  { icon: "🏆", label: "Competitor Analysis",id: "competitor" },
  { icon: "🤖", label: "AI Assistant",       id: "assistant" },
];

const BOTTOM_ITEMS: NavItem[] = [
  { icon: "🔍", label: "Smart Search",       id: "search" },
  { icon: "📊", label: "Analytics",          id: "analytics" },
  { icon: "🔔", label: "Activity Center",    id: "activity" },
  { icon: "📤", label: "Export Center",      id: "export" },
  { icon: "⚙️", label: "Settings",          id: "settings" },
];

export default function Sidebar({ setWorkspace, workspace }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🚀</span>
        <span className="sidebar-title">Voxora AI</span>
      </div>

      <div className="sidebar-section-label">Workspaces</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
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

      <div className="sidebar-section-label">Tools</div>
      <nav className="sidebar-nav">
        {BOTTOM_ITEMS.map((item) => (
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
    </aside>
  );
}
