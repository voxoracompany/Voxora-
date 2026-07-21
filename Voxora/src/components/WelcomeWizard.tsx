// ── V5.5 Welcome Wizard ────────────────────────────────────────────────────────
// Shown once on first visit. Stored in localStorage.

import { useState, useCallback } from "react";
import "./WelcomeWizard.css";

interface Props {
  onComplete: () => void;
  setWorkspace: (w: string) => void;
}

const STEPS = [
  {
    icon: "🚀",
    title: "Welcome to Voxora Beta",
    subtitle: "The AI-native platform for building intelligent agents, automations, and business applications.",
    content: (
      <div className="ww-intro">
        <div className="ww-badges">
          <span className="ww-badge ww-badge--beta">🧪 Public Beta</span>
          <span className="ww-badge ww-badge--ai">🤖 AI-Powered</span>
          <span className="ww-badge ww-badge--free">✅ Free to Start</span>
        </div>
        <p>You're among the first to experience Voxora. This quick setup takes under 2 minutes.</p>
        <div className="ww-stats-row">
          <div className="ww-stat"><strong>50+</strong><span>AI Tools</span></div>
          <div className="ww-stat"><strong>10+</strong><span>Studio Modules</span></div>
          <div className="ww-stat"><strong>∞</strong><span>Possibilities</span></div>
        </div>
      </div>
    ),
  },
  {
    icon: "🗺️",
    title: "Your Workspace at a Glance",
    subtitle: "Everything you need, organized in one place.",
    content: (
      <div className="ww-features-grid">
        {[
          { icon: "🤖", name: "AI Assistant", desc: "Chat with AI for ideas & strategy" },
          { icon: "💡", name: "Idea Studios", desc: "App & startup idea generation" },
          { icon: "🔬", name: "Research Tools", desc: "Customer & market research" },
          { icon: "📊", name: "Analytics Studio", desc: "Track KPIs and growth" },
          { icon: "🤝", name: "Team Hub", desc: "Collaborate with your team" },
          { icon: "💳", name: "Billing & Plans", desc: "Manage your subscription" },
        ].map((f) => (
          <div key={f.name} className="ww-feature-card">
            <span className="ww-feature-icon">{f.icon}</span>
            <strong>{f.name}</strong>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: "⚡",
    title: "Start with Quick Actions",
    subtitle: "Pick your first action — we'll set up a demo project for you.",
    content: null, // rendered separately as interactive
  },
  {
    icon: "🎉",
    title: "You're All Set!",
    subtitle: "Your workspace is ready. Explore at your own pace.",
    content: (
      <div className="ww-done">
        <div className="ww-done-icon">🎉</div>
        <p>Your Getting Started checklist is available in the sidebar. Complete it to unlock all features.</p>
        <div className="ww-done-tips">
          <div className="ww-done-tip"><span>💡</span> Press <kbd>Ctrl+K</kbd> to search anything</div>
          <div className="ww-done-tip"><span>🤖</span> Press <kbd>Ctrl+N</kbd> to open AI Assistant</div>
          <div className="ww-done-tip"><span>❓</span> Press <kbd>Ctrl+H</kbd> for Help Center</div>
        </div>
      </div>
    ),
  },
];

const QUICK_ACTIONS = [
  { icon: "🤖", label: "Chat with AI", workspace: "assistant" },
  { icon: "🚀", label: "Generate Startup Idea", workspace: "startup" },
  { icon: "🔬", label: "Research Customers", workspace: "research" },
  { icon: "📊", label: "View Analytics", workspace: "analytics" },
  { icon: "💡", label: "App Ideas", workspace: "apps" },
  { icon: "📋", label: "Getting Started Guide", workspace: "gettingStarted" },
];

export default function WelcomeWizard({ onComplete, setWorkspace }: Props) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
      if (step === 2 && selectedAction) {
        setWorkspace(selectedAction);
      }
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onComplete, step, selectedAction, setWorkspace]);

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="ww-overlay" role="dialog" aria-modal="true" aria-label="Welcome to Voxora">
      <div className="ww-modal">
        {/* Progress dots */}
        <div className="ww-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <div key={i} className={`ww-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
          ))}
        </div>

        {/* Header */}
        <div className="ww-icon">{STEPS[step].icon}</div>
        <h2 className="ww-title">{STEPS[step].title}</h2>
        <p className="ww-subtitle">{STEPS[step].subtitle}</p>

        {/* Content */}
        <div className="ww-body">
          {step === 2 ? (
            <div className="ww-actions-grid">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.workspace}
                  className={`ww-action-btn ${selectedAction === a.workspace ? "selected" : ""}`}
                  onClick={() => setSelectedAction(a.workspace)}
                  aria-pressed={selectedAction === a.workspace}
                >
                  <span className="ww-action-icon">{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          ) : (
            STEPS[step].content
          )}
        </div>

        {/* Footer */}
        <div className="ww-footer">
          {!isLast && (
            <button className="ww-skip-btn" onClick={handleSkip}>
              Skip setup
            </button>
          )}
          <button
            className="ww-next-btn"
            onClick={handleNext}
            disabled={step === 2 && !selectedAction}
          >
            {isLast ? "Enter Workspace →" : step === 2 ? (selectedAction ? "Let's Go →" : "Select an action") : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}
