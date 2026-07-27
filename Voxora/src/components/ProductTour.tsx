// ── V9.0 Product Tour ─────────────────────────────────────────────────────────
// Interactive guided tour with tooltips anchored to real UI elements.
// Uses a spotlight overlay. Stored completion in localStorage.

import { useState, useEffect, useCallback, memo } from "react";
import "./ProductTour.css";

const TOUR_KEY = "voxora-product-tour-v90";

export interface TourStep {
  target: string;          // CSS selector
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    target: ".sidebar",
    title: "🗂️ Your Workspace Sidebar",
    content: "Everything is organized here — AI tools, studios, settings, and more. Click any section to expand it.",
    position: "right",
  },
  {
    target: ".welcome-section",
    title: "🏠 Your Dashboard",
    content: "This is your home base. Quickly see stats, recent work, AI activity, and smart suggestions.",
    position: "bottom",
  },
  {
    target: ".stats",
    title: "📊 Live Stats",
    content: "Real-time metrics — project count, AI sessions, activities, and more — always at a glance.",
    position: "bottom",
  },
  {
    target: ".quick-actions",
    title: "⚡ Quick Actions",
    content: "Launch any tool instantly. Start with AI Content, App Ideas, or Customer Research.",
    position: "top",
  },
  {
    target: ".dashboard-row",
    title: "📁 Projects & Activity",
    content: "Your recent projects and activity feed live here. Everything you save is always accessible.",
    position: "top",
  },
];

interface TooltipPos {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

function getTooltipPosition(el: Element, prefer: TourStep["position"] = "bottom"): TooltipPos {
  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TT_W = 320;
  const TT_H = 150;
  const GAP = 16;

  const positions: Record<string, TooltipPos> = {
    bottom: { top: rect.bottom + GAP, left: Math.max(8, Math.min(rect.left + rect.width / 2 - TT_W / 2, vw - TT_W - 8)), placement: "bottom" },
    top:    { top: rect.top - TT_H - GAP, left: Math.max(8, Math.min(rect.left + rect.width / 2 - TT_W / 2, vw - TT_W - 8)), placement: "top" },
    right:  { top: Math.max(8, rect.top + rect.height / 2 - TT_H / 2), left: rect.right + GAP, placement: "right" },
    left:   { top: Math.max(8, rect.top + rect.height / 2 - TT_H / 2), left: rect.left - TT_W - GAP, placement: "left" },
  };

  const pos = positions[prefer ?? "bottom"];
  // Clamp to viewport
  if (pos.top < 8) pos.top = 8;
  if (pos.top + TT_H > vh) pos.top = vh - TT_H - 8;
  if (pos.left < 8) pos.left = 8;
  if (pos.left + TT_W > vw) pos.left = vw - TT_W - 8;
  return pos;
}

interface SpotlightRect {
  top: number; left: number; width: number; height: number;
}

interface Props {
  onComplete: () => void;
}

export const ProductTour = memo(function ProductTour({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

  const applyStep = useCallback((idx: number) => {
    const s = TOUR_STEPS[idx];
    const el = document.querySelector(s.target);
    if (!el) {
      // Skip to next if element not found
      if (idx < TOUR_STEPS.length - 1) setStep(idx + 1);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      setSpotlight({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      setPos(getTooltipPosition(el, s.position));
    }, 300);
  }, []);

  useEffect(() => { applyStep(step); }, [step, applyStep]);

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const finish = () => {
    localStorage.setItem(TOUR_KEY, "1");
    onComplete();
  };

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="tour-backdrop" onClick={finish} aria-hidden="true" />

      {/* Spotlight cutout */}
      {spotlight && (
        <div
          className="tour-spotlight"
          style={{
            top:    spotlight.top    - 6,
            left:   spotlight.left   - 6,
            width:  spotlight.width  + 12,
            height: spotlight.height + 12,
          }}
          aria-hidden="true"
        />
      )}

      {/* Tooltip */}
      {pos && (
        <div
          className={`tour-tooltip tour-tooltip--${pos.placement}`}
          style={{ top: pos.top, left: pos.left }}
          role="dialog"
          aria-label={current.title}
          aria-modal="true"
        >
          {/* Progress */}
          <div className="tour-progress">
            {TOUR_STEPS.map((_, i) => (
              <div key={i} className={`tour-dot ${i === step ? "active" : i < step ? "done" : ""}`} />
            ))}
          </div>

          <h3 className="tour-title">{current.title}</h3>
          <p className="tour-content">{current.content}</p>

          <div className="tour-footer">
            <button className="tour-skip" onClick={finish}>Skip tour</button>
            <div className="tour-nav">
              {step > 0 && (
                <button className="tour-btn tour-btn--back" onClick={handleBack}>← Back</button>
              )}
              <button className="tour-btn tour-btn--next" onClick={handleNext}>
                {isLast ? "Finish ✓" : "Next →"}
              </button>
            </div>
          </div>

          <div className="tour-counter">{step + 1} / {TOUR_STEPS.length}</div>
        </div>
      )}
    </>
  );
});

export function useShouldShowTour(): boolean {
  return !localStorage.getItem(TOUR_KEY) && !!localStorage.getItem("voxora-wizard-done");
}

export { TOUR_KEY };
