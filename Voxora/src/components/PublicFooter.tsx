import { Link, useNavigate } from "react-router-dom";
import "./PublicFooter.css";

export default function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="pub-footer">
      <div className="pub-footer-inner">
        <div className="pub-footer-brand">
          <h2>🚀 VOXORA</h2>
          <p>The intelligence layer for the future of the AI age.</p>
          <button className="pub-footer-launch" onClick={() => navigate("/dashboard")}>
            Launch App →
          </button>
        </div>

        <div className="pub-footer-links">
          <div className="pub-footer-col">
            <h3>Platforms</h3>
            <Link to="/platforms/ai-command-center">AI Command Center</Link>
            <Link to="/platforms/startup-studio">Startup Studio</Link>
            <Link to="/platforms/marketing-studio">Marketing Studio</Link>
            <Link to="/platforms/financial-studio">Financial Studio</Link>
            <Link to="/platforms/investor-studio">Investor Studio</Link>
          </div>
          <div className="pub-footer-col">
            <h3>Solutions</h3>
            <Link to="/solutions/creators">Creators</Link>
            <Link to="/solutions/entrepreneurs">Entrepreneurs</Link>
            <Link to="/solutions/businesses">Businesses</Link>
            <Link to="/solutions/developers">Developers</Link>
          </div>
          <div className="pub-footer-col">
            <h3>Company</h3>
            <Link to="/about">About</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/careers">Careers</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="pub-footer-col">
            <h3>Legal</h3>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>

      <div className="pub-footer-bottom" style={{ borderTop: "1px solid #1e293b", padding: "20px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontSize: "13px", color: "#475569" }}>© 2026 Voxora. All rights reserved.</span>
        <div className="pub-footer-bottom-links">
          <Link to="/privacy" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>Terms</Link>
          <Link to="/contact" style={{ fontSize: "13px", color: "#475569", textDecoration: "none" }}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}
