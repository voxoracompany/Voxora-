// ── V5.3 Firebase Core — App Initialization ───────────────────────────────────
// Initialize Firebase from VITE_ environment variables.
// No env vars = Demo Mode (LocalBackendProvider is used instead).
// Set VITE_FIREBASE_* in .env (never commit real values).

import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";

export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             ?? "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         ?? "",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          ?? "",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              ?? "",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      ?? "",
};

let _app: FirebaseApp | null = null;

/**
 * Returns the initialized FirebaseApp singleton.
 * Throws if Firebase env vars are not configured.
 */
export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  if (!isFirebaseConfigured()) {
    throw new Error("[Voxora] Firebase is not configured. Set VITE_FIREBASE_* env vars.");
  }
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return _app;
}
