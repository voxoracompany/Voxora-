// ── V5.3 Backend Provider Interface ──────────────────────────────────────────
// All cloud providers implement this interface. Swap providers without touching
// any business logic — just swap the provider in BackendService.ts.

import type {
  AuthResult, BackendUser, CloudCollection, CloudRecord, BackendProviderName,
} from "./BackendTypes";

export interface BackendProvider {
  readonly name: BackendProviderName;

  // ── Auth ─────────────────────────────────────────────────────────────────
  signUp(name: string, email: string, password: string, username?: string): Promise<AuthResult>;
  login(email: string, password: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<BackendUser | null>;
  hydrateUserProfile?(userId: string): Promise<Partial<BackendUser> | null>;
  updateUser(userId: string, data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ ok: boolean; error?: string }>;
  deleteAccount(userId: string): Promise<{ ok: boolean; error?: string }>;
  sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }>;
  sendEmailVerification(userId: string): Promise<{ ok: boolean; error?: string }>;

  // ── Data ─────────────────────────────────────────────────────────────────
  getCollection(userId: string, collection: CloudCollection): Promise<CloudRecord[]>;
  upsertRecord(userId: string, collection: CloudCollection, id: string, data: unknown): Promise<{ ok: boolean; error?: string }>;
  deleteRecord(userId: string, collection: CloudCollection, id: string): Promise<{ ok: boolean; error?: string }>;
  getRecord(userId: string, collection: CloudCollection, id: string): Promise<CloudRecord | null>;

  // ── Health ───────────────────────────────────────────────────────────────
  isAvailable(): Promise<boolean>;
}
