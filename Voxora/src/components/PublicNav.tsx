import { useState } from "react";
import { Link } from "react-router-dom";
import voxoraLogo from "../assets/logo/voxora-logo.png";
import "./PublicNav.css";

interface NavItem {
  icon: string;
  label: string;
  description: string;
  to: string;
}

const PLATFORMS: NavItem[] = [
  {
    icon: "🤖",
    label: "AI Command Center",
    description: "Unified AI workspace & chat hub",
    to: "/platforms/ai-command-center",
  },
  {
    icon: "✨",
    label: "Startup Studio",
    description: "Validate and launch your ideas",
    to: "/platforms/startup-studio",
  },
  {
    icon: "📣",
    label: "Marketing Studio",
    description: "Content, SEO & social media tools",
    to: "/platforms/marketing-studio",
  },
  {
    icon: "💰",
    label: "Financial Studio",
    description: "Revenue forecasts & cash flow",
    to: "/platforms/financial-studio",
  },
  {
    icon: "🏦",
    label: "Investor Studio",
    description: "Pitch decks & investor readiness",
    to: "/platforms/investor-studio",
  },
];

const SOLUTIONS: NavItem[] = [
  {
    icon: "🎨",
    label: "Creators",
    description: "AI tools for content creators",
    to: "/solutions/creators",
  },
  {
    icon: "💡",
    label: "Entrepreneurs",
    description: "Build and validate your business",
    to: "/solutions/entrepreneurs",
  },
  {
    icon: "🏢",
    label: "Businesses",
    description: "Scale operations with AI",
    to: "/solutions/businesses",
  },
  {
    icon: "👨‍💻",
    label: "Developers",
    description: "APIs, integrations & workflows",
    to: "/solutions/developers",
  },
];

const COMPANY: NavItem[] = [
  {
    icon: "🌟",
    label: "About",
    description: "Our mission and story",
    to: "/about",
  },
  {
    icon: "📝",
    label: "Blog",
    description: "Insights and product updates",
    to: "/blog",
  },
  {
    icon: "💼",
    label: "Careers",
    description: "Join the Voxora team",
    to: "/careers",
  },
  {
    icon: "✉️",
    label: "Contact",
    description: "Get in touch with us",
    to: "/contact",
  },
];

function DropdownMenu({ items }: { items: NavItem[] }) {
  return (
    <div className="pub-nav-dropdown">
      {items.map((item) => (
        <Link key={item.to} to={item.to} className="pub-nav-dropdown-item">
          <span className="pub-nav-dropdown-icon">{item.icon}</span>
          <div className="pub-nav-dropdown-text">
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      <nav className="pub-nav">
        <div className="pub-nav-inner-row">
          <Link to="/" className="pub-nav-logo">
            <img
              src={voxoraLogo}
              alt="Voxora"
              width={40}
              height={40}
              style={{ display: "block", objectFit: "contain", borderRadius: 8 }}
            />
            VOXORA
          </Link>

          {/* Desktop links */}
          <ul className="pub-nav-links">
            <li className="pub-nav-item">
              <button className="pub-nav-link">
                Platforms <span className="pub-nav-chevron">▼</span>
              </button>
              <DropdownMenu items={PLATFORMS} />
            </li>
            <li className="pub-nav-item">
              <button className="pub-nav-link">
                Solutions <span className="pub-nav-chevron">▼</span>
              </button>
              <DropdownMenu items={SOLUTIONS} />
            </li>
            <li className="pub-nav-item">
              <Link to="/pricing" className="pub-nav-link">
                Pricing
              </Link>
            </li>
            <li className="pub-nav-item">
              <button className="pub-nav-link">
                Company <span className="pub-nav-chevron">▼</span>
              </button>
              <DropdownMenu items={COMPANY} />
            </li>
          </ul>

          <div className="pub-nav-actions">
            <Link to="/login" className="pub-nav-login">
              Log In
            </Link>
            <Link to="/signup" className="pub-nav-signup">
              Sign Up Free
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="pub-nav-burger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`pub-nav-mobile ${mobileOpen ? "open" : ""}`}>
          <div className="pub-nav-mobile-section">Platforms</div>
          {PLATFORMS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="pub-nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {p.icon} {p.label}
            </Link>
          ))}
          <div className="pub-nav-mobile-divider" />
          <div className="pub-nav-mobile-section">Solutions</div>
          {SOLUTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="pub-nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {s.icon} {s.label}
            </Link>
          ))}
          <div className="pub-nav-mobile-divider" />
          <div className="pub-nav-mobile-section">Company</div>
          {COMPANY.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="pub-nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {c.icon} {c.label}
            </Link>
          ))}
          <Link
            to="/pricing"
            className="pub-nav-mobile-link"
            onClick={() => setMobileOpen(false)}
          >
            💳 Pricing
          </Link>
          <div className="pub-nav-mobile-divider" />
          <div className="pub-nav-mobile-actions">
            <Link
              to="/login"
              className="pub-nav-login"
              onClick={() => setMobileOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="pub-nav-signup"
              onClick={() => setMobileOpen(false)}
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
