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
const FIRESTORE_TIMEOUT_MS = 12_000;

type SavePlanOptions = {
  rejectOnCloudFailure?: boolean;
};

function withFirestoreTimeout<T>(
  operation: Promise<T>,
  operationName: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Firestore ${operationName} timed out after 12 seconds`));
    }, FIRESTORE_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

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
  const { getFirestore, collection } = await withFirestoreTimeout(
    import("firebase/firestore"),
    "module load",
  );
  const db = getFirestore(getFirebaseApp());
  return collection(db, `users/${uid}/businessPlans`);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchPlans(uid: string): Promise<BusinessPlan[]> {
  if (!isFirebaseConfigured() || !uid) return readLocal().filter(p => p.ownerUid === uid);
  try {
    const { getDocs, orderBy, query } = await withFirestoreTimeout(
      import("firebase/firestore"),
      "module load",
    );
    const col = await withFirestoreTimeout(getCollection(uid), "collection lookup");
    const snap = await withFirestoreTimeout(
      getDocs(query(col, orderBy("updatedAt", "desc"))),
      "fetch",
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BusinessPlan));
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore fetch failed, using local", e);
    return readLocal().filter(p => p.ownerUid === uid);
  }
}

export async function savePlan(
  plan: BusinessPlan,
  options: SavePlanOptions = {},
): Promise<BusinessPlan> {
  if (!isFirebaseConfigured() || !plan.ownerUid) {
    const all = readLocal().filter(p => p.id !== plan.id);
    all.unshift(plan);
    writeLocal(all);
    return plan;
  }
  try {
    console.log("[BusinessPlanService] Before await Firestore module load");
    const { doc, setDoc, getFirestore } = await withFirestoreTimeout(
      import("firebase/firestore"),
      "module load",
    );
    console.log("[BusinessPlanService] After await Firestore module load");
    const db = getFirestore(getFirebaseApp());
    const ref = doc(db, `users/${plan.ownerUid}/businessPlans/${plan.id}`);
    console.log("[BusinessPlanService] Before await Firestore save");
    await withFirestoreTimeout(setDoc(ref, plan), "save");
    console.log("[BusinessPlanService] After await Firestore save");
    return plan;
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore save failed, using local", e);
    const all = readLocal().filter(p => p.id !== plan.id);
    all.unshift(plan);
    writeLocal(all);
    if (options.rejectOnCloudFailure) {
      throw e;
    }
    return plan;
  }
}

export async function deletePlan(uid: string, planId: string): Promise<void> {
  if (!isFirebaseConfigured() || !uid) {
    writeLocal(readLocal().filter(p => p.id !== planId));
    return;
  }
  try {
    const { doc, deleteDoc, getFirestore } = await withFirestoreTimeout(
      import("firebase/firestore"),
      "module load",
    );
    const db = getFirestore(getFirebaseApp());
    await withFirestoreTimeout(
      deleteDoc(doc(db, `users/${uid}/businessPlans/${planId}`)),
      "delete",
    );
  } catch (e) {
    console.warn("[BusinessPlanService] Firestore delete failed, using local", e);
    writeLocal(readLocal().filter(p => p.id !== planId));
  }
}

export function newPlanId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
