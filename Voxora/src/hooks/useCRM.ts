// ── V6.4 CRM — Shared data hook ───────────────────────────────────────────────
// All CRM workspaces share this hook. Each component mounts fresh from
// localStorage; only one workspace is visible at a time, so state never
// conflicts. Functional setState throughout for race-safety; a ref-backed
// save queue serialises any async (Firestore) writes.

import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type LeadStatus =
  | "new" | "contacted" | "qualified" | "proposal"
  | "negotiation" | "won" | "lost";

export type LeadSource =
  | "Website" | "Referral" | "LinkedIn" | "Cold Outreach"
  | "Event" | "Social Media" | "Other";

export type ContactType = "customer" | "investor" | "partner" | "supplier";

export type TaskType =
  | "call" | "email" | "meeting" | "follow-up" | "deadline" | "other";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus   = "pending" | "in-progress" | "done";
export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  tags: string[];
  value: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactActivity {
  date: string;
  note: string;
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  company: string;
  email: string;
  phone: string;
  notes: string;
  isFavorite: boolean;
  activityHistory: ContactActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string;
  agenda: string;
  notes: string;
  followUpActions: string;
  status: MeetingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CRMTask {
  id: string;
  type: TaskType;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────────
// Firestore subcollection names mirror these keys (salesCrmLeads, etc.) and
// are listed in firestore.ts deleteUserData so account deletion wipes them.
export const CRM_KEYS = {
  leads:    "voxora-crm-leads",
  contacts: "voxora-crm-contacts",
  meetings: "voxora-crm-meetings",
  tasks:    "voxora-crm-tasks",
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

export function newCrmId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// ── useCRM ─────────────────────────────────────────────────────────────────────
export function useCRM() {
  const [leads,    setLeads]    = useState<Lead[]>(()    => load<Lead>(CRM_KEYS.leads));
  const [contacts, setContacts] = useState<Contact[]>(()  => load<Contact>(CRM_KEYS.contacts));
  const [meetings, setMeetings] = useState<Meeting[]>(()  => load<Meeting>(CRM_KEYS.meetings));
  const [tasks,    setTasks]    = useState<CRMTask[]>(()  => load<CRMTask>(CRM_KEYS.tasks));

  // Serialised save queues — prevent rapid edits from overwriting newer state
  const leadsQ    = useRef<Promise<void>>(Promise.resolve());
  const contactsQ = useRef<Promise<void>>(Promise.resolve());
  const meetingsQ = useRef<Promise<void>>(Promise.resolve());
  const tasksQ    = useRef<Promise<void>>(Promise.resolve());

  // Sync to localStorage after every state change (synchronous, no race risk)
  useEffect(() => { persist(CRM_KEYS.leads,    leads);    }, [leads]);
  useEffect(() => { persist(CRM_KEYS.contacts, contacts); }, [contacts]);
  useEffect(() => { persist(CRM_KEYS.meetings, meetings); }, [meetings]);
  useEffect(() => { persist(CRM_KEYS.tasks,    tasks);    }, [tasks]);

  // Queue helper — future Firestore writes will slot in here
  const queueSave = useCallback(
    (queueRef: React.MutableRefObject<Promise<void>>, fn: () => Promise<void>) => {
      queueRef.current = queueRef.current.then(fn).catch(console.error);
    },
    [],
  );

  // ── Leads ──────────────────────────────────────────────────────────────────
  const addLead = useCallback((data: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    const lead: Lead = { ...data, id: newCrmId(), createdAt: nowIso(), updatedAt: nowIso() };
    setLeads(prev => [lead, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    // Functional update — always based on latest state, never a stale closure
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: nowIso() } : l));
    queueSave(leadsQ, async () => { /* Firestore upsert goes here */ });
  }, [queueSave]);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    queueSave(leadsQ, async () => { /* Firestore delete goes here */ });
  }, [queueSave]);

  const moveLead = useCallback((id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status, updatedAt: nowIso() } : l));
    queueSave(leadsQ, async () => { /* Firestore upsert goes here */ });
  }, [queueSave]);

  // ── Contacts ───────────────────────────────────────────────────────────────
  const addContact = useCallback((data: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    const contact: Contact = { ...data, id: newCrmId(), createdAt: nowIso(), updatedAt: nowIso() };
    setContacts(prev => [contact, ...prev]);
  }, []);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: nowIso() } : c));
    queueSave(contactsQ, async () => { /* Firestore upsert goes here */ });
  }, [queueSave]);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    queueSave(contactsQ, async () => { /* Firestore delete goes here */ });
  }, [queueSave]);

  const toggleFavorite = useCallback((id: string) => {
    setContacts(prev =>
      prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite, updatedAt: nowIso() } : c),
    );
  }, []);

  const addContactActivity = useCallback((id: string, note: string) => {
    setContacts(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              activityHistory: [{ date: nowIso(), note }, ...(c.activityHistory ?? [])].slice(0, 30),
              updatedAt: nowIso(),
            }
          : c,
      ),
    );
  }, []);

  // ── Meetings ───────────────────────────────────────────────────────────────
  const addMeeting = useCallback((data: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => {
    const meeting: Meeting = { ...data, id: newCrmId(), createdAt: nowIso(), updatedAt: nowIso() };
    setMeetings(prev => [meeting, ...prev]);
  }, []);

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: nowIso() } : m));
    queueSave(meetingsQ, async () => { /* Firestore upsert goes here */ });
  }, [queueSave]);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    queueSave(meetingsQ, async () => { /* Firestore delete goes here */ });
  }, [queueSave]);

  // ── Tasks ──────────────────────────────────────────────────────────────────
  const addTask = useCallback((data: Omit<CRMTask, "id" | "createdAt" | "updatedAt">) => {
    const task: CRMTask = { ...data, id: newCrmId(), createdAt: nowIso(), updatedAt: nowIso() };
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<CRMTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: nowIso() } : t));
    queueSave(tasksQ, async () => { /* Firestore upsert goes here */ });
  }, [queueSave]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    queueSave(tasksQ, async () => { /* Firestore delete goes here */ });
  }, [queueSave]);

  return {
    leads,    contacts,    meetings,    tasks,
    addLead,  updateLead,  deleteLead,  moveLead,
    addContact, updateContact, deleteContact, toggleFavorite, addContactActivity,
    addMeeting, updateMeeting, deleteMeeting,
    addTask,  updateTask,  deleteTask,
  };
}
