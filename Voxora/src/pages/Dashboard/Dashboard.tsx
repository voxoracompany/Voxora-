import { useActivity } from "../../context/ActivityContext";
import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FeatureCard from "./components/FeatureCard";
import AIContent from "../Workspaces/AIContent";
import AppIdeas from "../Workspaces/AppIdeas";
import StartupIdeas from "../Workspaces/StartupIdeas";
import SavedProjects from "../Workspaces/SavedProjects";
import CustomerResearch from "../Workspaces/CustomerResearch";
import MarketResearch from "../Workspaces/MarketResearch";
import AIAssistant from "../Workspaces/AIAssistant";
import Settings from "../Workspaces/Settings";
import ProductValidation from "../Workspaces/ProductValidation";
import CustomerPersona from "../Workspaces/CustomerPersona";
import BusinessModelCanvas from "../Workspaces/BusinessModelCanvas";
import CompetitorAnalysis from "../Workspaces/CompetitorAnalysis";
import SWOTAnalysis from "../Workspaces/SWOTAnalysis";
import ProductRoadmap from "../Workspaces/ProductRoadmap";
import ActivityCenter from "../Workspaces/ActivityCenter";
import AnalyticsDashboard from "../Workspaces/AnalyticsDashboard";
import SmartSearch from "../Workspaces/SmartSearch";
import ExportCenter from "../Workspaces/ExportCenter";
import { useProjects } from "../../context/ProjectContext";
import "./Dashboard.css";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Dashboard = () => {
  const userName = localStorage.getItem("voxora-name") || "";
  const [workspace, setWorkspace] = useState("dashboard");
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();

  const stats = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    const aiSessions = Number(localStorage.getItem("voxora-chat-count")) || 0;
    const thisWeek = projects.filter((p) => new Date(p.createdAt) >= weekStart).length;
    return { aiSessions, thisWeek };
  }, [projects]);

  const recentProjects = useMemo(
    () => [...projects].reverse().slice(0, 3),
    [projects]
  );

  return (
    <div className="dashboard">
      <Sidebar setWorkspace={setWorkspace} workspace={workspace} />

      <main className="main-content">
        <TopBar setWorkspace={setWorkspace} />

        {workspace === "dashboard" && (
          <>
            <div className="welcome-section">
              <h1>Welcome back{userName ? `, ${userName}` : ""} 🚀</h1>
              <p className="welcome-sub">Your AI-powered workspace for ideas, research, and strategy.</p>
            </div>

            {/* Stats row */}
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

            {/* Quick Actions */}
            <div className="quick-actions">
              <h2>⚡ Quick Actions</h2>
              <div className="cards">
                <FeatureCard title="✍️ AI Content Ideas"    description="Generate creative content concepts."                     buttonText="Open"     onClick={() => setWorkspace("content")} />
                <FeatureCard title="💡 App Ideas"           description="Discover and create new app concepts."                   buttonText="Open"     onClick={() => setWorkspace("apps")} />
                <FeatureCard title="🚀 Startup Ideas"       description="Explore business opportunities."                         buttonText="Open"     onClick={() => setWorkspace("startup")} />
                <FeatureCard title="🔍 Customer Research"   description="Understand customers and their needs."                   buttonText="Research" onClick={() => setWorkspace("research")} />
                <FeatureCard title="📋 SWOT Analysis"       description="Analyze strengths, weaknesses, opportunities, threats."  buttonText="Analyze"  onClick={() => setWorkspace("swot")} />
                <FeatureCard title="🏆 Competitor Analysis" description="Analyze competitors before building."                    buttonText="Analyze"  onClick={() => setWorkspace("competitor")} />
                <FeatureCard title="📊 Business Model"      description="Generate a complete Business Model Canvas."              buttonText="Open"     onClick={() => setWorkspace("business")} />
                <FeatureCard title="🗺️ Product Roadmap"    description="Build a step-by-step development plan."                  buttonText="Plan"     onClick={() => setWorkspace("productRoadmap")} />
                <FeatureCard title="🤖 AI Assistant"        description="Ask Voxora anything about your business."               buttonText="Chat"     onClick={() => setWorkspace("assistant")} />
                <FeatureCard title="📤 Export Center"       description="Export your projects as PDF, Markdown, or Text."        buttonText="Export"   onClick={() => setWorkspace("export")} />
              </div>
            </div>

            {/* Recent Projects */}
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

        {workspace === "content"       && <AIContent         setWorkspace={setWorkspace} />}
        {workspace === "apps"          && <AppIdeas          setWorkspace={setWorkspace} />}
        {workspace === "startup"       && <StartupIdeas      setWorkspace={setWorkspace} />}
        {workspace === "validation"    && <ProductValidation setWorkspace={setWorkspace} />}
        {workspace === "persona"       && <CustomerPersona   setWorkspace={setWorkspace} />}
        {workspace === "saved"         && <SavedProjects     setWorkspace={setWorkspace} />}
        {workspace === "research"      && <CustomerResearch  setWorkspace={setWorkspace} />}
        {workspace === "assistant"     && <AIAssistant       setWorkspace={setWorkspace} />}
        {workspace === "business"      && <BusinessModelCanvas setWorkspace={setWorkspace} />}
        {workspace === "settings"      && <Settings          setWorkspace={setWorkspace} />}
        {workspace === "competitor"    && <CompetitorAnalysis setWorkspace={setWorkspace} />}
        {workspace === "market"        && <MarketResearch    setWorkspace={setWorkspace} />}
        {workspace === "swot"          && <SWOTAnalysis      setWorkspace={setWorkspace} />}
        {workspace === "productRoadmap"&& <ProductRoadmap    setWorkspace={setWorkspace} />}
        {workspace === "activity"      && <ActivityCenter    setWorkspace={setWorkspace} />}
        {workspace === "analytics"     && <AnalyticsDashboard setWorkspace={setWorkspace} />}
        {workspace === "search"        && <SmartSearch       setWorkspace={setWorkspace} />}
        {workspace === "export"        && <ExportCenter      setWorkspace={setWorkspace} />}
      </main>
    </div>
  );
};

export default Dashboard;
