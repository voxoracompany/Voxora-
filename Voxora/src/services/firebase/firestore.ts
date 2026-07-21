// ── V5.3 Firestore Service ─────────────────────────────────────────────────────
// All Firestore CRUD for Voxora cloud data.
// Data model: /users/{uid}/{collection}/{recordId}
// User profile:  /users/{uid}  (top-level document)

import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore,
  type FieldValue,
} from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import type { BackendUser } from "../backend/BackendTypes";

function db(): Firestore {
  return getFirestore(getFirebaseApp());
}

// ── Ref helpers ───────────────────────────────────────────────────────────────
function userRef(uid: string) {
  return doc(db(), "users", uid);
}

function colRef(uid: string, col: string) {
  return collection(db(), "users", uid, col);
}

function recRef(uid: string, col: string, id: string) {
  return doc(db(), "users", uid, col, id);
}

// ── User Profile ──────────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<Partial<BackendUser> | null> {
  try {
    const snap = await getDoc(userRef(uid));
    return snap.exists() ? (snap.data() as Partial<BackendUser>) : null;
  } catch (e) {
    console.warn("[Voxora/Firestore] getUserProfile failed:", e);
    return null;
  }
}

export async function saveUserProfile(uid: string, data: Partial<BackendUser>): Promise<{ ok: boolean; error?: string }> {
  try {
    await setDoc(userRef(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String((e as { message?: string }).message ?? e) };
  }
}

// ── Generic Collection CRUD ────────────────────────────────────────────────────
export interface FirestoreRecord {
  id: string;
  [key: string]: unknown;
}

export async function getCollection<T = FirestoreRecord>(
  uid: string,
  col: string,
  maxDocs = 500,
): Promise<T[]> {
  try {
    const q = query(colRef(uid, col), orderBy("updatedAt", "desc"), limit(maxDocs));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  } catch (e) {
    console.warn(`[Voxora/Firestore] getCollection(${col}) failed:`, e);
    return [];
  }
}

export async function upsertRecord(
  uid: string,
  col: string,
  id: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload: Record<string, unknown | FieldValue> = {
      ...data,
      id,
      updatedAt: serverTimestamp(),
    };
    await setDoc(recRef(uid, col, id), payload, { merge: true });
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String((e as { message?: string }).message ?? e) };
  }
}

export async function deleteRecord(
  uid: string,
  col: string,
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(recRef(uid, col, id));
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: String((e as { message?: string }).message ?? e) };
  }
}

export async function getRecord<T = FirestoreRecord>(
  uid: string,
  col: string,
  id: string,
): Promise<T | null> {
  try {
    const snap = await getDoc(recRef(uid, col, id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
  } catch (e) {
    console.warn(`[Voxora/Firestore] getRecord(${col}/${id}) failed:`, e);
    return null;
  }
}

// ── Reachability check (no SDK import needed) ─────────────────────────────────
export async function isFirestoreReachable(projectId: string): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases`;
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    return res.ok || res.status === 401;
  } catch {
    return false;
  }
}
