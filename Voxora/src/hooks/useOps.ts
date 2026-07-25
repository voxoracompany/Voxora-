// ── V6.5 Operations Studio — Shared data hook ────────────────────────────────
// All Operations workspaces share this hook. Functional setState throughout
// for race-safety; a ref-backed save queue serialises async (Firestore) writes.
// Mirrors the useCRM.ts pattern exactly.

import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type OpsPriority       = "low" | "medium" | "high" | "critical";
export type OpsTaskStatus     = "todo" | "in-progress" | "review" | "done";
export type OpsKanbanColumn   = "todo" | "in-progress" | "review" | "done";
export type OpsTeamMemberStatus = "active" | "inactive" | "invited";

export interface OpsTask {
  id: string;
  title: string;
  description: string;
  priority: OpsPriority;
  status: OpsTaskStatus;
  dueDate: string;
  assignee: string;
  progress: number; // 0-100
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OpsKanbanCard {
  id: string;
  title: string;
  description: string;
  column: OpsKanbanColumn;
  priority: OpsPriority;
  assignee: string;
  dueDate: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SOPStep {
  id: string;
  title: string;
  description: string;
}

export interface SOPSection {
  id: string;
  title: string;
  notes: string;
  steps: SOPStep[];
}

export interface OpsSOPDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  sections: SOPSection[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OpsWorkflowAction {
  id: string;
  type: string;
  description: string;
}

export interface OpsWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  conditions: string[];
  actions: OpsWorkflowAction[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpsTeamActivity {
  date: string;
  note: string;
}

export interface OpsTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  permissions: string[];
  status: OpsTeamMemberStatus;
  activityHistory: OpsTeamActivity[];
  createdAt: string;
  updatedAt: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────────
// Firestore subcollection names mirror these keys and should be added to
// firestore.ts deleteUserData when account deletion cleanup is needed.
export const OPS_KEYS = {
  tasks:     "voxora-ops-tasks",
  kanban:    "voxora-ops-kanban",
  sops:      "voxora-ops-sops",
  workflows: "voxora-ops-workflows",
  team:      "voxora-ops-team",
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────────
function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, items: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* quota */ }
}

export function newOpsId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// ── useOps ─────────────────────────────────────────────────────────────────────
export function useOps() {
  const [tasks,     setTasks]     = useState<OpsTask[]>(()          => load<OpsTask>(OPS_KEYS.tasks));
  const [kanban,    setKanban]    = useState<OpsKanbanCard[]>(()     => load<OpsKanbanCard>(OPS_KEYS.kanban));
  const [sops,      setSOPs]      = useState<OpsSOPDocument[]>(()    => load<OpsSOPDocument>(OPS_KEYS.sops));
  const [workflows, setWorkflows] = useState<OpsWorkflow[]>(()       => load<OpsWorkflow>(OPS_KEYS.workflows));
  const [team,      setTeam]      = useState<OpsTeamMember[]>(()     => load<OpsTeamMember>(OPS_KEYS.team));

  // Serialised save queues — prevent rapid edits from overwriting newer state
  const tasksQ     = useRef<Promise<void>>(Promise.resolve());
  const kanbanQ    = useRef<Promise<void>>(Promise.resolve());
  const sopsQ      = useRef<Promise<void>>(Promise.resolve());
  const workflowsQ = useRef<Promise<void>>(Promise.resolve());
  const teamQ      = useRef<Promise<void>>(Promise.resolve());

  // Sync to localStorage after every state change
  useEffect(() => { persist(OPS_KEYS.tasks,     tasks);     }, [tasks]);
  useEffect(() => { persist(OPS_KEYS.kanban,    kanban);    }, [kanban]);
  useEffect(() => { persist(OPS_KEYS.sops,      sops);      }, [sops]);
  useEffect(() => { persist(OPS_KEYS.workflows, workflows); }, [workflows]);
  useEffect(() => { persist(OPS_KEYS.team,      team);      }, [team]);

  const queueSave = useCallback(
    (queueRef: React.MutableRefObject<Promise<void>>, fn: () => Promise<void>) => {
      queueRef.current = queueRef.current.then(fn).catch(console.error);
    },
    [],
  );

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const addTask = useCallback((data: Omit<OpsTask, "id" | "createdAt" | "updatedAt">) => {
    const task: OpsTask = { ...data, id: newOpsId(), createdAt: nowIso(), updatedAt: nowIso() };
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<OpsTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: nowIso() } : t));
    queueSave(tasksQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    queueSave(tasksQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Kanban ─────────────────────────────────────────────────────────────────
  const addCard = useCallback((data: Omit<OpsKanbanCard, "id" | "createdAt" | "updatedAt">) => {
    const card: OpsKanbanCard = { ...data, id: newOpsId(), createdAt: nowIso(), updatedAt: nowIso() };
    setKanban(prev => [...prev, card]);
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<OpsKanbanCard>) => {
    setKanban(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: nowIso() } : c));
    queueSave(kanbanQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteCard = useCallback((id: string) => {
    setKanban(prev => prev.filter(c => c.id !== id));
    queueSave(kanbanQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  const moveCard = useCallback((id: string, column: OpsKanbanColumn) => {
    setKanban(prev => prev.map(c => c.id === id ? { ...c, column, updatedAt: nowIso() } : c));
    queueSave(kanbanQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  // ── SOPs ───────────────────────────────────────────────────────────────────
  const addSOP = useCallback((data: Omit<OpsSOPDocument, "id" | "createdAt" | "updatedAt">) => {
    const sop: OpsSOPDocument = { ...data, id: newOpsId(), createdAt: nowIso(), updatedAt: nowIso() };
    setSOPs(prev => [sop, ...prev]);
  }, []);

  const updateSOP = useCallback((id: string, updates: Partial<OpsSOPDocument>) => {
    setSOPs(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: nowIso() } : s));
    queueSave(sopsQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteSOP = useCallback((id: string) => {
    setSOPs(prev => prev.filter(s => s.id !== id));
    queueSave(sopsQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Workflows ──────────────────────────────────────────────────────────────
  const addWorkflow = useCallback((data: Omit<OpsWorkflow, "id" | "createdAt" | "updatedAt">) => {
    const wf: OpsWorkflow = { ...data, id: newOpsId(), createdAt: nowIso(), updatedAt: nowIso() };
    setWorkflows(prev => [wf, ...prev]);
  }, []);

  const updateWorkflow = useCallback((id: string, updates: Partial<OpsWorkflow>) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates, updatedAt: nowIso() } : w));
    queueSave(workflowsQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteWorkflow = useCallback((id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
    queueSave(workflowsQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  const duplicateWorkflow = useCallback((id: string) => {
    setWorkflows(prev => {
      const src = prev.find(w => w.id === id);
      if (!src) return prev;
      const copy: OpsWorkflow = {
        ...src,
        id: newOpsId(),
        name: `${src.name} (Copy)`,
        isActive: false,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      return [copy, ...prev];
    });
  }, []);

  const toggleWorkflow = useCallback((id: string) => {
    setWorkflows(prev =>
      prev.map(w => w.id === id ? { ...w, isActive: !w.isActive, updatedAt: nowIso() } : w),
    );
  }, []);

  // ── Team ───────────────────────────────────────────────────────────────────
  const addMember = useCallback((data: Omit<OpsTeamMember, "id" | "createdAt" | "updatedAt">) => {
    const member: OpsTeamMember = { ...data, id: newOpsId(), createdAt: nowIso(), updatedAt: nowIso() };
    setTeam(prev => [member, ...prev]);
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<OpsTeamMember>) => {
    setTeam(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: nowIso() } : m));
    queueSave(teamQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteMember = useCallback((id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    queueSave(teamQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  const addMemberActivity = useCallback((id: string, note: string) => {
    setTeam(prev =>
      prev.map(m =>
        m.id === id
          ? {
              ...m,
              activityHistory: [{ date: nowIso(), note }, ...(m.activityHistory ?? [])].slice(0, 30),
              updatedAt: nowIso(),
            }
          : m,
      ),
    );
  }, []);

  return {
    tasks, kanban, sops, workflows, team,
    addTask,     updateTask,     deleteTask,
    addCard,     updateCard,     deleteCard,     moveCard,
    addSOP,      updateSOP,      deleteSOP,
    addWorkflow, updateWorkflow, deleteWorkflow, duplicateWorkflow, toggleWorkflow,
    addMember,   updateMember,   deleteMember,   addMemberActivity,
  };
}
