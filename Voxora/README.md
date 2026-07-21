# 🚀 Voxora — AI-Powered Business Intelligence Platform

> The all-in-one AI workspace for founders, marketers, investors, and growth-focused teams.

[![Version](https://img.shields.io/badge/version-6.0_RC-6C63FF?style=flat-square)](https://github.com/voxoracompany/Voxora-)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?style=flat-square)](https://vitejs.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [AI Provider Setup](#ai-provider-setup)
- [Billing Setup](#billing-setup)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Release Notes](#release-notes)

---

## Overview

Voxora is a production-ready React + TypeScript SPA delivering **100+ AI-powered tools** across **9 specialized studios**. It runs entirely in the browser using `localStorage` for persistence in Demo Mode, and supports pluggable backends (Firebase) and AI providers (OpenAI, Gemini, Anthropic).

**Demo Mode** — works out of the box with zero configuration. All features are functional; AI responses are simulated via the built-in MockProvider.

---

## Features

### 🤖 AI Engine (V5.1+)
- **AI Assistant** — Conversational AI powered by OpenAI / Gemini / Anthropic
- **AI Content Generator** — Blog posts, social copy, email drafts
- **App Ideas & Startup Ideas** — AI-generated concept exploration
- **AI Settings** — Model selection, provider configuration, usage tracking
- **AI Memory Engine** — Persistent conversation memory with semantic context
- **Prompt Library** — Curated, customisable prompt templates

### 🔬 Research Studio
Customer Research · Market Research · Customer Persona · Product Validation · Competitor Analysis · SWOT Analysis

### 🏢 Strategy Studio
Business Model Canvas · Product Roadmap

### 💰 Financial Studio
Financial Hub · Financial Forecast · Revenue Model · Pricing Strategy · Unit Economics · Break-Even · Pitch Deck · Executive Summary

### 📣 Marketing Studio
Marketing Hub · Strategy · Email Campaigns · Social Media · SEO Planner · Ad Copy · Content Calendar · Brand Voice

### 💼 Investor Studio
Investor Hub · Fundraising Strategy · Investor Narrative · Term Sheet Guide · Due Diligence · Cap Table

### 📈 Growth Studio
Growth Hub · Growth Planner · KPI Dashboard · Goal Tracker · OKR Manager · Growth Opportunity · A/B Test Planner · Business Milestones · Weekly Review · Monthly Growth Report · AI Growth Recommendations

### 📊 Analytics Studio
Analytics Hub · Executive Dashboard · Revenue Analytics · Customer Analytics · Marketing Analytics · Financial Analytics · AI Analytics · Startup Analytics · Trend Analysis · Analytics Reports

### 👥 Team Collaboration
Team Hub · Team Members · Task Board · Meeting Notes · Team Goals · Role Assignment · Team Announcements · Team Brief · Collaboration Plan · Team Retrospective

### 🔗 Integrations & Automation
OpenAI · Gemini · Anthropic · Google Drive · Dropbox · Notion · Slack · Zapier · Webhooks · GitHub · Google Calendar · Outlook · Automation Workspace

### ⚙️ Admin & DevOps
Admin Dashboard · User Management · System Monitoring · Audit Logs · Notification Center · Feature Flags · Error Reporting · Health Check · Deployment Checklist · Documentation Center · Launch Checklist · Beta Readiness Report

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+

### Installation

```bash
git clone https://github.com/voxoracompany/Voxora-.git
cd Voxora-
npm install
npm run dev
```

The app starts on **http://localhost:5000** (or the Replit preview URL).

**No environment variables are required.** Without them, Voxora runs in Demo Mode with:
- Simulated AI responses (MockProvider)
- localStorage-based persistence
- Demo billing mode

### Production Build

```bash
npm run build      # TypeScript check + Vite bundle
npm run preview    # Preview the production build locally
```

---

## Environment Variables

All variables use the `VITE_` prefix so Vite includes them in the client bundle. **Never commit real values to version control.**

Create a `.env` file in the `Voxora/` directory:

```env
# ── Firebase ──────────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# ── AI Providers (pick one or more; first configured wins) ─
VITE_OPENAI_API_KEY=sk-...
VITE_GEMINI_API_KEY=AIza...
VITE_ANTHROPIC_API_KEY=sk-ant-...

# ── Payments (optional) ────────────────────────────────────
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
```

> On Replit, add these in the **Secrets** panel (not `.env`) — they are automatically injected as environment variables.

### Provider Priority

| Service | Priority |
|---------|----------|
| AI | OpenAI → Gemini → Anthropic → Mock (Demo) |
| Backend | Firebase → Local Storage (Demo) |
| Payments | Stripe → Flutterwave → Paystack → Demo |

---

## Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password sign-in
3. Enable **Firestore Database** (start in test mode, then secure with rules)
4. Enable **Storage** (optional — for file uploads)
5. Go to **Project Settings → Your Apps → Web App** → copy the config
6. Paste the values into your `.env` / Replit Secrets

### Firestore Security Rules (recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## AI Provider Setup

### OpenAI
1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key under **API Keys**
3. Set `VITE_OPENAI_API_KEY` in your environment

### Google Gemini
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create an API key
3. Set `VITE_GEMINI_API_KEY` in your environment

### Anthropic (Claude)
1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Set `VITE_ANTHROPIC_API_KEY` in your environment

> **Security note:** In-browser AI calls expose your API key in network requests. For production, proxy requests through a backend service and never use a production key directly in client-side code.

---

## Billing Setup

### Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Get your publishable key from the Stripe Dashboard
3. Set `VITE_STRIPE_PUBLIC_KEY`
4. Implement a backend endpoint to create checkout sessions (not included — client-side only)

### Paystack
1. Sign up at [paystack.com](https://paystack.com)
2. Get your public key from Settings → API Keys
3. Set `VITE_PAYSTACK_PUBLIC_KEY`

### Flutterwave
1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Get your public key from the Dashboard
3. Set `VITE_FLUTTERWAVE_PUBLIC_KEY`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React SPA (Vite)                         │
├────────────────┬────────────────┬───────────────────────────────┤
│   Public Pages │   Platform     │   Dashboard (/dashboard)      │
│   (/, /login,  │   Pages        │   ┌──────────┬─────────────┐  │
│    /pricing…)  │   (/platforms/ │   │ Sidebar  │ Workspace   │  │
│                │    /solutions/)│   │ (nav)    │ (lazy page) │  │
└────────────────┴────────────────┴───┴──────────┴─────────────┘  │
                                                                   │
┌─────────────────────────────────────────────────────────────────┤
│                    Context / State Layer                         │
│  AuthContext · AIContext · ProjectContext · ActivityContext      │
│  CloudContext · SubscriptionContext · ToastContext               │
├─────────────────────────────────────────────────────────────────┤
│                      Service Layer                               │
│  AIService (cache · queue · health · context)                   │
│  BackendService → Firebase | LocalStorage                       │
│  PaymentService → Stripe | Flutterwave | Paystack | Demo        │
│  IntegrationService · AutomationEngine · MemoryService          │
│  MonitoringService · AuditLogService · ErrorReportingService    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| State-based routing (not URL sub-routes) inside Dashboard | Simplifies workspace switching without full page reloads; all 100+ workspaces share a single parent context |
| Lazy loading for every workspace | Keeps the initial bundle small; workspaces load on demand |
| Demo Mode fallback | Zero-configuration onboarding; evaluators never hit a broken state |
| WorkspaceErrorBoundary per panel | A crash in one workspace never takes down the whole app |
| `VITE_*` env vars for all credentials | Vite replaces them at build time; no server needed |

---

## Project Structure

```
Voxora/
├── index.html                  # HTML shell with SEO meta tags
├── vite.config.ts              # Vite config (port 5000, all hosts allowed)
├── tsconfig.json               # TypeScript strict config
├── package.json
└── src/
    ├── main.tsx                # App entry, ErrorBoundary, BrowserRouter, theme init
    ├── App.tsx                 # Route definitions, provider tree
    ├── index.css               # CSS custom properties, base reset
    ├── App.css
    ├── components/
    │   ├── ErrorBoundary.tsx   # Global error boundary
    │   ├── WorkspaceErrorBoundary.tsx  # Per-workspace error recovery (V6.0)
    │   ├── ProtectedRoute.tsx  # Auth guard
    │   ├── DemoBanner.tsx      # Demo Mode indicator
    │   ├── WelcomeWizard.tsx   # Onboarding wizard
    │   ├── ToastContainer.tsx
    │   ├── PublicNav.tsx
    │   └── PublicFooter.tsx
    ├── context/
    │   ├── AIContext.tsx
    │   ├── AuthContext.tsx
    │   ├── ActivityContext.tsx
    │   ├── CloudContext.tsx
    │   ├── ProjectContext.tsx
    │   ├── SubscriptionContext.tsx
    │   └── ToastContext.tsx
    ├── hooks/
    │   └── useAI.ts
    ├── pages/
    │   ├── LandingPage.tsx
    │   ├── NotFound.tsx
    │   ├── public/             # Login, SignUp, About, Blog, Pricing…
    │   ├── platforms/          # AICommandCenter, StartupStudio…
    │   ├── solutions/          # Creators, Entrepreneurs, Businesses, Developers
    │   ├── Dashboard/
    │   │   ├── Dashboard.tsx   # Main dashboard shell + workspace router
    │   │   ├── Dashboard.css
    │   │   └── components/     # Sidebar, TopBar, FeatureCard
    │   └── Workspaces/         # 100+ lazy-loaded workspace components
    ├── services/
    │   ├── ai/                 # AIService, providers, cache, health, memory
    │   ├── admin/              # Monitoring, Audit, Notifications, ErrorReporting
    │   ├── automation/         # AutomationEngine
    │   ├── backend/            # BackendService, Firebase & Local providers
    │   ├── firebase/           # Firebase init, auth, firestore, storage wrappers
    │   ├── integrations/       # IntegrationService + provider scaffolding
    │   ├── memory/             # MemoryService
    │   ├── payment/            # PaymentService, Stripe/Paystack/Flutterwave
    │   └── subscription/       # SubscriptionEngine, plan definitions
    └── styles/
        └── dark-mode.css
```

---

## Deployment

### Replit (recommended for quick launch)

1. Import the repo into Replit
2. Add secrets in the **Secrets** panel (VITE_FIREBASE_*, VITE_OPENAI_API_KEY, etc.)
3. Click **Deploy** → **Autoscale** or **Static**

The Vite config already has `host: true` and `allowedHosts: true` for the Replit proxy.

### Vercel

```bash
# From the Voxora/ directory
npx vercel --prod
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Netlify

```toml
# netlify.toml
[build]
  base    = "Voxora"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200
```

### Self-hosted (any static host)

```bash
cd Voxora && npm run build
# Upload dist/ to your CDN or web server
# Configure your web server to serve index.html for all routes (SPA)
```

---

## Troubleshooting

### App shows Demo Mode banner
No Firebase or AI environment variables are set. This is expected for evaluation. Add `VITE_FIREBASE_*` keys to enable real auth and persistence.

### AI requests return simulated responses
Set `VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`, or `VITE_ANTHROPIC_API_KEY`. The MockProvider is the automatic fallback when no key is present.

### White screen / blank page
1. Open browser DevTools → Console for errors
2. Verify `npm install` completed without errors
3. Check that the Vite dev server is running on port 5000
4. Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R)

### TypeScript errors on build
```bash
cd Voxora && npx tsc --noEmit
```
V6.0 ships with zero TypeScript errors. If you see errors, they are from local modifications.

### Firebase auth not working
- Verify all 6 `VITE_FIREBASE_*` variables are set correctly
- Check that Email/Password sign-in is enabled in the Firebase Console
- Ensure your domain is in Firebase → Authentication → Authorized Domains

### Payment buttons do nothing
Payment providers require backend checkout session creation. The client-side Voxora code collects payment intent — connect a server-side webhook handler to complete the flow.

---

## Release Notes

### V6.0 — Launch Candidate (RC) — 2025-07-21
- **WorkspaceErrorBoundary** — per-workspace error recovery; a crash in one tool never takes down the dashboard
- **BetaReadinessReport** workspace — live launch-readiness dashboard with scores, system status, AI status, known limitations, and V6.1+ roadmap
- **Performance** — `React.memo` applied to FeatureCard; React import fixed to top of App.tsx
- **Cleanup** — removed empty `ProductR` artefact file
- Zero TypeScript errors · Zero runtime errors on clean start

### V5.9 — Launch Preparation & Production Readiness
- Error Reporting, Health Check, Deployment Checklist, Documentation Center, Launch Checklist workspaces
- Launch Readiness Score calculation integrated into the Dashboard
- Full audit of all 100+ workspaces

### V5.8 — Admin & Monitoring
- Admin Dashboard, User Management, System Monitoring, Audit Logs, Notification Center, Feature Flags

### V5.7 — Integrations & Automation
- Automation Workspace, Google Calendar, Outlook, GitHub integrations
- Integration provider scaffolding for all major services

### V5.6 — Workspace Intelligence & AI Memory
- AI Memory Engine with persistent conversation context
- Prompt Library workspace
- AI Suggestions on the main dashboard

### V5.5 — Public Beta Launch
- Welcome Wizard (onboarding)
- Feedback Center, Trust Center, Getting Started workspaces
- Demo Mode banner

### V5.4 — Payments & Subscription
- Billing workspace, Stripe/Paystack/Flutterwave/Demo providers
- SubscriptionContext with plan limits enforcement

### V5.1–V5.3 — AI Engine & Authentication
- AICache, AIHealthMonitor, AIRequestManager, AIContextManager
- Firebase Auth integration with Local Demo Mode fallback
- AuthContext, ProtectedRoute, UserProfile, AccountSettings, SecuritySettings

### V4.1–V4.9 — Studios Rollout
- Financial Studio (V4.3), Marketing Studio (V4.2)
- Investor Studio (V4.4), Growth Studio (V4.5)
- Advanced Analytics Studio (V4.6), Team Collaboration (V4.7)
- Integrations Studio (V4.8), Auth & User Accounts (V4.9)
