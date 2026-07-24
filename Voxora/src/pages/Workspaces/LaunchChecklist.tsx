// ── V5.9 Launch Checklist ─────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import "./Admin.css";

interface Props { setWorkspace: (w: string) => void }

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

interface ChecklistCategory {
  id: string;
  icon: string;
  title: string;
  items: ChecklistItem[];
}

const CATEGORIES: ChecklistCategory[] = [
  {
    id: "authentication",
    icon: "🔐",
    title: "Authentication",
    items: [
      { id: "auth-signup",    label: "Test sign up flow",             description: "Create a new account end-to-end." },
      { id: "auth-login",     label: "Test login flow",               description: "Sign in with an existing account." },
      { id: "auth-logout",    label: "Test logout",                   description: "Ensure session is cleared on logout." },
      { id: "auth-forgot",    label: "Test forgot password",          description: "Verify password reset email flow.", action: "securitySettings", actionLabel: "Security" },
      { id: "auth-protected", label: "Verify protected routes",       description: "Confirm unauthenticated users are redirected to /login." },
    ],
  },
  {
    id: "ai",
    icon: "🤖",
    title: "AI",
    items: [
      { id: "ai-provider",  label: "Configure AI provider",           description: "Set up Gemini, OpenAI, or Anthropic.", action: "aiSettings", actionLabel: "AI Settings" },
      { id: "ai-chat",      label: "Test AI Assistant",               description: "Send a message and receive a response.", action: "assistant", actionLabel: "Open Assistant" },
      { id: "ai-content",   label: "Test AI content generation",      description: "Generate at least one piece of content.", action: "content", actionLabel: "AI Content" },
      { id: "ai-health",    label: "Verify AI health status",         description: "Confirm provider shows healthy in Health Check.", action: "healthCheck", actionLabel: "Health Check" },
    ],
  },
  {
    id: "billing",
    icon: "💳",
    title: "Billing",
    items: [
      { id: "bill-provider", label: "Configure payment provider",     description: "Set up Stripe, Paystack, or Flutterwave.", action: "billing", actionLabel: "Billing" },
      { id: "bill-plans",    label: "Review subscription plans",      description: "Confirm Free, Pro, and Enterprise tiers are correct.", action: "billing", actionLabel: "Plans" },
      { id: "bill-trial",    label: "Test trial period",              description: "Verify trial countdown and expiry logic." },
    ],
  },
  {
    id: "memory",
    icon: "🧠",
    title: "Memory",
    items: [
      { id: "mem-storage",  label: "Check storage usage",             description: "Confirm localStorage usage is below 80%.", action: "systemMonitoring", actionLabel: "Monitor" },
      { id: "mem-ai",       label: "Test AI memory persistence",      description: "Start a conversation and verify it appears in history.", action: "aiMemorySettings", actionLabel: "Memory Settings" },
      { id: "mem-export",   label: "Test memory export",              description: "Export a project and verify the output.", action: "export", actionLabel: "Export Center" },
    ],
  },
  {
    id: "integrations",
    icon: "🔌",
    title: "Integrations",
    items: [
      { id: "int-hub",     label: "Review integrations hub",          description: "Confirm all integration cards display correctly.", action: "integrationsHub", actionLabel: "Integrations Hub" },
      { id: "int-connect", label: "Test at least one integration",    description: "Connect GitHub, Slack, or another service." },
      { id: "int-auto",    label: "Test automation rule",             description: "Create and trigger at least one automation rule.", action: "automation", actionLabel: "Automation" },
    ],
  },
  {
    id: "monitoring",
    icon: "📡",
    title: "Monitoring",
    items: [
      { id: "mon-health",  label: "Review health dashboard",          description: "All services show Healthy or Warning (not Offline).", action: "healthCheck", actionLabel: "Health Check" },
      { id: "mon-admin",   label: "Review admin dashboard",           description: "Metrics and service statuses load correctly.", action: "adminDashboard", actionLabel: "Admin" },
      { id: "mon-errors",  label: "Review error log",                 description: "No critical errors in the error reporting dashboard.", action: "errorReporting", actionLabel: "Error Log" },
      { id: "mon-audit",   label: "Review audit logs",                description: "Confirm activity is being logged.", action: "auditLogs", actionLabel: "Audit Logs" },
    ],
  },
  {
    id: "security",
    icon: "🔒",
    title: "Security",
    items: [
      { id: "sec-firestore", label: "Deploy Firestore security rules", description: "Apply rules from .env.example to Firebase Console." },
      { id: "sec-env",       label: "Secure environment variables",    description: "Verify .env is in .gitignore and not committed to git." },
      { id: "sec-https",     label: "Verify HTTPS on production",      description: "Ensure your deployment domain uses SSL/TLS." },
      { id: "sec-trust",     label: "Review Trust Center",             description: "Confirm privacy policy and terms of service are accurate.", action: "trust", actionLabel: "Trust Center" },
    ],
  },
  {
    id: "performance",
    icon: "⚡",
    title: "Performance",
    items: [
      { id: "perf-build",  label: "Run production build",             description: "Execute `npm run build` with zero errors." },
      { id: "perf-ts",     label: "Zero TypeScript errors",           description: "Run `tsc -b` and confirm no type errors." },
      { id: "perf-routes", label: "Verify all routes load",           description: "Navigate to each major route and confirm no blank pages." },
      { id: "perf-mobile", label: "Test mobile responsiveness",       description: "Check sidebar, dashboard, and workspaces on mobile viewport." },
    ],
  },
  {
    id: "documentation",
    icon: "📚",
    title: "Documentation",
    items: [
      { id: "doc-user",   label: "Review User Guide",                 description: "Confirm User Guide is up to date.", action: "documentationCenter", actionLabel: "Docs" },
      { id: "doc-admin",  label: "Review Admin Guide",                description: "Confirm Admin Guide covers all V5.8+ features.", action: "documentationCenter", actionLabel: "Docs" },
      { id: "doc-api",    label: "Review API Overview",               description: "Confirm Firebase and Gemini setup instructions are accurate.", action: "documentationCenter", actionLabel: "Docs" },
      { id: "doc-rn",     label: "Review Release Notes",              description: "Confirm V5.9 release notes are complete.", action: "documentationCenter", actionLabel: "Docs" },
    ],
  },
  {
    id: "deployment",
    icon: "✨",
    title: "Deployment",
    items: [
      { id: "dep-checklist", label: "Complete Deployment Checklist",  description: "All items pass in the Deployment Checklist.", action: "deploymentChecklist", actionLabel: "Deployment Checklist" },
      { id: "dep-meta",      label: "Update SEO meta tags",           description: "Set og:title, og:description, og:image in index.html." },
      { id: "dep-spa",       label: "Configure SPA routing on host",  description: "Ensure hosting serves index.html for all paths." },
      { id: "dep-domain",    label: "Set up custom domain",           description: "Point your domain to the deployment and verify SSL." },
      { id: "dep-go",        label: "Go live! 🎉",                    description: "Deploy and share your Voxora instance with the world." },
    ],
  },
];

const STORAGE_KEY = "voxora-launch-checklist-v59";

function loadChecked(): Set<string> {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}
function saveChecked(set: Set<string>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch { /* ignore */ }
}

export default function LaunchChecklist({ setWorkspace }: Props) {
  const [checked, setChecked] = useState<Set<string>>(loadChecked);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const allItems = useMemo(() => CATEGORIES.flatMap((c) => c.items), []);
  const totalItems = allItems.length;
  const doneItems = allItems.filter((i) => checked.has(i.id)).length;
  const percent = Math.round((doneItems / totalItems) * 100);

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveChecked(next);
      return next;
    });
  }, []);

  const markAll = useCallback(() => {
    const all = new Set(allItems.map((i) => i.id));
    setChecked(all);
    saveChecked(all);
  }, [allItems]);

  const clearAll = useCallback(() => {
    setChecked(new Set());
    saveChecked(new Set());
  }, []);

  useEffect(() => {
    const stored = loadChecked();
    setChecked(stored);
  }, []);

  const scoreColor = percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="admin-container" style={{ maxWidth: 860 }}>
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="admin-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1>✅ Launch Checklist</h1>
          <span className="admin-badge admin-badge--blue">V5.9</span>
          <span className="admin-badge" style={{ background: `${scoreColor}18`, color: scoreColor, borderColor: `${scoreColor}40` }}>
            {percent}% Complete
          </span>
        </div>
        <p className="workspace-subtitle">Track everything needed before your production beta release.</p>
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          <button className="admin-action-btn" onClick={markAll}>✅ Check All</button>
          <button className="admin-action-btn" onClick={clearAll}>🔄 Reset</button>
          <button className="admin-action-btn" onClick={() => setWorkspace("deploymentChecklist")}>✨ Deployment Checklist</button>
          <button className="admin-action-btn" onClick={() => setWorkspace("healthCheck")}>🏥 Health Check</button>
        </div>
      </div>

      {/* Progress */}
      <div className="admin-card" style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor }}>{percent}%</span>
            <span style={{ fontSize: 14, color: "var(--text-secondary,#64748b)", marginLeft: 10 }}>
              {doneItems} / {totalItems} tasks complete
            </span>
          </div>
          {percent === 100 && (
            <div style={{ fontSize: 24 }}>🎉</div>
          )}
        </div>
        <div style={{ height: 10, background: "var(--border,#e5e7eb)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: scoreColor, borderRadius: 6, transition: "width 0.4s ease" }} />
        </div>
        {percent === 100 && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#d1fae5", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#065f46" }}>
            ✨ You're ready for launch! All checklist items are complete.
          </div>
        )}
      </div>

      {/* Category KPIs */}
      <div className="admin-kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", marginBottom: 16 }}>
        {CATEGORIES.map((cat) => {
          const done = cat.items.filter((i) => checked.has(i.id)).length;
          const total = cat.items.length;
          const pct = Math.round((done / total) * 100);
          return (
            <div key={cat.id} className="admin-kpi-card">
              <div className="admin-kpi-icon">{cat.icon}</div>
              <div className="admin-kpi-value" style={{ color: pct === 100 ? "#10b981" : pct > 50 ? "#f59e0b" : "var(--text-primary,#1e293b)", fontSize: 16 }}>{pct}%</div>
              <div className="admin-kpi-label">{cat.title}</div>
              <div className="admin-kpi-bar-wrap">
                <div className="admin-kpi-bar" style={{ width: `${pct}%`, background: pct === 100 ? "#10b981" : pct > 50 ? "#f59e0b" : "#6C63FF" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: "1.5px solid",
              background: filter === f ? "#6C63FF" : "var(--bg-card,#fff)",
              color: filter === f ? "#fff" : "var(--text-primary,#374151)",
              borderColor: filter === f ? "#6C63FF" : "var(--border,#e2e8f0)",
              textTransform: "capitalize",
            }}
          >{f === "all" ? `All (${totalItems})` : f === "pending" ? `Pending (${totalItems - doneItems})` : `Done (${doneItems})`}</button>
        ))}
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat) => {
        const filteredItems = cat.items.filter((item) => {
          if (filter === "pending") return !checked.has(item.id);
          if (filter === "done")    return checked.has(item.id);
          return true;
        });
        if (filteredItems.length === 0) return null;

        const catDone = cat.items.filter((i) => checked.has(i.id)).length;

        return (
          <div key={cat.id} className="admin-card" style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ padding: "12px 18px", background: "var(--bg-secondary,#f8fafc)", borderBottom: "1px solid var(--border,#f1f5f9)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{cat.icon} {cat.title}</span>
              <span style={{ fontSize: 12, color: catDone === cat.items.length ? "#10b981" : "var(--text-secondary,#64748b)", fontWeight: 600 }}>
                {catDone}/{cat.items.length} {catDone === cat.items.length ? "✓" : ""}
              </span>
            </div>
            {filteredItems.map((item, i) => {
              const done = checked.has(item.id);
              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
                    borderBottom: i < filteredItems.length - 1 ? "1px solid var(--border,#f1f5f9)" : undefined,
                    background: done ? "rgba(16,185,129,0.03)" : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(item.id)}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? "#10b981" : "var(--bg-secondary,#f8fafc)",
                    border: `2px solid ${done ? "#10b981" : "var(--border,#d1d5db)"}`,
                    transition: "all 0.15s",
                  }}>
                    {done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: done ? "var(--text-secondary,#94a3b8)" : "var(--text-primary,#1e293b)", textDecoration: done ? "line-through" : undefined }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary,#94a3b8)", marginTop: 1 }}>{item.description}</div>
                  </div>
                  {item.action && (
                    <button
                      className="admin-action-btn"
                      style={{ padding: "5px 10px", fontSize: 11, flexShrink: 0 }}
                      onClick={(e) => { e.stopPropagation(); setWorkspace(item.action!); }}
                    >
                      {item.actionLabel}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
