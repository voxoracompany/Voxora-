import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ActivityProvider } from "./context/ActivityContext";
import { ProjectProvider } from "./context/ProjectContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";

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
