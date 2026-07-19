---
name: Voxora architecture
description: State-based routing inside dashboard, React Router for all public pages. Key structure and conventions.
---

## Routing
- **Public routes**: React Router (`react-router-dom`) with `BrowserRouter` in `main.tsx` and `Routes` in `App.tsx`.
- **Dashboard workspace**: State-based (`workspace` useState) — no router; all workspace switching stays in `Dashboard.tsx` via `setWorkspace`.
- Unknown routes → redirect to `/`.

## Public Pages (all under `Voxora/src/pages/public/`)
Login, SignUp, About, Blog, Careers, Contact, Pricing, PrivacyPolicy, TermsOfService

## Platform Pages (`Voxora/src/pages/platforms/`)
AICommandCenter (`/platforms/ai-command-center`), StartupStudio, MarketingStudio, FinancialStudio, InvestorStudio

## Solution Pages (`Voxora/src/pages/solutions/`)
Creators, Entrepreneurs, Businesses, Developers

## Shared Components (`Voxora/src/components/`)
- `PublicNav.tsx` + `PublicNav.css` — sticky navbar with hover dropdowns for Platforms/Solutions/Company; Log In + Sign Up Free buttons; mobile hamburger drawer.
- `PublicFooter.tsx` + `PublicFooter.css` — all footer links are real `<Link>` components; "Launch App" → `/dashboard`.

## Shared CSS
`Voxora/src/pages/public/public-pages.css` — all public page utility classes (pub-hero, pub-section, pub-card, pub-cta, pub-grid, pub-stats-strip, pub-auth-*, pub-prose, pub-blog-*, pub-job-*, btn-primary/secondary/white/outline-white).

## Dashboard Sidebar
Logo click → navigate to `/`; "Home Page" button added to bottom nav (also navigates to `/`).

## Dark mode
Toggle via `data-theme="dark"` on `<html>` — set in `main.tsx` from localStorage before first paint.

**Why:** Keep dashboard snappy (no URL bar flicker on workspace switch) while giving public pages proper deep-linkable URLs.
