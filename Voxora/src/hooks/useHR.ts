// ── V6.6 HR & People Studio — Shared data hook ───────────────────────────────
// All HR workspaces share this hook. Functional setState throughout for
// race-safety; mirrors the useOps.ts pattern exactly.

import { useState, useCallback, useRef, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
export type EmploymentStatus = "active" | "inactive" | "on-leave" | "terminated";
export type LeaveType        = "annual" | "sick" | "maternity" | "paternity" | "unpaid" | "other";
export type LeaveStatus      = "pending" | "approved" | "rejected";
export type InterviewStage   = "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
export type OfferStatus      = "none" | "pending" | "accepted" | "declined";
export type AttendanceStatus = "present" | "absent" | "leave" | "half-day";
export type PayrollStatus    = "draft" | "processed" | "paid";
export type ReviewStatus     = "draft" | "submitted" | "reviewed";
export type PerformanceRating = 1 | 2 | 3 | 4 | 5;

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: EmploymentStatus;
  startDate: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: InterviewStage;
  offerStatus: OfferStatus;
  notes: string;
  resumeUrl: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: AttendanceStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  notes: string;
  reviewedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netPay: number;
  status: PayrollStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
}

export interface KPI {
  id: string;
  name: string;
  target: string;
  actual: string;
  unit: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  goals: PerformanceGoal[];
  kpis: KPI[];
  rating: PerformanceRating;
  managerFeedback: string;
  improvementPlan: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────────
export const HR_KEYS = {
  employees:   "voxora-hr-employees",
  candidates:  "voxora-hr-candidates",
  attendance:  "voxora-hr-attendance",
  leaves:      "voxora-hr-leaves",
  payroll:     "voxora-hr-payroll",
  performance: "voxora-hr-performance",
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

export function newHRId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

// ── useHR ──────────────────────────────────────────────────────────────────────
export function useHR() {
  const [employees,   setEmployees]   = useState<Employee[]>(()          => load<Employee>(HR_KEYS.employees));
  const [candidates,  setCandidates]  = useState<Candidate[]>(()         => load<Candidate>(HR_KEYS.candidates));
  const [attendance,  setAttendance]  = useState<AttendanceRecord[]>(()  => load<AttendanceRecord>(HR_KEYS.attendance));
  const [leaves,      setLeaves]      = useState<LeaveRequest[]>(()      => load<LeaveRequest>(HR_KEYS.leaves));
  const [payroll,     setPayroll]     = useState<PayrollRecord[]>(()     => load<PayrollRecord>(HR_KEYS.payroll));
  const [performance, setPerformance] = useState<PerformanceReview[]>(() => load<PerformanceReview>(HR_KEYS.performance));

  const empQ  = useRef<Promise<void>>(Promise.resolve());
  const canQ  = useRef<Promise<void>>(Promise.resolve());
  const attQ  = useRef<Promise<void>>(Promise.resolve());
  const lvQ   = useRef<Promise<void>>(Promise.resolve());
  const payQ  = useRef<Promise<void>>(Promise.resolve());
  const perfQ = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => { persist(HR_KEYS.employees,   employees);   }, [employees]);
  useEffect(() => { persist(HR_KEYS.candidates,  candidates);  }, [candidates]);
  useEffect(() => { persist(HR_KEYS.attendance,  attendance);  }, [attendance]);
  useEffect(() => { persist(HR_KEYS.leaves,      leaves);      }, [leaves]);
  useEffect(() => { persist(HR_KEYS.payroll,     payroll);     }, [payroll]);
  useEffect(() => { persist(HR_KEYS.performance, performance); }, [performance]);

  const queueSave = useCallback(
    (queueRef: React.MutableRefObject<Promise<void>>, fn: () => Promise<void>) => {
      queueRef.current = queueRef.current.then(fn).catch(console.error);
    },
    [],
  );

  // ── Employees ──────────────────────────────────────────────────────────────
  const addEmployee = useCallback((data: Omit<Employee, "id" | "createdAt" | "updatedAt">) => {
    const emp: Employee = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setEmployees(prev => [emp, ...prev]);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: nowIso() } : e));
    queueSave(empQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    queueSave(empQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Candidates ─────────────────────────────────────────────────────────────
  const addCandidate = useCallback((data: Omit<Candidate, "id" | "createdAt" | "updatedAt">) => {
    const cand: Candidate = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setCandidates(prev => [cand, ...prev]);
  }, []);

  const updateCandidate = useCallback((id: string, updates: Partial<Candidate>) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: nowIso() } : c));
    queueSave(canQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteCandidate = useCallback((id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    queueSave(canQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Attendance ─────────────────────────────────────────────────────────────
  const addAttendance = useCallback((data: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">) => {
    const rec: AttendanceRecord = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setAttendance(prev => [rec, ...prev]);
  }, []);

  const updateAttendance = useCallback((id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: nowIso() } : r));
    queueSave(attQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteAttendance = useCallback((id: string) => {
    setAttendance(prev => prev.filter(r => r.id !== id));
    queueSave(attQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Leave ──────────────────────────────────────────────────────────────────
  const addLeave = useCallback((data: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt">) => {
    const req: LeaveRequest = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setLeaves(prev => [req, ...prev]);
  }, []);

  const updateLeave = useCallback((id: string, updates: Partial<LeaveRequest>) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: nowIso() } : l));
    queueSave(lvQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteLeave = useCallback((id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    queueSave(lvQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Payroll ────────────────────────────────────────────────────────────────
  const addPayroll = useCallback((data: Omit<PayrollRecord, "id" | "createdAt" | "updatedAt">) => {
    const rec: PayrollRecord = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setPayroll(prev => [rec, ...prev]);
  }, []);

  const updatePayroll = useCallback((id: string, updates: Partial<PayrollRecord>) => {
    setPayroll(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: nowIso() } : r));
    queueSave(payQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deletePayroll = useCallback((id: string) => {
    setPayroll(prev => prev.filter(r => r.id !== id));
    queueSave(payQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  // ── Performance ────────────────────────────────────────────────────────────
  const addReview = useCallback((data: Omit<PerformanceReview, "id" | "createdAt" | "updatedAt">) => {
    const rev: PerformanceReview = { ...data, id: newHRId(), createdAt: nowIso(), updatedAt: nowIso() };
    setPerformance(prev => [rev, ...prev]);
  }, []);

  const updateReview = useCallback((id: string, updates: Partial<PerformanceReview>) => {
    setPerformance(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: nowIso() } : r));
    queueSave(perfQ, async () => { /* Firestore upsert */ });
  }, [queueSave]);

  const deleteReview = useCallback((id: string) => {
    setPerformance(prev => prev.filter(r => r.id !== id));
    queueSave(perfQ, async () => { /* Firestore delete */ });
  }, [queueSave]);

  return {
    employees,  candidates,  attendance,  leaves,  payroll,  performance,
    addEmployee,   updateEmployee,   deleteEmployee,
    addCandidate,  updateCandidate,  deleteCandidate,
    addAttendance, updateAttendance, deleteAttendance,
    addLeave,      updateLeave,      deleteLeave,
    addPayroll,    updatePayroll,    deletePayroll,
    addReview,     updateReview,     deleteReview,
  };
}
