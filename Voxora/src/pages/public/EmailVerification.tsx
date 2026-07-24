import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PublicNav from "../../components/PublicNav";
import PublicFooter from "../../components/PublicFooter";
import "./public-pages.css";

export default function EmailVerification() {
  const { user, updateProfile } = useAuth();
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = () => {
    // Demo: mark email as verified
    updateProfile({ emailVerified: true });
    setVerified(true);
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  if (user?.emailVerified || verified) {
    return (
      <div className="pub-page">
        <PublicNav />
        <div className="pub-auth-wrap">
          <div className="pub-auth-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 12 }}>Email Verified!</h2>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
              Your email address has been verified. Your account is now fully active.
            </p>
            <Link
              to="/dashboard"
              style={{
                display: "inline-block", padding: "12px 28px", background: "#6C63FF",
                color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 14,
                textDecoration: "none",
              }}
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="pub-page">
      <PublicNav />

      <div className="pub-auth-wrap">
        <div className="pub-auth-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📧</div>
          <div className="pub-auth-logo" style={{ marginBottom: 8 }}>VOXORA</div>
          <h2 style={{ marginBottom: 12 }}>Verify your email</h2>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 24 }}>
            We sent a verification link to{" "}
            <strong>{user?.email || "your email address"}</strong>.
            Click the link to activate your account.
          </p>

          <div style={{
            background: "#eff6ff", border: "1.5px solid #bfdbfe",
            borderRadius: 12, padding: "12px 16px", fontSize: 13,
            color: "#1d4ed8", marginBottom: 24,
          }}>
            💡 <strong>Demo mode:</strong> Click the button below to simulate verification.
          </div>

          <button
            className="pub-auth-submit"
            style={{ marginBottom: 12 }}
            onClick={handleVerify}
          >
            ✅ Simulate Email Verification
          </button>

          <button
            type="button"
            onClick={handleResend}
            style={{
              width: "100%", padding: "12px", border: "1.5px solid #e5e7eb",
              borderRadius: 12, background: resent ? "#f0fdf4" : "#f9fafb",
              fontSize: 14, fontWeight: 600,
              color: resent ? "#059669" : "#374151",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {resent ? "✅ Resent!" : "🔄 Resend Verification Email"}
          </button>

          <div className="pub-auth-footer" style={{ marginTop: 20 }}>
            <Link to="/dashboard">Skip for now →</Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
