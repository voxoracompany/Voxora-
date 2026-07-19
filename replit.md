# Voxora

An AI-native platform for creating, orchestrating, and scaling intelligent agent, automation, and business applications.

## Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 8
- **Styling:** Plain CSS (component-scoped files)
- **State / persistence:** React Context + localStorage (no backend)
- **Package manager:** npm

## Project structure

```
Voxora/          ← all app source lives here
  src/
    App.tsx               Landing page + root
    pages/Dashboard/      Main dashboard shell
    pages/Workspaces/     Feature pages (AI, Analytics, Activity, Search, Export, …)
    context/              ProjectContext, ActivityContext, ToastContext
    components/           Shared UI (ToastContainer)
```

## How to run

```
cd Voxora && npm run dev
```

Dev server runs on port **5173**.

## User preferences

- Keep existing UI and design language intact when adding features
- Do not remove existing functionality
- Preferred feature roadmap: V2.1 (Analytics Dashboard, Smart Search, Export Center, Activity Center, Supabase, Auth, Responsive UI)
