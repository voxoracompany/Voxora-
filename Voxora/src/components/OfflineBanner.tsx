/**
 * OfflineBanner — V8.0
 * Displays a persistent strip when the user loses internet connectivity,
 * and a brief "Back online" confirmation when they reconnect.
 */

import { useEffect, useState } from 'react';
import { useOffline } from '../hooks/useOffline';
import './OfflineBanner.css';

export default function OfflineBanner() {
  const { isOnline, isReconnecting } = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && wasOffline && !isReconnecting) {
      setShowReconnected(true);
      const t = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline, isReconnecting]);

  if (isOnline && !showReconnected && !isReconnecting) return null;

  if (showReconnected) {
    return (
      <div className="offline-banner offline-banner--online" role="status" aria-live="polite">
        <span className="offline-banner-icon">✅</span>
        <span>Back online — all systems operational.</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="offline-banner offline-banner--reconnecting" role="status" aria-live="polite">
        <span className="offline-banner-spinner" />
        <span>Reconnecting…</span>
      </div>
    );
  }

  return (
    <div className="offline-banner offline-banner--offline" role="alert" aria-live="assertive">
      <span className="offline-banner-icon">📡</span>
      <span>
        <strong>You're offline.</strong> Voxora continues to work — your data is saved locally.
      </span>
    </div>
  );
}
