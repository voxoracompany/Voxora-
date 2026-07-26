/**
 * useOffline — V8.0
 * Tracks browser online/offline state with a debounced reconnect indicator.
 */

import { useEffect, useState } from 'react';

export interface OfflineState {
  isOnline: boolean;
  isReconnecting: boolean;
  lastOnlineAt: number | null;
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(
    navigator.onLine ? Date.now() : null
  );

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const handleOnline = () => {
      setIsReconnecting(true);
      // Brief "reconnecting" flash before marking fully online
      reconnectTimer = setTimeout(() => {
        setIsOnline(true);
        setIsReconnecting(false);
        setLastOnlineAt(Date.now());
      }, 800);
    };

    const handleOffline = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      setIsOnline(false);
      setIsReconnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return { isOnline, isReconnecting, lastOnlineAt };
}
