// ── V5.5 Feedback Center ──────────────────────────────────────────────────────
// Report Bug, Feature Request, General Feedback, Satisfaction Rating, History
// All feedback stored locally in localStorage.

import { useState, useCallback } from "react";
import "./FeedbackCenter.css";

interface Props { setWorkspace: (w: string) => void; }

type FeedbackType = "bug" | "feature" | "general";
type Tab = "Report Bug" | "Feature Request" | "General Feedback" | "Feedback History";

const TABS: Tab[] = ["Report Bug", "Feature Request", "General Feedback", "Feedback History"];

interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  subject: string;
  message: string;
  rating?: number;
  createdAt: string;
}

const STORAGE_KEY = "voxora-feedback-history";

function loadHistory(): FeedbackEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveEntry(entry: FeedbackEntry) {
  const hist = loadHistory();
  hist.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(0, 50)));
}

const RATINGS = [
  { emoji: "😡", label: "Terrible", value: 1 },
  { emoji: "😕", label: "Poor", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "🤩", label: "Excellent", value: 5 },
];

function BugReportForm({ onSubmit }: { onSubmit: () => void }) {
  const [subject, setSubject] = useState("");
  const [desc, setDesc]       = useState("");
  const [steps, setSteps]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !desc.trim()) return;
    saveEntry({
      id: Date.now().toString(),
      type: "bug",
      subject: subject.trim(),
      message: `${desc.trim()}${steps ? `\n\nSteps: ${steps}` : ""}`,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setTimeout(onSubmit, 1800);
  };

  if (submitted) return (
    <div className="feedback-success">
      <div className="feedback-success-icon">🐛✅</div>
      <h3>Bug Report Submitted</h3>
      <p>Thank you for helping make Voxora better. We'll investigate this soon.</p>
    </div>
  );

  return (
    <div className="feedback-form">
      <div className="feedback-field">
        <label>Bug Title *</label>
        <input placeholder="Brief description of the issue" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div className="feedback-field">
        <label>What happened? *</label>
        <textarea placeholder="Describe what went wrong…" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div className="feedback-field">
        <label>Steps to reproduce (optional)</label>
        <textarea placeholder="1. Go to…&#10;2. Click…&#10;3. See error…" value={steps} onChange={e => setSteps(e.target.value)} style={{ minHeight: 80 }} />
      </div>
      <button className="feedback-submit-btn" onClick={handleSubmit} disabled={!subject.trim() || !desc.trim()}>
        🐛 Submit Bug Report
      </button>
    </div>
  );
}

function FeatureRequestForm({ onSubmit }: { onSubmit: () => void }) {
  const [title, setTitle]   = useState("");
  const [why, setWhy]       = useState("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!title.trim() || !why.trim()) return;
    saveEntry({
      id: Date.now().toString(),
      type: "feature",
      subject: title.trim(),
      message: `Why: ${why.trim()}${detail ? `\nDetails: ${detail}` : ""}`,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setTimeout(onSubmit, 1800);
  };

  if (submitted) return (
    <div className="feedback-success">
      <div className="feedback-success-icon">✨</div>
      <h3>Feature Request Submitted!</h3>
      <p>Great idea! We've logged it for the product team to review.</p>
    </div>
  );

  return (
    <div className="feedback-form">
      <div className="feedback-field">
        <label>Feature Title *</label>
        <input placeholder="What feature would you like?" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="feedback-field">
        <label>Why is this useful? *</label>
        <textarea placeholder="Tell us how this feature would help you…" value={why} onChange={e => setWhy(e.target.value)} />
      </div>
      <div className="feedback-field">
        <label>Additional details (optional)</label>
        <textarea placeholder="Any examples, references, or extra context…" value={detail} onChange={e => setDetail(e.target.value)} style={{ minHeight: 80 }} />
      </div>
      <button className="feedback-submit-btn" onClick={handleSubmit} disabled={!title.trim() || !why.trim()}>
        ✨ Submit Feature Request
      </button>
    </div>
  );
}

function GeneralFeedbackForm({ onSubmit }: { onSubmit: () => void }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating]   = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) return;
    saveEntry({
      id: Date.now().toString(),
      type: "general",
      subject: subject.trim() || "General Feedback",
      message: message.trim(),
      rating: rating ?? undefined,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setTimeout(onSubmit, 1800);
  };

  if (submitted) return (
    <div className="feedback-success">
      <div className="feedback-success-icon">💬</div>
      <h3>Feedback Received!</h3>
      <p>Thank you for sharing your thoughts. Your feedback shapes Voxora's future.</p>
    </div>
  );

  return (
    <div className="feedback-form">
      <div className="feedback-field">
        <label>How satisfied are you with Voxora?</label>
        <div className="rating-row">
          {RATINGS.map(r => (
            <button
              key={r.value}
              className={`rating-btn ${rating === r.value ? "selected" : ""}`}
              onClick={() => setRating(r.value)}
              aria-label={r.label}
              aria-pressed={rating === r.value}
            >
              {r.emoji}
              <span className="rating-label">{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="feedback-field">
        <label>Subject (optional)</label>
        <input placeholder="What's this about?" value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div className="feedback-field">
        <label>Your Feedback *</label>
        <textarea placeholder="Tell us what you think, what you love, or what could be better…" value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <button className="feedback-submit-btn" onClick={handleSubmit} disabled={!message.trim()}>
        💬 Send Feedback
      </button>
    </div>
  );
}

function FeedbackHistory() {
  const [history, setHistory] = useState<FeedbackEntry[]>(() => loadHistory());

  const handleClear = useCallback(() => {
    if (confirm("Clear all feedback history?")) {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    }
  }, []);

  if (history.length === 0) return (
    <div className="feedback-empty">
      <p>📭 No feedback submitted yet. Share your thoughts using the tabs above!</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{history.length} submission{history.length !== 1 ? "s" : ""}</span>
        <button onClick={handleClear} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, color: "#6b7280" }}>
          Clear History
        </button>
      </div>
      <div className="feedback-history-list">
        {history.map(entry => (
          <div key={entry.id} className="feedback-history-item">
            <div className="fhi-top">
              <span className={`fhi-type fhi-type--${entry.type}`}>
                {entry.type === "bug" ? "🐛 Bug" : entry.type === "feature" ? "✨ Feature" : "💬 Feedback"}
              </span>
              <span className="fhi-date">{new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <p className="fhi-subject">{entry.subject}</p>
            <p className="fhi-message">{entry.message}</p>
            {entry.rating && (
              <div style={{ marginTop: 6, fontSize: 13, color: "#94a3b8" }}>
                Rating: {RATINGS.find(r => r.value === entry.rating)?.emoji} {RATINGS.find(r => r.value === entry.rating)?.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackCenter({ setWorkspace }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Report Bug");
  const [historyKey, setHistoryKey] = useState(0);

  const refreshHistory = useCallback(() => {
    setActiveTab("Feedback History");
    setHistoryKey(k => k + 1);
  }, []);

  return (
    <div className="feedback-container">
      <button className="back-btn" onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>

      <div className="feedback-header">
        <h1>💬 Feedback Center</h1>
        <p className="workspace-subtitle">Help us build a better Voxora — your feedback matters.</p>
      </div>

      <div className="feedback-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`feedback-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            role="tab"
            aria-selected={activeTab === tab}
          >
            {tab === "Report Bug" ? "🐛 " : tab === "Feature Request" ? "✨ " : tab === "General Feedback" ? "💬 " : "📋 "}
            {tab}
          </button>
        ))}
      </div>

      <div className="feedback-content" role="tabpanel">
        {activeTab === "Report Bug" && (
          <div>
            <div className="feedback-section-card">
              <h3>🐛 Report a Bug</h3>
              <p>Found something broken? Let us know and we'll get it fixed fast.</p>
            </div>
            <div className="feedback-section-card">
              <BugReportForm onSubmit={refreshHistory} />
            </div>
          </div>
        )}

        {activeTab === "Feature Request" && (
          <div>
            <div className="feedback-section-card">
              <h3>✨ Request a Feature</h3>
              <p>Have an idea that would make Voxora more powerful? Share it!</p>
            </div>
            <div className="feedback-section-card">
              <FeatureRequestForm onSubmit={refreshHistory} />
            </div>
          </div>
        )}

        {activeTab === "General Feedback" && (
          <div>
            <div className="feedback-section-card">
              <h3>💬 General Feedback</h3>
              <p>Tell us what's working, what isn't, and how we can do better.</p>
            </div>
            <div className="feedback-section-card">
              <GeneralFeedbackForm onSubmit={refreshHistory} />
            </div>
          </div>
        )}

        {activeTab === "Feedback History" && (
          <div>
            <div className="feedback-section-card">
              <h3>📋 Your Feedback History</h3>
              <p>All feedback you've submitted in this session is stored locally.</p>
            </div>
            <div className="feedback-section-card">
              <FeedbackHistory key={historyKey} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
