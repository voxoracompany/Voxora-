// ── V4.9 Security Settings ────────────────────────────────────────────────────
import { useState } from "react";
import { useAuth, type LoginHistoryEntry } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SecuritySettings({ setWorkspace }: Props) {
  const { user, loginHistory, updateProfile } = useAuth();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [activeTab, setActiveTab] = useState<"sessions" | "history" | "twofa" | "settings">("sessions");
  const [twoFAStep, setTwoFAStep] = useState<"idle" | "setup" | "verify">("idle");
  const [verifyCode, setVerifyCode] = useState("");

  const enable2FA = () => {
    if (verifyCode === "123456") {
      updateProfile({ twoFAEnabled: true });
      addActivity({ type: "settings_updated", title: "2FA Enabled", description: "Two-factor authentication activated.", category: "Projects", icon: "🔐" });
      showToast("✅ Two-factor authentication enabled!");
      setTwoFAStep("idle");
      setVerifyCode("");
    } else {
      showToast("Incorrect code. (Hint: 123456 in demo mode)", "error");
    }
  };

  const disable2FA = () => {
    updateProfile({ twoFAEnabled: false });
    addActivity({ type: "settings_updated", title: "2FA Disabled", description: "Two-factor authentication deactivated.", category: "Projects", icon: "🔓" });
    showToast("2FA has been disabled.");
  };

  const SESSIONS = [
    { id: "s1", device: "Current session", browser: "Chrome — This device", location: "Active now", current: true },
    { id: "s2", device: "Mobile (iOS)",    browser: "Safari",                  location: "3 days ago",    current: false },
    { id: "s3", device: "Mac",             browser: "Firefox",                 location: "1 week ago",   current: false },
  ];

  const TABS = [
    { id: "sessions", icon: "💻", label: "Sessions"   },
    { id: "history",  icon: "📋", label: "Login History" },
    { id: "twofa",    icon: "🔐", label: "2FA"         },
    { id: "settings", icon: "⚙️", label: "Settings"   },
  ] as const;

  return (
    <div className="workspace-container" style={{ maxWidth: 760 }}>
      <button className="back-btn" onClick={() => setWorkspace("accountSettings")}>← Back to Account</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 24, color: "#fff",
      }}>
        <div style={{ fontSize: 42, marginBottom: 10 }}>🔐</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Security Settings</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, opacity: 0.85 }}>
          Manage your sessions, login history, and two-factor authentication.
        </p>
      </div>

      {/* Security score */}
      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <p className="stat-value">{user?.twoFAEnabled ? "Strong" : "Fair"}</p>
          <h3 className="stat-label">Security Level</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💻</div>
          <p className="stat-value">{SESSIONS.length}</p>
          <h3 className="stat-label">Active Sessions</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <p className="stat-value">{loginHistory.length}</p>
          <h3 className="stat-label">Login Events</h3>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <p className="stat-value" style={{ fontSize: 13 }}>{user?.twoFAEnabled ? "On" : "Off"}</p>
          <h3 className="stat-label">2FA Status</h3>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#f3f4f6", borderRadius: 14, padding: 4 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 13,
            background: activeTab === tab.id ? "#fff" : "transparent",
            color: activeTab === tab.id ? "#111827" : "#6b7280",
            boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Sessions */}
      {activeTab === "sessions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {SESSIONS.map(s => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
              background: "#fff", border: `1.5px solid ${s.current ? "#c4b5fd" : "#e5e7eb"}`,
              borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 28 }}>💻</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                  {s.device}
                  {s.current && <span style={{ marginLeft: 8, fontSize: 11, background: "#ede9fe", color: "#6C63FF", borderRadius: 6, padding: "2px 8px", fontWeight: 700 }}>CURRENT</span>}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{s.browser}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{s.location}</div>
              </div>
              {!s.current && (
                <button onClick={() => showToast("Session revoked (simulated).")}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
          <button className="workspace-btn" style={{ background: "#dc2626", marginTop: 8 }}
            onClick={() => showToast("All other sessions revoked (simulated).")}>
            🚪 Sign Out All Other Sessions
          </button>
        </div>
      )}

      {/* Login History */}
      {activeTab === "history" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {loginHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
              <p>No login history yet.</p>
            </div>
          ) : (
            loginHistory.slice(0, 20).map((entry: LoginHistoryEntry) => (
              <div key={entry.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "13px 16px",
                background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12,
              }}>
                <span style={{ fontSize: 20 }}>{entry.status === "success" ? "✅" : "❌"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{entry.device}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{entry.location}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: entry.status === "success" ? "#d1fae5" : "#fee2e2",
                    color: entry.status === "success" ? "#065f46" : "#991b1b",
                    marginBottom: 4,
                  }}>
                    {entry.status.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{timeAgo(entry.timestamp)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2FA */}
      {activeTab === "twofa" && (
        <div>
          <div style={{
            background: user?.twoFAEnabled ? "#f0fdf4" : "#fffbeb",
            border: `1.5px solid ${user?.twoFAEnabled ? "#bbf7d0" : "#fde68a"}`,
            borderRadius: 14, padding: "20px 24px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 36 }}>{user?.twoFAEnabled ? "🔐" : "🔓"}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                  Two-Factor Authentication — {user?.twoFAEnabled ? "Enabled ✅" : "Disabled"}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                  {user?.twoFAEnabled
                    ? "Your account is protected by 2FA. We'll ask for a code when you sign in."
                    : "Add an extra layer of security. We recommend enabling 2FA."}
                </div>
              </div>
            </div>
          </div>

          {!user?.twoFAEnabled ? (
            <>
              {twoFAStep === "idle" && (
                <button className="workspace-btn" onClick={() => setTwoFAStep("setup")}>
                  🔐 Enable Two-Factor Authentication
                </button>
              )}
              {twoFAStep === "setup" && (
                <div style={{ background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "24px" }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}>📱 Set Up Authenticator App</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                    Scan the QR code below with Google Authenticator, Authy, or 1Password, then enter the 6-digit code.
                  </p>
                  {/* Placeholder QR code */}
                  <div style={{
                    width: 160, height: 160, background: "#f3f4f6", border: "2px solid #e5e7eb",
                    borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 48, marginBottom: 20,
                  }}>
                    📱
                  </div>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
                    Demo mode: Enter <strong>123456</strong> as the code.
                  </p>
                  <div className="workspace-form">
                    <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Verification Code</label>
                    <input className="workspace-input" placeholder="000000" maxLength={6}
                      value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      style={{ letterSpacing: 6, fontSize: 20, textAlign: "center" }} />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="workspace-btn" onClick={enable2FA}>✅ Verify & Enable</button>
                      <button className="workspace-btn" style={{ background: "#6b7280" }} onClick={() => setTwoFAStep("idle")}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <button className="workspace-btn" style={{ background: "#dc2626" }} onClick={disable2FA}>
              🔓 Disable Two-Factor Authentication
            </button>
          )}
        </div>
      )}

      {/* Security Settings */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Login alerts",       desc: "Get notified when a new device signs in to your account", enabled: true  },
            { label: "Suspicious activity", desc: "Alert me about failed login attempts",                   enabled: true  },
            { label: "Session timeout",    desc: "Auto sign out after 7 days of inactivity",                enabled: false },
          ].map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
              background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 14,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{item.desc}</div>
              </div>
              <button onClick={() => showToast(`${item.label} toggled (simulated).`)} style={{
                width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                background: item.enabled ? "#6C63FF" : "#d1d5db", position: "relative",
              }}>
                <span style={{
                  position: "absolute", top: 3, left: item.enabled ? 20 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff", display: "block",
                }} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
