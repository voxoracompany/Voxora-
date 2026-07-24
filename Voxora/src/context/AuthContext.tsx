// ── V5.3 Authentication Context ───────────────────────────────────────────────
// Firebase Auth when VITE_FIREBASE_* env vars are set.
// Local Demo Mode (localStorage) when they are not.
//
// Session persistence: Firebase handles this via browserLocalPersistence.
// onAuthStateChanged is subscribed so the UI reacts if the session is revoked.

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from "react";
import { getBackendProvider, isCloudConfigured } from "../services/backend/BackendService";
import { isFirebaseConfigured } from "../services/firebase/firebase";
import { subscribeAuthState, mapFirebaseUser, firebaseGoogleSignIn } from "../services/firebase/auth";
import { saveUserProfile } from "../services/firebase/firestore";
import type { BackendProvider } from "../services/backend/BackendProvider";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface VoxoraUser {
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

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  status: "success" | "failed";
}

interface AuthContextValue {
  user: VoxoraUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginHistory: LoginHistoryEntry[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, username?: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<VoxoraUser>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  deleteAccount: () => Promise<{ ok: boolean; error?: string }>;
  getProfileCompletion: () => number;
}

// ── Login history (always localStorage — device-local by design) ──────────────
const HISTORY_KEY = "voxora-auth-history";

function makeId() { return Math.random().toString(36).slice(2, 11); }

function deviceLabel() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "iOS Device";
  if (/Android/.test(ua)) return "Android Device";
  if (/Mac/.test(ua)) return "Mac — Browser";
  if (/Windows/.test(ua)) return "Windows — Browser";
  return "Browser";
}

function loadHistory(): LoginHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function pushHistory(entry: LoginHistoryEntry) {
  const hist = loadHistory();
  hist.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 50)));
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VoxoraUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
  const [bp, setBp] = useState<BackendProvider | null>(null);

  // ── Initialise provider and restore session ────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const provider = await getBackendProvider();
        if (cancelled) return;
        setBp(provider);

        // getCurrentUser() awaits Firebase's first auth-state emission (handles
        // page-refresh correctly) or reads localStorage in Demo Mode.
        const u = await provider.getCurrentUser();
        if (!cancelled) {
          setUser(u as VoxoraUser | null);
          setLoginHistory(loadHistory());
        }
      } catch (err) {
        console.warn("[Voxora/Auth] Failed to restore session:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Firebase ongoing session subscription ─────────────────────────────────
  // Keeps the UI in sync when Firebase revokes a token or the session changes
  // in another tab. No-op in Local Demo Mode.
  useEffect(() => {
    if (!isFirebaseConfigured() || !isCloudConfigured()) return;

    const unsub = subscribeAuthState(async fbUser => {
      if (fbUser) {
        // Keep auth-state changes immediate; profile data is non-essential.
        setUser(mapFirebaseUser(fbUser) as unknown as VoxoraUser);
        void bp?.hydrateUserProfile?.(fbUser.uid).then(profile => {
          if (profile) setUser(prev => prev ? { ...prev, ...profile } : prev);
        });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, [bp]);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    name: string, email: string, password: string, username = ""
  ): Promise<{ ok: boolean; error?: string }> => {
    const provider = bp ?? await getBackendProvider();
    const result = await provider.signUp(name, email, password, username);

    pushHistory({
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Sign Up",
      status: result.ok ? "success" : "failed",
    });

    if (result.ok && result.user) {
      setUser(result.user as VoxoraUser);
      setLoginHistory(loadHistory());
    }
    return { ok: result.ok, error: result.error };
  }, [bp]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string, password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const provider = bp ?? await getBackendProvider();
    const result = await provider.login(email, password);

    pushHistory({
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Browser Session",
      status: result.ok ? "success" : "failed",
    });
    setLoginHistory(loadHistory());

    if (result.ok && result.user) {
      setUser(result.user as VoxoraUser);
    }
    return { ok: result.ok, error: result.error };
  }, [bp]);

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!isFirebaseConfigured()) {
      return { ok: false, error: "Google sign-in requires Firebase. Add VITE_FIREBASE_* keys to enable it." };
    }
    const result = await firebaseGoogleSignIn();
    if (!result.ok) return { ok: false, error: result.error };
    const voxoraUser = result.user as VoxoraUser;

    // Do not block navigation on non-essential profile persistence.
    if (result.isNewUser) {
      void saveUserProfile(voxoraUser.id, voxoraUser);
    }

    pushHistory({
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Google Sign-In",
      status: "success",
    });
    setUser(voxoraUser);
    setLoginHistory(loadHistory());
    return { ok: true };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    const provider = bp;
    if (provider) provider.logout();
    setUser(null);
  }, [bp]);

  // ── Update Profile ─────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data: Partial<VoxoraUser>) => {
    if (!user) return;
    const provider = bp ?? await getBackendProvider();
    await provider.updateUser(user.id, data);
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, [bp, user]);

  // ── Change Password ────────────────────────────────────────────────────────
  const changePassword = useCallback(async (
    current: string, next: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Not logged in." };
    const provider = bp ?? await getBackendProvider();
    return provider.changePassword(user.id, current, next);
  }, [bp, user]);

  // ── Delete Account ─────────────────────────────────────────────────────────
  const deleteAccount = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Not logged in." };
    const provider = bp ?? await getBackendProvider();
    const result = await provider.deleteAccount(user.id);
    if (!result.ok) return result;
    localStorage.removeItem(HISTORY_KEY);
    setUser(null);
    setLoginHistory([]);
    return { ok: true };
  }, [bp, user]);

  // ── Profile completion ─────────────────────────────────────────────────────
  const getProfileCompletion = useCallback((): number => {
    if (!user) return 0;
    const fields: (keyof VoxoraUser)[] = ["name", "email", "username", "bio", "company", "role", "avatarEmoji"];
    const filled = fields.filter(f => user[f] && String(user[f]).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, loginHistory,
      login, signUp, loginWithGoogle, logout, updateProfile,
      changePassword, deleteAccount,
      getProfileCompletion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
