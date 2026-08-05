import React from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";

interface CommandCenterProps {
  setWorkspace: (workspace: string) => void;
}

export default function CommandCenter({
  setWorkspace,
}: CommandCenterProps) {
  const { projects, favorites, pinned } = useProjects();
  const { activities } = useActivity();

  const recentProjects = [...projects].slice(-5).reverse();

  return (
    <div className="workspace">
      <h1>🚀 Voxora Command Center</h1>

      <p>
        Welcome back! Manage your AI workspace, startups, projects and
        business tools from one place.
      </p>

      {/* Welcome Banner */}

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          borderRadius: "16px",
          background: "linear-gradient(135deg,#2563eb,#7c3aed)",
          color: "#ffffff",
        }}
      >
        <h2>👋 Welcome Back</h2>

        <p>
          Voxora is ready to help you build startups, launch products,
          create content and grow your business with AI.
        </p>
      </div>

      {/* Dashboard Statistics */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "16px",
          marginTop: "30px",
        }}
      >
        <div className="stat-card">
          <h3>📁 Projects</h3>
          <h1>{projects.length}</h1>
          <p>Total Projects</p>
        </div>

        <div className="stat-card">
          <h3>⭐ Favorites</h3>
          <h1>{favorites.length}</h1>
          <p>Saved Favorites</p>
        </div>

        <div className="stat-card">
          <h3>📌 Pinned</h3>
          <h1>{pinned.length}</h1>
          <p>Pinned Projects</p>
        </div>

        <div className="stat-card">
          <h3>🤖 AI Status</h3>
          <h1>Ready</h1>
          <p>Assistant Online</p>
        </div>
      </div>
      {/* Quick Actions */}

      <div style={{ marginTop: "40px" }}>
        <h2>⚡ Quick Actions</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <button onClick={() => setWorkspace("assistant")}>
            🤖 AI Assistant
          </button>

          <button onClick={() => setWorkspace("startup")}>
            🚀 Startup Studio
          </button>

          <button onClick={() => setWorkspace("research")}>
            🔍 Customer Research
          </button>

          <button onClick={() => setWorkspace("marketingHub")}>
            📢 Marketing Studio
          </button>

          <button onClick={() => setWorkspace("financialStudio")}>
            💰 Financial Studio
          </button>

          <button onClick={() => setWorkspace("analyticsHub")}>
            📊 Analytics Studio
          </button>

          <button onClick={() => setWorkspace("teamHub")}>
            👥 Team Collaboration
          </button>

          <button onClick={() => setWorkspace("integrationsHub")}>
            🔌 Integrations
          </button>

          <button onClick={() => setWorkspace("billing")}>
            💳 Billing
          </button>

          <button onClick={() => setWorkspace("adminDashboard")}>
            🛡️ Admin Center
          </button>
        </div>
      </div>
      {/* Recent Projects */}

      <div style={{ marginTop: "40px" }}>
        <h2>📁 Recent Projects</h2>

        {recentProjects.length === 0 ? (
          <p>No projects yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {recentProjects.map((project) => (
              <div
                key={project.id}
                style={{
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  background: "#ffffff",
                }}
              >
                <h3>{project.title}</h3>

                <p>{project.category}</p>

                <small>{project.createdAt}</small>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Recent Activity */}

      <div style={{ marginTop: "40px" }}>
        <h2>🕒 Recent Activity</h2>

        {activities.length === 0 ? (
          <p>No recent activity yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {activities
              .slice()
              .reverse()
              .slice(0, 5)
              .map((activity) => (
                <div
                  key={activity.id}
                  style={{
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    background: "#ffffff",
                  }}
                >
                  <strong>{activity.title}</strong>

                  <p>{activity.description}</p>

                  <small>{activity.timestamp}</small>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Today's Focus */}

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          borderRadius: "12px",
          background: "#f8fafc",
        }}
      >
        <h2>📈 Today's Focus</h2>

        <ul style={{ marginTop: "20px" }}>
          <li>✅ Continue your latest project</li>
          <li>🤖 Ask AI Assistant for new ideas</li>
          <li>📊 Review your analytics</li>
          <li>💰 Update your financial forecast</li>
          <li>📢 Plan today's marketing campaign</li>
        </ul>
      </div>
    </div>
  );
}