// ── V5.3 Backend Service — Factory & Singleton ────────────────────────────────
// Selects the active backend provider based on environment configuration.
//
// Firebase mode:  Set VITE_FIREBASE_API_KEY + VITE_FIREBASE_AUTH_DOMAIN +
//                 VITE_FIREBASE_PROJECT_ID.  Firebase SDK is bundled.
// Demo Mode:      No env vars needed.  Data lives in localStorage only.
//
// No secrets are ever hard-coded here.

import type { BackendProvider } from "./BackendProvider";
import { LocalBackendProvider } from "./providers/LocalBackendProvider";
import { isFirebaseConfigured } from "../firebase/firebase";

export type BackendMode = "firebase" | "local";

/** Which mode env vars indicate. */
export function getBackendMode(): BackendMode {
  return isFirebaseConfigured() ? "firebase" : "local";
}

/** True when Firebase env vars are configured and the provider resolved to Firebase. */
export function isCloudConfigured(): boolean {
  return _resolvedMode === "firebase";
}

// ── Singleton state ───────────────────────────────────────────────────────────
let _resolvedMode: BackendMode = "local";
let _provider: BackendProvider | null = null;
let _initPromise: Promise<BackendProvider> | null = null;

export async function getBackendProvider(): Promise<BackendProvider> {
  if (_provider) return _provider;
  if (_initPromise) return _initPromise;
  _initPromise = _init();
  return _initPromise;
}

async function _init(): Promise<BackendProvider> {
  if (isFirebaseConfigured()) {
    try {
      const { FirebaseBackendProvider } = await import(
        "./providers/FirebaseBackendProvider"
      );
      const candidate = new FirebaseBackendProvider();
      _provider = candidate;
      _resolvedMode = "firebase";
      console.info("[Voxora] ☁️ Cloud backend: Firebase");
      return _provider;
    } catch (e) {
      console.warn(
        "[Voxora] Firebase provider failed to initialise — falling back to Local Demo Mode:",
        e,
      );
    }
  }

  // Local Demo Mode
  _provider = new LocalBackendProvider();
  _resolvedMode = "local";
  console.info("[Voxora] 💾 Running in Local Demo Mode — data stored in browser storage.");
  return _provider;
}

/** Reset the singleton (for testing / hot reload). */
export function _resetBackendService(): void {
  _provider = null;
  _initPromise = null;
  _resolvedMode = "local";
}
