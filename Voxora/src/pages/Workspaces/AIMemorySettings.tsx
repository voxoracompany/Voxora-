// ── V5.6 AI Memory Settings Workspace ────────────────────────────────────────
import { useState, useCallback } from "react";
import { MemoryService } from "../../services/memory/MemoryService";
import { MemoryExport } from "../../services/memory/MemoryExport";
import { AIMemory } from "../../services/ai/AIMemory";
import { AIContextManager } from "../../services/ai/AIContextManager";
import { useToast } from "../../context/ToastContext";
import "./AIMemorySettings.css";

interface Props { setWorkspace: (w: string) => void }

const SETTINGS_KEY = "voxora-memory-settings";

interface MemSettings {
  memoryEnabled: boolean;
  autoSaveConversations: boolean;
  contextDepth: number;
  retentionDays: number; // 0 = forever
}

const DEFAULTS: MemSettings = {
  memoryEnabled: true,
  autoSaveConversations: true,
  contextDepth: 20,
  retentionDays: 0,
};

function loadSettings(): MemSettings {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") }; }
  catch { return DEFAULTS; }
}
function saveSettings(s: MemSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function getMemorySettings(): MemSettings {
  return loadSettings();
}

export default function AIMemorySettings({ setWorkspace }: Props) {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<MemSettings>(loadSettings);
  const [memStats] = useState(() => MemoryService.getStats());
  const [convCount] = useState(() => AIMemory.getAll().length);
  const [archCount] = useState(() => AIMemory.getArchived().length);
  const [confirmClear, setConfirmClear] = useState<"memory" | "conversations" | "all" | null>(null);

  const update = useCallback(<K extends keyof MemSettings>(key: K, val: MemSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: val };
      saveSettings(next);
      return next;
    });
  }, []);

  const exportJSON = () => {
    try { MemoryExport.downloadJSON(); showToast("Memory exported as JSON!"); }
    catch { showToast("Export failed.", "error"); }
  };
  const exportCSV = () => {
    try { MemoryExport.downloadCSV(); showToast("Memory exported as CSV!"); }
    catch { showToast("Export failed.", "error"); }
  };

  const clearMemory = () => {
    MemoryService.deleteAll();
    setConfirmClear(null);
    showToast("Project memory cleared.", "info");
  };
  const clearConversations = () => {
    AIMemory.getAll().forEach(c => AIMemory.delete(c.id));
    AIMemory.getArchived().forEach(c => AIMemory.delete(c.id));
    AIContextManager.clearAll();
    localStorage.removeItem("voxora-chat");
    localStorage.removeItem("voxora-active-conv");
    setConfirmClear(null);
    showToast("AI conversations cleared.", "info");
  };
  const clearAll = () => {
    clearMemory();
    clearConversations();
    localStorage.removeItem("voxora-ai-recent-prompts");
    localStorage.removeItem("voxora-ai-fav-prompts");
    setConfirmClear(null);
    showToast("All memory cleared.", "info");
  };

  const memSizeLabel = MemoryExport.getSizeLabel();

  return (
    <div className="ams-container">
      <button className="back-btn" onClick={() => setWorkspace("aiSettings")}>← Back to AI Settings</button>

      <div className="ams-header">
        <h1>🧠 AI Memory Settings</h1>
        <p className="ams-subtitle">Control how Voxora remembers your projects, conversations, and business context.</p>
      </div>

      {/* Stats */}
      <div className="ams-stats-row">
        <div className="ams-stat">
          <span className="ams-stat-value">{memStats.total}</span>
          <span className="ams-stat-label">Memory Items</span>
        </div>
        <div className="ams-stat">
          <span className="ams-stat-value">{convCount}</span>
          <span className="ams-stat-label">AI Conversations</span>
        </div>
        <div className="ams-stat">
          <span className="ams-stat-value">{archCount}</span>
          <span className="ams-stat-label">Archived</span>
        </div>
        <div className="ams-stat">
          <span className="ams-stat-value">{memStats.favourites}</span>
          <span className="ams-stat-label">Favourites</span>
        </div>
        <div className="ams-stat">
          <span className="ams-stat-value">{memSizeLabel}</span>
          <span className="ams-stat-label">Memory Size</span>
        </div>
      </div>

      {/* Settings */}
      <div className="ams-card">
        <h2 className="ams-card-title">⚙️ Memory Preferences</h2>

        <div className="ams-setting">
          <div className="ams-setting-info">
            <strong>Enable Memory</strong>
            <p>Allow Voxora to store project memory, notes, and generated content for future AI context.</p>
          </div>
          <label className="ams-toggle">
            <input type="checkbox" checked={settings.memoryEnabled} onChange={e => update("memoryEnabled", e.target.checked)} />
            <span className="ams-toggle-slider" />
          </label>
        </div>

        <div className="ams-setting">
          <div className="ams-setting-info">
            <strong>Auto-save Conversations</strong>
            <p>Automatically save AI conversations to memory so you can search and reference them later.</p>
          </div>
          <label className="ams-toggle">
            <input type="checkbox" checked={settings.autoSaveConversations} onChange={e => update("autoSaveConversations", e.target.checked)} />
            <span className="ams-toggle-slider" />
          </label>
        </div>

        <div className="ams-setting ams-setting--vertical">
          <div className="ams-setting-info">
            <strong>Context Depth</strong>
            <p>Number of previous messages to inject into each AI request for conversation continuity.</p>
          </div>
          <div className="ams-select-row">
            {[5, 10, 20].map(n => (
              <button
                key={n}
                className={`ams-choice-btn ${settings.contextDepth === n ? "active" : ""}`}
                onClick={() => update("contextDepth", n)}
              >
                {n} messages
              </button>
            ))}
          </div>
        </div>

        <div className="ams-setting ams-setting--vertical">
          <div className="ams-setting-info">
            <strong>Memory Retention</strong>
            <p>How long to keep memory items before they are eligible for cleanup.</p>
          </div>
          <div className="ams-select-row">
            {[
              { label: "1 Week", days: 7 },
              { label: "1 Month", days: 30 },
              { label: "3 Months", days: 90 },
              { label: "Forever", days: 0 },
            ].map(o => (
              <button
                key={o.days}
                className={`ams-choice-btn ${settings.retentionDays === o.days ? "active" : ""}`}
                onClick={() => update("retentionDays", o.days)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="ams-card">
        <h2 className="ams-card-title">📤 Export Memory</h2>
        <p className="ams-card-desc">Download a copy of all your project memory and AI conversations.</p>
        <div className="ams-action-row">
          <button className="ams-btn ams-btn--primary" onClick={exportJSON}>⬇ Export as JSON</button>
          <button className="ams-btn ams-btn--outline" onClick={exportCSV}>⬇ Export as CSV</button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="ams-card ams-card--danger">
        <h2 className="ams-card-title ams-card-title--danger">⚠️ Danger Zone</h2>
        <p className="ams-card-desc">These actions are permanent and cannot be undone.</p>

        <div className="ams-danger-row">
          <div>
            <strong>Delete Project Memory</strong>
            <p>Remove all saved memory items ({memStats.total} items, {memSizeLabel}).</p>
          </div>
          <button className="ams-btn ams-btn--danger" onClick={() => setConfirmClear("memory")}>Delete Memory</button>
        </div>

        <div className="ams-danger-row">
          <div>
            <strong>Delete AI Conversations</strong>
            <p>Remove all saved conversations ({convCount} active, {archCount} archived) and context history.</p>
          </div>
          <button className="ams-btn ams-btn--danger" onClick={() => setConfirmClear("conversations")}>Delete Conversations</button>
        </div>

        <div className="ams-danger-row">
          <div>
            <strong>Delete All Memory</strong>
            <p>Remove all memory items, conversations, recent prompts, and favourites.</p>
          </div>
          <button className="ams-btn ams-btn--danger" onClick={() => setConfirmClear("all")}>Delete Everything</button>
        </div>
      </div>

      {/* Confirm modal */}
      {confirmClear && (
        <div className="ams-overlay">
          <div className="ams-confirm-modal">
            <h3>⚠️ Confirm Deletion</h3>
            <p>
              {confirmClear === "memory" && "This will permanently delete all project memory items."}
              {confirmClear === "conversations" && "This will permanently delete all AI conversations and context history."}
              {confirmClear === "all" && "This will permanently delete ALL memory, conversations, prompts, and favourites."}
            </p>
            <p style={{ fontWeight: 700, color: "#ef4444" }}>This cannot be undone.</p>
            <div className="ams-confirm-actions">
              <button className="ams-btn ams-btn--ghost" onClick={() => setConfirmClear(null)}>Cancel</button>
              <button className="ams-btn ams-btn--danger" onClick={
                confirmClear === "memory" ? clearMemory :
                confirmClear === "conversations" ? clearConversations :
                clearAll
              }>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
