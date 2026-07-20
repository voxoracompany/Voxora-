// ── V5.3 Firebase Backend Provider ───────────────────────────────────────────
// Skeleton ready for Firebase SDK integration.
// Set these env vars to activate (prefix VITE_ for Vite to expose them):
//   VITE_FIREBASE_API_KEY
//   VITE_FIREBASE_PROJECT_ID
//   VITE_FIREBASE_AUTH_DOMAIN
//   VITE_FIREBASE_APP_ID
//
// Install SDK when ready:  npm install firebase
// Then replace the stub bodies below with real Firebase calls.

import type { BackendProvider } from "../BackendProvider";
import type {
  AuthResult, BackendUser, CloudCollection, CloudRecord, BackendProviderName,
} from "../BackendTypes";

export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

export class FirebaseBackendProvider implements BackendProvider {
  readonly name: BackendProviderName = "firebase";

  constructor() {
    if (!isFirebaseConfigured()) {
      throw new Error("[Voxora] Firebase is not configured. Set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID.");
    }
    // TODO: When you install the Firebase SDK, initialize it here:
    // import { initializeApp } from "firebase/app";
    // import { getAuth } from "firebase/auth";
    // import { getFirestore } from "firebase/firestore";
    // const app = initializeApp({ apiKey: ..., projectId: ..., ... });
    // this._auth = getAuth(app);
    // this._db = getFirestore(app);
    console.info("[Voxora] Firebase provider loaded. Install the firebase SDK and implement provider methods to activate cloud storage.");
  }

  // ── Auth stubs — replace with firebase/auth calls ──────────────────────
  async signUp(_name: string, _email: string, _password: string, _username?: string): Promise<AuthResult> {
    // TODO: createUserWithEmailAndPassword(this._auth, email, password)
    return { ok: false, error: "Firebase SDK not yet installed. Run: npm install firebase" };
  }

  async login(_email: string, _password: string): Promise<AuthResult> {
    // TODO: signInWithEmailAndPassword(this._auth, email, password)
    return { ok: false, error: "Firebase SDK not yet installed. Run: npm install firebase" };
  }

  async logout(): Promise<void> {
    // TODO: signOut(this._auth)
  }

  async getCurrentUser(): Promise<BackendUser | null> {
    // TODO: this._auth.currentUser
    return null;
  }

  async updateUser(_userId: string, _data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }> {
    // TODO: updateDoc(doc(this._db, "users", userId), data)
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async changePassword(_userId: string, _current: string, _next: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: updatePassword(this._auth.currentUser!, next)
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async deleteAccount(_userId: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: deleteUser(this._auth.currentUser!)
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: sendPasswordResetEmail(this._auth, email)
    void email;
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async sendEmailVerification(_userId: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: sendEmailVerification(this._auth.currentUser!)
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  // ── Data stubs — replace with Firestore calls ──────────────────────────
  async getCollection(_userId: string, _collection: CloudCollection): Promise<CloudRecord[]> {
    // TODO: getDocs(collection(this._db, `users/${userId}/${collection}`))
    return [];
  }

  async upsertRecord(
    _userId: string, _collection: CloudCollection, _id: string, _data: unknown
  ): Promise<{ ok: boolean; error?: string }> {
    // TODO: setDoc(doc(this._db, `users/${userId}/${collection}/${id}`), { ...data, updatedAt: serverTimestamp() })
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async deleteRecord(_userId: string, _collection: CloudCollection, _id: string): Promise<{ ok: boolean; error?: string }> {
    // TODO: deleteDoc(doc(this._db, `users/${userId}/${collection}/${id}`))
    return { ok: false, error: "Firebase SDK not yet installed." };
  }

  async getRecord(_userId: string, _collection: CloudCollection, _id: string): Promise<CloudRecord | null> {
    // TODO: getDoc(doc(this._db, `users/${userId}/${collection}/${id}`))
    return null;
  }

  async isAvailable(): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/databases`;
      const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
      return res.ok || res.status === 401; // 401 = reachable but needs auth
    } catch { return false; }
  }
}
