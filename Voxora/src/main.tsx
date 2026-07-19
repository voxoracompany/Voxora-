import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/dark-mode.css";
import App from "./App.tsx";
import { ActivityProvider } from "./context/ActivityContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";

// ── Apply stored theme/accent/fontSize before React mounts (avoid FOUC) ──
(function applyStoredTheme() {
  const theme    = localStorage.getItem("voxora-theme")    || "light";
  const accent   = localStorage.getItem("voxora-accent")   || "#6C63FF";
  const fontSize = localStorage.getItem("voxora-fontsize") || "medium";

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.setProperty("--accent", accent);

  // Rough shade for hover
  const hex = accent.replace("#", "");
  const num = parseInt(hex, 16);
  const shade = (n: number) => Math.min(255, Math.max(0, n - 15)).toString(16).padStart(2, "0");
  const hover = `#${shade(num >> 16)}${shade((num >> 8) & 0xff)}${shade(num & 0xff)}`;
  document.documentElement.style.setProperty("--accent-hover", hover);

  const sizeMap: Record<string, string> = { small: "14px", medium: "16px", large: "18px" };
  document.documentElement.style.setProperty("--font-size-base", sizeMap[fontSize] || "16px");
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <ActivityProvider>
        <ProjectProvider>
          <App />
          <ToastContainer />
        </ProjectProvider>
      </ActivityProvider>
    </ToastProvider>
  </StrictMode>
);
