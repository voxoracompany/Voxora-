import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// ── Apply stored theme tokens before first paint ─────────────────────────────
const root = document.documentElement;
const accent = localStorage.getItem("voxora-accent");
const fontSize = localStorage.getItem("voxora-font-size");
if (accent) root.style.setProperty("--accent", accent);
if (fontSize) root.style.setProperty("--font-size-base", fontSize);

const storedTheme = localStorage.getItem("voxora-theme");
if (storedTheme === "dark") root.setAttribute("data-theme", "dark");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
