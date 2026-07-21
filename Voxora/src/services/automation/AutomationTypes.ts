// ── V5.7 Automation Types ─────────────────────────────────────────────────────

export type TriggerType =
  | "project_created"
  | "ai_conversation_saved"
  | "billing_upgraded"
  | "feedback_submitted"
  | "report_generated"
  | "integration_connected"
  | "integration_synced"
  | "manual";

export type ConditionOperator = "equals" | "contains" | "greater_than" | "less_than" | "exists";

export type ActionType =
  | "send_notification"
  | "sync_integration"
  | "log_event"
  | "create_project"
  | "send_webhook";

export type ScheduleType = "daily" | "weekly" | "monthly" | "manual";

export type WorkflowStatus = "active" | "inactive" | "error";

export interface TriggerConfig {
  type: TriggerType;
  payload?: Record<string, unknown>;
}

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface ActionConfig {
  type: ActionType;
  params: Record<string, string | number | boolean>;
}

export interface Schedule {
  type: ScheduleType;
  time?: string;       // HH:MM
  dayOfWeek?: number;  // 0=Sunday
  dayOfMonth?: number; // 1-31
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerConfig;
  conditions: Condition[];
  actions: ActionConfig[];
  schedule?: Schedule;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  lastExecutedAt?: string;
}

export interface ExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: "success" | "failed" | "skipped";
  triggeredBy: TriggerType | "schedule" | "manual";
  message: string;
  timestamp: string;
  durationMs?: number;
}
