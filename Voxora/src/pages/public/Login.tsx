import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store a name for dashboard welcome; in a real app this would be authenticated
    localStorage.setItem("voxora-name", form.email.split("@")[0]);
    navigate("/dashboard");
  };

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card">
          <div className="pub-auth-logo">🚀 VOXORA</div>
          <p className="pub-auth-subtitle">Sign in to your workspace</p>

          <h2>Welcome back</h2>

          <form className="pub-auth-form" onSubmit={handleSubmit}>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label className="pub-auth-label" style={{ margin: 0 }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: "#6C63FF" }}>Forgot password?</a>
              </div>
              <input
                className="pub-auth-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button className="pub-auth-submit" type="submit">Sign In →</button>
          </form>

          <div className="pub-auth-divider" style={{ marginTop: 20 }}>or</div>

          <button
            style={{
              width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 12,
              background: "#fff", fontSize: 14, fontWeight: 600, color: "#374151",
              cursor: "pointer", marginTop: 12, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 8, fontFamily: "inherit",
            }}
            onClick={() => navigate("/dashboard")}
          >
            <span>🌐</span> Continue with Google
          </button>

          <div className="pub-auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">Sign up free</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
