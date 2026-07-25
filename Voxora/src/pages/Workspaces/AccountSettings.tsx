// ── V4.9 Account Settings ────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";
import "./Settings.css";

interface Props { setWorkspace: (w: string) => void }

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Dubai", "Australia/Sydney",
];

export default function AccountSettings({ setWorkspace }: Props) {
  const { user, logout, updateProfile, changePassword, deleteAccount, reauthenticate, reauthenticateWithGoogle } = useAuth();
  const { showToast } = useToast();
  const { addActivity } = useActivity();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "preferences" | "danger">("profile");

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(user?.notifEmail ?? true);
  const [notifBrowser, setNotifBrowser] = useState(user?.notifBrowser ?? true);
  const [notifWeekly, setNotifWeekly] = useState(user?.notifWeeklyReport ?? true);

  // Preferences
  const [language, setLanguage] = useState(user?.language || "en");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reauthentication modal (shown when Firebase requires recent login before deletion)
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState("");

  const TABS = [
    { id: "profile",       icon: "👤", label: "Profile" },
    { id: "password",      icon: "🔑", label: "Password" },
    { id: "notifications", icon: "🔔", label: "Notifications" },
    { id: "preferences",   icon: "⚙️", label: "Preferences" },
    { id: "danger",        icon: "⚠️", label: "Danger Zone" },
  ] as const;

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { showToast("Passwords do not match.", "error"); return; }
    setPwLoading(true);
    const result = await changePassword(currentPw, newPw);
    setPwLoading(false);
    if (!result.ok) { showToast(result.error || "Failed.", "error"); return; }
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    addActivity({ type: "settings_updated", title: "Password Changed", description: "Account password updated.", category: "Projects", icon: "🔑" });
    showToast("✅ Password changed successfully!");
  };

  const saveNotifications = () => {
    updateProfile({ notifEmail, notifBrowser, notifWeeklyReport: notifWeekly });
    addActivity({ type: "settings_updated", title: "Notification Preferences Saved", description: "Notification settings updated.", category: "Projects", icon: "🔔" });
    showToast("✅ Notification preferences saved!");
  };

  const savePreferences = () => {
    updateProfile({ language, timezone });
    addActivity({ type: "settings_updated", title: "Preferences Saved", description: `Language: ${language}, Timezone: ${timezone}`, category: "Projects", icon: "⚙️" });
    showToast("✅ Preferences saved!");
  };

  // Internal helper — performs the deletion and handles the success/error path
  const doDeleteAccount = async () => {
    const result = await deleteAccount();
    if (!result.ok) {
      // Firebase requires a fresh login before deletion
      if (result.error === "auth/requires-recent-login") {
        setShowReauthModal(true);
        return;
      }
      showToast(result.error || "Unable to delete your account.", "error");
      return;
    }
    showToast("✅ Your account has been permanently deleted.", "success");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.toLowerCase() !== "delete my account") {
      showToast("Please type the confirmation phrase exactly.", "error"); return;
    }
    setDeleteLoading(true);
    try {
      await doDeleteAccount();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to delete your account.";
      showToast(message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Reauthenticate with password then retry deletion
  const handleReauthPasswordAndDelete = async () => {
    if (!reauthPassword.trim()) { setReauthError("Please enter your password."); return; }
    setReauthLoading(true);
    setReauthError("");
    try {
      const r = await reauthenticate(reauthPassword);
      if (!r.ok) { setReauthError(r.error || "Incorrect password."); return; }
      setShowReauthModal(false);
      setReauthPassword("");
      await doDeleteAccount();
    } catch (e: unknown) {
      setReauthError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setReauthLoading(false);
    }
  };

  // Reauthenticate with Google then retry deletion
  const handleReauthGoogleAndDelete = async () => {
    setReauthLoading(true);
    setReauthError("");
    try {
      const r = await reauthenticateWithGoogle();
      if (!r.ok) { setReauthError(r.error || "Google authentication failed."); return; }
      setShowReauthModal(false);
      await doDeleteAccount();
    } catch (e: unknown) {
      setReauthError(e instanceof Error ? e.message : "Authentication failed.");
    } finally {
      setReauthLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 760 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #4c1d95 100%)",
        borderRadius: 20, padding: "28px 30px", marginBottom: 24, color: "#fff",
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0,
        }}>
          {user?.avatarEmoji || user?.name?.charAt(0).toUpperCase() || "V"}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Account Settings</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.8 }}>{user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setWorkspace("userProfile")}
            style={{
              padding: "8px 16px", background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)", borderRadius: 10,
              color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            👤 Profile
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px", background: "rgba(239,68,68,0.8)",
              border: "none", borderRadius: 10,
              color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 2, marginBottom: 24, background: "#f3f4f6",
        borderRadius: 14, padding: 4, flexWrap: "wrap",
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, minWidth: 80, padding: "8px 4px", borderRadius: 10, border: "none",
            cursor: "pointer", fontWeight: 600, fontSize: 13,
            background: activeTab === tab.id ? "#fff" : "transparent",
            color: activeTab === tab.id ? (tab.id === "danger" ? "#dc2626" : "#111827") : "#6b7280",
            boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === "profile" && (
        <div>
          <div className="settings-card">
            <h3>👤 Profile Overview</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px", fontSize: 14, color: "#374151" }}>
              <span style={{ color: "#9ca3af" }}>Name</span>     <span style={{ fontWeight: 600 }}>{user?.name || "—"}</span>
              <span style={{ color: "#9ca3af" }}>Username</span> <span style={{ fontWeight: 600 }}>@{user?.username || "—"}</span>
              <span style={{ color: "#9ca3af" }}>Email</span>    <span style={{ fontWeight: 600 }}>{user?.email}</span>
              <span style={{ color: "#9ca3af" }}>Company</span>  <span style={{ fontWeight: 600 }}>{user?.company || "—"}</span>
              <span style={{ color: "#9ca3af" }}>Role</span>     <span style={{ fontWeight: 600 }}>{user?.role || "—"}</span>
              <span style={{ color: "#9ca3af" }}>Bio</span>      <span style={{ fontWeight: 500 }}>{user?.bio || "—"}</span>
            </div>
            <button className="workspace-btn" style={{ marginTop: 16 }} onClick={() => setWorkspace("userProfile")}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* ── Password tab ── */}
      {activeTab === "password" && (
        <div className="settings-card">
          <h3>🔑 Change Password</h3>
          <div className="workspace-form">
            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Current Password</label>
            <input className="workspace-input" type="password" placeholder="Your current password"
              value={currentPw} onChange={e => setCurrentPw(e.target.value)} />

            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>New Password</label>
            <input className="workspace-input" type="password" placeholder="Min. 8 characters"
              value={newPw} onChange={e => setNewPw(e.target.value)} />

            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Confirm New Password</label>
            <input className="workspace-input" type="password" placeholder="Repeat new password"
              value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />

            <button className="workspace-btn" onClick={handleChangePassword} disabled={pwLoading || !currentPw || !newPw || !confirmPw}>
              {pwLoading ? "Updating…" : "🔑 Update Password"}
            </button>
          </div>
        </div>
      )}

      {/* ── Notifications tab ── */}
      {activeTab === "notifications" && (
        <div className="settings-card">
          <h3>🔔 Notification Preferences</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
            {[
              { label: "Email Notifications", desc: "Receive updates and reports via email", val: notifEmail, set: setNotifEmail },
              { label: "Browser Notifications", desc: "Push notifications in your browser", val: notifBrowser, set: setNotifBrowser },
              { label: "Weekly Report", desc: "Get a weekly summary of your Voxora activity", val: notifWeekly, set: setNotifWeekly },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1.5px solid #e5e7eb",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{item.desc}</div>
                </div>
                <button onClick={() => item.set(!item.val)} style={{
                  width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                  background: item.val ? "#6C63FF" : "#d1d5db", transition: "background 0.2s", position: "relative",
                }}>
                  <span style={{
                    position: "absolute", top: 3, left: item.val ? 20 : 3,
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    transition: "left 0.2s", display: "block",
                  }} />
                </button>
              </div>
            ))}
          </div>
          <button className="workspace-btn" onClick={saveNotifications}>💾 Save Preferences</button>
        </div>
      )}

      {/* ── Preferences tab ── */}
      {activeTab === "preferences" && (
        <div className="settings-card">
          <h3>⚙️ Language & Region</h3>
          <div className="workspace-form">
            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Language</label>
            <select className="workspace-input" value={language} onChange={e => setLanguage(e.target.value)} style={{ cursor: "pointer" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Time Zone</label>
            <select className="workspace-input" value={timezone} onChange={e => setTimezone(e.target.value)} style={{ cursor: "pointer" }}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>

            <button className="workspace-btn" onClick={savePreferences}>💾 Save Preferences</button>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#fef9c3", borderRadius: 10, border: "1.5px solid #fde68a" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e" }}>
              🌍 <strong>Theme</strong> is managed in <button onClick={() => setWorkspace("settings")} style={{ background: "none", border: "none", color: "#6C63FF", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13 }}>Appearance Settings</button>
            </p>
          </div>
        </div>
      )}

      {/* ── Danger Zone ── */}
      {activeTab === "danger" && (
        <div className="settings-card settings-danger-card">
          <h3>⚠️ Danger Zone</h3>
          <p className="settings-desc">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          {!deleteConfirm ? (
            <button className="clear-btn" onClick={() => setDeleteConfirm(true)}>
              🗑️ Delete Account
            </button>
          ) : (
            <div className="account-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
              <h4 id="delete-account-title">Delete your Voxora account?</h4>
              <p style={{ fontSize: 14, color: "#dc2626", fontWeight: 600, marginBottom: 10 }}>
                This permanently deletes your Firebase Authentication account and all associated Firestore data.
              </p>
              <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 10 }}>
                Type <strong>delete my account</strong> to confirm:
              </p>
              <input
                className="workspace-input"
                placeholder="delete my account"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                style={{ borderColor: "#fecaca", marginBottom: 12 }}
                autoFocus
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button className="clear-btn confirm" onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteInput.toLowerCase() !== "delete my account"}>
                  {deleteLoading ? "Deleting..." : "⚠️ Permanently Delete"}
                </button>
                <button className="workspace-btn" style={{ background: "#6b7280" }}
                  onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                  disabled={deleteLoading}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reauthentication Modal ── */}
      {showReauthModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}
          onClick={e => { if (e.target === e.currentTarget && !reauthLoading) { setShowReauthModal(false); setReauthPassword(""); setReauthError(""); } }}
        >
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, maxWidth: 420, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
            role="dialog" aria-modal="true" aria-labelledby="reauth-modal-title"
          >
            <h3 id="reauth-modal-title" style={{ margin: "0 0 8px", fontSize: 18, color: "#111827" }}>
              🔐 Confirm Your Identity
            </h3>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
              For your security, please verify your identity before we permanently delete your account.
            </p>

            {/* Password reauthentication */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Enter your password
              </label>
              <input
                className="workspace-input"
                type="password"
                placeholder="Your current password"
                value={reauthPassword}
                onChange={e => { setReauthPassword(e.target.value); setReauthError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleReauthPasswordAndDelete(); }}
                autoFocus
                disabled={reauthLoading}
                style={{ marginBottom: 0 }}
              />
            </div>

            {reauthError && (
              <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 12px", fontWeight: 500 }}>
                ⚠️ {reauthError}
              </p>
            )}

            <button
              className="clear-btn confirm"
              onClick={handleReauthPasswordAndDelete}
              disabled={reauthLoading || !reauthPassword.trim()}
              style={{ width: "100%", marginBottom: 10 }}
            >
              {reauthLoading ? "Verifying…" : "Confirm & Delete Account"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>

            <button
              onClick={handleReauthGoogleAndDelete}
              disabled={reauthLoading}
              style={{
                width: "100%", padding: "10px 16px", border: "1.5px solid #d1d5db",
                borderRadius: 8, background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Sign in with Google instead
            </button>

            <button
              onClick={() => { setShowReauthModal(false); setReauthPassword(""); setReauthError(""); }}
              disabled={reauthLoading}
              style={{
                width: "100%", background: "none", border: "none", color: "#6b7280",
                fontSize: 13, cursor: "pointer", padding: "6px 0",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
