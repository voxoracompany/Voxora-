import { useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./Workspace.css";
import "./Settings.css";

export default function Settings({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [name, setName] = useState(() => localStorage.getItem("voxora-name") || "");
  const [goal, setGoal] = useState(() => localStorage.getItem("voxora-goal") || "");
  const [theme, setTheme] = useState(() => localStorage.getItem("voxora-theme") || "light");

  const saveSettings = () => {
    localStorage.setItem("voxora-name", name);
    localStorage.setItem("voxora-goal", goal);
    localStorage.setItem("voxora-theme", theme);
    addActivity({
      type: "settings_updated",
      title: "Settings Updated",
      description: "User profile and preferences were updated.",
      category: "Projects",
      icon: "⚙️",
    });
    showToast("⚙️ Settings saved!");
  };

  return (
    <div className="workspace-container settings-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>⚙️ Settings</h1>
      <p className="workspace-subtitle">Customize your Voxora experience.</p>

      <div className="settings-card">
        <h3>👤 User Profile</h3>
        <label className="settings-label">Your Name</label>
        <input
          className="workspace-input"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="settings-label">Business Goal</label>
        <input
          className="workspace-input"
          placeholder="What are you building?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <div className="settings-card">
        <h3>🎨 Appearance</h3>
        <label className="settings-label">Theme</label>
        <div className="theme-options">
          {["light", "dark"].map((t) => (
            <label key={t} className={`theme-option ${theme === t ? "active" : ""}`}>
              <input type="radio" name="theme" value={t} checked={theme === t} onChange={() => setTheme(t)} />
              {t === "light" ? "☀️ Light" : "🌙 Dark"}
            </label>
          ))}
        </div>
      </div>

      <div className="settings-card current-profile">
        <h3>📋 Current Profile</h3>
        <p><strong>Name:</strong> {name || <span className="not-set">Not set</span>}</p>
        <p><strong>Goal:</strong> {goal || <span className="not-set">Not set</span>}</p>
        <p><strong>Theme:</strong> {theme}</p>
      </div>

      <button className="workspace-btn" onClick={saveSettings}>💾 Save Settings</button>
    </div>
  );
}
