// ── V5.3 Authentication & Cloud Backend ──────────────────────────────────────
// Modular auth layer backed by BackendProvider.
// Demo Mode (localStorage) is automatic when no cloud provider is configured.
// To activate Firebase or Supabase, set the corresponding VITE_ env vars.

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from "react";
import { getBackendProvider } from "../services/backend/BackendService";
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
  logout: () => void;
  updateProfile: (data: Partial<VoxoraUser>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  deleteAccount: () => void;
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

  // Initialize provider and restore session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const provider = await getBackendProvider();
      if (cancelled) return;
      setBp(provider);
      const u = await provider.getCurrentUser();
      if (!cancelled) {
        setUser(u as VoxoraUser | null);
        setLoginHistory(loadHistory());
        setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    name: string, email: string, password: string, username = ""
  ): Promise<{ ok: boolean; error?: string }> => {
    const provider = bp ?? await getBackendProvider();
    const result = await provider.signUp(name, email, password, username);

    const entry: LoginHistoryEntry = {
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Sign Up",
      status: result.ok ? "success" : "failed",
    };
    pushHistory(entry);

    if (result.ok && result.user) {
      setUser(result.user as VoxoraUser);
      setLoginHistory(loadHistory());
    }
    return { ok: result.ok, error: result.error };
  }, [bp]);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string, password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const provider = bp ?? await getBackendProvider();
    const result = await provider.login(email, password);

    const entry: LoginHistoryEntry = {
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Browser Session",
      status: result.ok ? "success" : "failed",
    };
    pushHistory(entry);
    setLoginHistory(loadHistory());

    if (result.ok && result.user) {
      setUser(result.user as VoxoraUser);
    }
    return { ok: result.ok, error: result.error };
  }, [bp]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    if (bp) bp.logout();
    setUser(null);
  }, [bp]);

  // ── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data: Partial<VoxoraUser>) => {
    if (!user) return;
    const provider = bp ?? await getBackendProvider();
    await provider.updateUser(user.id, data);
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, [bp, user]);

  // ── Change Password ──────────────────────────────────────────────────────
  const changePassword = useCallback(async (
    current: string, next: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: "Not logged in." };
    const provider = bp ?? await getBackendProvider();
    return provider.changePassword(user.id, current, next);
  }, [bp, user]);

  // ── Delete Account ───────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    if (!user) return;
    const provider = bp ?? await getBackendProvider();
    await provider.deleteAccount(user.id);
    localStorage.removeItem(HISTORY_KEY);
    setUser(null);
    setLoginHistory([]);
  }, [bp, user]);

  // ── Profile completion ────────────────────────────────────────────────────
  const getProfileCompletion = useCallback((): number => {
    if (!user) return 0;
    const fields: (keyof VoxoraUser)[] = ["name", "email", "username", "bio", "company", "role", "avatarEmoji"];
    const filled = fields.filter(f => user[f] && String(user[f]).trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, loginHistory,
      login, signUp, logout, updateProfile,
      changePassword, deleteAccount: () => { deleteAccount(); },
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
