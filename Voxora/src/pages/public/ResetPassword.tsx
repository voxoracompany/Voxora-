import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function ResetPassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    // Demo mode: update password in localStorage
    if (user) {
      localStorage.setItem(`voxora-auth-pw-${user.email}`, password);
    }
    setDone(true);
    setTimeout(() => navigate("/login"), 2500);
  };

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card">
          <div className="pub-auth-logo">VOXORA</div>
          <p className="pub-auth-subtitle">Create a new password</p>

          {!done ? (
            <>
              <h2>Reset password</h2>

              {error && (
                <div style={{
                  background: "#fef2f2", border: "1.5px solid #fecaca",
                  borderRadius: 10, padding: "10px 14px", fontSize: 13,
                  color: "#dc2626", marginBottom: 16, textAlign: "center",
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form className="pub-auth-form" onSubmit={handleSubmit}>
                <div>
                  <label className="pub-auth-label">New password</label>
                  <input
                    className="pub-auth-input"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="pub-auth-label">Confirm new password</label>
                  <input
                    className="pub-auth-input"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button className="pub-auth-submit" type="submit">
                  Reset Password →
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ marginBottom: 12 }}>Password updated!</h2>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                Your password has been reset successfully. Redirecting to sign in…
              </p>
            </div>
          )}

          <div className="pub-auth-footer">
            <Link to="/login">← Back to Sign In</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
