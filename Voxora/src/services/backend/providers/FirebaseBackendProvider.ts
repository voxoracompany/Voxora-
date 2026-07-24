// ── V5.3 Firebase Backend Provider ───────────────────────────────────────────
// Real Firebase Auth + Firestore implementation.
// Activated when VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and
// VITE_FIREBASE_PROJECT_ID are set. Falls back to LocalBackendProvider otherwise.

import type { BackendProvider } from "../BackendProvider";
import type {
  AuthResult, BackendUser, CloudCollection, CloudRecord, BackendProviderName,
} from "../BackendTypes";
import { isFirebaseConfigured } from "../../firebase/firebase";
import {
  waitForAuthReady,
  firebaseSignUp,
  firebaseLogin,
  firebaseLogout,
  firebaseSendPasswordReset,
  firebaseSendEmailVerification,
  firebaseChangePassword,
  firebaseDeleteAccount,
  mapFirebaseUser,
  getFirebaseAuth,
} from "../../firebase/auth";
import {
  getUserProfile,
  saveUserProfile,
  deleteUserData,
  getCollection as fsGetCollection,
  upsertRecord as fsUpsert,
  deleteRecord as fsDelete,
  getRecord as fsGetRecord,
  isFirestoreReachable,
} from "../../firebase/firestore";

export { isFirebaseConfigured };

// ── Provider ─────────────────────────────────────────────────────────────────
export class FirebaseBackendProvider implements BackendProvider {
  readonly name: BackendProviderName = "firebase";

  constructor() {
    if (!isFirebaseConfigured()) {
      throw new Error("[Voxora] Firebase is not configured. Set VITE_FIREBASE_* env vars.");
    }
    console.info("[Voxora] Firebase provider initialised.");
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  async signUp(name: string, email: string, password: string, username = ""): Promise<AuthResult> {
    const result = await firebaseSignUp(name, email, password, username);
    if (!result.ok || !result.user) return { ok: false, error: result.error };
    // Persist extra profile fields without blocking the redirect.
    void saveUserProfile(result.user.id, result.user);
    return { ok: true, user: result.user };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const result = await firebaseLogin(email, password);
    if (!result.ok || !result.user) return { ok: false, error: result.error };
    // Return Firebase Auth data immediately; profile hydration happens in the
    // background through AuthContext after navigation.
    return { ok: true, user: result.user };
  }

  async logout(): Promise<void> {
    await firebaseLogout();
  }

  async getCurrentUser(): Promise<BackendUser | null> {
    // waitForAuthReady resolves after Firebase has loaded the persisted session.
    // This handles page-refresh correctly — auth.currentUser is null until then.
    const fbUser = await waitForAuthReady();
    if (!fbUser) return null;
    // Return Firebase Auth data immediately. Firestore profile data is
    // hydrated by AuthContext after the session is available.
    return mapFirebaseUser(fbUser);
  }

  async hydrateUserProfile(userId: string): Promise<Partial<BackendUser> | null> {
    return getUserProfile(userId);
  }

  async updateUser(userId: string, data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }> {
    const result = await saveUserProfile(userId, data as Partial<BackendUser>);
    if (!result.ok) return result;
    // Sync displayName to Firebase Auth if name changed
    if (data.name) {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(auth.currentUser, { displayName: data.name }).catch(() => {});
      }
    }
    return { ok: true };
  }

  async changePassword(
    _userId: string, currentPassword: string, newPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    return firebaseChangePassword(currentPassword, newPassword);
  }

  async deleteAccount(userId: string): Promise<{ ok: boolean; error?: string }> {
    // Delete Firestore data first, then delete the Firebase Auth account.
    const dataResult = await deleteUserData(userId);
    if (!dataResult.ok) return dataResult;
    const authResult = await firebaseDeleteAccount();
    if (!authResult.ok) return authResult;
    await firebaseLogout();
    return { ok: true };
  }

  async sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
    return firebaseSendPasswordReset(email);
  }

  async sendEmailVerification(_userId: string): Promise<{ ok: boolean; error?: string }> {
    return firebaseSendEmailVerification();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  async getCollection(userId: string, col: CloudCollection): Promise<CloudRecord[]> {
    const recs = await fsGetCollection(userId, col);
    return recs.map(r => ({
      id: (r as { id: string }).id,
      userId,
      collection: col,
      data: r,
      updatedAt: (r as { updatedAt?: string }).updatedAt ?? new Date().toISOString(),
    }));
  }

  async upsertRecord(
    userId: string, col: CloudCollection, id: string, data: unknown
  ): Promise<{ ok: boolean; error?: string }> {
    return fsUpsert(userId, col, id, data as Record<string, unknown>);
  }

  async deleteRecord(
    userId: string, col: CloudCollection, id: string
  ): Promise<{ ok: boolean; error?: string }> {
    return fsDelete(userId, col, id);
  }

  async getRecord(
    userId: string, col: CloudCollection, id: string
  ): Promise<CloudRecord | null> {
    const rec = await fsGetRecord(userId, col, id);
    if (!rec) return null;
    return {
      id,
      userId,
      collection: col,
      data: rec,
      updatedAt: (rec as { updatedAt?: string }).updatedAt ?? new Date().toISOString(),
    };
  }

  // ── Health ──────────────────────────────────────────────────────────────────
  async isAvailable(): Promise<boolean> {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (!projectId) return false;
    return isFirestoreReachable(projectId);
  }
}
