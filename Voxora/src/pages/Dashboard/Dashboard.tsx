import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import FeatureCard from "./components/FeatureCard";
import AIContent from "../Workspaces/AIContent";
import AppIdeas from "../Workspaces/AppIdeas";
import StartupIdeas from "../Workspaces/StartupIdeas";
import SavedProjects from "../Workspaces/SavedProjects";
import { useProjects } from "../../context/ProjectContext";
import "./Dashboard.css";

const Dashboard = () => {
  const [workspace, setWorkspace] = useState("dashboard");
const { projects } = useProjects();
  return (
    <div className="dashboard">
      <Sidebar setWorkspace={setWorkspace} />

      <main className="main-content">
        <TopBar />

        {workspace === "dashboard" && (
          <>
            <h1>Welcome to Voxora</h1>
            <p>Create ideas, build projects, and grow with AI.</p>

            <div className="cards">
              <FeatureCard
                title="AI Content Ideas"
                description="Generate creative content concepts."
                buttonText="Generate"
                onClick={() => setWorkspace("content")}
              />

              <FeatureCard
                title="App Ideas"
                description="Discover new app concepts."
                buttonText="Create"
                onClick={() => setWorkspace("apps")}
              />

              <FeatureCard
                title="Startup Ideas"
                description="Create and explore business ideas."
                buttonText="Explore"
                onClick={() => setWorkspace("startup")}
              />
            </div>
          <div className="stats">

  <div className="stat-card">
    <h3>Total Projects</h3>
    <p>{projects.length}</p>
  </div>

  <div className="stat-card">
    <h3>AI Tools</h3>
    <p>3</p>
  </div>

  <div className="stat-card">
    <h3>Saved Ideas</h3>
    <p>{projects.length}</p>
  </div>

</div>
          <h2>Recent Projects</h2>
          {projects.length === 0 ? (
            <p>No saved projects yet.</p>
          ) : (
          projects.slice(-3).map((project, index) => (
          <p key={index}>{project}</p>
  ))
  )}
          </>
        )}

        {workspace === "content" && <AIContent />}
        {workspace === "apps" && <AppIdeas />}
        {workspace === "startup" && <StartupIdeas />}
        {workspace === "saved" && <SavedProjects />}
      </main>
    </div>
  );
};