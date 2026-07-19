import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [googleNote, setGoogleNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) localStorage.setItem("voxora-name", form.name.trim());
    navigate("/dashboard");
  };

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card">
          <div className="pub-auth-logo">🚀 VOXORA</div>
          <p className="pub-auth-subtitle">Start building with AI today — it's free</p>

          <h2>Create your account</h2>

          <form className="pub-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="pub-auth-label">Full name</label>
              <input
                className="pub-auth-input"
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="pub-auth-label">Email address</label>
              <input
                className="pub-auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="pub-auth-label">Password</label>
              <input
                className="pub-auth-input"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button className="pub-auth-submit" type="submit">Create Account →</button>
          </form>

          <div className="pub-auth-divider" style={{ marginTop: 20 }}>or</div>

          <button
            type="button"
            style={{
              width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 12,
              background: "#f9fafb", fontSize: 14, fontWeight: 600, color: "#9ca3af",
              cursor: "not-allowed", marginTop: 12, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, fontFamily: "inherit", opacity: 0.7,
            }}
            onClick={() => setGoogleNote(true)}
          >
            <span>🌐</span> Sign up with Google
            <span style={{ fontSize: 10, background: "#e5e7eb", color: "#6b7280", borderRadius: 6, padding: "2px 7px", marginLeft: 4, fontWeight: 700, letterSpacing: 0.5 }}>COMING SOON</span>
          </button>
          {googleNote && (
            <p style={{ fontSize: 12, color: "#6C63FF", textAlign: "center", marginTop: 8 }}>
              Google sign-up is coming soon. Please create your account with email above.
            </p>
          )}

          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            By creating an account you agree to our{" "}
            <Link to="/terms" style={{ color: "#6C63FF" }}>Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" style={{ color: "#6C63FF" }}>Privacy Policy</Link>.
          </p>

          <div className="pub-auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
