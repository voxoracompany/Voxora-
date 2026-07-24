// ── 404 Not Found ─────────────────────────────────────────────────────────────
import { Link, useNavigate } from "react-router-dom";
import "./public/public-pages.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, sans-serif",
      padding: "40px 20px", textAlign: "center",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(108,99,255,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 32, letterSpacing: -0.5 }}>
          VOXORA
        </div>

        <div style={{
          fontSize: "clamp(80px, 15vw, 140px)", fontWeight: 900, lineHeight: 1,
          background: "linear-gradient(135deg, #6C63FF, #a855f7)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
          Page not found
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 420, margin: "0 auto 40px", lineHeight: 1.65 }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "13px 26px", background: "#6C63FF", color: "#fff", border: "none",
              borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 14px rgba(108,99,255,0.4)", fontFamily: "inherit",
            }}
          >
            ← Go Back
          </button>
          <Link
            to="/"
            style={{
              padding: "13px 26px", background: "rgba(255,255,255,0.1)",
              color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 12, fontSize: 15, fontWeight: 600,
              textDecoration: "none", display: "inline-flex", alignItems: "center",
            }}
          >
            🏠 Home
          </Link>
          <Link
            to="/dashboard"
            style={{
              padding: "13px 26px", background: "rgba(255,255,255,0.1)",
              color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)",
              borderRadius: 12, fontSize: 15, fontWeight: 600,
              textDecoration: "none", display: "inline-flex", alignItems: "center",
            }}
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: 48, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 32 }}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Popular pages</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { to: "/pricing", label: "Pricing" },
              { to: "/about", label: "About" },
              { to: "/blog", label: "Blog" },
              { to: "/contact", label: "Contact" },
              { to: "/signup", label: "Sign Up Free" },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 13, color: "#6C63FF", fontWeight: 600,
                  textDecoration: "none", padding: "5px 14px",
                  background: "rgba(108,99,255,0.1)", borderRadius: 20,
                  border: "1px solid rgba(108,99,255,0.2)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
