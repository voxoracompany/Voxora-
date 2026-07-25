// ── V6.0 AI Business Platform — BusinessPlanService ──────────────────────────
// Persists Business Plans to Firestore when Firebase is configured,
// falls back to localStorage in Demo Mode.

import { isFirebaseConfigured, getFirebaseApp } from "../firebase/firebase";

export interface BusinessPlan {
  id: string;
  title: string;
  businessIdea: string;
  industry: string;
  generatedSections: Record<string, string>;
  aiProvider: string;
  ownerUid: string;
  createdAt: string;
  updatedAt: string;
}

const LS_KEY = "voxora-business-plans";

// ── Local storage helpers ─────────────────────────────────────────────────────
function readLocal(): BusinessPlan[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLocal(plans: BusinessPlan[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(plans));
}

// ── Firestore helpers (dynamic import to avoid loading firebase if unconfigured) ─
async function getCollection(uid: string) {
  const { getFirestore, collection } = await import("firebase/firestore");
  const db = getFirestore(getFirebaseApp());
  return collection(db, `users/${uid}/businessPlans`);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchPlans(uid: string): Promise<BusinessPlan[]> {
  if (!isFirebaseConfigured() || !uid) return readLocal().filter(p => p.ownerUid === uid);
  try {
    const { getDocs, orderBy, query } = await import("firebase/firestore");
    const col = await getCollection(uid);
    const snap = await getDocs(query(col, orderBy("updatedAt", "desc")));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessPlan));
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore fetch failed, using local", e);
    return readLocal().filter(p => p.ownerUid === uid);
  }
}

export async function savePlan(plan: BusinessPlan): Promise<BusinessPlan> {
  if (!isFirebaseConfigured() || !plan.ownerUid) {
    const all = readLocal().filter(p => p.id !== plan.id);
    all.unshift(plan);
    writeLocal(all);
    return plan;
  }
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    const { getFirestore } = await import("firebase/firestore");
    const db = getFirestore(getFirebaseApp());
    const ref = doc(db, `users/${plan.ownerUid}/businessPlans/${plan.id}`);
    await setDoc(ref, plan);
    return plan;
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore save failed, using local", e);
    const all = readLocal().filter(p => p.id !== plan.id);
    all.unshift(plan);
    writeLocal(all);
    return plan;
  }
}

export async function deletePlan(uid: string, planId: string): Promise<void> {
  if (!isFirebaseConfigured() || !uid) {
    writeLocal(readLocal().filter(p => p.id !== planId));
    return;
  }
  try {
    const { doc, deleteDoc, getFirestore } = await import("firebase/firestore");
    const db = getFirestore(getFirebaseApp());
    await deleteDoc(doc(db, `users/${uid}/businessPlans/${planId}`));
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore delete failed, using local", e);
    writeLocal(readLocal().filter(p => p.id !== planId));
  }
}

export function newPlanId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
