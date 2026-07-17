import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectProvider } from "./context/ProjectContext";
import { ActivityProvider } from "./context/ActivityContext";
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActivityProvider>
  <ProjectProvider>
    <App />
  </ProjectProvider>
</ActivityProvider>
  </StrictMode>,
)
