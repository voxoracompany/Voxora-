// ── V5.5 Getting Started ──────────────────────────────────────────────────────
// Welcome checklist, sample project generator, demo workspace, quick start templates

import { useState, useCallback, useMemo } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./GettingStarted.css";

interface Props { setWorkspace: (w: string) => void; }

const CHECKLIST_KEY = "voxora-gs-checklist";

interface CheckItem {
  id: string;
  label: string;
  desc: string;
  icon: string;
  workspace: string;
  action: string;
}

const CHECKLIST: CheckItem[] = [
  { id: "profile",   label: "Complete your profile",      desc: "Add your name and bio to personalize AI responses.",     icon: "👤", workspace: "userProfile",    action: "Open Profile" },
  { id: "assistant", label: "Chat with the AI Assistant", desc: "Ask Voxora AI anything about your business or idea.",    icon: "🤖", workspace: "assistant",      action: "Open Chat" },
  { id: "startup",   label: "Generate a Startup Idea",    desc: "Use AI to generate a business concept in seconds.",      icon: "✨", workspace: "startup",        action: "Try It" },
  { id: "research",  label: "Run Customer Research",       desc: "Understand your target market with AI-powered research.", icon: "🔬", workspace: "research",       action: "Start Research" },
  { id: "saved",     label: "Explore Saved Projects",      desc: "View, organize, and manage your generated content.",     icon: "📁", workspace: "saved",          action: "View Projects" },
  { id: "export",    label: "Export a Project",            desc: "Download your work as PDF, Markdown, or JSON.",          icon: "📤", workspace: "export",          action: "Open Export" },
  { id: "billing",   label: "Review Your Plan",            desc: "Check your subscription and usage limits.",              icon: "💳", workspace: "billing",         action: "View Plan" },
  { id: "settings",  label: "Customize Voxora",            desc: "Set your theme, language, and preferences.",             icon: "⚙️", workspace: "settings",       action: "Open Settings" },
];

const TEMPLATES = [
  { icon: "✨", name: "Startup Validation",    desc: "Validate your startup idea with research, persona, and SWOT.",         workspaces: ["startup","research","swot"] },
  { icon: "📣", name: "Marketing Launch",      desc: "Plan a product launch with strategy, email, and ad copy.",             workspaces: ["marketingStrategy","emailCampaign","adCopy"] },
  { icon: "💰", name: "Financial Planning",    desc: "Model your revenue, unit economics, and break-even point.",            workspaces: ["revenueModel","unitEconomics","breakEven"] },
  { icon: "🤝", name: "Team Kickoff",          desc: "Set up team goals, task board, and collaboration plan.",               workspaces: ["teamGoals","taskBoard","collaborationPlan"] },
  { icon: "📊", name: "Analytics Deep Dive",  desc: "Review KPIs, growth experiments, and monthly performance.",            workspaces: ["kpiDashboard","growthExperiments","monthlyGrowthReport"] },
  { icon: "💼", name: "Investor Pitch",        desc: "Build your narrative, pitch deck, and fundraising strategy.",          workspaces: ["investorNarrative","pitchDeck","fundraisingStrategy"] },
];

function loadDone(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "[]")); }
  catch { return new Set(); }
}

function saveDone(done: Set<string>) {
  localStorage.setItem(CHECKLIST_KEY, JSON.stringify([...done]));
}

export default function GettingStarted({ setWorkspace }: Props) {
  const [done, setDone] = useState<Set<string>>(() => loadDone());
  const { saveProject } = useProjects();
  const [demoGenerated, setDemoGenerated] = useState(false);

  const progress = useMemo(() => Math.round((done.size / CHECKLIST.length) * 100), [done]);

  const toggleDone = useCallback((id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveDone(next);
      return next;
    });
  }, []);

  const handleItemAction = useCallback((item: CheckItem) => {
    toggleDone(item.id);
    setWorkspace(item.workspace);
  }, [toggleDone, setWorkspace]);

  const generateDemoProject = useCallback(() => {
    saveProject({
      id: `demo-${Date.now()}`,
      title: "🎯 Demo: AI Startup Idea — Voxora Sample",
      category: "Startup Ideas",
      createdAt: new Date().toISOString(),
      notes: `# Sample Startup Idea: AI-Powered Business Intelligence for SMBs

## Problem
Small and medium businesses lack access to enterprise-grade business intelligence and AI tooling that large corporations use.

## Solution
An AI-native platform (like Voxora) that gives SMBs access to:
- AI-powered market research
- Automated competitor analysis
- Growth planning and KPI tracking
- Investor-ready reporting

## Target Market
- Founders and startup teams (1–50 people)
- Solo entrepreneurs and solopreneurs
- Consulting firms and agencies

## Business Model
- Freemium SaaS with monthly subscriptions
- Free tier: 10 AI requests/month
- Pro tier: Unlimited AI + cloud sync

## Why Now
AI costs have dropped 100x. SMBs now have access to the same models used by Fortune 500 companies.

---
*This is a demo project generated by Voxora's Getting Started guide.*`,
    });
    setDemoGenerated(true);
    setTimeout(() => setWorkspace("saved"), 1500);
  }, [saveProject, setWorkspace]);

  return (
    <div className="gs-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="gs-header">
        <h1>🗺️ Getting Started</h1>
        <p>Complete these steps to get the most out of Voxora.</p>
      </div>

      {/* Progress */}
      <div className="gs-progress-bar-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="gs-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="gs-progress-label">
        {done.size} of {CHECKLIST.length} completed — {progress}%
        {progress === 100 && " 🎉 All done!"}
      </div>

      {/* Checklist */}
      <div className="gs-section-label">Setup Checklist</div>
      <div className="gs-checklist">
        {CHECKLIST.map(item => (
          <div
            key={item.id}
            className={`gs-item ${done.has(item.id) ? "done" : ""}`}
            onClick={() => toggleDone(item.id)}
            role="checkbox"
            aria-checked={done.has(item.id)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === " " || e.key === "Enter") toggleDone(item.id); }}
          >
            <div className="gs-checkbox" aria-hidden="true">{done.has(item.id) ? "✓" : ""}</div>
            <span className="gs-item-icon">{item.icon}</span>
            <div className="gs-item-body">
              <strong>{item.label}</strong>
              <p>{item.desc}</p>
            </div>
            <button
              className="gs-item-action"
              onClick={e => { e.stopPropagation(); handleItemAction(item); }}
              aria-label={`${item.action}: ${item.label}`}
            >
              {item.action} →
            </button>
          </div>
        ))}
      </div>

      {/* Demo Workspace */}
      <div className="gs-demo-card">
        <div className="gs-demo-icon">🎮</div>
        <h3>Try the Demo Workspace</h3>
        <p>Generate a sample project to see how Voxora works — no configuration needed.</p>
        <div className="gs-demo-actions">
          <button
            className="gs-demo-btn"
            onClick={generateDemoProject}
            disabled={demoGenerated}
          >
            {demoGenerated ? "✅ Demo Created — Opening…" : "⚡ Generate Demo Project"}
          </button>
          <button className="gs-demo-btn gs-demo-btn--outline" onClick={() => setWorkspace("assistant")}>
            💬 Chat with AI
          </button>
        </div>
      </div>

      {/* Quick Start Templates */}
      <div className="gs-section-label">Quick Start Templates</div>
      <div className="gs-templates-grid">
        {TEMPLATES.map(t => (
          <div key={t.name} className="gs-template-card">
            <div className="gs-template-icon">{t.icon}</div>
            <h4>{t.name}</h4>
            <p>{t.desc}</p>
            <button
              className="gs-use-btn"
              onClick={() => setWorkspace(t.workspaces[0])}
              aria-label={`Start ${t.name} template`}
            >
              Start Template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
