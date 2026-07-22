// ── V6.0 Beta Readiness Report ────────────────────────────────────────────────
// Comprehensive launch-readiness dashboard for the V6.0 public beta.

import { useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAIContext } from "../../context/AIContext";
import { IntegrationService } from "../../services/integrations/IntegrationService";
import { AutomationEngine } from "../../services/automation/AutomationEngine";
import { MonitoringService } from "../../services/admin/MonitoringService";
import { ErrorReportingService } from "../../services/admin/ErrorReportingService";

interface Props { setWorkspace: (w: string) => void }

const WORKSPACES = [
  "AI Assistant", "AI Content Generator", "App Ideas", "Startup Ideas",
  "Customer Research", "Market Research", "Customer Persona", "Product Validation",
  "Competitor Analysis", "SWOT Analysis", "Business Model Canvas", "Product Roadmap",
  "Marketing Hub", "Marketing Strategy", "Email Campaigns", "Social Media Posts",
  "SEO Planner", "Ad Copy", "Content Calendar", "Brand Voice",
  "Financial Hub", "Financial Forecast", "Revenue Model", "Pricing Strategy",
  "Unit Economics", "Break-Even Analysis", "Pitch Deck", "Executive Summary",
  "Investor Hub", "Fundraising Strategy", "Investor Narrative", "Term Sheet Guide",
  "Due Diligence", "Cap Table",
  "Growth Hub", "Growth Planner", "KPI Dashboard", "Goal Tracker", "OKR Manager",
  "Growth Opportunity", "Growth Experiments", "A/B Test Planner", "Business Milestones",
  "Weekly Review", "Monthly Growth Report", "AI Growth Recommendations",
  "Analytics Hub", "Executive Dashboard", "Revenue Analytics", "Customer Analytics",
  "Marketing Analytics", "Financial Analytics", "AI Analytics", "Startup Analytics",
  "Trend Analysis", "Analytics Reports",
  "Team Hub", "Team Members", "Task Board", "Meeting Notes", "Team Goals",
  "Role Assignment", "Team Announcements", "Team Brief", "Collaboration Plan",
  "Team Retrospective",
  "Integrations Hub", "OpenAI Integration", "Gemini Integration", "Anthropic Integration",
  "Google Drive", "Dropbox", "Notion", "Slack", "Zapier", "Webhooks",
  "Automation Workspace", "Google Calendar", "Outlook", "GitHub",
  "Memory Settings", "Prompt Library",
  "Billing", "Getting Started", "Feedback Center", "Trust Center",
  "Admin Dashboard", "User Management", "System Monitoring", "Audit Logs",
  "Notification Center", "Feature Flags",
  "Error Reporting", "Health Check", "Deployment Checklist", "Documentation Center",
  "Launch Checklist", "AI Memory Settings", "AI Settings", "Settings",
  "User Profile", "Account Settings", "Security Settings",
  "Activity Center", "Smart Search", "Export Center", "Help Center", "Dev Admin",
  "Saved Projects", "Analytics Dashboard",
];

const SERVICES = [
  "AIService", "AICache", "AIHealthMonitor", "AIRequestManager", "AIContextManager",
  "AIMemory", "AIUsage", "PromptLibrary", "MemoryService",
  "BackendService", "LocalBackendProvider", "FirebaseBackendProvider",
  "PaymentService", "StripeProvider", "FlutterwaveProvider", "PaystackProvider",
  "IntegrationService", "AutomationEngine",
  "MonitoringService", "AuditLogService", "NotificationService", "ErrorReportingService",
  "SubscriptionEngine", "AuthContext", "CloudContext",
];

const PROVIDERS = [
  "OpenAI", "Gemini (Google)", "Anthropic (Claude)", "Mock (Demo)",
  "Firebase Auth", "Firebase Firestore", "Local Storage (Demo)",
  "Stripe", "Flutterwave", "Paystack", "Demo Billing",
];

const ROUTES = [
  "/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email",
  "/pricing", "/about", "/blog", "/careers", "/contact", "/privacy", "/terms",
  "/platforms/ai-command-center", "/platforms/startup-studio", "/platforms/marketing-studio",
  "/platforms/financial-studio", "/platforms/investor-studio",
  "/solutions/creators", "/solutions/entrepreneurs", "/solutions/businesses", "/solutions/developers",
  "/dashboard", "* (404)",
];

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: color + "20", color,
    }}>{label}</span>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, display: "flex", alignItems: "center", gap: 8, margin: "0 0 16px", color: "var(--color-text, #0f172a)" }}>
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function StatGrid({ stats }: { stats: { icon: string; label: string; value: string | number; color?: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 8 }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 12, padding: "16px 12px", textAlign: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 24 }}>{s.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.color ?? "var(--accent,#6C63FF)", margin: "6px 0 4px" }}>{s.value}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

import React from "react";

export default function BetaReadinessReport({ setWorkspace }: Props) {
  const { projects } = useProjects();
  const { usage, isDemoMode, activeProvider, health } = useAIContext();

  const intStats  = useMemo(() => IntegrationService.getStats(), []);
  const autoStats = useMemo(() => AutomationEngine.getStats(), []);
  const sysMetrics = useMemo(() => MonitoringService.getMetrics(), []);
  const errStats  = useMemo(() => ErrorReportingService.getStats(), []);

  const launchChecklistDone = useMemo(() => {
    try { return (JSON.parse(localStorage.getItem("voxora-launch-checklist-v59") || "[]") as string[]).length; }
    catch { return 0; }
  }, []);
  const CHECKLIST_TOTAL = 37;

  const operationalServices = sysMetrics.services.filter(s => s.status === "operational").length;
  const healthScore = Math.round((operationalServices / Math.max(1, sysMetrics.services.length)) * 100);
  const checklistPct = Math.round((launchChecklistDone / CHECKLIST_TOTAL) * 100);
  const errScore = errStats.unresolved === 0 ? 100 : errStats.unresolved < 3 ? 80 : 50;
  const launchScore = Math.min(100, Math.round(checklistPct * 0.5 + healthScore * 0.3 + errScore * 0.2));

  const scoreColor = launchScore >= 80 ? "#10b981" : launchScore >= 60 ? "#f59e0b" : "#ef4444";
  const scoreLabel = launchScore >= 80 ? "Launch Ready ✅" : launchScore >= 60 ? "Nearly Ready ⚠️" : "Needs Work 🔴";

  const buildDate = "2026-07-22";
  const version = "V6.0 Launch Candidate (RC)";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #6C63FF 0%, #8b5cf6 100%)",
        borderRadius: 20, padding: "32px 36px", marginBottom: 32,
        color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>🚀 Beta Readiness Report</h1>
            <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>{version} — Generated {buildDate}</p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px 28px", textAlign: "center",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: 40, fontWeight: 900 }}>{launchScore}%</div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>{scoreLabel}</div>
          </div>
        </div>
      </div>

      {/* Build Statistics */}
      <Section title="Build Statistics" icon="📊">
        <StatGrid stats={[
          { icon: "🛠️", label: "Workspaces", value: WORKSPACES.length, color: "#6C63FF" },
          { icon: "⚙️", label: "Services", value: SERVICES.length, color: "#8b5cf6" },
          { icon: "🔌", label: "Providers", value: PROVIDERS.length, color: "#06b6d4" },
          { icon: "🗺️", label: "Routes", value: ROUTES.length, color: "#10b981" },
          { icon: "📁", label: "Projects", value: projects.length, color: "#f59e0b" },
          { icon: "🤖", label: "AI Requests Today", value: usage.todayCount, color: "#ef4444" },
          { icon: "🔗", label: "Integrations", value: intStats.total, color: "#0ea5e9" },
          { icon: "⚡", label: "Automations", value: autoStats.total, color: "#84cc16" },
        ]} />
      </Section>

      {/* Launch Readiness */}
      <Section title="Launch Readiness Score" icon="🎯">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "24px 28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            {[
              { label: "Checklist", value: checklistPct, detail: `${launchChecklistDone}/${CHECKLIST_TOTAL} items` },
              { label: "System Health", value: healthScore, detail: `${operationalServices}/${sysMetrics.services.length} services` },
              { label: "Error Status", value: errScore, detail: `${errStats.unresolved} unresolved` },
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: item.value >= 80 ? "#10b981" : item.value >= 60 ? "#f59e0b" : "#ef4444" }}>
                  {item.value}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text, #0f172a)" }}>{item.label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)" }}>{item.detail}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--color-border-light, #f1f5f9)", borderRadius: 8, height: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}bb)`, width: `${launchScore}%`, transition: "width 0.5s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)" }}>0%</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{launchScore}% — {scoreLabel}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)" }}>100%</span>
          </div>
        </div>
      </Section>

      {/* System Status */}
      <Section title="System Status" icon="💚">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {sysMetrics.services.map(s => (
              <div key={s.name} style={{
                padding: "6px 14px", borderRadius: 20,
                background: s.status === "operational" ? "#d1fae5" : s.status === "degraded" ? "#fef3c7" : "#fee2e2",
                color: s.status === "operational" ? "#065f46" : s.status === "degraded" ? "#92400e" : "#991b1b",
                fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
              }}>
                <span>{s.status === "operational" ? "✅" : s.status === "degraded" ? "⚠️" : "🔴"}</span>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* AI Status */}
      <Section title="AI Engine Status" icon="🤖">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Badge color={isDemoMode ? "#f59e0b" : "#10b981"} label={isDemoMode ? "Demo Mode" : "Live Mode"} />
            <Badge color="#6C63FF" label={`Provider: ${activeProvider}`} />
            <Badge color={health.length === 0 || health.every(h => h.status === "healthy") ? "#10b981" : "#f59e0b"} label={`Health: ${health.length === 0 ? "unknown" : health[0].status}`} />
            <Badge color="#0ea5e9" label={`Requests today: ${usage.todayCount}`} />
            <Badge color="#8b5cf6" label={`This week: ${usage.weeklyCount}`} />
          </div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary, #6b7280)", margin: "12px 0 0", lineHeight: 1.5 }}>
            {isDemoMode
              ? "Running in Demo Mode — AI responses are simulated. Configure an AI provider in AI Settings to enable real responses."
              : `Live AI responses enabled via ${activeProvider}. All requests go through the rate limiter and cache layer.`}
          </p>
          <button
            onClick={() => setWorkspace("aiSettings")}
            style={{ marginTop: 12, padding: "8px 16px", background: "var(--accent,#6C63FF)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            ⚙️ Configure AI
          </button>
        </div>
      </Section>

      {/* Workspaces List */}
      <Section title={`All Workspaces (${WORKSPACES.length})`} icon="🗂️">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {WORKSPACES.map(w => (
              <span key={w} style={{
                padding: "4px 10px", borderRadius: 8,
                background: "var(--color-border-light, #f1f5f9)",
                color: "var(--color-text, #374151)", fontSize: 12, fontWeight: 500,
              }}>{w}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Known Limitations */}
      <Section title="Known Limitations" icon="⚠️">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {[
            { icon: "🔗", text: "Third-party integrations (Slack, GitHub, Dropbox, Notion, Zapier, Google Drive) show connection UI but OAuth flows require backend API credentials to fully function." },
            { icon: "💳", text: "Payment providers (Stripe, Flutterwave, Paystack) are wired but require VITE_STRIPE_* / VITE_PAYSTACK_* / VITE_FLUTTERWAVE_* keys to process real transactions." },
            { icon: "🔥", text: "Firebase backend requires VITE_FIREBASE_* environment variables. Without them, the app operates in localStorage Demo Mode (suitable for evaluation, not production data persistence)." },
            { icon: "📱", text: "Mobile layout is functional but some complex workspaces (e.g. Financial Forecast, Pitch Deck) are optimised for desktop." },
            { icon: "🌐", text: "No server-side rendering — this is a pure SPA. SEO for dynamic content relies on client-side rendering." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--color-border-light,#f1f5f9)" : "none" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "var(--color-text, #374151)", lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Future Roadmap */}
      <Section title="Future Roadmap (V6.1+)" icon="🗺️">
        <div style={{
          background: "var(--color-card, #fff)", border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {[
            { version: "V6.1", items: ["OAuth2 integration flows (Slack, GitHub, Google Drive)", "Real payment checkout sessions", "Email notification system"] },
            { version: "V6.2", items: ["Multi-user workspaces (real-time collaboration via Firebase)", "Custom domain support", "White-label options"] },
            { version: "V6.3", items: ["Mobile app (React Native)", "Offline-first PWA capabilities", "Advanced AI memory with semantic search"] },
            { version: "V7.0", items: ["AI agents with autonomous task execution", "No-code automation builder", "Enterprise SSO (SAML/OIDC)"] },
          ].map(section => (
            <div key={section.version} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent,#6C63FF)", marginBottom: 6 }}>{section.version}</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {section.items.map(item => (
                  <li key={item} style={{ fontSize: 13, color: "var(--color-text, #374151)", lineHeight: 1.8 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Quick Navigation */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "🚀 Launch Checklist", ws: "launchChecklist" },
          { label: "❤️ Health Check", ws: "healthCheck" },
          { label: "🐛 Error Reporting", ws: "errorReporting" },
          { label: "📋 Deployment Checklist", ws: "deploymentChecklist" },
          { label: "📚 Documentation", ws: "documentationCenter" },
        ].map(btn => (
          <button
            key={btn.ws}
            onClick={() => setWorkspace(btn.ws)}
            style={{
              padding: "10px 18px", background: "var(--color-card,#fff)",
              border: "1.5px solid var(--color-border,#e2e8f0)", borderRadius: 10,
              fontSize: 13, fontWeight: 700, cursor: "pointer", color: "var(--color-text,#0f172a)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
