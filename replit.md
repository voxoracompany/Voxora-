# Voxora — AI-Powered Business Intelligence Platform

A production-ready React 19 + TypeScript + Vite SPA with 100+ AI-powered workspace tools across 9 studios (Research, Strategy, Financial, Marketing, Investor, Growth, Analytics, Team, Admin).

## How to run

The workflow **"Start application"** runs `cd Voxora && npm run dev` and serves on port 5000.

**Demo Mode** (default, zero config): all features work with simulated AI responses and localStorage persistence.

## Optional environment variables (Replit Secrets)

| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` + 5 others | Switch from localStorage → Firebase cloud backend |
| `VITE_OPENAI_API_KEY` | Real OpenAI responses instead of mock |
| `VITE_GEMINI_API_KEY` | Real Gemini responses |
| `VITE_ANTHROPIC_API_KEY` | Real Anthropic/Claude responses |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe payments |

All variables use the `VITE_` prefix. Without them the app runs in Demo Mode.

## Project structure

```
Voxora/          ← all source lives here
  src/
    pages/Workspaces/   ← 100+ lazy-loaded workspace components
    services/           ← AI, backend, payment, auth service layers
    context/            ← React contexts (Auth, AI, Project, etc.)
  vite.config.ts  ← port 5000, host:true, allowedHosts:true
```

## User preferences

<!-- Add preferences here as they are expressed -->
