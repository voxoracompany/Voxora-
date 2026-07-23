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
    avatarEmoji:        extra?.avatarEmoji  ?? "🚀",
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
    "auth/email-already-in-use":      "An account with this email already exists.",
    "auth/invalid-email":             "Invalid email address.",
    "auth/weak-password":             "Password must be at least 6 characters.",
    "auth/user-not-found":            "No account found with this email.",
    "auth/wrong-password":            "Incorrect password.",
    "auth/invalid-credential":        "Incorrect email or password.",
    "auth/too-many-requests":         "Too many attempts. Please wait and try again.",
    "auth/network-request-failed":    "Network error. Check your connection.",
    "auth/user-disabled":             "This account has been disabled.",
    "auth/requires-recent-login":     "Please log out and log back in before changing your password.",
  };
  return map[code] ?? ((e as { message?: string }).message ?? "An unexpected error occurred.");
}
