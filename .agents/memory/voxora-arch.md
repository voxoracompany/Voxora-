---
name: Voxora architecture
description: Key architectural decisions and patterns in the Voxora React app at Voxora/src/.
---

## Routing
No React Router. Navigation is a `workspace` string in `useState` inside `Dashboard.tsx`. Sidebar and TopBar receive `setWorkspace` as a prop.

## Theme system
- `data-theme="dark"` set on `<html>` element
- CSS overrides in `src/styles/dark-mode.css` (imported in main.tsx)
- Accent color and font-size as CSS custom properties (`--accent`, `--font-size-base`) set on `:root` dynamically
- Stored in localStorage: `voxora-theme`, `voxora-accent`, `voxora-fontsize`
- Applied before React mounts in `main.tsx` IIFE to avoid FOUC
- Also applied immediately in Settings.tsx `applyTheme()` on change

## Performance
All workspace pages lazy-loaded via `React.lazy` + `<Suspense>` in Dashboard.tsx. Spinner shown while loading.

## Security / Validation
- `ProjectContext.tsx`: `validateProject()` checks title (required, ≤200 chars), category (required). `sanitizeProject()` strips/limits all fields. Duplicate title+category prevented for new projects. `saveProject()` returns `{ success, error }`.
- `ActivityContext.tsx`: `safeLoadActivities()` validates shape before using. Max 500 activities. All field lengths capped.
- localStorage reads wrapped in try/catch in both contexts; corrupt data resets key.

## New pages (V2.1)
- `HelpCenter.tsx` — workspace `"help"`, sidebar ❓ item, Ctrl+H shortcut
- `DevAdmin.tsx` — workspace `"admin"`, Ctrl+Shift+D shortcut (not in sidebar, hidden)

## Keyboard shortcuts (Dashboard.tsx useEffect)
Ctrl+K → search, Ctrl+N → assistant, Ctrl+S → saved, Ctrl+E → export, Ctrl+H → help, Ctrl+Shift+D → admin, Escape → dashboard.

## Data persistence
Everything in localStorage. Keys: `voxora-projects`, `voxora-favorites`, `voxora-pinned`, `voxora-activities`, `voxora-chat`, `voxora-chat-count`, `voxora-name`, `voxora-goal`, `voxora-theme`, `voxora-accent`, `voxora-fontsize`.

**Why:** No backend in current version. Supabase integration planned for V2.2.

## Backup/Restore
Settings.tsx exports a JSON backup containing all keys above. Import re-parses, validates shape, writes back to localStorage, then reloads page.

## Build
`cd Voxora && npm run build` — confirmed builds clean with 0 errors. Code-split per workspace page (~2–12KB each). Entry bundle 218KB gzip 67KB.
