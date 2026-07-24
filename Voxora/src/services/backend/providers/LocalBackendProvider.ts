// ── V5.3 Local Backend Provider ───────────────────────────────────────────────
// Full localStorage implementation — works with zero config (Demo Mode).
// Preserves 100% of V4.9 behaviour so existing users see no disruption.

import type { BackendProvider } from "../BackendProvider";
import type {
  AuthResult, BackendUser, CloudCollection, CloudRecord, BackendProviderName,
} from "../BackendTypes";

// ── Storage key helpers ───────────────────────────────────────────────────────
const K = {
  user: "voxora-auth-user",
  pw: (email: string) => `voxora-auth-pw-${email.toLowerCase().trim()}`,
  history: "voxora-auth-history",
  col: (uid: string, col: CloudCollection) => `voxora-cloud-${uid}-${col}`,
};

function makeId() { return Math.random().toString(36).slice(2, 11); }

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function saveJson(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

// ── Provider ─────────────────────────────────────────────────────────────────
export class LocalBackendProvider implements BackendProvider {
  readonly name: BackendProviderName = "local";

  // ── Auth ───────────────────────────────────────────────────────────────────
  async signUp(
    name: string, email: string, password: string, username = ""
  ): Promise<AuthResult> {
    const em = email.toLowerCase().trim();
    if (localStorage.getItem(K.pw(em))) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    const user: BackendUser = {
      id: makeId(),
      name: name.trim(),
      email: em,
      username: username.trim() || em.split("@")[0],
      bio: "",
      company: "",
      role: "",
      avatarEmoji: "V",
      createdAt: new Date().toISOString(),
      emailVerified: false,
      twoFAEnabled: false,
      notifEmail: true,
      notifBrowser: true,
      notifWeeklyReport: true,
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };
    localStorage.setItem(K.pw(em), password);
    saveJson(K.user, user);
    localStorage.setItem("voxora-name", user.name);
    return { ok: true, user };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const em = email.toLowerCase().trim();
    const storedPw = localStorage.getItem(K.pw(em));
    const storedUser = loadJson<BackendUser>(K.user);

    if (storedUser && storedUser.email === em) {
      const ok = !storedPw || storedPw === password;
      if (!ok) return { ok: false, error: "Incorrect password. Try again or use Forgot Password." };
      return { ok: true, user: storedUser };
    }
    // Auto-create demo account
    return this.signUp(email.split("@")[0], email, password);
  }

  async logout(): Promise<void> { /* keep data; session cleared by context */ }

  async getCurrentUser(): Promise<BackendUser | null> {
    return loadJson<BackendUser>(K.user);
  }

  async hydrateUserProfile(_userId: string): Promise<Partial<BackendUser> | null> {
    return null;
  }

  async updateUser(userId: string, data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }> {
    const u = loadJson<BackendUser>(K.user);
    if (!u || u.id !== userId) return { ok: false, error: "User not found." };
    const next = { ...u, ...data };
    saveJson(K.user, next);
    localStorage.setItem("voxora-name", next.name);
    return { ok: true };
  }

  async changePassword(userId: string, current: string, next: string): Promise<{ ok: boolean; error?: string }> {
    const u = loadJson<BackendUser>(K.user);
    if (!u || u.id !== userId) return { ok: false, error: "Not logged in." };
    const stored = localStorage.getItem(K.pw(u.email));
    if (stored && stored !== current) return { ok: false, error: "Current password is incorrect." };
    if (next.length < 8) return { ok: false, error: "New password must be at least 8 characters." };
    localStorage.setItem(K.pw(u.email), next);
    return { ok: true };
  }

  async deleteAccount(_userId: string): Promise<{ ok: boolean; error?: string }> {
    const u = loadJson<BackendUser>(K.user);
    if (u) {
      localStorage.removeItem(K.pw(u.email));
      localStorage.removeItem(K.history);
    }
    localStorage.removeItem(K.user);
    localStorage.removeItem("voxora-name");
    const userId = u?.id || _userId;
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(`voxora-cloud-${userId}-`)) localStorage.removeItem(key);
    }
    return { ok: true };
  }

  async sendPasswordReset(_email: string): Promise<{ ok: boolean; error?: string }> {
    return { ok: true }; // Demo: pretend email sent
  }

  async sendEmailVerification(_userId: string): Promise<{ ok: boolean; error?: string }> {
    return { ok: true }; // Demo: pretend email sent
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  async getCollection(userId: string, collection: CloudCollection): Promise<CloudRecord[]> {
    // Migrate legacy keys on first call
    this._migrateLegacy(userId, collection);
    const raw = loadJson<CloudRecord[]>(K.col(userId, collection));
    return Array.isArray(raw) ? raw : [];
  }

  async upsertRecord(
    userId: string, collection: CloudCollection, id: string, data: unknown
  ): Promise<{ ok: boolean; error?: string }> {
    const records = await this.getCollection(userId, collection);
    const idx = records.findIndex(r => r.id === id);
    const record: CloudRecord = {
      id, userId, collection, data, updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) records[idx] = record;
    else records.push(record);
    saveJson(K.col(userId, collection), records);
    return { ok: true };
  }

  async deleteRecord(userId: string, collection: CloudCollection, id: string): Promise<{ ok: boolean; error?: string }> {
    const records = await this.getCollection(userId, collection);
    saveJson(K.col(userId, collection), records.filter(r => r.id !== id));
    return { ok: true };
  }

  async getRecord(userId: string, collection: CloudCollection, id: string): Promise<CloudRecord | null> {
    const records = await this.getCollection(userId, collection);
    return records.find(r => r.id === id) ?? null;
  }

  async isAvailable(): Promise<boolean> { return true; }

  // ── Legacy data migration ─────────────────────────────────────────────────
  // Lifts old flat localStorage keys into the new per-user cloud-keyed store.
  private _migrated = new Set<string>();
  private _migrateLegacy(userId: string, collection: CloudCollection) {
    const key = `${userId}:${collection}`;
    if (this._migrated.has(key)) return;
    this._migrated.add(key);

    const cloudKey = K.col(userId, collection);
    if (localStorage.getItem(cloudKey)) return; // already migrated

    const legacyMap: Partial<Record<CloudCollection, string>> = {
      projects: "voxora-projects",
      conversations: "voxora-conversations",
      favorites: "voxora-favorites",
      pins: "voxora-pinned",
      activityHistory: "voxora-activities",
      settings: "voxora-settings",
      dashboardPreferences: "voxora-dashboard-prefs",
    };

    const legacyKey = legacyMap[collection];
    if (!legacyKey) return;
    const raw = localStorage.getItem(legacyKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const records: CloudRecord[] = items.map((item: unknown) => {
        const obj = (item && typeof item === "object" ? item : { value: item }) as Record<string, unknown>;
        const id = typeof obj.id === "string" ? obj.id : makeId();
        return { id, userId, collection, data: obj, updatedAt: new Date().toISOString() };
      });
      saveJson(cloudKey, records);
    } catch { /* ignore corrupt data */ }
  }

  // ── Storage usage estimate ────────────────────────────────────────────────
  static estimateStorageBytes(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) ?? "";
      if (k.startsWith("voxora")) {
        total += (localStorage.getItem(k) ?? "").length * 2; // UTF-16
      }
    }
    return total;
  }
}
