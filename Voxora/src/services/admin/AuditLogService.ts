// ── V5.8 Audit Log Service ────────────────────────────────────────────────────

import type { AuditEvent, AuditEventType } from "./AdminTypes";

const STORAGE_KEY = "voxora-audit-log";
const MAX_EVENTS  = 500;

function genId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function iconForType(type: AuditEventType): string {
  const map: Record<AuditEventType, string> = {
    login:              "🔓",
    logout:             "🔒",
    ai_request:         "🤖",
    project_create:     "📁",
    project_delete:     "🗑️",
    billing_change:     "💳",
    integration_event:  "🔌",
    automation_event:   "⚡",
    settings_change:    "⚙️",
    user_role_change:   "👤",
    user_suspend:       "⛔",
    user_reactivate:    "✅",
    user_delete:        "🗑️",
    feature_flag_change:"🚩",
    maintenance_mode:   "🔧",
  };
  return map[type] ?? "📋";
}

function severityForType(type: AuditEventType): AuditEvent["severity"] {
  if (["user_suspend","user_delete","billing_change","maintenance_mode"].includes(type)) return "critical";
  if (["user_role_change","feature_flag_change"].includes(type)) return "warning";
  return "info";
}

export class AuditLogService {
  private static load(): AuditEvent[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  }

  private static save(events: AuditEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
    } catch { /* storage full */ }
  }

  static log(
    type: AuditEventType,
    description: string,
    metadata?: Record<string, string>,
  ): void {
    const userName = localStorage.getItem("voxora-name") || "Demo User";
    const event: AuditEvent = {
      id:          genId(),
      type,
      userId:      "demo-user",
      userName,
      description,
      metadata,
      timestamp:   new Date().toISOString(),
      severity:    severityForType(type),
      icon:        iconForType(type),
    };
    const existing = this.load();
    this.save([event, ...existing]);
  }

  static getAll(): AuditEvent[] {
    return this.load();
  }

  static getByType(type: AuditEventType): AuditEvent[] {
    return this.load().filter((e) => e.type === type);
  }

  static search(query: string): AuditEvent[] {
    const q = query.toLowerCase();
    return this.load().filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.userName.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q),
    );
  }

  static exportJSON(): string {
    return JSON.stringify(this.load(), null, 2);
  }

  static exportCSV(): string {
    const events = this.load();
    const header = "id,type,userId,userName,description,severity,timestamp";
    const rows = events.map((e) =>
      [e.id, e.type, e.userId, `"${e.userName}"`, `"${e.description}"`, e.severity, e.timestamp].join(","),
    );
    return [header, ...rows].join("\n");
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static seed(): void {
    // Seed demo events if empty
    if (this.load().length > 0) return;
    const demoEvents: Array<[AuditEventType, string]> = [
      ["login",             "User logged in from Chrome/Mac"],
      ["ai_request",        "AI request: Startup Ideas generator"],
      ["project_create",    "Created project: SaaS Pitch Deck"],
      ["integration_event", "Google Calendar connected"],
      ["automation_event",  "Automation workflow triggered: Daily AI Report"],
      ["settings_change",   "Theme changed to dark mode"],
      ["ai_request",        "AI request: Customer Research analysis"],
      ["billing_change",    "Plan upgraded to Pro"],
    ];
    demoEvents.forEach(([type, desc]) => this.log(type, desc));
  }
}
