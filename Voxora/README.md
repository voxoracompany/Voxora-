# 🚀 Voxora — AI-Powered Business Intelligence Platform

> The all-in-one AI workspace for founders, marketers, investors, and growth-focused teams.

[![Version](https://img.shields.io/badge/version-5.0-6C63FF?style=flat-square)](https://github.com/voxoracompany/Voxora-)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat-square)](https://vitejs.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Feature Changelog](#feature-changelog)

---

## Overview

Voxora is a production-ready React + TypeScript application that delivers 80+ AI-powered tools across 9 specialized studios. It runs entirely in the browser using localStorage for persistence and supports pluggable AI backends (OpenAI, Gemini, Anthropic, or demo mode when no key is configured).

---

## Features

### 🤖 AI Tools
- **AI Assistant** — Conversational AI powered by OpenAI / Gemini / Anthropic
- **AI Content Generator** — Blog posts, social copy, email drafts
- **App Ideas & Startup Ideas** — AI-generated concept exploration
- **AI Settings** — Model selection, provider configuration, usage tracking

### 🔬 Research Studio
- Customer Research, Market Research, Customer Persona
- Product Validation, Competitor Analysis, SWOT Analysis

### 🏢 Strategy Studio
- Business Model Canvas, Product Roadmap

### 💰 Financial Studio (V4.3)
- Financial Hub, Financial Forecast, Revenue Model
- Pricing Strategy, Unit Economics, Break-Even, Pitch Deck, Executive Summary

### 📣 Marketing Studio (V4.2)
- Marketing Hub, Strategy, Email Campaigns, Social Media
- SEO Planner, Ad Copy, Content Calendar, Brand Voice

### 💼 Investor Studio (V4.4)
- Investor Hub, Fundraising Strategy, Investor Narrative
- Term Sheet Guide, Due Diligence, Cap Table

### 📈 Growth Studio (V4.5)
- Growth Hub, Growth Planner, KPI Dashboard, Goal Tracker
- OKR Manager, Growth Experiments, A/B Test Planner
- Business Milestones, Weekly Review, Monthly Report, AI Recommendations

### 📊 Analytics Studio (V4.6)
- Analytics Hub, Executive Dashboard, Revenue Analytics
- Customer Analytics, Marketing Analytics, Financial Analytics
- AI Analytics, Startup Analytics, Trend Analysis, Reports

### 👥 Team Collaboration (V4.7)
- Team Hub, Team Members, Task Board, Meeting Notes
- Team Goals, Role Assignment, Announcements, Team Brief
- Collaboration Plan, Retrospective

### 🔌 Integrations Studio (V4.8)
- OpenAI, Gemini, Anthropic API configuration
- Google Drive, Dropbox, Notion sync
- Slack, Zapier, Webhooks

### 👤 Authentication & Accounts (V4.9)
- Sign Up / Login / Logout
- Forgot Password & Reset Password
- Email Verification (demo)
- User Profile, Account Settings, Security Settings
- Two-Factor Authentication (demo), Login History, Session Management

---

## Getting Started

### Prerequisites
- Node.js 18+ (or use the Replit environment)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/voxoracompany/Voxora-.git
cd Voxora-/Voxora

# Install dependencies
npm install

# Start development server
npm run dev
```

The app starts at `http://localhost:5000`.

### Environment Variables

No environment variables are required to run in demo mode. To enable live AI:

| Variable | Description |
|---|---|
| `VITE_OPENAI_KEY` | OpenAI API key (optional — use in-app settings instead) |

> ⚠️ **Security:** Never hard-code API keys. Use the in-app Integrations Studio to store keys in localStorage, or configure a backend proxy.

---

## Development Guide

### Available Scripts

```bash
npm run dev      # Start Vite dev server (port 5000)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Adding a New Workspace

1. Create `src/pages/Workspaces/MyWorkspace.tsx`
2. Add a lazy import in `Dashboard.tsx`
3. Add a `workspace === "myWorkspace"` conditional in the render
4. Add a nav item to the appropriate group in `Sidebar.tsx`

### AI Integration

The AI layer lives in `src/services/ai/`. To add a new provider:

1. Create `src/services/ai/providers/MyProvider.ts` implementing `AIProvider`
2. Register it in `src/services/ai/AIService.ts`
3. Add UI controls in `src/pages/Workspaces/AISettings.tsx`

---

## Project Structure

```
Voxora/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/          # Shared UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── PublicNav.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── ToastContainer.tsx
│   │   └── DemoBanner.tsx
│   ├── context/             # React context providers
│   │   ├── AuthContext.tsx   # Auth state (demo mode, backend-ready)
│   │   ├── AIContext.tsx     # AI provider + usage tracking
│   │   ├── ProjectContext.tsx
│   │   ├── ActivityContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/
│   │   └── useAI.ts
│   ├── pages/
│   │   ├── Dashboard/        # Protected app shell
│   │   │   ├── Dashboard.tsx  # State-based router (80+ workspace IDs)
│   │   │   ├── Dashboard.css
│   │   │   └── components/
│   │   │       ├── Sidebar.tsx / .css
│   │   │       ├── TopBar.tsx
│   │   │       └── FeatureCard.tsx
│   │   ├── Workspaces/       # 80+ workspace pages (all lazy-loaded)
│   │   ├── public/           # Auth + marketing pages
│   │   ├── platforms/        # Platform marketing pages
│   │   └── solutions/        # Solution pages
│   ├── services/ai/          # AI provider abstraction layer
│   │   ├── AIService.ts
│   │   ├── AIMemory.ts
│   │   └── providers/
│   │       ├── OpenAIProvider.ts
│   │       ├── GeminiProvider.ts
│   │       ├── AnthropicProvider.ts
│   │       └── MockProvider.ts
│   └── styles/
│       └── dark-mode.css
├── index.html               # SEO meta tags, OG, Twitter cards
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Architecture

### Routing
- **Public routes** — React Router (`/`, `/login`, `/signup`, etc.)
- **Protected routes** — `ProtectedRoute` wraps `/dashboard`; redirects to `/login` if unauthenticated
- **Workspace routing** — State-based (`useState`) inside `Dashboard.tsx`; no URL changes between workspaces (single-page, no browser history per workspace)

### State Management
- React Context for global state (Auth, AI, Projects, Activity, Toast)
- localStorage for persistence (users, projects, AI settings, theme)
- No external state library (Zustand / Redux) needed at current scale

### Auth (V4.9)
- `AuthContext` stores user in localStorage — demo mode, no backend required
- Designed for drop-in replacement with Firebase / Supabase / Auth0
- `ProtectedRoute` guards `/dashboard`

### AI Layer
- Provider pattern: `OpenAIProvider`, `GeminiProvider`, `AnthropicProvider`, `MockProvider`
- Auto-falls back to `MockProvider` when no API key is configured
- All AI calls tracked via `AIContext` (requests, tokens, response times)

---

## Feature Changelog

| Version | Release | Summary |
|---|---|---|
| **V5.0** | 2026-07 | Production Launch Readiness — Error boundary, 404 page, SEO, accessibility, responsive design, docs |
| **V4.9** | 2026-07 | Authentication & User Accounts — Auth system, protected routes, profile, security settings |
| **V4.8** | 2026-07 | Integrations Studio — OpenAI, Gemini, Anthropic, Drive, Dropbox, Notion, Slack, Zapier, Webhooks |
| **V4.7** | 2026-07 | Team Collaboration — Hub, Members, Task Board, Meeting Notes, Goals, Retrospective |
| **V4.6** | 2026-07 | Analytics Studio — Executive Dashboard, Revenue, Customer, Marketing, Financial, AI Analytics |
| **V4.5** | 2026-07 | Growth Studio — KPI, OKR, Goal Tracker, A/B Tests, Growth Experiments, AI Recommendations |
| **V4.4** | 2026-07 | Investor Studio — Fundraising, Due Diligence, Cap Table, Investor Narrative |
| **V4.3** | 2026-07 | Financial Studio — Forecast, Revenue Model, Pricing, Unit Economics, Break-Even, Pitch Deck |
| **V4.2** | 2026-07 | Marketing Studio — Strategy, Email, Social Media, SEO, Ad Copy, Content Calendar |
| **V4.1** | 2026-07 | AI Engine — Multi-provider (OpenAI/Gemini/Anthropic/Mock), memory, usage tracking |

---

## License

Proprietary — © 2026 Voxora. All rights reserved.
