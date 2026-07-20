// ── V5.3 Backend Service — Factory & Singleton ────────────────────────────────
// Reads environment variables and returns the configured provider.
// Falls back to LocalBackendProvider (Demo Mode) if nothing is configured.
// No secrets are ever hard-coded here.

import type { BackendProvider } from "./BackendProvider";
import { LocalBackendProvider } from "./providers/LocalBackendProvider";
import { isFirebaseConfigured } from "./providers/FirebaseBackendProvider";
import { isSupabaseConfigured } from "./providers/SupabaseBackendProvider";

export type BackendMode = "firebase" | "supabase" | "local";

export function getBackendMode(): BackendMode {
  if (isFirebaseConfigured()) return "firebase";
  if (isSupabaseConfigured()) return "supabase";
  return "local";
}

export function isCloudConfigured(): boolean {
  return getBackendMode() !== "local";
}

// Lazily-initialized singleton provider
let _provider: BackendProvider | null = null;

export async function getBackendProvider(): Promise<BackendProvider> {
  if (_provider) return _provider;

  const mode = getBackendMode();

  if (mode === "firebase") {
    try {
      const { FirebaseBackendProvider } = await import("./providers/FirebaseBackendProvider");
      _provider = new FirebaseBackendProvider();
      console.info("[Voxora] Cloud backend: Firebase");
      return _provider;
    } catch (e) {
      console.warn("[Voxora] Firebase provider failed to initialize, falling back to local:", e);
    }
  }

  if (mode === "supabase") {
    try {
      const { SupabaseBackendProvider } = await import("./providers/SupabaseBackendProvider");
      _provider = new SupabaseBackendProvider();
      console.info("[Voxora] Cloud backend: Supabase");
      return _provider;
    } catch (e) {
      console.warn("[Voxora] Supabase provider failed to initialize, falling back to local:", e);
    }
  }

  // Local Demo Mode
  _provider = new LocalBackendProvider();
  if (mode === "local") {
    console.info("[Voxora] Running in Local Demo Mode — no cloud backend configured.");
  }
  return _provider;
}

/** Reset the singleton (useful for testing / provider switching). */
export function resetBackendProvider() { _provider = null; }
