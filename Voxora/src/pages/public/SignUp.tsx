import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (!result.ok) { if (result.error) setError(result.error); return; }
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const result = await signUp(form.name, form.email, form.password, form.username);
      if (!result.ok) { setError(result.error || "Sign up failed."); return; }
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card">
          <div className="pub-auth-logo">VOXORA</div>
          <p className="pub-auth-subtitle">Start building with AI today — it's free</p>

          <h2>Create your account</h2>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16, textAlign: "center",
            }}>
              ⚠️ {error}
            </div>
          )}

          <form className="pub-auth-form" onSubmit={handleSubmit}>
            <div>
              <label className="pub-auth-label">Full name</label>
              <input
                className="pub-auth-input"
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="pub-auth-label">Username</label>
              <input
                className="pub-auth-input"
                type="text"
                placeholder="janesmith"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.replace(/\s/g, "").toLowerCase() }))}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="pub-auth-label">Email address</label>
              <input
                className="pub-auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button className="pub-auth-submit" type="submit" disabled={loading}>
              {loading ? <><span className="auth-spinner" aria-hidden="true" />Signing you in...</> : "Create Account →"}
            </button>
          </form>

          <div className="pub-auth-divider" style={{ marginTop: 20 }}>or</div>

          <button
            type="button"
            disabled={googleLoading}
            style={{
              width: "100%", padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 12,
              background: "#fff", fontSize: 14, fontWeight: 600, color: "#374151",
              cursor: googleLoading ? "wait" : "pointer", marginTop: 12, display: "flex",
              alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { if (!googleLoading) (e.currentTarget as HTMLButtonElement).style.borderColor = "#6C63FF"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; }}
            onClick={handleGoogleSignIn}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            {googleLoading ? <><span className="auth-spinner auth-spinner--dark" aria-hidden="true" />Signing you in...</> : "Sign up with Google"}
          </button>

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
