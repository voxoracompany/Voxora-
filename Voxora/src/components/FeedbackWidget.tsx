// ── V9.0 Feedback Widget ──────────────────────────────────────────────────────
// Floating in-app feedback button. Allows quick ratings & comments.
// Persists to localStorage. Does NOT replace the full FeedbackCenter workspace.

import { useState, useCallback, memo } from "react";
import "./FeedbackWidget.css";

const STORAGE_KEY = "voxora-feedback-history";

interface QuickFeedback {
  id: string;
  rating: number;
  comment: string;
  page: string;
  createdAt: string;
}

function save(entry: QuickFeedback) {
  try {
    const hist = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as QuickFeedback[];
    hist.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(0, 50)));
  } catch { /* silent */ }
}

const RATINGS = [
  { emoji: "😡", value: 1, label: "Terrible" },
  { emoji: "😕", value: 2, label: "Poor" },
  { emoji: "😐", value: 3, label: "Okay" },
  { emoji: "🙂", value: 4, label: "Good" },
  { emoji: "🤩", value: 5, label: "Excellent" },
];

interface Props {
  onOpenFeedbackCenter?: () => void;
}

export const FeedbackWidget = memo(function FeedbackWidget({ onOpenFeedbackCenter }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const handleSubmit = useCallback(() => {
    if (!rating) return;
    save({
      id: Date.now().toString(),
      rating,
      comment: comment.trim(),
      page: window.location.pathname,
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setRating(null);
      setComment("");
    }, 2000);
  }, [rating, comment]);

  const handleClose = () => {
    setOpen(false);
    setRating(null);
    setComment("");
    setSubmitted(false);
  };

  return (
    <div className="fw-root" aria-label="Feedback widget">
      {/* Toggle button */}
      <button
        className={`fw-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Give feedback"
        aria-expanded={open}
        title="Give quick feedback"
      >
        <span className="fw-toggle-icon">{open ? "✕" : "💬"}</span>
        {!open && <span className="fw-toggle-label">Feedback</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className="fw-panel" role="dialog" aria-modal="true" aria-label="Quick feedback">
          {submitted ? (
            <div className="fw-success">
              <div className="fw-success-icon">🎉</div>
              <p>Thanks for your feedback!</p>
            </div>
          ) : (
            <>
              <div className="fw-header">
                <h3>How's it going?</h3>
                <button className="fw-close" onClick={handleClose} aria-label="Close feedback">✕</button>
              </div>

              <div className="fw-ratings">
                {RATINGS.map(r => (
                  <button
                    key={r.value}
                    className={`fw-rating-btn ${rating === r.value ? "selected" : ""}`}
                    onClick={() => setRating(r.value)}
                    onMouseEnter={() => setHovered(r.value)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={r.label}
                    aria-pressed={rating === r.value}
                    title={r.label}
                  >
                    <span className="fw-emoji">{r.emoji}</span>
                  </button>
                ))}
              </div>

              {(rating || hovered) && (
                <p className="fw-rating-label">
                  {RATINGS.find(r => r.value === (hovered ?? rating))?.label}
                </p>
              )}

              {rating !== null && (
                <>
                  <textarea
                    className="fw-comment"
                    placeholder="Optional: tell us more…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={2}
                    maxLength={300}
                    aria-label="Feedback comment"
                  />
                  <div className="fw-actions">
                    <button
                      className="fw-submit"
                      onClick={handleSubmit}
                      disabled={!rating}
                    >
                      Send ✓
                    </button>
                    {onOpenFeedbackCenter && (
                      <button
                        className="fw-more"
                        onClick={() => { handleClose(); onOpenFeedbackCenter(); }}
                      >
                        More options →
                      </button>
                    )}
                  </div>
                </>
              )}

              {!rating && (
                <p className="fw-hint">Select a rating to continue</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});
