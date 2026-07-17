import React from "react";
import "./Sidebar.css";

interface SidebarProps {
  setWorkspace: (workspace: string) => void;
  workspace: string;
}

export default function Sidebar({
  setWorkspace,
  workspace,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>🚀 Voxora AI</h2>

      <p
        className={workspace === "dashboard" ? "active" : ""}
        onClick={() => setWorkspace("dashboard")}
      >
        🏠 Dashboard
      </p>

      <p
        className={workspace === "apps" ? "active" : ""}
        onClick={() => setWorkspace("apps")}
      >
        💡 App Ideas
      </p>

      <p
        className={workspace === "startup" ? "active" : ""}
        onClick={() => setWorkspace("startup")}
      >
        🚀 Startup Ideas
      </p>

      <p
  onClick={() =>
    setWorkspace("validation")
  }
>
  📈 Product Validation
</p> 
      
     <p
  className={
    workspace === "persona"
      ? "active"
      : ""
  }
  onClick={() =>
    setWorkspace("persona")
  }
>
  👤 Customer Persona
</p>
     
      
      <p
  onClick={() => setWorkspace("business")}
>
  📊 Business Model
</p>
      
      
      <p
        className={workspace === "research" ? "active" : ""}
        onClick={() => setWorkspace("research")}
      >
        🔍 Customer Research
      </p>

      <p
        className={workspace === "saved" ? "active" : ""}
        onClick={() => setWorkspace("saved")}
      >
        📁 Saved Projects
      </p>

      <p
        className={workspace === "assistant" ? "active" : ""}
        onClick={() => setWorkspace("assistant")}
      >
        🤖 AI Assistant
      </p>

      <p
        className={workspace === "settings" ? "active" : ""}
        onClick={() => setWorkspace("settings")}
      >
        ⚙️ Settings
      </p>
    
    <p
  onClick={() => setWorkspace("activity")}
>
  🔔 Activity Center
</p>

   <p
  onClick={() => setWorkspace("competitor")}
>
  🏆 Competitor Analysis
</p>
   
    <p
  onClick={() => setWorkspace("market")}
>
  📊 Market Research
</p>
    
    <p
  onClick={() => setWorkspace("swot")}
>
  📋 SWOT Analysis
</p>
    
    
    <p onClick={() => setWorkspace("productRoadmap")}>
  Product Roadmap
</p>
    
    </aside>
  );
}