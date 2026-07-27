// ── V8.2 Scheduled Task Service ───────────────────────────────────────────────
// Manages scheduled automation tasks with daily/weekly/monthly/custom schedules.
// Persists in localStorage (Demo Mode). Firebase-ready shape.

import { NotificationService } from "../admin/NotificationService";

export type ScheduleFrequency = "daily" | "weekly" | "monthly" | "custom";
export type TaskStatus = "active" | "paused" | "error";
export type RunStatus  = "success" | "failed" | "skipped";

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  frequency: ScheduleFrequency;
  /** HH:MM (24h) */
  time: string;
  /** 0=Sunday … 6=Saturday — used for weekly */
  dayOfWeek?: number;
  /** 1-31 — used for monthly */
  dayOfMonth?: number;
  /** Cron-like label for custom, e.g. "Every 6 hours" */
  customLabel?: string;
  status: TaskStatus;
  lastRunAt?: string;
  lastRunStatus?: RunStatus;
  nextRunAt: string;
  runCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
  /** Workspace to navigate to when the task completes */
  linkedWorkspace?: string;
}

export interface TaskRunRecord {
  id: string;
  taskId: string;
  taskName: string;
  status: RunStatus;
  message: string;
  duration: number;
  timestamp: string;
}

const TASKS_KEY = "voxora-scheduled-tasks-v1";
const RUNS_KEY  = "voxora-scheduled-runs-v1";
const MAX_RUNS  = 200;

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function runId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function loadTasks(): ScheduledTask[] {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || "[]"); }
  catch { return []; }
}

function saveTasks(tasks: ScheduledTask[]): void {
  try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
  catch { /* storage full */ }
}

function loadRuns(): TaskRunRecord[] {
  try { return JSON.parse(localStorage.getItem(RUNS_KEY) || "[]"); }
  catch { return []; }
}

function saveRuns(runs: TaskRunRecord[]): void {
  try { localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, MAX_RUNS))); }
  catch { /* storage full */ }
}

function computeNextRun(task: Pick<ScheduledTask, "frequency" | "time" | "dayOfWeek" | "dayOfMonth">): string {
  const now = new Date();
  const [hh, mm] = (task.time || "08:00").split(":").map(Number);
  const next = new Date(now);
  next.setHours(hh, mm, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);

  if (task.frequency === "weekly" && task.dayOfWeek !== undefined) {
    while (next.getDay() !== task.dayOfWeek) next.setDate(next.getDate() + 1);
  } else if (task.frequency === "monthly" && task.dayOfMonth !== undefined) {
    next.setDate(task.dayOfMonth);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_TASKS: ScheduledTask[] = [
  {
    id: "stask-1",
    name: "Weekly AI Summary",
    description: "Generate a weekly summary of all AI activity and project updates.",
    frequency: "weekly",
    time: "08:00",
    dayOfWeek: 1,
    status: "active",
    nextRunAt: computeNextRun({ frequency: "weekly", time: "08:00", dayOfWeek: 1 }),
    runCount: 4,
    failCount: 0,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastRunAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastRunStatus: "success",
    linkedWorkspace: "assistant",
  },
  {
    id: "stask-2",
    name: "Daily Activity Reminder",
    description: "Send a daily reminder to review your key metrics and open tasks.",
    frequency: "daily",
    time: "09:00",
    status: "active",
    nextRunAt: computeNextRun({ frequency: "daily", time: "09:00" }),
    runCount: 12,
    failCount: 1,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    lastRunStatus: "success",
    linkedWorkspace: "analytics",
  },
  {
    id: "stask-3",
    name: "Monthly Growth Report",
    description: "Compile and send a full monthly growth and performance report.",
    frequency: "monthly",
    time: "07:00",
    dayOfMonth: 1,
    status: "paused",
    nextRunAt: computeNextRun({ frequency: "monthly", time: "07:00", dayOfMonth: 1 }),
    runCount: 2,
    failCount: 0,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastRunAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastRunStatus: "success",
    linkedWorkspace: "monthlyGrowthReport",
  },
];

// ── Scheduled Task Service ────────────────────────────────────────────────────

export const ScheduledTaskService = {
  getAll(): ScheduledTask[] {
    const stored = loadTasks();
    if (stored.length === 0) {
      saveTasks(SEED_TASKS);
      return SEED_TASKS;
    }
    return stored;
  },

  getById(id: string): ScheduledTask | undefined {
    return this.getAll().find((t) => t.id === id);
  },

  getActive(): ScheduledTask[] {
    return this.getAll().filter((t) => t.status === "active");
  },

  create(params: {
    name: string;
    description: string;
    frequency: ScheduleFrequency;
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    customLabel?: string;
    linkedWorkspace?: string;
  }): ScheduledTask {
    const now = new Date().toISOString();
    const task: ScheduledTask = {
      id: uid(),
      name: params.name,
      description: params.description,
      frequency: params.frequency,
      time: params.time,
      dayOfWeek: params.dayOfWeek,
      dayOfMonth: params.dayOfMonth,
      customLabel: params.customLabel,
      status: "active",
      nextRunAt: computeNextRun(params),
      runCount: 0,
      failCount: 0,
      createdAt: now,
      updatedAt: now,
      linkedWorkspace: params.linkedWorkspace,
    };
    const tasks = this.getAll();
    saveTasks([task, ...tasks]);
    return task;
  },

  update(id: string, params: Partial<Pick<ScheduledTask, "name" | "description" | "frequency" | "time" | "dayOfWeek" | "dayOfMonth" | "linkedWorkspace">>): void {
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return;
    tasks[idx] = {
      ...tasks[idx],
      ...params,
      updatedAt: new Date().toISOString(),
      nextRunAt: computeNextRun({ ...tasks[idx], ...params }),
    };
    saveTasks(tasks);
  },

  toggle(id: string): TaskStatus {
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return "paused";
    const next: TaskStatus = tasks[idx].status === "active" ? "paused" : "active";
    tasks[idx] = { ...tasks[idx], status: next, updatedAt: new Date().toISOString() };
    saveTasks(tasks);
    return next;
  },

  delete(id: string): void {
    saveTasks(this.getAll().filter((t) => t.id !== id));
  },

  /** Run a task manually (demo simulation). */
  async run(id: string): Promise<TaskRunRecord> {
    const task = this.getById(id);
    const start = Date.now();

    if (!task) {
      return this._record({ taskId: id, taskName: "Unknown", status: "failed", message: "Task not found.", duration: 0 });
    }

    // Simulate execution
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
    const duration = Date.now() - start;
    const success = Math.random() > 0.05; // 95% success rate in demo

    // Update task
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasks[idx] = {
        ...tasks[idx],
        lastRunAt: new Date().toISOString(),
        lastRunStatus: success ? "success" : "failed",
        runCount: tasks[idx].runCount + 1,
        failCount: tasks[idx].failCount + (success ? 0 : 1),
        nextRunAt: computeNextRun(tasks[idx]),
        updatedAt: new Date().toISOString(),
      };
      saveTasks(tasks);
    }

    const record = this._record({
      taskId: id,
      taskName: task.name,
      status: success ? "success" : "failed",
      message: success ? `Task completed in ${duration}ms.` : "Task failed — will retry at next scheduled run.",
      duration,
    });

    // Notify on failure
    if (!success) {
      NotificationService.add("error", `Scheduled Task Failed`, `"${task.name}" failed at ${new Date().toLocaleTimeString()}.`, "Scheduler");
    } else {
      NotificationService.add("success", `Scheduled Task Complete`, `"${task.name}" ran successfully.`, "Scheduler");
    }

    return record;
  },

  _record(params: { taskId: string; taskName: string; status: RunStatus; message: string; duration: number }): TaskRunRecord {
    const record: TaskRunRecord = {
      id: runId(),
      ...params,
      timestamp: new Date().toISOString(),
    };
    const runs = loadRuns();
    saveRuns([record, ...runs]);
    return record;
  },

  getRuns(limit = 50): TaskRunRecord[] {
    return loadRuns().slice(0, limit);
  },

  getRunsForTask(taskId: string, limit = 20): TaskRunRecord[] {
    return loadRuns().filter((r) => r.taskId === taskId).slice(0, limit);
  },

  getStats() {
    const tasks = this.getAll();
    const runs = loadRuns();
    return {
      total: tasks.length,
      active: tasks.filter((t) => t.status === "active").length,
      paused: tasks.filter((t) => t.status === "paused").length,
      totalRuns: runs.length,
      successRate: runs.length === 0 ? 100 : Math.round((runs.filter((r) => r.status === "success").length / runs.length) * 100),
      recentRuns: runs.slice(0, 5),
    };
  },

  /** Seed smart notifications (AI-driven). Call once on Dashboard mount. */
  seedSmartNotifications(): void {
    const stats = this.getStats();
    const seenKey = "voxora-smart-notif-seeded-v82";
    if (localStorage.getItem(seenKey)) return;
    localStorage.setItem(seenKey, "1");

    NotificationService.add("info", "Weekly AI Summary Ready", "Your weekly AI activity report is available in the AI Assistant.", "AI Engine");
    if (stats.active > 0) {
      NotificationService.add("success", "Automation Running", `${stats.active} automation workflow${stats.active > 1 ? "s are" : " is"} actively monitoring your platform.`, "Automation");
    }
    NotificationService.add("info", "AI Agents Available", "7 specialised AI Agents are ready — CEO, Marketing, Sales, Finance, Support, HR & Research.", "AI Agents");
    NotificationService.add("info", "Suggested: Run Customer Research", "You haven't run customer research this week. Open the Research Agent to get started.", "AI Recommendations");
  },
};
