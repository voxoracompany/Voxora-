// ── V5.5 Trust Center ─────────────────────────────────────────────────────────
// Privacy Policy, Terms of Service, Cookie Policy, Data Security,
// Responsible AI, About Voxora

import { useState } from "react";
import "./TrustCenter.css";

interface Props { setWorkspace: (w: string) => void; }

const TABS = ["Privacy Policy", "Terms of Service", "Cookie Policy", "Data Security", "Responsible AI", "About Voxora"] as const;
type Tab = typeof TABS[number];

export default function TrustCenter({ setWorkspace }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Privacy Policy");

  return (
    <div className="trust-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="trust-header">
        <h1>🔒 Trust Center</h1>
        <p className="workspace-subtitle">Transparency, security, and responsible AI — our commitments to you.</p>
      </div>

      <div className="trust-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`trust-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="trust-content" role="tabpanel">

        {/* ── Privacy Policy ── */}
        {activeTab === "Privacy Policy" && (
          <div className="trust-section-card">
            <h2>🔒 Privacy Policy</h2>
            <p className="trust-meta">Effective Date: January 1, 2025 · Last Updated: July 2025</p>
            <div className="trust-badge-row">
              <div className="trust-badge"><span className="trust-badge-icon">💾</span>Local-first storage</div>
              <div className="trust-badge"><span className="trust-badge-icon">🔐</span>No third-party selling</div>
              <div className="trust-badge"><span className="trust-badge-icon">🧹</span>Full data deletion</div>
            </div>
            <h3>1. Information We Collect</h3>
            <p>Voxora operates primarily as a local-first application. In demo mode, all data is stored in your browser's localStorage and never transmitted to our servers. When you enable cloud features (Firebase), we store only:</p>
            <ul>
              <li>Your email address and display name (for authentication)</li>
              <li>Project data and AI conversation history (synced to your account)</li>
              <li>Usage analytics (aggregated and anonymized)</li>
            </ul>
            <h3>2. How We Use Your Information</h3>
            <p>We use collected information solely to provide and improve the Voxora service. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
            <h3>3. Data Storage & Security</h3>
            <p>Local demo data never leaves your device. Cloud data is encrypted in transit (TLS 1.3) and at rest using AES-256 encryption via Firebase. We follow industry best practices for access control and monitoring.</p>
            <h3>4. Your Rights</h3>
            <ul>
              <li><strong>Access:</strong> Request a copy of your data at any time</li>
              <li><strong>Deletion:</strong> Delete your account and all associated data</li>
              <li><strong>Portability:</strong> Export your data via Settings → Backup</li>
              <li><strong>Correction:</strong> Update your profile information at any time</li>
            </ul>
            <h3>5. Contact</h3>
            <p>For privacy questions: <strong>privacy@voxora.ai</strong></p>
          </div>
        )}

        {/* ── Terms of Service ── */}
        {activeTab === "Terms of Service" && (
          <div className="trust-section-card">
            <h2>📄 Terms of Service</h2>
            <p className="trust-meta">Effective Date: January 1, 2025 · Last Updated: July 2025</p>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing or using Voxora, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.</p>
            <h3>2. Use of Service</h3>
            <p>Voxora grants you a limited, non-exclusive, non-transferable license to use the platform for lawful business and personal purposes. You may not:</p>
            <ul>
              <li>Use the service to generate illegal, harmful, or deceptive content</li>
              <li>Attempt to reverse-engineer or exploit the platform</li>
              <li>Share your account credentials with others</li>
              <li>Use automated scripts to abuse the AI request limits</li>
            </ul>
            <h3>3. Beta Service</h3>
            <p>Voxora is currently in Public Beta. Features may change, and the service is provided "as is" without warranties. We reserve the right to modify or discontinue features at any time with reasonable notice.</p>
            <h3>4. Intellectual Property</h3>
            <p>Content you create using Voxora belongs to you. Voxora retains ownership of the platform, its UI, and underlying AI infrastructure. You grant Voxora a limited license to use your content to improve the service (aggregated, anonymized).</p>
            <h3>5. Limitation of Liability</h3>
            <p>Voxora is not liable for indirect, incidental, or consequential damages arising from use of the service. Our maximum liability is limited to the amount you paid in the last 12 months.</p>
            <h3>6. Contact</h3>
            <p>For legal questions: <strong>legal@voxora.ai</strong></p>
          </div>
        )}

        {/* ── Cookie Policy ── */}
        {activeTab === "Cookie Policy" && (
          <div className="trust-section-card">
            <h2>🍪 Cookie Policy</h2>
            <p className="trust-meta">Last Updated: July 2025</p>
            <h3>What Are Cookies?</h3>
            <p>Cookies are small text files stored on your device. Voxora uses minimal cookies — we prefer localStorage for application data.</p>
            <h3>Cookies We Use</h3>
            <div className="trust-grid">
              {[
                { icon: "⚙️", name: "Essential", desc: "Session management, authentication state. Cannot be disabled." },
                { icon: "📊", name: "Analytics", desc: "Aggregated usage data to improve the product. Opt-out available in Settings." },
                { icon: "💾", name: "Preferences", desc: "Theme, language, and layout preferences. Stored in localStorage." },
                { icon: "🚫", name: "No Tracking", desc: "We do not use advertising cookies or third-party trackers." },
              ].map(c => (
                <div key={c.name} className="trust-grid-card">
                  <div className="trust-grid-icon">{c.icon}</div>
                  <strong>{c.name}</strong>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
            <h3>Managing Cookies</h3>
            <p>You can clear cookies and localStorage via Settings → Data Management. Note that clearing all data will log you out and reset your preferences.</p>
          </div>
        )}

        {/* ── Data Security ── */}
        {activeTab === "Data Security" && (
          <div>
            <div className="trust-highlight">
              <h3>🛡️ Security-First Architecture</h3>
              <p>Voxora is built with a local-first approach — your data is never unnecessarily sent to external servers. In demo mode, everything stays on your device.</p>
            </div>
            <div className="trust-section-card">
              <h2>🔐 Data Security</h2>
              <h3>Encryption</h3>
              <ul>
                <li><strong>In transit:</strong> All data transmitted over TLS 1.3</li>
                <li><strong>At rest:</strong> AES-256 encryption via Firebase</li>
                <li><strong>Local data:</strong> Browser's built-in localStorage (no additional encryption)</li>
              </ul>
              <h3>Authentication Security</h3>
              <ul>
                <li>Firebase Authentication with industry-standard OAuth flows</li>
                <li>Optional two-factor authentication (2FA) for all accounts</li>
                <li>Secure session management with automatic expiry</li>
                <li>Password breach detection on account creation</li>
              </ul>
              <h3>Access Controls</h3>
              <ul>
                <li>Role-based access control for team features</li>
                <li>Audit logs for sensitive account changes</li>
                <li>API key isolation per workspace</li>
                <li>AI provider keys stored encrypted, never logged</li>
              </ul>
              <h3>Incident Response</h3>
              <p>We maintain a 24-hour incident response SLA for security issues. To report a security vulnerability: <strong>security@voxora.ai</strong></p>
            </div>
          </div>
        )}

        {/* ── Responsible AI ── */}
        {activeTab === "Responsible AI" && (
          <div>
            <div className="trust-section-card">
              <h2>🤖 Responsible AI</h2>
              <p>Voxora is committed to building AI tools that are helpful, harmless, and honest. Here's how we approach responsible AI:</p>
              <div className="trust-grid" style={{ marginBottom: 20 }}>
                {[
                  { icon: "🎯", name: "Transparency", desc: "We clearly indicate when content is AI-generated." },
                  { icon: "⚖️", name: "Fairness", desc: "We actively test for and mitigate bias in AI outputs." },
                  { icon: "🔒", name: "Privacy", desc: "Your prompts are never used to train AI models without consent." },
                  { icon: "🧠", name: "Human Control", desc: "AI is a tool — all decisions remain with the user." },
                  { icon: "🚫", name: "Content Safety", desc: "We filter harmful, illegal, and deceptive content." },
                  { icon: "♻️", name: "Sustainability", desc: "We optimize AI calls to minimize environmental impact." },
                ].map(c => (
                  <div key={c.name} className="trust-grid-card">
                    <div className="trust-grid-icon">{c.icon}</div>
                    <strong>{c.name}</strong>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
              <h3>AI Provider Partners</h3>
              <p>Voxora integrates with OpenAI, Google Gemini, and Anthropic Claude — all of which have published responsible AI frameworks. We rely on their content policies in addition to our own.</p>
              <h3>Prohibited Uses</h3>
              <ul>
                <li>Generating disinformation or political propaganda</li>
                <li>Creating content that impersonates real individuals deceptively</li>
                <li>Using AI to automate harassment or spam</li>
                <li>Generating illegal content of any kind</li>
              </ul>
              <h3>Report AI Misuse</h3>
              <p>If you encounter harmful AI outputs: <strong>safety@voxora.ai</strong></p>
            </div>
          </div>
        )}

        {/* ── About Voxora ── */}
        {activeTab === "About Voxora" && (
          <div>
            <div className="trust-section-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✨</div>
              <h2>About Voxora</h2>
              <p style={{ fontSize: 16, color: "#6C63FF", fontWeight: 700, margin: "0 0 16px" }}>
                The Intelligence Layer for the AI Age
              </p>
              <div className="trust-badge-row" style={{ justifyContent: "center", marginBottom: 20 }}>
                <div className="trust-badge">🧪 Public Beta</div>
                <div className="trust-badge">🤖 AI-Native</div>
                <div className="trust-badge">🌍 Built for Builders</div>
              </div>
              <p>Voxora is an AI-native platform for creating, orchestrating, and scaling intelligent agents, automation workflows, and business applications. We help founders, teams, and creators move from idea to execution faster with the power of AI.</p>
            </div>
            <div className="trust-section-card">
              <h3>Our Mission</h3>
              <p>To democratize access to intelligent business tools — making the capabilities that were once reserved for large enterprises available to every builder, founder, and creator on the planet.</p>
              <h3>What We Build</h3>
              <div className="trust-grid">
                {[
                  { icon: "🤖", name: "AI Assistants", desc: "Smart conversation and research tools" },
                  { icon: "📊", name: "Analytics Studio", desc: "Growth and business intelligence" },
                  { icon: "✨", name: "Startup Tools", desc: "Idea to pitch deck, end to end" },
                  { icon: "🤝", name: "Team Collaboration", desc: "Async-first team management" },
                  { icon: "💰", name: "Financial Studio", desc: "Models, forecasts, and planning" },
                  { icon: "🌱", name: "Growth Studio", desc: "KPIs, OKRs, and experiments" },
                ].map(c => (
                  <div key={c.name} className="trust-grid-card">
                    <div className="trust-grid-icon">{c.icon}</div>
                    <strong>{c.name}</strong>
                    <p>{c.desc}</p>
                  </div>
                ))}
              </div>
              <h3>Contact</h3>
              <p>📧 General: <strong>hello@voxora.ai</strong><br />
              🐛 Support: <strong>support@voxora.ai</strong><br />
              🔒 Security: <strong>security@voxora.ai</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
