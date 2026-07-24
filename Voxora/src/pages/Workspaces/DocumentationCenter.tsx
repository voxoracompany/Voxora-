// ── V5.9 Documentation Center ─────────────────────────────────────────────────

import { useState } from "react";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

interface DocSection {
  id: string;
  icon: string;
  title: string;
  description: string;
  content: DocArticle[];
}

interface DocArticle {
  id: string;
  title: string;
  body: string;
}

const DOCS: DocSection[] = [
  {
    id: "user-guide",
    icon: "📘",
    title: "User Guide",
    description: "Get up and running with Voxora quickly.",
    content: [
      {
        id: "ug-1",
        title: "Getting Started",
        body: `Welcome to Voxora! To get started:\n\n1. **Sign Up or Log In** — Create an account or sign in on the login page. In Demo Mode, no account is needed.\n2. **Complete the Welcome Wizard** — The onboarding wizard walks you through core features.\n3. **Explore the Dashboard** — Your home base shows stats, recent projects, and AI suggestions.\n4. **Create a Project** — Use Quick Actions to generate startup ideas, customer research, or business models.\n5. **Connect AI** — Add a Gemini API key in AI Settings for live AI responses.`,
      },
      {
        id: "ug-2",
        title: "Demo Mode vs Cloud Mode",
        body: `**Demo Mode** (default): All data is stored in your browser's localStorage. Nothing is synced to the cloud. Perfect for exploring without an account.\n\n**Cloud Mode**: Configure Firebase credentials in your .env file. Enables:\n- Cross-device sync via Firestore\n- Firebase Authentication\n- Persistent user profile\n\nYou can switch between modes by setting/unsetting Firebase environment variables.`,
      },
      {
        id: "ug-3",
        title: "Workspace Navigation",
        body: `Voxora organizes tools into **sections** accessible from the sidebar:\n\n- **AI Tools** — AI Assistant, Content Generator, App Ideas, Startup Ideas\n- **Research** — Customer Research, Market Research, SWOT, Competitor Analysis\n- **Strategy** — Business Model Canvas, Product Roadmap\n- **Financial Studio** — Forecasts, Revenue Model, Pricing, Unit Economics\n- **Marketing Studio** — Strategy, Email, Social Media, SEO, Ad Copy\n- **Growth Studio** — KPI Dashboard, Goals, OKR Manager, Experiments\n- **Team Collaboration** — Task Board, Meeting Notes, Team Goals\n- **Admin & Monitoring** — System health, Audit logs, Feature flags\n\nUse **Ctrl+K** for smart search, **Ctrl+N** for AI Assistant, **Ctrl+H** for Help.`,
      },
    ],
  },
  {
    id: "admin-guide",
    icon: "🛠️",
    title: "Administrator Guide",
    description: "Manage users, monitor the system, and configure platform behavior.",
    content: [
      {
        id: "ag-1",
        title: "Admin Dashboard",
        body: `The Admin Dashboard (sidebar → Admin & Monitoring → Admin Dashboard) provides:\n\n- **System Metrics** — CPU, memory, storage, API and AI request counts\n- **User Management** — View and manage user accounts\n- **Audit Logs** — Full trail of actions performed in the system\n- **Feature Flags** — Toggle features on/off without code changes\n- **Notifications** — System-wide notification management\n\nAccess requires an admin role (demo: any user can access the admin panel).`,
      },
      {
        id: "ag-2",
        title: "System Monitoring",
        body: `System Monitoring provides real-time service health:\n\n- **Firebase Auth** — Connection and latency status\n- **Firestore DB** — Database availability and response times\n- **AI Providers** — Gemini, OpenAI, Anthropic health\n- **Payment Provider** — Stripe/Paystack connectivity\n- **Integration Engine** — Third-party integration status\n- **Automation Engine** — Rule engine status\n\nToggle **Live Mode** to auto-refresh every 10 seconds.`,
      },
      {
        id: "ag-3",
        title: "Feature Flags",
        body: `Feature flags let you toggle functionality without deploying code:\n\n- Navigate to Admin → Feature Flags\n- Toggle any flag on or off\n- Changes take effect immediately in the current session\n- Flags are persisted in localStorage (demo) or Firestore (cloud mode)\n\nCurrent flags include: AI Features, Analytics, Team Collaboration, Payments, and more.`,
      },
    ],
  },
  {
    id: "developer-guide",
    icon: "💻",
    title: "Developer Guide",
    description: "Architecture, services, and extending Voxora.",
    content: [
      {
        id: "dg-1",
        title: "Architecture Overview",
        body: `Voxora is a **React + TypeScript + Vite** single-page application.\n\n**Key architectural decisions:**\n- **State-based routing** — Dashboard uses a \`workspace\` state variable, not URL sub-routes. All workspace pages are lazy-loaded.\n- **Context providers** — Auth, Cloud, Toast, Activity, Project, AI, and Subscription contexts wrap the Dashboard.\n- **Backend abstraction** — \`BackendService\` wraps Firebase/Supabase/Local providers behind a unified interface.\n- **AI abstraction** — \`AIService\` supports OpenAI, Anthropic, Gemini, and Mock providers.\n- **Dark mode** — Applied via \`data-theme\` attribute on \`<html>\`. Theme persists in localStorage.\n\n**Directory structure:**\n\`\`\`\nsrc/\n  components/   — Shared components\n  context/      — React contexts\n  hooks/        — Custom hooks\n  pages/        — Route pages & workspace pages\n  services/     — Business logic services\n  styles/       — Global CSS\n\`\`\``,
      },
      {
        id: "dg-2",
        title: "Adding a New Workspace",
        body: `To add a new workspace page:\n\n1. Create \`src/pages/Workspaces/MyWorkspace.tsx\`\n2. Export a default component accepting \`{ setWorkspace: (w: string) => void }\`\n3. In \`Dashboard.tsx\`, add a lazy import:\n   \`const MyWorkspace = lazy(() => import("../Workspaces/MyWorkspace"));\`\n4. Add a render line in the Suspense block:\n   \`{workspace === "myWorkspace" && <MyWorkspace setWorkspace={setWorkspace} />}\`\n5. In \`Sidebar.tsx\`, add an entry to the appropriate nav array.\n\nFollow the \`Admin.css\` class conventions (\`admin-container\`, \`admin-card\`, etc.) for consistent styling.`,
      },
      {
        id: "dg-3",
        title: "AI Service Integration",
        body: `The AI Engine is accessed via the \`useAI\` hook or \`AIService\` directly:\n\n\`\`\`typescript\nimport { useAI } from "../../hooks/useAI";\n\nconst { generate, isLoading, error } = useAI();\n\nconst result = await generate({\n  prompt: "Your prompt here",\n  workspace: "myWorkspace",\n  systemPrompt: "You are a helpful assistant.",\n});\n\`\`\`\n\nThe service automatically routes to the configured provider (Gemini, OpenAI, Anthropic) or falls back to the Mock provider in Demo Mode. Results are cached by \`AICache\` and tracked by \`AIUsage\`.`,
      },
    ],
  },
  {
    id: "api-overview",
    icon: "🌐",
    title: "API Overview",
    description: "External APIs and service integrations.",
    content: [
      {
        id: "ao-1",
        title: "Firebase Configuration",
        body: `Firebase provides Auth and Firestore for cloud mode.\n\n**Required environment variables:**\n\`\`\`\nVITE_FIREBASE_API_KEY=\nVITE_FIREBASE_AUTH_DOMAIN=\nVITE_FIREBASE_PROJECT_ID=\nVITE_FIREBASE_STORAGE_BUCKET=\nVITE_FIREBASE_MESSAGING_SENDER_ID=\nVITE_FIREBASE_APP_ID=\n\`\`\`\n\nGet these from: Firebase Console → Project Settings → Your apps → Web app.\n\n**Firestore Rules** (paste into Firebase Console → Firestore → Rules):\n\`\`\`\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /users/{userId}/{document=**} {\n      allow read, write: if request.auth != null && request.auth.uid == userId;\n    }\n  }\n}\n\`\`\``,
      },
      {
        id: "ao-2",
        title: "Google Gemini AI",
        body: `Gemini is the default AI provider.\n\n**Setup:**\n1. Get an API key at https://aistudio.google.com\n2. Add to your environment: \`VITE_GEMINI_API_KEY=your_key\`\n3. The app auto-detects the key and switches to live mode\n\n**Usage limits:** Check your Google AI Studio dashboard for quota information.\n\n**Models used:** gemini-1.5-flash (default), configurable in AI Settings.`,
      },
      {
        id: "ao-3",
        title: "Payment Providers",
        body: `Voxora supports multiple payment providers via the \`PaymentService\` abstraction:\n\n- **Stripe** — Global payments (credit card, bank transfer)\n- **Paystack** — African markets (card, bank, USSD, mobile money)\n- **Flutterwave** — Pan-African payments\n\n**Configuration:** Add provider API keys in the Billing workspace. In Demo Mode, all billing is simulated.\n\nThe \`SubscriptionService\` manages plan tiers: Free, Pro, and Enterprise with configurable limits.`,
      },
    ],
  },
  {
    id: "faq",
    icon: "❓",
    title: "FAQ",
    description: "Frequently asked questions.",
    content: [
      {
        id: "faq-1",
        title: "Is my data safe in Demo Mode?",
        body: `In Demo Mode, all data is stored in your browser's localStorage. It is:\n- **Private** — Only accessible in your browser on your device\n- **Persistent** — Survives page refreshes and browser restarts\n- **Limited** — localStorage has a ~5MB limit per domain\n- **Not synced** — Not backed up or accessible from other devices\n\nTo get cloud backup and cross-device sync, configure Firebase credentials.`,
      },
      {
        id: "faq-2",
        title: "How do I enable live AI?",
        body: `By default, Voxora runs AI in Demo Mode with mock responses.\n\nTo enable live AI:\n1. Get a **Gemini API key** from https://aistudio.google.com (free tier available)\n2. Go to **AI Settings** (sidebar) and enter your key, OR\n3. Set \`VITE_GEMINI_API_KEY=your_key\` in your \`.env\` file and restart\n\nAlternatively, you can use **OpenAI** or **Anthropic** — configure them in Integrations → OpenAI / Anthropic Claude.`,
      },
      {
        id: "faq-3",
        title: "Can I self-host Voxora?",
        body: `Yes! Voxora is a standard Vite React app.\n\n**To deploy:**\n1. Set environment variables (Firebase, Gemini, etc.)\n2. Run \`npm run build\` — outputs to \`dist/\`\n3. Deploy the \`dist/\` folder to any static host:\n   - **Vercel** — \`vercel deploy\`\n   - **Netlify** — Drag and drop or CLI\n   - **Firebase Hosting** — \`firebase deploy\`\n   - **Replit** — Use the Deploy button\n\n**Important:** Configure your host to serve \`index.html\` for all routes (SPA mode).`,
      },
      {
        id: "faq-4",
        title: "How do I reset my data?",
        body: `To reset Demo Mode data:\n- Go to **Settings → Data Management** and use the clear options, OR\n- Open browser DevTools → Application → Local Storage → clear items prefixed with \`voxora-\`\n\nFor cloud mode, data is in Firestore under your user ID. You can delete it from the Firebase Console → Firestore → Data.`,
      },
    ],
  },
  {
    id: "release-notes",
    icon: "📋",
    title: "Release Notes",
    description: "Version history and changelog.",
    content: [
      {
        id: "rn-v59",
        title: "V5.9 — Launch Preparation & Production Readiness",
        body: `**Released:** July 2026\n\n**New Features:**\n- 🚨 **Error Reporting Service** — Centralized error history, filtering by category/severity, and export (JSON/CSV)\n- 🏥 **Health Check Dashboard** — Real-time status for Firebase, Gemini, AI Engine, Memory, Integrations, Automation, Payments, Auth\n- ✨ **Deployment Checklist** — Automated readiness scan for environment variables, routing, SEO, performance\n- 📚 **Documentation Center** — User Guide, Admin Guide, Developer Guide, API Overview, FAQ, Release Notes\n- ✅ **Launch Checklist** — Interactive launch checklist with progress tracking across 10 categories\n- 📊 **Dashboard V5.9 Widgets** — Launch Readiness Score, Health Summary, Deployment Status, Documentation Status\n\n**Improvements:**\n- All workspace pages are lazy-loaded for improved initial load time\n- Memoized service calls across Dashboard widgets\n- TypeScript strict-mode compliance verified`,
      },
      {
        id: "rn-v58",
        title: "V5.8 — Admin & Monitoring",
        body: `**Features:**\n- 🏛️ Admin Dashboard with system metrics and service status\n- 👥 User Management panel\n- 📡 System Monitoring with live refresh\n- 📋 Audit Logs with full action trail\n- 🔔 Notification Center\n- 🚩 Feature Flag management\n- Supporting services: MonitoringService, AuditLogService, NotificationService`,
      },
      {
        id: "rn-v57",
        title: "V5.7 — Integrations & Automation",
        body: `**Features:**\n- ⚡ Automation Engine with rule-based triggers\n- 📅 Google Calendar integration\n- 📧 Microsoft Outlook integration\n- 🐙 GitHub integration\n- AutomationEngine, AutomationRules, AutomationTypes services`,
      },
      {
        id: "rn-v55",
        title: "V5.5 — Public Beta Launch",
        body: `**Features:**\n- 🗺️ Getting Started onboarding wizard\n- 💬 Feedback Center\n- 🔒 Trust Center with security and privacy info\n- Welcome Wizard component`,
      },
    ],
  },
];

export default function DocumentationCenter({ setWorkspace }: Props) {
  const [activeSection, setActiveSection] = useState<string>(DOCS[0].id);
  const [activeArticle, setActiveArticle] = useState<string>(DOCS[0].content[0].id);

  const section = DOCS.find((d) => d.id === activeSection)!;
  const article = section.content.find((a) => a.id === activeArticle) ?? section.content[0];

  const formatBody = (body: string) =>
    body.split("\n").map((line, i) => {
      // Code blocks
      if (line.startsWith("```")) return null;
      // Bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} style={{ margin: "4px 0", lineHeight: 1.7, fontSize: 14, color: "var(--text-primary,#374151)" }}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });

  return (
    <div className="admin-container" style={{ maxWidth: 1100 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>📚 Documentation Center</h1>
          <span className="admin-badge admin-badge--blue">V5.9</span>
        </div>
        <p className="workspace-subtitle">User guides, API references, and developer docs.</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {DOCS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => { setActiveSection(doc.id); setActiveArticle(doc.content[0].id); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: "1.5px solid", transition: "all 0.15s",
              background: activeSection === doc.id ? "#6C63FF" : "var(--bg-card,#fff)",
              color: activeSection === doc.id ? "#fff" : "var(--text-primary,#374151)",
              borderColor: activeSection === doc.id ? "#6C63FF" : "var(--border,#e2e8f0)",
            }}
          >
            {doc.icon} {doc.title}
          </button>
        ))}
      </div>

      {/* Content layout */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Article list */}
        <div style={{
          width: 220, flexShrink: 0,
          background: "var(--bg-card,#fff)", border: "1px solid var(--border,#e5e7eb)",
          borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ padding: "12px 16px", background: "var(--bg-secondary,#f8fafc)", borderBottom: "1px solid var(--border,#f1f5f9)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary,#64748b)", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {section.icon} {section.title}
          </div>
          {section.content.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveArticle(a.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "11px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                border: "none", borderBottom: "1px solid var(--border,#f1f5f9)",
                background: activeArticle === a.id ? "rgba(108,99,255,0.08)" : "transparent",
                color: activeArticle === a.id ? "#6C63FF" : "var(--text-primary,#374151)",
                transition: "background 0.1s",
              }}
            >
              {a.title}
            </button>
          ))}
        </div>

        {/* Article content */}
        <div className="admin-card" style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 18, marginBottom: 16 }}>{article.title}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {formatBody(article.body)}
          </div>
        </div>
      </div>
    </div>
  );
}
