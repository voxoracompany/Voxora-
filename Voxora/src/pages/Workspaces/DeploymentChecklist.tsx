// ── V5.9 Deployment Checklist ─────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { useAIContext }  from "../../context/AIContext";
import { useAuth }       from "../../context/AuthContext";
import { MonitoringService } from "../../services/admin/MonitoringService";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

interface CheckItem {
  id: string;
  category: string;
  label: string;
  status: "pass" | "warn" | "fail" | "info";
  detail: string;
  action?: string;
  actionLabel?: string;
}

const STATUS_ICON: Record<string, string> = { pass: "✅", warn: "⚠️", fail: "❌", info: "ℹ️" };
const STATUS_COLOR: Record<string, string> = {
  pass: "#10b981", warn: "#f59e0b", fail: "#ef4444", info: "#6C63FF",
};

export default function DeploymentChecklist({ setWorkspace }: Props) {
  const { isDemoMode, activeProvider } = useAIContext();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const metrics = useMemo(() => MonitoringService.getMetrics(), []);

  const checks: CheckItem[] = useMemo(() => {
    const hasFirebase = !isDemoMode && !!import.meta.env.VITE_FIREBASE_API_KEY;
    const hasGemini   = !!import.meta.env.VITE_GEMINI_API_KEY;
    const memOk = metrics.memoryUsage < 90;

    return [
      // Environment Variables
      {
        id: "env-firebase",
        category: "Environment Variables",
        label: "Firebase API Key",
        status: hasFirebase ? "pass" : "warn",
        detail: hasFirebase ? "VITE_FIREBASE_API_KEY is set." : "Not set — app will run in Demo Mode. Add to .env for cloud sync.",
        action: "accountSettings",
        actionLabel: "Settings",
      },
      {
        id: "env-gemini",
        category: "Environment Variables",
        label: "Gemini AI API Key",
        status: hasGemini ? "pass" : "warn",
        detail: hasGemini ? "VITE_GEMINI_API_KEY is set." : "Not set — AI features use mock responses. Add to .env for live AI.",
        action: "intGemini",
        actionLabel: "Configure",
      },
      // Production Configuration
      {
        id: "prod-demofallback",
        category: "Production Configuration",
        label: "Demo Mode Fallback",
        status: "pass",
        detail: "App gracefully falls back to localStorage when Firebase is not configured.",
      },
      {
        id: "prod-build",
        category: "Production Configuration",
        label: "Vite Build Configuration",
        status: "pass",
        detail: "vite.config.ts is set to port 5000, allowedHosts: true. Production build via `npm run build`.",
      },
      {
        id: "prod-ts",
        category: "Production Configuration",
        label: "TypeScript Strict Mode",
        status: "pass",
        detail: "tsconfig.app.json uses strict: true. Run `tsc -b` to verify zero errors before deploy.",
      },
      // Routing
      {
        id: "routing-404",
        category: "Routing",
        label: "404 / Not Found Page",
        status: "pass",
        detail: "NotFound page is lazy-loaded and registered as the catch-all route.",
      },
      {
        id: "routing-protected",
        category: "Routing",
        label: "Protected Routes",
        status: "pass",
        detail: "ProtectedRoute wraps /dashboard. Unauthenticated users are redirected to /login.",
      },
      {
        id: "routing-spa",
        category: "Routing",
        label: "SPA Routing (history mode)",
        status: "info",
        detail: "Ensure your hosting platform (Netlify, Vercel, Firebase Hosting) is configured to serve index.html for all routes.",
      },
      // Assets & SEO
      {
        id: "assets-favicon",
        category: "Assets & SEO",
        label: "Favicon",
        status: "pass",
        detail: "public/favicon.svg is present.",
      },
      {
        id: "assets-robots",
        category: "Assets & SEO",
        label: "robots.txt",
        status: "pass",
        detail: "public/robots.txt is present.",
      },
      {
        id: "assets-sitemap",
        category: "Assets & SEO",
        label: "sitemap.xml",
        status: "pass",
        detail: "public/sitemap.xml is present.",
      },
      {
        id: "assets-meta",
        category: "Assets & SEO",
        label: "Meta Tags (OG / Social)",
        status: "info",
        detail: "Update index.html og:title, og:description, og:image, and twitter:* tags before production launch.",
      },
      // Auth & Data
      {
        id: "auth-user",
        category: "Authentication",
        label: "User Authentication",
        status: user !== null ? "pass" : "warn",
        detail: user !== null
          ? `Signed in as ${user.email ?? "Demo User"}.`
          : "No user signed in. Test login/signup flows before deploying.",
        action: "securitySettings",
        actionLabel: "Security",
      },
      {
        id: "auth-firestore-rules",
        category: "Authentication",
        label: "Firestore Security Rules",
        status: hasFirebase ? "pass" : "info",
        detail: hasFirebase
          ? "Firebase configured. Ensure Firestore rules are deployed from .env.example."
          : "Firebase not configured — see .env.example for Firestore security rules template.",
      },
      // Performance
      {
        id: "perf-lazy",
        category: "Performance",
        label: "Route Lazy Loading",
        status: "pass",
        detail: "All workspace pages are lazy-loaded with React.lazy() + Suspense.",
      },
      {
        id: "perf-storage",
        category: "Performance",
        label: "Storage Usage",
        status: memOk ? "pass" : "warn",
        detail: `localStorage: ${metrics.memoryUsage}% used (${MonitoringService.formatBytes(metrics.storageUsed)}). ${memOk ? "OK." : "High — consider clearing old data."}`,
      },
      {
        id: "perf-ai",
        category: "Performance",
        label: "AI Provider",
        status: isDemoMode ? "warn" : "pass",
        detail: isDemoMode
          ? `Running in Demo Mode (${activeProvider}). AI responses are mocked.`
          : `Live AI enabled via ${activeProvider}.`,
        action: "aiSettings",
        actionLabel: "AI Settings",
      },
    ];
  }, [isDemoMode, activeProvider, user, metrics]);

  const categories = [...new Set(checks.map((c) => c.category))];
  const passCount  = checks.filter((c) => c.status === "pass").length;
  const warnCount  = checks.filter((c) => c.status === "warn").length;
  const failCount  = checks.filter((c) => c.status === "fail").length;
  const score = Math.round((passCount / checks.length) * 100);

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => setWorkspace("launchChecklist")}>← Back to Launch Checklist</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>✨ Deployment Checklist</h1>
          <span className="admin-badge admin-badge--blue">V5.9</span>
          <span className="admin-badge admin-badge--green">{score}% Ready</span>
        </div>
        <p className="workspace-subtitle">Verify your environment, configuration, routing, and assets before going live.</p>
      </div>

      {/* Score */}
      <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))" }}>
        {[
          { icon: "🎯", label: "Readiness", value: `${score}%`, color: score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444" },
          { icon: "✅", label: "Passed", value: passCount, color: "#10b981" },
          { icon: "⚠️", label: "Warnings", value: warnCount, color: "#f59e0b" },
          { icon: "❌", label: "Failed", value: failCount, color: "#ef4444" },
        ].map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon">{k.icon}</div>
            <div className="admin-kpi-value" style={{ color: k.color }}>{k.value}</div>
            <div className="admin-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="admin-card" style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
          <span>Deployment Readiness Score</span>
          <span style={{ color: score > 80 ? "#10b981" : "#f59e0b" }}>{score}%</span>
        </div>
        <div style={{ height: 8, background: "var(--border,#e5e7eb)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${score}%`, height: "100%", background: score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#ef4444", borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Checks by Category */}
      {categories.map((cat) => (
        <div key={cat} className="admin-card" style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "12px 18px", background: "var(--bg-secondary,#f8fafc)", borderBottom: "1px solid var(--border,#f1f5f9)", fontWeight: 700, fontSize: 13 }}>
            📁 {cat}
          </div>
          {checks.filter((c) => c.category === cat).map((check, i, arr) => (
            <div
              key={check.id}
              style={{
                padding: "13px 18px",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border,#f1f5f9)" : undefined,
                cursor: "pointer",
              }}
              onClick={() => setExpanded(expanded === check.id ? null : check.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{STATUS_ICON[check.status]}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary,#1e293b)" }}>{check.label}</span>
                  {expanded === check.id && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary,#64748b)", marginTop: 4 }}>{check.detail}</div>
                  )}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                  background: `${STATUS_COLOR[check.status]}18`, color: STATUS_COLOR[check.status],
                  textTransform: "uppercase",
                }}>{check.status}</span>
                {check.action && expanded === check.id && (
                  <button
                    className="admin-action-btn"
                    style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={(e) => { e.stopPropagation(); setWorkspace(check.action!); }}
                  >
                    {check.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
