// ── V5.3 Backend Types ────────────────────────────────────────────────────────
// Shared types for all backend providers (Firebase, Local).

export type BackendProviderName = "firebase" | "local";

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  company: string;
  role: string;
  avatarEmoji: string;
  createdAt: string;
  emailVerified: boolean;
  twoFAEnabled: boolean;
  notifEmail: boolean;
  notifBrowser: boolean;
  notifWeeklyReport: boolean;
  language: string;
  timezone: string;
}

export interface AuthResult {
  ok: boolean;
  user?: BackendUser;
  error?: string;
}

export interface CloudSyncStatus {
  provider: BackendProviderName;
  isDemo: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: string | null;    // ISO timestamp
  pendingChanges: number;
  storageUsed: number;        // bytes (estimate)
}

// Generic data record stored in the cloud backend
export interface CloudRecord {
  id: string;
  userId: string;
  collection: CloudCollection;
  data: unknown;
  updatedAt: string;
}

export type CloudCollection =
  | "projects"
  | "conversations"
  | "favorites"
  | "pins"
  | "dashboardPreferences"
  | "settings"
  | "activityHistory";

export interface SyncQueueEntry {
  id: string;
  collection: CloudCollection;
  operation: "upsert" | "delete";
  payload: unknown;
  timestamp: string;
}
