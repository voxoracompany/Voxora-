// ── V5.3 Firebase Authentication Service ─────────────────────────────────────
// Wraps firebase/auth with Voxora-typed results.
// Used exclusively by FirebaseBackendProvider.

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  EmailAuthProvider,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  type User,
} from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import type { BackendUser } from "../backend/BackendTypes";

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

// ── Map Firebase User → BackendUser ───────────────────────────────────────────
export function mapFirebaseUser(fbUser: User, extra?: Partial<BackendUser>): BackendUser {
  return {
    id:                 fbUser.uid,
    name:               fbUser.displayName  ?? extra?.name      ?? "",
    email:              fbUser.email        ?? extra?.email     ?? "",
    username:           extra?.username     ?? fbUser.email?.split("@")[0] ?? "",
    bio:                extra?.bio          ?? "",
    company:            extra?.company      ?? "",
    role:               extra?.role         ?? "",
    avatarEmoji:        extra?.avatarEmoji  ?? "V",
    createdAt:          extra?.createdAt    ?? (fbUser.metadata.creationTime ?? new Date().toISOString()),
    emailVerified:      fbUser.emailVerified,
    twoFAEnabled:       extra?.twoFAEnabled        ?? false,
    notifEmail:         extra?.notifEmail          ?? true,
    notifBrowser:       extra?.notifBrowser        ?? true,
    notifWeeklyReport:  extra?.notifWeeklyReport   ?? false,
    language:           extra?.language    ?? "en",
    timezone:           extra?.timezone    ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// ── Initialise session persistence ────────────────────────────────────────────
export async function initFirebaseAuth(): Promise<void> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
}

// ── Wait for the first auth-state emission (handles page-refresh session) ─────
export function waitForAuthReady(): Promise<User | null> {
  return new Promise(resolve => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, user => {
      unsub();
      resolve(user);
    });
  });
}

// ── Listen for ongoing auth state changes ─────────────────────────────────────
export function subscribeAuthState(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), cb);
}

// ── Auth operations ───────────────────────────────────────────────────────────
export async function firebaseSignUp(
  name: string, email: string, password: string, username = ""
): Promise<{ ok: boolean; user?: BackendUser; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const user = mapFirebaseUser(cred.user, { name, username });
    return { ok: true, user };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseLogin(
  email: string, password: string
): Promise<{ ok: boolean; user?: BackendUser; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = mapFirebaseUser(cred.user);
    return { ok: true, user };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseGoogleSignIn(): Promise<{ ok: boolean; user?: BackendUser; isNewUser?: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    const cred = await signInWithPopup(auth, provider);
    const isNewUser = cred.user.metadata.creationTime === cred.user.metadata.lastSignInTime;
    const user = mapFirebaseUser(cred.user, {
      name: cred.user.displayName ?? "",
      username: cred.user.email?.split("@")[0] ?? "",
    });
    return { ok: true, user, isNewUser };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return { ok: false, error: "" }; // user dismissed — no error message needed
    }
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseLogout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function firebaseSendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseSendEmailVerification(): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return { ok: false, error: "Not logged in." };
    await sendEmailVerification(user);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseChangePassword(
  currentPassword: string, newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user || !user.email) return { ok: false, error: "Not logged in." };
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseDeleteAccount(): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) return { ok: false, error: "Not logged in." };
    await deleteUser(user);
    return { ok: true };
  } catch (e: unknown) {
    // Return the raw code for requires-recent-login so callers can trigger reauth
    const code = (e as { code?: string }).code ?? "";
    if (code === "auth/requires-recent-login") {
      return { ok: false, error: "auth/requires-recent-login" };
    }
    return { ok: false, error: friendlyError(e) };
  }
}

// ── Reauthentication ──────────────────────────────────────────────────────────
export async function firebaseReauthenticate(
  password: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const user = getFirebaseAuth().currentUser;
    if (!user || !user.email) return { ok: false, error: "Not logged in." };
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseReauthenticateWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return { ok: false, error: "Not logged in." };

    // Use reauthenticateWithPopup — Firebase's native reauth flow. Unlike
    // signInWithPopup, it cannot switch auth.currentUser to a different account.
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    const result = await reauthenticateWithPopup(user, provider);

    // Verify the reauthenticated identity matches the original user.
    if (result.user.uid !== user.uid) {
      // This should never happen with reauthenticateWithPopup, but guard anyway.
      await signOut(auth);
      return { ok: false, error: "Identity mismatch — please sign in with the same Google account." };
    }

    return { ok: true };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code ?? "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return { ok: false, error: "Google sign-in was cancelled." };
    }
    return { ok: false, error: friendlyError(e) };
  }
}

export async function firebaseUpdateProfile(data: { displayName?: string }): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) return;
  await updateProfile(user, data);
}

export function getCurrentFirebaseUser(): User | null {
  return getFirebaseAuth().currentUser;
}

// ── Error messages ─────────────────────────────────────────────────────────────
function friendlyError(e: unknown): string {
  if (!e || typeof e !== "object") return "An unexpected error occurred.";
  const code = (e as { code?: string }).code ?? "";
  const map: Record<string, string> = {
    // Account / sign-up errors
    "auth/email-already-in-use":       "An account with this email already exists. Try signing in instead.",
    "auth/invalid-email":              "Please enter a valid email address (e.g. user@example.com).",
    "auth/weak-password":              "Your password is too weak. Use at least 8 characters with a mix of letters and numbers.",
    "auth/missing-password":           "Please enter a password.",
    // Sign-in errors
    "auth/user-not-found":             "No account found with this email. Please check and try again, or sign up.",
    "auth/wrong-password":             "Incorrect password. Please try again or reset your password.",
    "auth/invalid-credential":         "Incorrect email or password. Please check and try again.",
    "auth/invalid-login-credentials":  "Incorrect email or password. Please check and try again.",
    // Rate limiting
    "auth/too-many-requests":          "Too many failed attempts. Your account is temporarily locked. Please wait a few minutes or reset your password.",
    // Network
    "auth/network-request-failed":     "Network error. Please check your internet connection and try again.",
    // Account status
    "auth/user-disabled":              "This account has been disabled. Contact support for assistance.",
    // Configuration
    "auth/operation-not-allowed":      "This sign-in method is not currently enabled. Please contact support.",
    "auth/unauthorized-domain":        "Sign-in is not allowed from this domain. Contact support.",
    // Google OAuth
    "auth/popup-closed-by-user":       "Google sign-in was cancelled.",
    "auth/cancelled-popup-request":    "Google sign-in was cancelled.",
    "auth/popup-blocked":              "Your browser blocked the pop-up. Please allow pop-ups for this site and try again.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    // Session
    "auth/requires-recent-login":      "For security, please log out and sign back in before making this change.",
    "auth/session-cookie-expired":     "Your session has expired. Please sign in again.",
    "auth/id-token-expired":           "Your session has expired. Please sign in again.",
    // Token / credential
    "auth/credential-already-in-use":  "This credential is already associated with another account.",
    "auth/invalid-action-code":        "This link has expired or already been used. Please request a new one.",
    "auth/expired-action-code":        "This link has expired. Please request a new one.",
  };
  return map[code] ?? ((e as { message?: string }).message ?? "An unexpected error occurred.");
}
