# Voxora

AI-powered Business Intelligence Platform — v6.4 (Sales & CRM Studio).  
A production-ready React + TypeScript SPA delivering 100+ AI-powered tools across 9 specialised studios.

## Stack
- **Framework:** React 19 + TypeScript 6
- **Build tool:** Vite 8 (dev server on **port 5000**, `allowedHosts: true` for Replit proxy)
- **Routing:** React Router v7 for public pages; state-based workspace switching inside the dashboard
- **Backend:** Firebase (Auth + Firestore) when `VITE_FIREBASE_*` env vars are set; falls back to `localStorage` Demo Mode automatically
- **AI:** OpenAI / Gemini / Anthropic when the matching `VITE_*_API_KEY` is set; falls back to built-in MockProvider
- **Payments:** Stripe / Flutterwave / Paystack when keys are set; Demo Mode otherwise
- **Dependencies:** `npm install` inside `Voxora/` (root-level package.json is absent; all deps live in `Voxora/package.json`)

## How to run
The configured workflow **`Start application`** runs:
```
cd Voxora && npm run dev
```
This starts the Vite dev server on **http://localhost:5000**.

One-time setup (already done on this Replit):
```bash
cd Voxora && npm install
```

Quality checks (all pass on the current codebase):
```bash
cd Voxora && npm run typecheck   # tsc --noEmit — zero errors
cd Voxora && npm run build       # tsc + vite build — zero errors
```

## Environment variables (all optional)
Add secrets in Replit's **Secrets** panel (not a `.env` file):

| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` + 5 others | Real auth + Firestore cloud persistence |
| `VITE_OPENAI_API_KEY` | OpenAI as AI provider |
| `VITE_GEMINI_API_KEY` | Google Gemini as AI provider |
| `VITE_ANTHROPIC_API_KEY` | Anthropic Claude as AI provider |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe payments |

Without any secrets the app runs fully in **Demo Mode** (simulated AI, localStorage data).

## Project structure
```
Voxora/
├── index.html
├── vite.config.ts          # port 5000, allowedHosts: true
├── package.json
└── src/
    ├── main.tsx             # entry point, ErrorBoundary, BrowserRouter, theme init
    ├── App.tsx              # route definitions + provider tree
    ├── components/          # ProtectedRoute, DemoBanner, WelcomeWizard, Toast, Nav, Footer
    ├── context/             # AuthContext, AIContext, ProjectContext, ActivityContext,
    │                        # CloudContext, SubscriptionContext, ToastContext
    ├── hooks/               # useAI, useCRM
    ├── pages/
    │   ├── public/          # Login, SignUp, Pricing, About, Blog…
    │   ├── platforms/       # AI Command Center, Startup Studio…
    │   ├── solutions/       # Creators, Entrepreneurs, Businesses, Developers
    │   └── Workspaces/      # 100+ lazy-loaded workspace components (V4–V6.4)
    └── services/
        ├── ai/              # AIService + Cache, Queue, Health, Memory, providers
        ├── backend/         # BackendService → Firebase | LocalStorage
        ├── payment/         # PaymentService → Stripe | Paystack | Flutterwave | Demo
        ├── integrations/    # IntegrationService + provider scaffolding
        ├── automation/      # AutomationEngine
        ├── memory/          # MemoryService
        ├── admin/           # Monitoring, Audit, Notifications, ErrorReporting
        └── subscription/    # SubscriptionEngine, plan definitions
```

## Navigation
- Public pages use React Router (`/`, `/login`, `/signup`, `/pricing`, etc.)
- Dashboard (`/dashboard`) uses state-based workspace switching — no URL sub-routes
- All 100+ workspace components are **lazy-loaded** for fast initial load
- Dark mode is toggled via `data-theme` attribute on `<html>`

## Studios & workspaces (V4–V6.4)
| Version | Studio |
|---------|--------|
| V4 | Research, Strategy, Financial, Marketing, Investor, Growth, Analytics, Team |
| V5.1–5.9 | AI Engine (cache, health, queue, context), Auth, Launch & Quality |
| V6.1 | Pitch Studio |
| V6.2 | Marketing Studio (extended) |
| V6.3 | Financial Studio (extended) |
| V6.4 | **Sales & CRM Studio** — Lead Manager, Kanban Pipeline, Contacts, Meeting Planner, Proposal Generator, Analytics, Task Manager, Export |

## User preferences
