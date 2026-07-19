import { useState } from "react";
import "./HelpCenter.css";

interface Props {
  setWorkspace: (w: string) => void;
}

const FAQS = [
  {
    q: "How do I create a project?",
    a: "Navigate to any tool (AI Assistant, Startup Ideas, Customer Research, etc.) and fill in the form. Click the generate button and your results will be automatically saved as a project in Saved Projects.",
  },
  {
    q: "Where are my projects stored?",
    a: "All projects are stored locally in your browser's localStorage. They persist across page refreshes but are tied to this browser. Use the Backup & Restore feature in Settings to export your data.",
  },
  {
    q: "How do I back up my data?",
    a: "Go to Settings → Backup & Restore → Export Backup. This downloads a JSON file containing all your projects, activities, and preferences. You can restore it later using the Import Backup option.",
  },
  {
    q: "What is the AI Assistant?",
    a: "The AI Assistant is Voxora's built-in intelligence that helps you brainstorm ideas, research customers, plan products, and more. It's accessible from the sidebar under AI Tools.",
  },
  {
    q: "How do I pin or favorite a project?",
    a: "Open Saved Projects, find your project, and click the ⭐ (favorite) or 📌 (pin) button. Pinned projects appear at the top of your list.",
  },
  {
    q: "Can I export my projects as PDF?",
    a: "Yes! Go to Export Center in the sidebar. Select the project(s) you want, choose PDF, Markdown, Text, or JSON, then click Export.",
  },
  {
    q: "How do I switch between light and dark mode?",
    a: "Go to Settings → Appearance → Theme. Select Light or Dark mode. Your preference is saved immediately.",
  },
  {
    q: "Is my data safe?",
    a: "Your data stays entirely on your device in localStorage. Nothing is sent to external servers. We recommend regular backups using the Export Backup feature.",
  },
  {
    q: "How do I delete all my data?",
    a: "Go to Settings → Data Management → Clear All Data. This permanently removes all projects, activities, and settings. Make sure to export a backup first.",
  },
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
];

const TABS = ["Getting Started", "FAQs", "Keyboard Shortcuts", "Contact Support", "About Voxora", "Legal"] as const;
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

      <div className="help-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`help-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="help-content">
        {/* ─── Getting Started ─── */}
        {activeTab === "Getting Started" && (
          <div className="help-getting-started">
            <div className="help-section-card">
              <h3>👋 Welcome to Voxora</h3>
              <p>Voxora is an AI-native platform for creating, orchestrating, and scaling intelligent agents, automations, and business applications. Here's how to get started in 5 minutes.</p>
            </div>

            <div className="help-steps">
              {[
                { num: "01", title: "Set Up Your Profile", desc: "Go to Settings → User Profile and enter your name and business goal. Voxora uses this to personalize AI responses." },
                { num: "02", title: "Choose a Workspace Tool", desc: "Use the sidebar to navigate. Try AI Assistant for quick brainstorming, or Startup Ideas to generate business concepts." },
                { num: "03", title: "Generate & Save", desc: "Fill in the form and click generate. Your results are automatically saved to Saved Projects where you can review them anytime." },
                { num: "04", title: "Organize Your Work", desc: "In Saved Projects, pin your best work to the top, mark favorites with ⭐, and use filters to find what you need." },
                { num: "05", title: "Export & Back Up", desc: "Use Export Center to download projects as PDF or Markdown. Use Settings → Backup to save all your data." },
              ].map((step) => (
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
                ].map((item) => (
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
                  >
                    <span>{faq.q}</span>
                    <span className="faq-chevron">{openFaq === i ? "▲" : "▼"}</span>
                  </button>
                  {openFaq === i && (
                    <div className="faq-answer">{faq.a}</div>
                  )}
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
              ].map((c) => (
                <div key={c.title} className="help-contact-card">
                  <div className="help-contact-icon">{c.icon}</div>
                  <h4>{c.title}</h4>
                  <p className="help-contact-email">{c.desc}</p>
                  <p>{c.sub}</p>
                </div>
              ))}
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
                <span className="help-badge">Version 2.1</span>
                <span className="help-badge">Production Ready</span>
                <span className="help-badge">AI-Native</span>
              </div>
            </div>

            <div className="help-section-card">
              <h3>🌟 Our Mission</h3>
              <p>Voxora exists to make AI accessible, practical, and powerful for creators, entrepreneurs, and businesses. We believe the future will be built by people who combine human creativity with intelligent AI systems.</p>
            </div>

            <div className="help-section-card">
              <h3>🛠️ Technology</h3>
              <p>Voxora is built with React 19, TypeScript, and Vite — a modern, fast, and reliable technology stack designed for the future. Your data stays on your device using secure localStorage, giving you full control over your information.</p>
            </div>

            <div className="help-section-card">
              <h3>🗺️ Roadmap</h3>
              <div className="help-roadmap">
                {[
                  { phase: "✅ V2.0", desc: "Core platform with AI tools, project management, and workspace" },
                  { phase: "✅ V2.1", desc: "Analytics, Smart Search, Export Center, Activity Center, Settings" },
                  { phase: "🔜 V2.2", desc: "Supabase authentication and cloud sync" },
                  { phase: "🔜 V3.0", desc: "Real AI model integration and agent orchestration" },
                ].map((r) => (
                  <div key={r.phase} className="help-roadmap-item">
                    <strong>{r.phase}</strong>
                    <span>{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Legal ─── */}
        {activeTab === "Legal" && (
          <div className="help-legal">
            <div className="help-section-card">
              <h3>🔒 Privacy Policy</h3>
              <p><strong>Last updated: July 2026</strong></p>
              <p style={{ marginTop: 12 }}>Voxora is a client-side application. All data you create — projects, notes, settings, and activity logs — is stored exclusively in your browser's localStorage. We do not collect, transmit, or store any personal data on external servers.</p>
              <ul className="help-legal-list">
                <li>No account creation required in the current version</li>
                <li>No analytics or tracking scripts</li>
                <li>No cookies beyond localStorage</li>
                <li>Your data never leaves your device</li>
                <li>You can clear all data at any time via Settings</li>
              </ul>
            </div>

            <div className="help-section-card">
              <h3>📜 Terms of Service</h3>
              <p><strong>Last updated: July 2026</strong></p>
              <ul className="help-legal-list">
                <li>Voxora is provided "as is" without warranty of any kind</li>
                <li>You are responsible for backing up your own data</li>
                <li>Do not use Voxora for unlawful purposes</li>
                <li>We reserve the right to update these terms at any time</li>
                <li>Continued use of Voxora constitutes acceptance of these terms</li>
              </ul>
            </div>

            <div className="help-section-card">
              <h3>⚖️ Licenses</h3>
              <p>Voxora is built using open-source software including React, TypeScript, and Vite. We are grateful to the open-source community for making tools like these available.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
