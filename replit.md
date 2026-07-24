# Voxora

An AI-powered platform landing page and workspace built with React, TypeScript, and Vite.

## Stack
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite (serves on port 5000)
- **Styling:** Plain CSS per component

## How to run
The workflow `Start application` runs `cd Voxora && npm run dev`, which starts the Vite dev server on port 5000.
From the project root, run `cd Voxora && npm install` once, then use `npm run dev`.
For checks, use `npm run typecheck` and `npm run build` from `Voxora/`.

## Project structure
- `Voxora/src/pages/` — Landing page and all workspace pages (Dashboard, AI Assistant, Analytics, etc.)
- `Voxora/src/components/` — Shared UI components (ToastContainer, etc.)
- `Voxora/src/context/` — React context providers (Auth, Activity, Project, Toast, Cloud)

## Navigation
Public pages use React Router, while dashboard workspace switching uses state-based navigation. Workspace pages are lazy-loaded. Dark mode is toggled via `data-theme` on `<html>`.

## User preferences
