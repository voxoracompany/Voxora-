// ── V5.5 Help Center (expanded) ───────────────────────────────────────────────
import { useState } from "react";
import "./HelpCenter.css";

interface Props { setWorkspace: (w: string) => void; }

const FAQS = [
  { q: "How do I create a project?", a: "Navigate to any tool (AI Assistant, Startup Ideas, Customer Research, etc.) and fill in the form. Click the generate button and your results are automatically saved as a project in Saved Projects." },
  { q: "Where are my projects stored?", a: "All projects are stored locally in your browser's localStorage by default. They persist across page refreshes. Use Settings → Backup & Restore to export your data. Enable Firebase for cloud sync." },
  { q: "How do I back up my data?", a: "Go to Settings → Backup & Restore → Export Backup. This downloads a JSON file containing all your projects, activities, and preferences. You can restore it using the Import Backup option." },
  { q: "What is the AI Assistant?", a: "The AI Assistant is Voxora's built-in intelligence that helps you brainstorm ideas, research customers, plan products, and more. It's accessible from the sidebar under AI Tools or via Ctrl+N." },
  { q: "How do I pin or favorite a project?", a: "Open Saved Projects, find your project, and click ⭐ (favorite) or 📌 (pin). Pinned projects appear at the top of your list." },
  { q: "Can I export my projects as PDF?", a: "Yes! Go to Export Center in the sidebar. Select the project(s) you want, choose PDF, Markdown, Text, or JSON, then click Export." },
  { q: "How do I switch between light and dark mode?", a: "Go to Settings → Appearance → Theme. Select Light or Dark mode. Your preference is saved immediately." },
  { q: "Is my data safe?", a: "In demo mode, your data stays entirely on your device in localStorage. With Firebase enabled, data is encrypted in transit (TLS 1.3) and at rest (AES-256)." },
  { q: "How do I delete all my data?", a: "Go to Settings → Data Management → Clear All Data. This permanently removes all projects, activities, and settings. Export a backup first." },
  { q: "Can I use Voxora with a team?", a: "Yes! The Team Collaboration suite (Team Hub, Task Board, Team Members, etc.) is available in the sidebar. Cloud sync via Firebase is required for real-time collaboration." },
  { q: "What AI providers does Voxora support?", a: "Voxora supports OpenAI (GPT-4), Google Gemini, and Anthropic Claude. Set your API keys in AI Settings. Without keys, Voxora runs in demo mode." },
  { q: "What is Voxora Beta?", a: "Voxora is currently in Public Beta. All core features are functional. Some cloud and team features require Firebase setup. We ship updates regularly." },
];

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], description: "Open Smart Search" },
  { keys: ["Ctrl", "N"], description: "Go to AI Assistant" },
  { keys: ["Ctrl", "S"], description: "Go to Saved Projects" },
  { keys: ["Ctrl", "E"], description: "Open Export Center" },
  { keys: ["Ctrl", "H"], description: "Open Help Center" },
  { keys: ["Ctrl", "Shift", "D"], description: "Open Developer Panel" },
  { keys: ["Escape"], description: "Go back to Dashboard" },
  { keys: ["Enter"], description: "Submit form / Send AI message" },
  { keys: ["Tab"], description: "Navigate between fields" },
];

const RELEASE_NOTES = [
  {
    version: "V5.5",
    date: "July 2025",
    tag: "Public Beta",
    highlights: [
      "Welcome Wizard for first-time users",
      "Getting Started checklist with progress tracking",
      "Quick Start Templates (6 workflow templates)",
      "Feedback Center — Bug reports, Feature requests, Satisfaction rating",
      "Trust Center — Privacy, ToS, Cookie Policy, Data Security, Responsible AI",
      "Expanded Help Center with User Guide, AI Guide, Billing Guide, Firebase Guide",
      "Dashboard V5.5 widgets — Beta Status, Tour Progress, System Health, Latest Updates",
      "Landing page improvements — animations, showcase, customer logos section",
      "Accessibility improvements — ARIA labels, keyboard navigation, focus management",
      "Performance — additional memoization, lazy loading, loading skeletons",
    ],
  },
  {
    version: "V5.4",
    date: "June 2025",
    tag: "Payments",
    highlights: [
      "Full Billing & Subscription system",
      "Stripe, Paystack, and Flutterwave payment providers",
      "Free, Pro, and Enterprise plan tiers",
      "Trial management and renewal tracking",
      "Usage limits per plan (AI requests, storage, projects)",
      "Subscription context for plan-gated features",
    ],
  },
  {
    version: "V5.3",
    date: "June 2025",
    tag: "Auth & Cloud",
    highlights: [
      "Firebase Authentication (email/password)",
      "Local Demo Mode fallback",
      "Cloud sync via Firestore",
      "AuthContext, ProtectedRoute, CloudContext",
      "User Profile, Account Settings, Security Settings workspaces",
      "Session persistence and login history",
    ],
  },
  {
    version: "V5.1–V5.2",
    date: "May 2025",
    tag: "AI Engine",
    highlights: [
      "Multi-provider AI engine (OpenAI, Gemini, Anthropic)",
      "AI cache, health monitor, request manager, context manager",
      "AI usage tracking and rate limiting",
      "Prompt library for all workspace tools",
      "AI Analytics workspace",
    ],
  },
];

const TABS = [
  "Getting Started", "User Guide", "AI Guide", "Billing Guide", "Firebase Guide",
  "FAQs", "Keyboard Shortcuts", "Release Notes", "Contact Support", "About Voxora",
] as const;
type Tab = typeof TABS[number];

export default function HelpCenter({ setWorkspace }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Getting Started");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="help-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="help-header">
        <h1>❓ Help Center</h1>
        <p className="workspace-subtitle">Everything you need to use Voxora effectively.</p>
      </div>

      <div className="help-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`help-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="help-content" role="tabpanel">

        {/* ─── Getting Started ─── */}
        {activeTab === "Getting Started" && (
          <div className="help-getting-started">
            <div className="help-section-card">
              <h3>👋 Welcome to Voxora Beta</h3>
              <p>Voxora is an AI-native platform for creating, orchestrating, and scaling intelligent agents, automations, and business applications. Here's how to get started in 5 minutes.</p>
            </div>
            <div className="help-steps">
              {[
                { num: "01", title: "Set Up Your Profile", desc: "Go to My Profile in the sidebar and enter your name and business goal. Voxora uses this to personalize AI responses." },
                { num: "02", title: "Choose a Workspace Tool", desc: "Use the sidebar to navigate. Try AI Assistant for quick brainstorming, or Startup Ideas to generate business concepts." },
                { num: "03", title: "Generate & Save", desc: "Fill in the form and click generate. Your results are automatically saved to Saved Projects." },
                { num: "04", title: "Organize Your Work", desc: "In Saved Projects, pin your best work, mark favorites with ⭐, and use filters to find what you need." },
                { num: "05", title: "Export & Back Up", desc: "Use Export Center to download projects as PDF or Markdown. Use Settings → Backup to save all your data." },
              ].map(step => (
                <div key={step.num} className="help-step">
                  <div className="help-step-num">{step.num}</div>
                  <div className="help-step-body">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 24 }}>
              <h3>🗺️ Navigation Overview</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "🤖", name: "AI Assistant", desc: "Chat with Voxora AI for ideas and strategy" },
                  { icon: "💡", name: "Startup Ideas", desc: "Generate business concepts automatically" },
                  { icon: "🔬", name: "Customer Research", desc: "Understand your target audience" },
                  { icon: "📊", name: "Analytics", desc: "Track your productivity stats" },
                  { icon: "🔍", name: "Smart Search", desc: "Find anything across all your projects" },
                  { icon: "📤", name: "Export Center", desc: "Download your work in multiple formats" },
                  { icon: "🕒", name: "Activity Center", desc: "See a log of everything you've done" },
                  { icon: "⚙️", name: "Settings", desc: "Customize themes, backup data" },
                  { icon: "💳", name: "Billing & Plans", desc: "Manage subscription and usage" },
                  { icon: "🤝", name: "Team Hub", desc: "Collaborate with your team" },
                ].map(item => (
                  <div key={item.name} className="help-nav-item">
                    <span className="help-nav-icon">{item.icon}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="help-section-card" style={{ marginTop: 16 }}>
              <h3>🎯 Your Getting Started Checklist</h3>
              <p>Track your setup progress in the <strong>Getting Started</strong> workspace (sidebar → Getting Started). Complete all steps to unlock the full power of Voxora.</p>
              <button
                style={{ marginTop: 12, background: "linear-gradient(135deg,#6C63FF,#9C8DFF)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                onClick={() => setWorkspace("gettingStarted")}
              >
                Open Getting Started →
              </button>
            </div>
          </div>
        )}

        {/* ─── User Guide ─── */}
        {activeTab === "User Guide" && (
          <div>
            <div className="help-section-card">
              <h3>📖 User Guide</h3>
              <p>A comprehensive guide to all Voxora workspaces and features.</p>
            </div>
            {[
              {
                title: "🤖 AI Tools",
                items: [
                  { name: "AI Assistant", desc: "Your intelligent conversation partner. Ask anything about business, ideas, strategy, or get help writing. Conversations are saved and searchable." },
                  { name: "AI Content", desc: "Generate blog posts, product descriptions, social captions, and more. Choose your tone and format." },
                  { name: "App Ideas", desc: "Generate app concepts with market analysis, tech stack recommendations, and MVP feature sets." },
                  { name: "Startup Ideas", desc: "Turn a problem or interest into a full startup concept with market size, competition, and business model." },
                  { name: "AI Settings", desc: "Configure your AI provider (OpenAI, Gemini, Anthropic), set API keys, and view usage stats." },
                ],
              },
              {
                title: "🔬 Research Tools",
                items: [
                  { name: "Customer Research", desc: "Define and analyze your target customer — pain points, behaviors, demographics, and willingness to pay." },
                  { name: "Market Research", desc: "Analyze market size, trends, and opportunities for your business idea." },
                  { name: "Customer Persona", desc: "Create detailed buyer personas with AI assistance." },
                  { name: "Product Validation", desc: "Validate your idea with a structured framework — problem, solution, market fit, and risks." },
                  { name: "Competitor Analysis", desc: "Map the competitive landscape and identify your differentiation." },
                  { name: "SWOT Analysis", desc: "Generate a complete Strengths, Weaknesses, Opportunities, and Threats analysis." },
                ],
              },
              {
                title: "📊 Analytics & Insights",
                items: [
                  { name: "Analytics Dashboard", desc: "View your Voxora usage stats, project counts, and productivity metrics." },
                  { name: "Analytics Hub", desc: "Access all analytics modules — revenue, customer, marketing, financial, and AI analytics." },
                  { name: "KPI Dashboard", desc: "Define and track key performance indicators for your business." },
                  { name: "Growth Studio", desc: "Plan, track, and optimize your business growth with goal tracking and experiments." },
                ],
              },
              {
                title: "🤝 Team Collaboration",
                items: [
                  { name: "Team Hub", desc: "Your team's central workspace. Manage members, tasks, and communications." },
                  { name: "Task Board", desc: "Kanban-style task management for your team." },
                  { name: "Meeting Notes", desc: "Capture and organize meeting notes with AI summarization." },
                  { name: "Team Goals & OKRs", desc: "Set and track team objectives and key results." },
                ],
              },
            ].map(section => (
              <div key={section.title} className="help-section-card" style={{ marginBottom: 12 }}>
                <h3>{section.title}</h3>
                <div className="help-nav-grid">
                  {section.items.map(item => (
                    <div key={item.name} className="help-nav-item">
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── AI Guide ─── */}
        {activeTab === "AI Guide" && (
          <div>
            <div className="help-section-card">
              <h3>🧠 AI Guide</h3>
              <p>Learn how to get the best results from Voxora's AI features.</p>
            </div>
            <div className="help-section-card">
              <h3>Demo Mode vs. Live AI</h3>
              <p>Without API keys, Voxora runs in <strong>Demo Mode</strong> — returning realistic placeholder responses so you can explore all features. Enable live AI by adding your API key in <strong>AI Settings</strong>.</p>
            </div>
            <div className="help-section-card">
              <h3>Supported AI Providers</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "🧠", name: "OpenAI GPT-4", desc: "Best for complex reasoning, writing, and code. Set OPENAI_API_KEY in AI Settings." },
                  { icon: "♊", name: "Google Gemini", desc: "Fast, multimodal AI from Google. Set GEMINI_API_KEY in AI Settings." },
                  { icon: "🤖", name: "Anthropic Claude", desc: "Excellent for nuanced analysis and long-form content. Set ANTHROPIC_API_KEY in AI Settings." },
                ].map(p => (
                  <div key={p.name} className="help-nav-item">
                    <span className="help-nav-icon">{p.icon}</span>
                    <div><strong>{p.name}</strong><p>{p.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="help-steps">
              {[
                { num: "01", title: "Get an API Key", desc: "Sign up at openai.com, ai.google.dev, or anthropic.com to get your API key. Free tiers are available on all platforms." },
                { num: "02", title: "Add it to AI Settings", desc: "Go to AI Settings in the sidebar, paste your key, and click Save. Voxora will validate it automatically." },
                { num: "03", title: "Select Your Provider", desc: "Set your preferred provider as the default. You can switch anytime from the AI Settings dropdown." },
                { num: "04", title: "Start Generating", desc: "Use any AI tool — results will now use your live AI provider instead of demo responses." },
              ].map(step => (
                <div key={step.num} className="help-step">
                  <div className="help-step-num">{step.num}</div>
                  <div className="help-step-body"><h4>{step.title}</h4><p>{step.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 16 }}>
              <h3>💡 Tips for Better AI Results</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "📝", name: "Be Specific", desc: "Include your industry, target market, and goals in your prompts." },
                  { icon: "🔄", name: "Iterate", desc: "Use follow-up messages to refine and expand AI outputs." },
                  { icon: "💾", name: "Save Good Results", desc: "Projects are auto-saved. Pin your best AI outputs for quick access." },
                  { icon: "⚡", name: "Use Templates", desc: "The Quick Start templates in Getting Started are pre-configured for common use cases." },
                ].map(tip => (
                  <div key={tip.name} className="help-nav-item">
                    <span className="help-nav-icon">{tip.icon}</span>
                    <div><strong>{tip.name}</strong><p>{tip.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Billing Guide ─── */}
        {activeTab === "Billing Guide" && (
          <div>
            <div className="help-section-card">
              <h3>💳 Billing Guide</h3>
              <p>Everything you need to know about Voxora plans and billing.</p>
            </div>
            <div className="help-section-card">
              <h3>Available Plans</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "🆓", name: "Free", desc: "50 AI requests/month, 1GB storage, 10 projects. No credit card required." },
                  { icon: "⚡", name: "Pro ($12/mo)", desc: "500 AI requests/month, 10GB storage, unlimited projects, PDF export, priority support." },
                  { icon: "🏢", name: "Enterprise (Custom)", desc: "Unlimited everything, custom AI models, SSO/SAML, dedicated support, SLA." },
                ].map(p => (
                  <div key={p.name} className="help-nav-item">
                    <span className="help-nav-icon">{p.icon}</span>
                    <div><strong>{p.name}</strong><p>{p.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="help-section-card">
              <h3>Demo Billing Mode</h3>
              <p>Without a real payment integration, Voxora runs in <strong>Demo Billing Mode</strong>. All plan features are simulated so you can explore the full billing experience. To connect real payments, contact us at <strong>billing@voxora.ai</strong>.</p>
            </div>
            <div className="help-steps">
              {[
                { num: "01", title: "View Your Plan", desc: "Go to Billing & Plans in the sidebar to see your current plan, usage, and renewal date." },
                { num: "02", title: "Upgrade or Downgrade", desc: "Click 'Change Plan' to upgrade or downgrade. Changes take effect at your next billing cycle." },
                { num: "03", title: "Manage Payment", desc: "Update your payment method via the Payment Method section in Billing & Plans." },
                { num: "04", title: "Cancel Anytime", desc: "You can cancel your subscription at any time. You retain access until the end of your billing period." },
              ].map(step => (
                <div key={step.num} className="help-step">
                  <div className="help-step-num">{step.num}</div>
                  <div className="help-step-body"><h4>{step.title}</h4><p>{step.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 16 }}>
              <h3>Billing Contact</h3>
              <p>For billing questions or refund requests: <strong>billing@voxora.ai</strong></p>
              <button style={{ marginTop: 12, background: "linear-gradient(135deg,#6C63FF,#9C8DFF)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14 }} onClick={() => setWorkspace("billing")}>
                Open Billing & Plans →
              </button>
            </div>
          </div>
        )}

        {/* ─── Firebase Guide ─── */}
        {activeTab === "Firebase Guide" && (
          <div>
            <div className="help-section-card">
              <h3>🔥 Firebase Guide</h3>
              <p>Connect Firebase to enable real authentication, cloud data sync, and multi-device access.</p>
            </div>
            <div className="help-section-card">
              <h3>Why Connect Firebase?</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "🔐", name: "Real Auth", desc: "Secure email/password login with password reset and email verification." },
                  { icon: "☁️", name: "Cloud Sync", desc: "Your projects sync across devices and browsers automatically." },
                  { icon: "🤝", name: "Team Features", desc: "Share projects and collaborate with your team in real time." },
                  { icon: "🛡️", name: "Backups", desc: "Your data is safe in Google's infrastructure with automatic backups." },
                ].map(f => (
                  <div key={f.name} className="help-nav-item">
                    <span className="help-nav-icon">{f.icon}</span>
                    <div><strong>{f.name}</strong><p>{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="help-steps">
              {[
                { num: "01", title: "Create a Firebase Project", desc: "Go to console.firebase.google.com → Create a new project. Enable Authentication (Email/Password) and Firestore Database." },
                { num: "02", title: "Get Your Config Keys", desc: "In Firebase Console → Project Settings → Your Apps → Web App → Copy the config object. You need: apiKey, authDomain, projectId." },
                { num: "03", title: "Set Environment Variables", desc: "In your Replit project, set: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and optionally VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID." },
                { num: "04", title: "Restart Voxora", desc: "Restart the development server. Voxora will automatically detect your Firebase config and switch from Demo Mode to Firebase Mode." },
                { num: "05", title: "Verify Connection", desc: "Check the Dashboard → Cloud & Backend section. You should see 'Firebase Connected' and 'Cloud Connected' badges." },
              ].map(step => (
                <div key={step.num} className="help-step">
                  <div className="help-step-num">{step.num}</div>
                  <div className="help-step-body"><h4>{step.title}</h4><p>{step.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 16 }}>
              <h3>⚠️ Without Firebase</h3>
              <p>Voxora works fully without Firebase in <strong>Local Demo Mode</strong>. All features are available with localStorage persistence. Firebase is optional and only needed for cloud sync and real authentication.</p>
            </div>
          </div>
        )}

        {/* ─── FAQs ─── */}
        {activeTab === "FAQs" && (
          <div className="help-faqs">
            <div className="help-section-card">
              <h3>💬 Frequently Asked Questions</h3>
              <p>Find answers to the most common questions about Voxora.</p>
            </div>
            <div className="faq-list">
              {FAQS.map((faq, i) => (
                <div key={i} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-chevron">{openFaq === i ? "▲" : "▼"}</span>
                  </button>
                  {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Keyboard Shortcuts ─── */}
        {activeTab === "Keyboard Shortcuts" && (
          <div className="help-shortcuts">
            <div className="help-section-card">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <p>Use keyboard shortcuts to navigate Voxora faster.</p>
            </div>
            <div className="shortcuts-list">
              {SHORTCUTS.map((s, i) => (
                <div key={i} className="shortcut-row">
                  <span className="shortcut-desc">{s.description}</span>
                  <div className="shortcut-keys">
                    {s.keys.map((k, j) => (
                      <span key={j} className="shortcut-key">{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 20 }}>
              <h3>💡 Pro Tip</h3>
              <p>Press <strong>Ctrl + K</strong> from anywhere in the app to instantly open Smart Search and find any project, note, or analysis.</p>
            </div>
          </div>
        )}

        {/* ─── Release Notes ─── */}
        {activeTab === "Release Notes" && (
          <div>
            <div className="help-section-card">
              <h3>📋 Release Notes</h3>
              <p>A history of what's been built in Voxora — version by version.</p>
            </div>
            {RELEASE_NOTES.map(rel => (
              <div key={rel.version} className="help-section-card" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>{rel.version}</h3>
                  <span style={{ fontSize: 11, background: "#ede9fe", color: "#4c1d95", borderRadius: 20, padding: "2px 10px", fontWeight: 700 }}>{rel.tag}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>{rel.date}</span>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                  {rel.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: "#4b5563", marginBottom: 4, lineHeight: 1.5 }}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* ─── Contact Support ─── */}
        {activeTab === "Contact Support" && (
          <div className="help-contact">
            <div className="help-section-card">
              <h3>📬 Get in Touch</h3>
              <p>Have a question, found a bug, or want to suggest a feature? We'd love to hear from you.</p>
            </div>
            <div className="help-contact-grid">
              {[
                { icon: "📧", title: "Email Support", desc: "support@voxora.ai", sub: "We typically respond within 24 hours." },
                { icon: "💬", title: "Community", desc: "community.voxora.ai", sub: "Join our community forum for tips and discussions." },
                { icon: "🐛", title: "Report a Bug", desc: "bugs@voxora.ai", sub: "Found something broken? Let us know." },
                { icon: "✨", title: "Feature Request", desc: "ideas@voxora.ai", sub: "Have an idea to improve Voxora?" },
              ].map(c => (
                <div key={c.title} className="help-contact-card">
                  <div className="help-contact-icon">{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p className="help-contact-email">{c.desc}</p>
                  <p>{c.sub}</p>
                </div>
              ))}
            </div>
            <div className="help-section-card" style={{ marginTop: 16 }}>
              <h3>💬 Feedback Center</h3>
              <p>Use the built-in Feedback Center to report bugs, request features, or share your thoughts directly within Voxora.</p>
              <button style={{ marginTop: 12, background: "linear-gradient(135deg,#6C63FF,#9C8DFF)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14 }} onClick={() => setWorkspace("feedback")}>
                Open Feedback Center →
              </button>
            </div>
          </div>
        )}

        {/* ─── About Voxora ─── */}
        {activeTab === "About Voxora" && (
          <div className="help-about">
            <div className="help-section-card help-about-hero">
              <div className="help-about-logo">🚀</div>
              <h2>Voxora</h2>
              <p className="help-about-tagline">The Intelligence Layer for the Future of the AI Age</p>
              <div className="help-about-badges">
                <span className="help-about-badge">🧪 Public Beta</span>
                <span className="help-about-badge">🤖 AI-Native</span>
                <span className="help-about-badge">🌍 Built for Builders</span>
              </div>
            </div>
            <div className="help-section-card">
              <h3>Our Mission</h3>
              <p>To democratize access to intelligent business tools — making enterprise-grade AI capabilities available to every builder, founder, and creator on the planet.</p>
              <h3 style={{ marginTop: 16 }}>What Makes Voxora Different</h3>
              <div className="help-nav-grid">
                {[
                  { icon: "🔗", name: "All-in-One Platform", desc: "50+ tools in one workspace — no context switching." },
                  { icon: "💾", name: "Local-First", desc: "Your data, your device. No mandatory cloud dependency." },
                  { icon: "🤖", name: "Multi-Provider AI", desc: "Choose OpenAI, Gemini, or Claude — or switch anytime." },
                  { icon: "🏗️", name: "Built to Scale", desc: "From solo founder to enterprise team." },
                ].map(w => (
                  <div key={w.name} className="help-nav-item">
                    <span className="help-nav-icon">{w.icon}</span>
                    <div><strong>{w.name}</strong><p>{w.desc}</p></div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button style={{ background: "linear-gradient(135deg,#6C63FF,#9C8DFF)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14, marginRight: 10 }} onClick={() => setWorkspace("trust")}>
                  Trust Center →
                </button>
                <button style={{ background: "none", color: "#6C63FF", border: "2px solid #6C63FF", borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14 }} onClick={() => setWorkspace("feedback")}>
                  Give Feedback →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
