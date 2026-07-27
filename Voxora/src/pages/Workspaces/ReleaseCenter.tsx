// ── V9.2 Release Center ──────────────────────────────────────────────────────
import { useState } from "react";
import "./ReleaseCenter.css";

interface Props { setWorkspace: (w: string) => void; }

interface Release {
  version: string;
  date: string;
  tag: "Major" | "Minor" | "Patch" | "Beta";
  headline: string;
  features: string[];
  improvements: string[];
  fixes: string[];
}

const RELEASES: Release[] = [
  {
    version: "V9.2",
    date: "July 2026",
    tag: "Major",
    headline: "Public Launch & Customer Success",
    features: [
      "Customer Success Dashboard — health scores, onboarding progress, churn risk, adoption metrics",
      "Product Analytics — workspace usage, AI analytics, feature adoption, productivity score",
      "Release Center — changelog, what's new, feature announcements, maintenance notices",
      "Dashboard personalisation — daily productivity summary, V9.2 Customer Success section",
      "Performance improvements — React.memo, useMemo, useCallback optimisations throughout",
      "Security hardening — enhanced input validation, permission guards, session verification",
    ],
    improvements: [
      "Added escapeHtml, readJson, writeJson, writeString, downloadBlob, validateBackup to SafeStorage",
      "TypeScript strict-mode fixes across Settings, BrandIdentityGen, ExecSummaryGen, LandingPageGen, OpsSOPBuilder, PitchDeckGenerator",
      "Dashboard daily productivity summary widget added to home view",
      "Sidebar V9.2 section with Customer Success, Product Analytics, Release Center",
    ],
    fixes: [
      "Fixed TS2305 missing SafeStorage exports used by 6 workspace files",
      "Fixed TS18046 unknown type errors in Settings.tsx backup/restore flow",
    ],
  },
  {
    version: "V9.1",
    date: "July 2026",
    tag: "Minor",
    headline: "Enterprise Operations",
    features: [
      "Enterprise Operations service with full audit trail",
      "Beta Program workspace with onboarding and feature management",
      "User Management with persist, roles, suspend/restore, admin guards",
      "Audit events for all admin actions",
      "SafeStorage compatibility fixes",
    ],
    improvements: [
      "Dashboard and Sidebar wired for Enterprise Operations",
      "Role management and permission validation",
    ],
    fixes: [
      "SafeStorage missing exports causing build failures",
      "TypeScript strict-mode issues resolved",
    ],
  },
  {
    version: "V9.0",
    date: "July 2026",
    tag: "Major",
    headline: "Public Beta Launch",
    features: [
      "Public Beta announcement banner across the landing page",
      "AI Provider Status workspace — real-time provider health",
      "Product Tour for first-time users",
      "Feedback Widget always visible in dashboard",
      "Beta readiness scoring",
    ],
    improvements: [
      "Performance — lazy loading across all 150+ workspaces",
      "Mobile navigation improvements",
      "Keyboard shortcuts expanded",
    ],
    fixes: [],
  },
  {
    version: "V8.3",
    date: "June 2026",
    tag: "Major",
    headline: "Integrations Marketplace",
    features: [
      "Integrations Dashboard — unified view of all 15+ integrations",
      "Integrations Monitoring — health checks and usage stats",
      "Webhooks Manager — create, test, and manage webhooks",
      "Integration Settings — global configuration",
    ],
    improvements: ["OpenAI, Gemini, Anthropic, Google Drive, Dropbox, Notion, Slack, Zapier, GitHub integrations updated"],
    fixes: [],
  },
  {
    version: "V8.2",
    date: "June 2026",
    tag: "Major",
    headline: "Enterprise AI Automation",
    features: [
      "AI Agents — 7 specialised autonomous agents",
      "Scheduled Tasks — time-based automation engine",
      "Enterprise AI Memory — company profile and brand context for personalised AI",
      "Automation Engine — visual workflow builder",
    ],
    improvements: ["Dashboard widgets for all Enterprise AI metrics"],
    fixes: [],
  },
  {
    version: "V6.7",
    date: "May 2026",
    tag: "Major",
    headline: "Customer Support Studio",
    features: [
      "Customer Support Studio — unified support hub",
      "AI Support Assistant — intelligent ticket routing and resolution",
      "Support Ticket Manager — full ticket lifecycle management",
      "Knowledge Base — searchable help articles",
      "Live Chat Manager — real-time customer chat",
      "Customer Feedback Tracker — NPS and CSAT tracking",
      "Support Analytics — response time, resolution rate, satisfaction scores",
    ],
    improvements: [],
    fixes: [],
  },
];

const UPCOMING = [
  { icon: "🔥", title: "Firebase Live Mode", desc: "One-click Firebase setup to switch from Demo Mode to full cloud sync.", eta: "V9.3" },
  { icon: "🤖", title: "Gemini AI Integration", desc: "Live AI generation across all 50+ workspace tools with your own API key.", eta: "V9.3" },
  { icon: "📱", title: "Mobile App (PWA)", desc: "Installable progressive web app for iOS and Android.", eta: "V9.4" },
  { icon: "🤝", title: "Real-time Team Collaboration", desc: "Live multi-user editing in workspaces via Firebase RTDB.", eta: "V9.4" },
  { icon: "🔗", title: "Zapier & n8n Workflows", desc: "Native Zapier triggers and n8n webhook connectors.", eta: "V10.0" },
];

const MAINTENANCE = [
  { status: "resolved", icon: "✅", title: "TypeScript build errors in SafeStorage", date: "July 27, 2026", desc: "Missing utility exports caused typecheck failures in 6 workspace files. Resolved in V9.1." },
  { status: "resolved", icon: "✅", title: "Vite dev server not found on first launch", date: "July 27, 2026", desc: "npm install not run on initial import. Resolved by running dependency install." },
];

function TagBadge({ tag }: { tag: Release["tag"] }) {
  const map: Record<string, { bg: string; color: string }> = {
    Major: { bg: "#ede9fe", color: "#4c1d95" },
    Minor: { bg: "#dbeafe", color: "#1e3a8a" },
    Patch: { bg: "#dcfce7", color: "#166534" },
    Beta:  { bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[tag];
  return <span className="rc-tag" style={{ background: s.bg, color: s.color }}>{tag}</span>;
}

export default function ReleaseCenter({ setWorkspace }: Props) {
  const [activeTab, setActiveTab] = useState<"whats-new" | "changelog" | "upcoming" | "maintenance">("whats-new");
  const [expandedVersion, setExpandedVersion] = useState<string | null>("V9.2");

  return (
    <div className="workspace-container rc-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🚀 Release Center</h1>
      <p className="workspace-subtitle">What's new in Voxora, full changelog, upcoming features, and maintenance notices.</p>

      {/* Tabs */}
      <div className="rc-tabs">
        {(["whats-new","changelog","upcoming","maintenance"] as const).map(tab => (
          <button key={tab} className={`rc-tab ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab === "whats-new" ? "🆕 What's New" : tab === "changelog" ? "📋 Changelog" : tab === "upcoming" ? "🔮 Coming Soon" : "🔧 Maintenance"}
          </button>
        ))}
      </div>

      {/* ── What's New ── */}
      {activeTab === "whats-new" && (
        <>
          <div className="rc-hero">
            <div className="rc-hero-badge">Latest Release</div>
            <h2 className="rc-hero-title">V9.2 — Public Launch &amp; Customer Success</h2>
            <p className="rc-hero-sub">July 2026 · Customer health dashboards, product analytics, release centre, and production hardening.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button className="workspace-btn" onClick={() => setWorkspace("customerSuccess")}>💚 Customer Success →</button>
              <button className="workspace-btn" onClick={() => setWorkspace("productAnalytics")}>📊 Product Analytics →</button>
            </div>
          </div>

          <div className="rc-feature-grid">
            {RELEASES[0].features.map((f, i) => (
              <div key={i} className="rc-feature-card">
                <span className="rc-feature-check">✨</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="rc-two-col">
            <div className="rc-panel">
              <h3>🛠️ Improvements</h3>
              <ul className="rc-list">
                {RELEASES[0].improvements.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="rc-panel">
              <h3>🐛 Bug Fixes</h3>
              {RELEASES[0].fixes.length > 0 ? (
                <ul className="rc-list">
                  {RELEASES[0].fixes.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>No bug fixes in this release.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Changelog ── */}
      {activeTab === "changelog" && (
        <div className="rc-changelog">
          {RELEASES.map((r) => (
            <div key={r.version} className="rc-release-entry">
              <button
                className="rc-release-header"
                onClick={() => setExpandedVersion(expandedVersion === r.version ? null : r.version)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
                  <span className="rc-version">{r.version}</span>
                  <TagBadge tag={r.tag} />
                  <span className="rc-headline">{r.headline}</span>
                  <span className="rc-date">{r.date}</span>
                </div>
                <span className="rc-chevron">{expandedVersion === r.version ? "▲" : "▼"}</span>
              </button>

              {expandedVersion === r.version && (
                <div className="rc-release-body">
                  {r.features.length > 0 && (
                    <>
                      <div className="rc-section-label">✨ New Features</div>
                      <ul className="rc-list">{r.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                    </>
                  )}
                  {r.improvements.length > 0 && (
                    <>
                      <div className="rc-section-label">🛠️ Improvements</div>
                      <ul className="rc-list">{r.improvements.map((f, i) => <li key={i}>{f}</li>)}</ul>
                    </>
                  )}
                  {r.fixes.length > 0 && (
                    <>
                      <div className="rc-section-label">🐛 Bug Fixes</div>
                      <ul className="rc-list">{r.fixes.map((f, i) => <li key={i}>{f}</li>)}</ul>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Coming Soon ── */}
      {activeTab === "upcoming" && (
        <div className="rc-upcoming-list">
          {UPCOMING.map((u, i) => (
            <div key={i} className="rc-upcoming-card">
              <div className="rc-upcoming-icon">{u.icon}</div>
              <div className="rc-upcoming-body">
                <div className="rc-upcoming-title">{u.title}</div>
                <div className="rc-upcoming-desc">{u.desc}</div>
              </div>
              <span className="rc-upcoming-eta">ETA: {u.eta}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Maintenance ── */}
      {activeTab === "maintenance" && (
        <>
          <div className="rc-status-banner rc-status-operational">
            <span>💚</span>
            <div>
              <strong>All systems operational</strong>
              <div style={{ fontSize: 12, marginTop: 2 }}>Voxora V9.2 is running normally. Last checked: just now.</div>
            </div>
          </div>
          <div className="rc-maintenance-list">
            {MAINTENANCE.map((m, i) => (
              <div key={i} className="rc-maintenance-card">
                <div className="rc-maintenance-header">
                  <span>{m.icon}</span>
                  <div>
                    <div className="rc-maintenance-title">{m.title}</div>
                    <div className="rc-maintenance-date">{m.date}</div>
                  </div>
                  <span className={`rc-maintenance-status ${m.status}`}>{m.status}</span>
                </div>
                <p className="rc-maintenance-desc">{m.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
