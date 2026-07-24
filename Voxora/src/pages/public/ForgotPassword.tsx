import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo mode: simulate email sent
    setSent(true);
  };

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card">
          <div className="pub-auth-logo">VOXORA</div>
          <p className="pub-auth-subtitle">We'll send you a reset link</p>

          {!sent ? (
            <>
              <h2>Forgot password?</h2>
              <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
                Enter your account email and we'll send you a link to reset your password.
              </p>

              <form className="pub-auth-form" onSubmit={handleSubmit}>
                <div>
                  <label className="pub-auth-label">Email address</label>
                  <input
                    className="pub-auth-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button className="pub-auth-submit" type="submit">
                  Send Reset Link →
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
              <h2 style={{ marginBottom: 12 }}>Check your inbox</h2>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
                If <strong>{email}</strong> is associated with a Voxora account, you'll receive a
                password reset email within a few minutes. Check your spam folder if you don't see it.
              </p>
              <div style={{
                background: "#eff6ff", border: "1.5px solid #bfdbfe",
                borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#1d4ed8", marginBottom: 20,
              }}>
                💡 <strong>Demo mode:</strong> No real email is sent. Use the reset link below.
              </div>
              <Link
                to="/reset-password"
                style={{
                  display: "inline-block", padding: "11px 24px", background: "#6C63FF",
                  color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14,
                  textDecoration: "none", marginBottom: 16,
                }}
              >
                Go to Reset Password →
              </Link>
            </div>
          )}

          <div className="pub-auth-footer">
            Remember your password? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
