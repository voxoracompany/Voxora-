import { useRef, useState } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import { useProjects } from "../../context/ProjectContext";
import "./Workspace.css";
import "./Settings.css";

function applyTheme(theme: string, accent: string, fontSize: string) {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-hover", shadeColor(accent, -15));
  const sizeMap: Record<string, string> = { small: "14px", medium: "16px", large: "18px" };
  document.documentElement.style.setProperty("--font-size-base", sizeMap[fontSize] || "16px");
}

function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const ACCENT_PRESETS = [
  { label: "Voxora Purple", color: "#6C63FF" },
  { label: "Ocean Blue", color: "#2563EB" },
  { label: "Emerald", color: "#059669" },
  { label: "Rose", color: "#E11D48" },
  { label: "Amber", color: "#D97706" },
  { label: "Cyan", color: "#0891B2" },
];

export default function Settings({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { addActivity } = useActivity();
  const { showToast } = useToast();
  const { projects } = useProjects();
  const importRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(() => localStorage.getItem("voxora-name") || "");
  const [goal, setGoal] = useState(() => localStorage.getItem("voxora-goal") || "");
  const [theme, setTheme] = useState(() => localStorage.getItem("voxora-theme") || "light");
  const [accent, setAccent] = useState(() => localStorage.getItem("voxora-accent") || "#6C63FF");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("voxora-fontsize") || "medium");
  const [confirmClear, setConfirmClear] = useState(false);

  const saveProfile = () => {
    const trimmedName = name.trim().slice(0, 80);
    const trimmedGoal = goal.trim().slice(0, 200);
    if (!trimmedName) { showToast("Please enter your name.", "error"); return; }
    localStorage.setItem("voxora-name", trimmedName);
    localStorage.setItem("voxora-goal", trimmedGoal);
    setName(trimmedName);
    setGoal(trimmedGoal);
    addActivity({ type: "settings_updated", title: "Profile Updated", description: "User profile was updated.", category: "Projects", icon: "👤" });
    showToast("✅ Profile saved!");
  };

  const saveAppearance = () => {
    localStorage.setItem("voxora-theme", theme);
    localStorage.setItem("voxora-accent", accent);
    localStorage.setItem("voxora-fontsize", fontSize);
    applyTheme(theme, accent, fontSize);
    addActivity({ type: "settings_updated", title: "Appearance Updated", description: `Theme set to ${theme}, accent updated.`, category: "Projects", icon: "🎨" });
    showToast("🎨 Appearance saved!");
  };

  const handleThemeChange = (t: string) => {
    setTheme(t);
    applyTheme(t, accent, fontSize);
  };

  const handleAccentChange = (a: string) => {
    setAccent(a);
    applyTheme(theme, a, fontSize);
  };

  const handleFontSizeChange = (f: string) => {
    setFontSize(f);
    applyTheme(theme, accent, f);
  };

  const exportAllData = () => {
    try {
      const data = {
        version: "2.1.0",
        exportedAt: new Date().toISOString(),
        profile: {
          name: localStorage.getItem("voxora-name") || "",
          goal: localStorage.getItem("voxora-goal") || "",
          theme: localStorage.getItem("voxora-theme") || "light",
          accent: localStorage.getItem("voxora-accent") || "#6C63FF",
          fontsize: localStorage.getItem("voxora-fontsize") || "medium",
        },
        projects: JSON.parse(localStorage.getItem("voxora-projects") || "[]"),
        favorites: JSON.parse(localStorage.getItem("voxora-favorites") || "[]"),
        pinned: JSON.parse(localStorage.getItem("voxora-pinned") || "[]"),
        activities: JSON.parse(localStorage.getItem("voxora-activities") || "[]"),
        chat: JSON.parse(localStorage.getItem("voxora-chat") || "[]"),
        chatCount: Number(localStorage.getItem("voxora-chat-count")) || 0,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voxora-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addActivity({ type: "backup_exported", title: "Backup Exported", description: `Exported ${projects.length} projects and all data.`, category: "Projects", icon: "📥" });
      showToast("📥 Backup downloaded!");
    } catch {
      showToast("Failed to export backup.", "error");
    }
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) { showToast("Please upload a .json backup file.", "error"); return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.version || !Array.isArray(data.projects)) {
          showToast("Invalid backup file format.", "error");
          return;
        }
        if (data.profile) {
          if (data.profile.name) localStorage.setItem("voxora-name", String(data.profile.name).slice(0, 80));
          if (data.profile.goal) localStorage.setItem("voxora-goal", String(data.profile.goal).slice(0, 200));
          if (data.profile.theme) localStorage.setItem("voxora-theme", data.profile.theme);
          if (data.profile.accent) localStorage.setItem("voxora-accent", data.profile.accent);
          if (data.profile.fontsize) localStorage.setItem("voxora-fontsize", data.profile.fontsize);
        }
        if (Array.isArray(data.projects)) localStorage.setItem("voxora-projects", JSON.stringify(data.projects));
        if (Array.isArray(data.favorites)) localStorage.setItem("voxora-favorites", JSON.stringify(data.favorites));
        if (Array.isArray(data.pinned)) localStorage.setItem("voxora-pinned", JSON.stringify(data.pinned));
        if (Array.isArray(data.activities)) localStorage.setItem("voxora-activities", JSON.stringify(data.activities));
        if (Array.isArray(data.chat)) localStorage.setItem("voxora-chat", JSON.stringify(data.chat));
        if (data.chatCount) localStorage.setItem("voxora-chat-count", String(data.chatCount));
        showToast("✅ Backup restored! Reloading…", "success");
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        showToast("Failed to read backup file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const clearAllData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
      return;
    }
    const keys = ["voxora-projects","voxora-favorites","voxora-pinned","voxora-activities","voxora-chat","voxora-chat-count","voxora-name","voxora-goal","voxora-theme","voxora-accent","voxora-fontsize"];
    keys.forEach((k) => localStorage.removeItem(k));
    showToast("🗑️ All data cleared. Reloading…", "info");
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="workspace-container settings-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>⚙️ Settings</h1>
      <p className="workspace-subtitle">Customize your Voxora experience.</p>

      {/* ─── User Profile ─── */}
      <div className="settings-card">
        <h3>👤 User Profile</h3>
        <label className="settings-label">Your Name</label>
        <input
          className="workspace-input"
          placeholder="Enter your name…"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="settings-label">Business Goal</label>
        <input
          className="workspace-input"
          placeholder="What are you building?"
          value={goal}
          maxLength={200}
          onChange={(e) => setGoal(e.target.value)}
        />
        <button className="workspace-btn" style={{ marginTop: 16 }} onClick={saveProfile}>💾 Save Profile</button>
      </div>

      {/* ─── Appearance ─── */}
      <div className="settings-card">
        <h3>🎨 Appearance</h3>

        <label className="settings-label">Theme</label>
        <div className="theme-options">
          {[
            { val: "light", label: "☀️ Light" },
            { val: "dark", label: "🌙 Dark" },
          ].map((t) => (
            <label key={t.val} className={`theme-option ${theme === t.val ? "active" : ""}`}>
              <input type="radio" name="theme" value={t.val} checked={theme === t.val} onChange={() => handleThemeChange(t.val)} />
              {t.label}
            </label>
          ))}
        </div>

        <label className="settings-label">Accent Color</label>
        <div className="accent-presets">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.color}
              className={`accent-swatch ${accent === p.color ? "active" : ""}`}
              style={{ background: p.color }}
              title={p.label}
              onClick={() => handleAccentChange(p.color)}
            />
          ))}
          <input
            type="color"
            className="accent-custom"
            value={accent}
            onChange={(e) => handleAccentChange(e.target.value)}
            title="Custom color"
          />
        </div>

        <label className="settings-label">Font Size</label>
        <div className="fontsize-options">
          {[
            { val: "small", label: "Small", px: "14px" },
            { val: "medium", label: "Medium", px: "16px" },
            { val: "large", label: "Large", px: "18px" },
          ].map((f) => (
            <button
              key={f.val}
              className={`fontsize-btn ${fontSize === f.val ? "active" : ""}`}
              onClick={() => handleFontSizeChange(f.val)}
            >
              <span style={{ fontSize: f.px }}>{f.label}</span>
            </button>
          ))}
        </div>

        <button className="workspace-btn" style={{ marginTop: 16 }} onClick={saveAppearance}>🎨 Save Appearance</button>
      </div>

      {/* ─── Current Profile ─── */}
      <div className="settings-card current-profile">
        <h3>📋 Current Profile</h3>
        <p><strong>Name:</strong> {name || <span className="not-set">Not set</span>}</p>
        <p><strong>Goal:</strong> {goal || <span className="not-set">Not set</span>}</p>
        <p><strong>Theme:</strong> {theme}</p>
        <p><strong>Accent:</strong> <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: accent, verticalAlign: "middle", marginRight: 6 }} />{accent}</p>
        <p><strong>Font Size:</strong> {fontSize}</p>
      </div>

      {/* ─── Backup & Restore ─── */}
      <div className="settings-card">
        <h3>💾 Backup & Restore</h3>
        <p className="settings-desc">Export all your data as a JSON backup file. You can restore it later from any device.</p>
        <div className="backup-actions">
          <button className="backup-btn backup-export" onClick={exportAllData}>
            📥 Export Backup
          </button>
          <button className="backup-btn backup-import" onClick={() => importRef.current?.click()}>
            📤 Import Backup
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={importBackup}
          />
        </div>
        <p className="settings-hint">Backup includes all projects, favorites, pins, activities, chat history, and settings.</p>
      </div>

      {/* ─── Data Management ─── */}
      <div className="settings-card settings-danger-card">
        <h3>🗑️ Data Management</h3>
        <p className="settings-desc">Permanently delete all your Voxora data from this browser. This cannot be undone. Export a backup first.</p>
        <button
          className={`clear-btn ${confirmClear ? "confirm" : ""}`}
          onClick={clearAllData}
        >
          {confirmClear ? "⚠️ Click Again to Confirm — This Cannot Be Undone" : "🗑️ Clear All Data"}
        </button>
      </div>
    </div>
  );
}
