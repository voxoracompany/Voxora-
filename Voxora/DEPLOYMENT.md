# Voxora — Deployment Guide

> V8.0 Global Launch · July 2026

---

## Overview

Voxora is a React 19 + TypeScript + Vite SPA. It runs entirely in the browser
and can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare
Pages, AWS S3 + CloudFront, Replit Deployments, etc.).

The application has two modes:

| Mode | Auth | Storage | AI |
|------|------|---------|-----|
| **Demo** | localStorage | localStorage | Mock provider |
| **Production** | Firebase Auth | Firestore | OpenAI / Gemini / Anthropic |

---

## Quick Start (Replit)

```bash
cd Voxora
npm install
npm run dev          # development server on :5000
npm run build        # production build → dist/
npm run preview      # preview the production build locally
```

The workflow **"Start application"** runs `npm run dev` and serves on port 5000.

---

## Environment Variables

All variables use the `VITE_` prefix so Vite embeds them at build time.
Set them as Replit Secrets or in a `.env.local` file (never commit this file).

### Required for Firebase (cloud backend)

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

All six must be set; missing any one keeps the app in Demo Mode.

### Optional — AI Providers

```
VITE_OPENAI_API_KEY       # OpenAI GPT-4o
VITE_GEMINI_API_KEY       # Google Gemini (auto-selected if set)
VITE_ANTHROPIC_API_KEY    # Anthropic Claude
```

Without these the app uses the built-in mock AI engine.

### Optional — Analytics

```
VITE_GA4_MEASUREMENT_ID   # Google Analytics 4 (e.g. G-XXXXXXXXXX)
```

### Optional — Payments

```
VITE_STRIPE_PUBLIC_KEY    # Stripe publishable key
```

---

## Production Build

```bash
cd Voxora
npm run build
```

Output goes to `Voxora/dist/`. Serve the contents of `dist/` from any static host.

### Build optimisations (V8.0)

- **Code splitting**: react-vendor, router, and firebase in separate chunks for
  long-term caching.
- **Target**: `es2020` for modern browsers — no unnecessary polyfills.
- **Chunk warning limit**: 800 kB.

---

## Firebase Setup

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com).
2. Create a project (name it `voxora-production` or similar).
3. Enable **Authentication** → Email/Password and Google providers.
4. Enable **Firestore Database** → start in production mode.
5. Enable **Storage** (for file uploads).

### 2. Get your config

Project Settings → Your Apps → Web App → SDK setup → Config object.
Copy the six values into Replit Secrets.

### 3. Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Public read for any other collections (adjust as needed)
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Storage security rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Hosting Options

### Replit Deployments (recommended for quick launch)

1. Open the Replit project.
2. Click **Deploy** → **Reserved VM** or **Autoscale**.
3. Set environment variables in the Deployment secrets panel.
4. Click **Publish**.

Replit serves `npm run preview` (production build) on the deployment domain.

### Vercel

```bash
npm i -g vercel
cd Voxora
vercel --prod
```

Vercel detects Vite automatically. Set env vars in the Vercel dashboard.

Add a `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify

```bash
npm i -g netlify-cli
cd Voxora
netlify deploy --prod --dir dist
```

Add a `public/_redirects` file:

```
/*  /index.html  200
```

### Cloudflare Pages

Build command: `npm run build`
Output directory: `dist`
Node version: `20`

Cloudflare handles SPA routing automatically.

---

## SPA Routing

Voxora uses React Router's `BrowserRouter`. All hosting providers must be
configured to return `index.html` for any path (catch-all / 404 → 200 rewrite).
The `public/_redirects` and `vercel.json` examples above handle this.

---

## Robots and Sitemap

- `public/robots.txt` — disallows `/dashboard` and auth routes from crawlers.
- `public/sitemap.xml` — includes all public pages; update the `<lastmod>` dates
  after each release.

---

## Performance Checklist

- [ ] Run `npm run build` and confirm no chunk exceeds 800 kB (gzip).
- [ ] Verify Web Vitals via the Voxora HealthCheck workspace or PageSpeed Insights.
- [ ] Confirm all lazy-loaded workspace chunks load without errors.
- [ ] Test on a throttled (Fast 3G) connection.

---

## Security Checklist

- [ ] All Firebase security rules deployed and tested.
- [ ] No API keys committed to the repository (use Secrets).
- [ ] `VITE_*` keys are publish-safe (they are embedded in the JS bundle — never
  put server-side secrets in `VITE_` variables).
- [ ] CORS configured on any backend APIs to allow only your production domain.
- [ ] Content Security Policy header set on your hosting provider.

---

## Monitoring

After launch, monitor via the **System Monitoring** workspace inside the Voxora
dashboard, or integrate external tools:

| Tool | Variable |
|------|---------|
| Google Analytics 4 | `VITE_GA4_MEASUREMENT_ID` |
| Sentry | Add `@sentry/react` and initialise in `main.tsx` |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page on load | Check `dist/` contains `index.html`; verify the hosting catch-all rewrite. |
| Firebase auth fails | Confirm all 6 `VITE_FIREBASE_*` secrets are set. |
| AI returns mock responses | Add a `VITE_OPENAI_API_KEY`, `VITE_GEMINI_API_KEY`, or `VITE_ANTHROPIC_API_KEY` secret. |
| 404 on direct URL access | Add the SPA catch-all rewrite rule for your host. |
| Large bundle warning | Run `npm run build` and check which chunk is large; split it further in `vite.config.ts`. |

---

*Last updated: July 2026 · Voxora V8.0 Global Launch*
