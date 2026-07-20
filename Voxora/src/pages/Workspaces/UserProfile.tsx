// ── V4.9 User Profile ─────────────────────────────────────────────────────────
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useActivity } from "../../context/ActivityContext";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

const AVATAR_EMOJIS = ["🚀","😊","🦁","🐬","🦊","🐉","🎯","⚡","🔥","🌟","💎","🎸"];

export default function UserProfile({ setWorkspace }: Props) {
  const { user, updateProfile, getProfileCompletion } = useAuth();
  const { showToast } = useToast();
  const { addActivity } = useActivity();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [company, setCompany] = useState(user?.company || "");
  const [role, setRole] = useState(user?.role || "");
  const [avatarEmoji, setAvatarEmoji] = useState(user?.avatarEmoji || "🚀");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const completion = getProfileCompletion();

  const save = () => {
    if (!name.trim()) { showToast("Name cannot be empty.", "error"); return; }
    updateProfile({ name: name.trim(), username: username.trim(), bio: bio.trim(), company: company.trim(), role: role.trim(), avatarEmoji });
    addActivity({ type: "settings_updated", title: "Profile Updated", description: "User profile saved.", category: "Projects", icon: "👤" });
    showToast("✅ Profile saved!");
  };

  return (
    <div className="workspace-container" style={{ maxWidth: 720 }}>
      <button className="back-btn" onClick={() => setWorkspace("accountSettings")}>← Back to Account</button>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #4c1d95 100%)",
        borderRadius: 20, padding: "32px 30px", marginBottom: 28, color: "#fff",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        {/* Avatar */}
        <div
          style={{
            width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, cursor: "pointer", border: "3px solid rgba(255,255,255,0.3)",
            flexShrink: 0, transition: "background 0.2s",
          }}
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          title="Change avatar"
        >
          {avatarEmoji}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{user?.name || "Your Profile"}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, opacity: 0.85 }}>@{user?.username || "username"}</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.7 }}>{user?.email}</p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: completion >= 80 ? "#34d399" : "#fbbf24" }}>
            {completion}%
          </div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: "#374151" }}>Profile Completion</span>
          <span style={{ color: completion >= 80 ? "#059669" : "#d97706" }}>{completion}%</span>
        </div>
        <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4, transition: "width 0.5s",
            width: `${completion}%`,
            background: completion >= 80 ? "#10b981" : "linear-gradient(90deg, #f59e0b, #f97316)",
          }} />
        </div>
      </div>

      {/* Avatar picker */}
      {showAvatarPicker && (
        <div style={{
          background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 16,
          padding: "16px 20px", marginBottom: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: "#374151" }}>Choose Avatar</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {AVATAR_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { setAvatarEmoji(e); setShowAvatarPicker(false); }}
                style={{
                  fontSize: 28, width: 48, height: 48, borderRadius: 12, border: "none",
                  cursor: "pointer", background: avatarEmoji === e ? "#ede9fe" : "#f9fafb",
                  transition: "all 0.15s",
                }}
              >{e}</button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 10 }}>
            📸 Photo upload coming in V5.0
          </p>
        </div>
      )}

      {/* Form */}
      <div className="workspace-form">
        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Full Name *</label>
        <input className="workspace-input" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Username</label>
        <input className="workspace-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="janesmith" />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Email</label>
        <input className="workspace-input" value={user?.email || ""} readOnly style={{ opacity: 0.6, cursor: "not-allowed" }} />
        <p style={{ fontSize: 12, color: "#9ca3af", marginTop: -10 }}>Email cannot be changed in demo mode.</p>

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Bio</label>
        <textarea
          className="workspace-textarea"
          style={{ minHeight: 80 }}
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Tell us a bit about yourself…"
        />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Company</label>
        <input className="workspace-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Inc." />

        <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Role / Job Title</label>
        <input className="workspace-input" value={role} onChange={e => setRole(e.target.value)} placeholder="Founder & CEO" />

        <button className="workspace-btn" onClick={save}>💾 Save Profile</button>
      </div>

      {/* Account info */}
      <div style={{
        background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 14,
        padding: "16px 20px", marginTop: 8,
      }}>
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#374151" }}>📋 Account Info</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 13, color: "#6b7280" }}>
          <span>Member since:</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
          </span>
          <span>Email verified:</span>
          <span style={{ color: user?.emailVerified ? "#059669" : "#d97706", fontWeight: 600 }}>
            {user?.emailVerified ? "✅ Verified" : "⚠️ Pending"}
          </span>
          <span>2FA:</span>
          <span style={{ color: user?.twoFAEnabled ? "#059669" : "#6b7280", fontWeight: 600 }}>
            {user?.twoFAEnabled ? "✅ Enabled" : "○ Disabled"}
          </span>
        </div>
      </div>
    </div>
  );
}
