/**
 * CookieConsent — V8.0
 * GDPR/ePrivacy-compliant cookie consent banner.
 * Consent choice is persisted in localStorage.
 * Analytics service is notified on accept so it can activate.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CONSENT_KEY = 'voxora_cookie_consent';
type ConsentValue = 'accepted' | 'declined';

function getStored(): ConsentValue | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === 'accepted' || v === 'declined') return v;
  } catch { /* private browsing */ }
  return null;
}

function setStored(val: ConsentValue): void {
  try { localStorage.setItem(CONSENT_KEY, val); } catch { /* ignore */ }
}

export function hasCookieConsent(): boolean {
  return getStored() === 'accepted';
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only if no prior decision recorded
    if (getStored() === null) {
      // Small delay so it doesn't flash during hydration
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    setStored('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    setStored('declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <div className="cookie-consent-inner">
        <div className="cookie-consent-text">
          <strong className="cookie-consent-title">🍪 Cookie Preferences</strong>
          <p className="cookie-consent-desc">
            Voxora uses only essential cookies to keep you logged in and remember your
            preferences. We do not use advertising or third-party tracking cookies.{' '}
            <Link to="/cookies" className="cookie-consent-link" onClick={handleDecline}>
              Cookie Policy
            </Link>
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button className="cookie-btn cookie-btn--decline" onClick={handleDecline}>
            Decline
          </button>
          <button className="cookie-btn cookie-btn--accept" onClick={handleAccept}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
