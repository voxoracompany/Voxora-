// ── V4.9 Authentication & User Accounts ──────────────────────────────────────
// Modular auth layer — demo mode uses localStorage.
// Swap the provider functions below for Firebase / Supabase / Auth0 when ready.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

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
  updateProfile: (data: Partial<VoxoraUser>) => void;
  changePassword: (current: string, next: string) => Promise<{ ok: boolean; error?: string }>;
  deleteAccount: () => void;
  getProfileCompletion: () => number;
}

// ── Storage helpers ───────────────────────────────────────────────────────────
const KEYS = {
  user: "voxora-auth-user",
  pw: (email: string) => `voxora-auth-pw-${email.toLowerCase().trim()}`,
  history: "voxora-auth-history",
};

function loadUser(): VoxoraUser | null {
  try {
    const raw = localStorage.getItem(KEYS.user);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(u: VoxoraUser) {
  localStorage.setItem(KEYS.user, JSON.stringify(u));
  // Keep legacy voxora-name in sync so other workspaces still see it
  localStorage.setItem("voxora-name", u.name);
}

function loadHistory(): LoginHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function pushHistory(entry: LoginHistoryEntry) {
  const hist = loadHistory();
  hist.unshift(entry);
  localStorage.setItem(KEYS.history, JSON.stringify(hist.slice(0, 50)));
}

function makeId() { return Math.random().toString(36).slice(2, 11); }

function deviceLabel() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return "iOS Device";
  if (/Android/.test(ua)) return "Android Device";
  if (/Mac/.test(ua)) return "Mac — Browser";
  if (/Windows/.test(ua)) return "Windows — Browser";
  return "Browser";
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<VoxoraUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);

  useEffect(() => {
    const u = loadUser();
    setUser(u);
    setLoginHistory(loadHistory());
    setIsLoading(false);
  }, []);

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (
    name: string, email: string, password: string, username = ""
  ): Promise<{ ok: boolean; error?: string }> => {
    const emailNorm = email.toLowerCase().trim();

    // Check duplicate
    const existing = localStorage.getItem(KEYS.pw(emailNorm));
    if (existing) return { ok: false, error: "An account with this email already exists." };
    if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

    const newUser: VoxoraUser = {
      id: makeId(),
      name: name.trim(),
      email: emailNorm,
      username: username.trim() || emailNorm.split("@")[0],
      bio: "",
      company: "",
      role: "",
      avatarEmoji: "🚀",
      createdAt: new Date().toISOString(),
      emailVerified: false,
      twoFAEnabled: false,
      notifEmail: true,
      notifBrowser: true,
      notifWeeklyReport: true,
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    localStorage.setItem(KEYS.pw(emailNorm), password);
    saveUser(newUser);

    const entry: LoginHistoryEntry = {
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Sign Up", status: "success",
    };
    pushHistory(entry);

    setUser(newUser);
    setLoginHistory(loadHistory());
    return { ok: true };
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    email: string, password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const emailNorm = email.toLowerCase().trim();
    const storedPw = localStorage.getItem(KEYS.pw(emailNorm));
    const storedUser = loadUser();

    // Demo mode: if user exists and email matches, accept any password
    // Real mode: storedPw must match
    let ok = false;
    if (storedUser && storedUser.email === emailNorm) {
      ok = !storedPw || storedPw === password;
    } else if (!storedUser) {
      // Auto-create demo account so dashboard never stays locked
      return signUp(email.split("@")[0], email, password);
    }

    const entry: LoginHistoryEntry = {
      id: makeId(), timestamp: new Date().toISOString(),
      device: deviceLabel(), location: "Browser Session", status: ok ? "success" : "failed",
    };
    pushHistory(entry);

    if (!ok) {
      setLoginHistory(loadHistory());
      return { ok: false, error: "Incorrect password. Try again or use Forgot Password." };
    }

    setUser(storedUser);
    setLoginHistory(loadHistory());
    return { ok: true };
  }, [signUp]);

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    // Keep data — only clear session marker; localStorage user stays for re-login
  }, []);

  // ── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = useCallback((data: Partial<VoxoraUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      saveUser(next);
      return next;
    });
  }, []);

  // ── Change Password ──────────────────────────────────────────────────────
  const changePassword = useCallback(async (
    current: string, next: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const u = loadUser();
    if (!u) return { ok: false, error: "Not logged in." };
    const stored = localStorage.getItem(KEYS.pw(u.email));
    if (stored && stored !== current) return { ok: false, error: "Current password is incorrect." };
    if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
    localStorage.setItem(KEYS.pw(u.email), next);
    return { ok: true };
  }, []);

  // ── Delete Account ───────────────────────────────────────────────────────
  const deleteAccount = useCallback(() => {
    const u = loadUser();
    if (u) {
      localStorage.removeItem(KEYS.pw(u.email));
      localStorage.removeItem(KEYS.history);
    }
    localStorage.removeItem(KEYS.user);
    localStorage.removeItem("voxora-name");
    setUser(null);
    setLoginHistory([]);
  }, []);

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
      login, signUp, logout, updateProfile, changePassword, deleteAccount, getProfileCompletion,
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
