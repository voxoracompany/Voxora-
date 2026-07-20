// ── V5.3 Cloud Context ────────────────────────────────────────────────────────
// Exposes cloud sync status, provider info, and manual sync trigger.
// Consumed by Dashboard widgets and any component needing sync state.

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import { getBackendProvider, getBackendMode, isCloudConfigured } from "../services/backend/BackendService";
import { syncManager } from "../services/backend/SyncManager";
import { LocalBackendProvider } from "../services/backend/providers/LocalBackendProvider";
import type { BackendProvider } from "../services/backend/BackendProvider";
import type { CloudSyncStatus } from "../services/backend/BackendTypes";

interface CloudContextValue {
  status: CloudSyncStatus;
  provider: BackendProvider | null;
  /** Manually trigger a sync flush (no-op in Demo Mode). */
  syncNow: () => Promise<void>;
}

const CloudContext = createContext<CloudContextValue | null>(null);

export function CloudProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [status, setStatus] = useState<CloudSyncStatus>({
    provider: getBackendMode(),
    isDemo: !isCloudConfigured(),
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: syncManager.lastSync,
    pendingChanges: syncManager.pendingCount,
    storageUsed: LocalBackendProvider.estimateStorageBytes(),
  });

  const providerRef = useRef<BackendProvider | null>(null);

  // Refresh status from syncManager state
  const refreshStatus = useCallback(() => {
    setStatus({
      provider: getBackendMode(),
      isDemo: !isCloudConfigured(),
      isOnline: navigator.onLine,
      isSyncing: syncManager.isSyncing,
      lastSync: syncManager.lastSync,
      pendingChanges: syncManager.pendingCount,
      storageUsed: LocalBackendProvider.estimateStorageBytes(),
    });
  }, []);

  // Initialize provider once
  useEffect(() => {
    let cancelled = false;
    getBackendProvider().then(p => {
      if (cancelled) return;
      providerRef.current = p;
      syncManager.setProvider(p);
      refreshStatus();
    });
    return () => { cancelled = true; };
  }, [refreshStatus]);

  // Push userId to syncManager whenever it changes
  useEffect(() => {
    syncManager.setUserId(userId);
    if (userId) syncManager.flush();
  }, [userId]);

  // Wire sync-manager change notifications → status refresh
  useEffect(() => {
    syncManager.onChange(refreshStatus);
    const cleanup = syncManager.startListening();
    // Also track online/offline
    const updateOnline = refreshStatus;
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      cleanup();
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, [refreshStatus]);

  const syncNow = useCallback(async () => {
    if (!isCloudConfigured()) return;
    await syncManager.flush();
    refreshStatus();
  }, [refreshStatus]);

  return (
    <CloudContext.Provider value={{ status, provider: providerRef.current, syncNow }}>
      {children}
    </CloudContext.Provider>
  );
}

export function useCloud(): CloudContextValue {
  const ctx = useContext(CloudContext);
  if (!ctx) throw new Error("useCloud must be used within CloudProvider");
  return ctx;
}
