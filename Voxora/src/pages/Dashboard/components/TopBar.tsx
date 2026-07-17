import React, { useState } from "react";
import "./TopBar.css";

interface TopBarProps {
  setWorkspace?: (workspace: string) => void;
}

export default function TopBar({ setWorkspace }: TopBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && setWorkspace) {
      setWorkspace("search");
    }
  };

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
        <div className="topbar-avatar">
          {(localStorage.getItem("voxora-name") || "V").charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
