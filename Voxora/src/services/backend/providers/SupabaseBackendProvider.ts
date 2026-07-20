// ── V5.3 Supabase Backend Provider ───────────────────────────────────────────
// Skeleton ready for Supabase SDK integration.
// Set these env vars to activate:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Install SDK when ready:  npm install @supabase/supabase-js
// Then replace the stub bodies below with real Supabase calls.

import type { BackendProvider } from "../BackendProvider";
import type {
  AuthResult, BackendUser, CloudCollection, CloudRecord, BackendProviderName,
} from "../BackendTypes";

export function isSupabaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export class SupabaseBackendProvider implements BackendProvider {
  readonly name: BackendProviderName = "supabase";

  constructor() {
    if (!isSupabaseConfigured()) {
      throw new Error("[Voxora] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    }
    // TODO: When you install the Supabase SDK, initialize it here:
    // import { createClient } from "@supabase/supabase-js";
    // this._client = createClient(
    //   import.meta.env.VITE_SUPABASE_URL,
    //   import.meta.env.VITE_SUPABASE_ANON_KEY
    // );
    console.info("[Voxora] Supabase provider loaded. Install @supabase/supabase-js and implement provider methods to activate cloud storage.");
  }

  // ── Auth stubs — replace with supabase.auth calls ─────────────────────
  async signUp(_name: string, _email: string, _password: string, _username?: string): Promise<AuthResult> {
    // TODO: this._client.auth.signUp({ email, password })
    return { ok: false, error: "Supabase SDK not yet installed. Run: npm install @supabase/supabase-js" };
  }

  async login(_email: string, _password: string): Promise<AuthResult> {
    // TODO: this._client.auth.signInWithPassword({ email, password })
    return { ok: false, error: "Supabase SDK not yet installed. Run: npm install @supabase/supabase-js" };
  }

  async logout(): Promise<void> {
    // TODO: this._client.auth.signOut()
  }

  async getCurrentUser(): Promise<BackendUser | null> {
    // TODO: this._client.auth.getUser()
    return null;
  }

  async updateUser(_userId: string, _data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.from("profiles").update(data).eq("id", userId)
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async changePassword(_userId: string, _current: string, next: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.auth.updateUser({ password: next })
    void next;
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async deleteAccount(_userId: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.auth.admin.deleteUser(userId) — requires service role key
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.auth.resetPasswordForEmail(email)
    void email;
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async sendEmailVerification(_userId: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.auth.resend({ type: "signup", email })
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  // ── Data stubs — replace with supabase.from() calls ───────────────────
  async getCollection(_userId: string, _collection: CloudCollection): Promise<CloudRecord[]> {
    // TODO: this._client.from(collection).select("*").eq("user_id", userId)
    return [];
  }

  async upsertRecord(
    _userId: string, _collection: CloudCollection, _id: string, _data: unknown
  ): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.from(collection).upsert({ id, user_id: userId, data, updated_at: new Date() })
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async deleteRecord(_userId: string, _collection: CloudCollection, _id: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: this._client.from(collection).delete().eq("id", id).eq("user_id", userId)
    return { ok: false, error: "Supabase SDK not yet installed." };
  }

  async getRecord(_userId: string, _collection: CloudCollection, _id: string): Promise<CloudRecord | null> {
    // TODO: this._client.from(collection).select("*").eq("id", id).single()
    return null;
  }

  async isAvailable(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        method: "HEAD",
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        signal: AbortSignal.timeout(4000),
      });
      return res.ok || res.status === 401;
    } catch { return false; }
  }
}
