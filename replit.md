# Voxora

An AI-powered platform landing page and workspace built with React, TypeScript, and Vite.

## Stack
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite (serves on port 5000)
- **Styling:** Plain CSS per component

## How to run
The workflow `Start application` runs `cd Voxora && npm run dev`, which starts the Vite dev server on port 5000.

## Project structure
- `Voxora/src/pages/` — Landing page and all workspace pages (Dashboard, AI Assistant, Analytics, etc.)
- `Voxora/src/components/` — Shared UI components (ToastContainer, etc.)
- `Voxora/src/context/` — React context providers (Activity, Project, Toast)

## Navigation
The app uses `useState`-based routing (no router library). All workspace pages are lazy-loaded. Dark mode is toggled via `data-theme` on `<html>`.

## User preferences
