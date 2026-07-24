import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./TopBar.css";

interface TopBarProps {
  setWorkspace?: (workspace: string) => void;
}

export default function TopBar({ setWorkspace }: TopBarProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && setWorkspace) setWorkspace("search");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const displayName = user?.name || localStorage.getItem("voxora-name") || "Voxora";
  const displayEmail = user?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="topbar">
      <form className="topbar-search" onSubmit={handleSearch}>
        <span className="topbar-search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search projects, ideas, analyses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setWorkspace && setWorkspace("search")}
        />
      </form>

      <div className="topbar-actions">
        {isAuthenticated ? (
          <div className="topbar-avatar-wrap" ref={menuRef}>
            <button
              className="topbar-avatar"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              {user?.avatarEmoji && user.avatarEmoji !== "🚀"
                ? <span style={{ fontSize: 18 }}>{user.avatarEmoji}</span>
                : avatarLetter}
            </button>

            {menuOpen && (
              <div className="topbar-dropdown">
                {/* User identity */}
                <div className="topbar-dropdown-header">
                  <div className="topbar-dropdown-avatar">{avatarLetter}</div>
                  <div className="topbar-dropdown-identity">
                    <span className="topbar-dropdown-name">{displayName}</span>
                    {displayEmail && (
                      <span className="topbar-dropdown-email">{displayEmail}</span>
                    )}
                  </div>
                </div>

                <div className="topbar-dropdown-divider" />

                <button
                  className="topbar-dropdown-item"
                  onClick={() => { setMenuOpen(false); setWorkspace && setWorkspace("userProfile"); }}
                >
                  <span>👤</span> My Profile
                </button>
                <button
                  className="topbar-dropdown-item"
                  onClick={() => { setMenuOpen(false); setWorkspace && setWorkspace("settings"); }}
                >
                  <span>⚙️</span> Settings
                </button>

                <div className="topbar-dropdown-divider" />

                <button
                  className="topbar-dropdown-item topbar-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar-avatar" onClick={() => navigate("/login")}>
            V
          </div>
        )}
      </div>
    </div>
  );
}
