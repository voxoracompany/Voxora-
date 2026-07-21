// ── V5.7 Automation Engine ────────────────────────────────────────────────────
import type {
  AutomationWorkflow, ExecutionRecord,
  TriggerType, WorkflowStatus, TriggerConfig, Condition, ActionConfig, Schedule,
} from "./AutomationTypes";
import { evaluateConditions } from "./AutomationRules";

const WF_KEY  = "voxora-automation-workflows-v1";
const EX_KEY  = "voxora-automation-executions-v1";
const MAX_EX  = 200;

// ── Persistence ──────────────────────────────────────────────────────────────

function loadWorkflows(): AutomationWorkflow[] {
  try { return JSON.parse(localStorage.getItem(WF_KEY) || "[]"); } catch { return []; }
}

function saveWorkflows(wf: AutomationWorkflow[]): void {
  localStorage.setItem(WF_KEY, JSON.stringify(wf));
}

function loadExecutions(): ExecutionRecord[] {
  try { return JSON.parse(localStorage.getItem(EX_KEY) || "[]"); } catch { return []; }
}

function saveExecutions(ex: ExecutionRecord[]): void {
  localStorage.setItem(EX_KEY, JSON.stringify(ex.slice(0, MAX_EX)));
}

function uid(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function exId(): string {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Default seed workflows ────────────────────────────────────────────────────

const SEED_WORKFLOWS: AutomationWorkflow[] = [
  {
    id: "seed-1",
    name: "Welcome New Project",
    description: "Log a welcome event whenever a new project is created.",
    status: "active",
    trigger: { type: "project_created" },
    conditions: [],
    actions: [{ type: "log_event", params: { message: "New project created — welcome!" } }],
    schedule: { type: "manual" },
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    executionCount: 3,
    lastExecutedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "seed-2",
    name: "AI Conversation Tracker",
    description: "Track every saved AI conversation for memory insights.",
    status: "active",
    trigger: { type: "ai_conversation_saved" },
    conditions: [],
    actions: [{ type: "log_event", params: { message: "AI conversation saved to memory." } }],
    schedule: { type: "manual" },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    executionCount: 12,
    lastExecutedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "seed-3",
    name: "Weekly Report Generator",
    description: "Generate a growth report summary every week.",
    status: "inactive",
    trigger: { type: "report_generated" },
    conditions: [],
    actions: [{ type: "log_event", params: { message: "Weekly report generated." } }],
    schedule: { type: "weekly", dayOfWeek: 1, time: "08:00" },
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    executionCount: 2,
    lastExecutedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// ── Engine ────────────────────────────────────────────────────────────────────

export const AutomationEngine = {
  /** Return all workflows, seeding defaults on first load. */
  getAll(): AutomationWorkflow[] {
    const stored = loadWorkflows();
    if (stored.length === 0) {
      saveWorkflows(SEED_WORKFLOWS);
      return SEED_WORKFLOWS;
    }
    return stored;
  },

  getById(id: string): AutomationWorkflow | undefined {
    return this.getAll().find(w => w.id === id);
  },

  getActive(): AutomationWorkflow[] {
    return this.getAll().filter(w => w.status === "active");
  },

  /** Create a new workflow. */
  create(params: {
    name: string;
    description: string;
    trigger: TriggerConfig;
    conditions?: Condition[];
    actions?: ActionConfig[];
    schedule?: Schedule;
  }): AutomationWorkflow {
    const now = new Date().toISOString();
    const wf: AutomationWorkflow = {
      id: uid(),
      name: params.name,
      description: params.description,
      status: "active",
      trigger: params.trigger,
      conditions: params.conditions ?? [],
      actions: params.actions ?? [{ type: "log_event", params: { message: `Triggered: ${params.name}` } }],
      schedule: params.schedule ?? { type: "manual" },
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
    };
    const list = this.getAll();
    saveWorkflows([wf, ...list]);
    return wf;
  },

  /** Duplicate a workflow. */
  duplicate(id: string): AutomationWorkflow | undefined {
    const src = this.getById(id);
    if (!src) return undefined;
    const now = new Date().toISOString();
    const copy: AutomationWorkflow = {
      ...src,
      id: uid(),
      name: `${src.name} (Copy)`,
      status: "inactive",
      executionCount: 0,
      lastExecutedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
    const list = this.getAll();
    saveWorkflows([copy, ...list]);
    return copy;
  },

  /** Toggle active/inactive. */
  toggle(id: string): WorkflowStatus {
    const list = this.getAll();
    const idx  = list.findIndex(w => w.id === id);
    if (idx === -1) return "inactive";
    const next: WorkflowStatus = list[idx].status === "active" ? "inactive" : "active";
    list[idx] = { ...list[idx], status: next, updatedAt: new Date().toISOString() };
    saveWorkflows(list);
    return next;
  },

  /** Delete a workflow. */
  delete(id: string): void {
    saveWorkflows(this.getAll().filter(w => w.id !== id));
  },

  /** Manually execute a workflow (demo — no real side-effects). */
  async execute(id: string, trigger: TriggerType = "manual", context: Record<string, unknown> = {}): Promise<ExecutionRecord> {
    const wf = this.getById(id);
    const start = Date.now();

    if (!wf) {
      return this._recordExecution({ workflowId: id, workflowName: "Unknown", status: "failed", trigger, message: "Workflow not found.", durationMs: 0 });
    }
    if (wf.status !== "active" && trigger !== "manual") {
      return this._recordExecution({ workflowId: id, workflowName: wf.name, status: "skipped", trigger, message: "Workflow is inactive.", durationMs: 0 });
    }

    const conditionsMet = evaluateConditions(wf.conditions, context);
    if (!conditionsMet) {
      return this._recordExecution({ workflowId: id, workflowName: wf.name, status: "skipped", trigger, message: "Conditions not met.", durationMs: Date.now() - start });
    }

    // Simulate execution delay
    await new Promise(r => setTimeout(r, 300 + Math.random() * 400));

    // Update execution count
    const list = this.getAll();
    const idx  = list.findIndex(w => w.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], executionCount: list[idx].executionCount + 1, lastExecutedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      saveWorkflows(list);
    }

    return this._recordExecution({
      workflowId: id,
      workflowName: wf.name,
      status: "success",
      trigger,
      message: `Executed ${wf.actions.length} action(s) successfully.`,
      durationMs: Date.now() - start,
    });
  },

  _recordExecution(params: { workflowId: string; workflowName: string; status: ExecutionRecord["status"]; trigger: TriggerType | "manual" | "schedule"; message: string; durationMs: number }): ExecutionRecord {
    const record: ExecutionRecord = {
      id: exId(),
      ...params,
      triggeredBy: params.trigger,
      timestamp: new Date().toISOString(),
    };
    const execs = loadExecutions();
    saveExecutions([record, ...execs]);
    return record;
  },

  getExecutions(limit = 50): ExecutionRecord[] {
    return loadExecutions().slice(0, limit);
  },

  getExecutionsByWorkflow(workflowId: string, limit = 20): ExecutionRecord[] {
    return loadExecutions().filter(e => e.workflowId === workflowId).slice(0, limit);
  },

  getStats() {
    const all   = this.getAll();
    const execs = loadExecutions();
    return {
      total: all.length,
      active: all.filter(w => w.status === "active").length,
      inactive: all.filter(w => w.status === "inactive").length,
      totalExecutions: execs.length,
      successRate: execs.length === 0 ? 100 : Math.round((execs.filter(e => e.status === "success").length / execs.length) * 100),
      recentExecutions: execs.slice(0, 5),
    };
  },

  /** Fire an event-driven trigger across all active workflows (demo). */
  async fireTrigger(type: TriggerType, context: Record<string, unknown> = {}): Promise<ExecutionRecord[]> {
    const matching = this.getActive().filter(w => w.trigger.type === type);
    const results: ExecutionRecord[] = [];
    for (const wf of matching) {
      const r = await this.execute(wf.id, type, context);
      results.push(r);
    }
    return results;
  },
};
