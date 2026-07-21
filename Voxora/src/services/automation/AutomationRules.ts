// ── V5.7 Automation Rules ─────────────────────────────────────────────────────
import type { Condition } from "./AutomationTypes";

/**
 * Evaluate a list of conditions against a context payload.
 * All conditions must pass (AND logic).
 */
export function evaluateConditions(
  conditions: Condition[],
  context: Record<string, unknown>
): boolean {
  if (conditions.length === 0) return true;

  return conditions.every(cond => {
    const value = context[cond.field];
    switch (cond.operator) {
      case "equals":
        return String(value) === String(cond.value);
      case "contains":
        return typeof value === "string" && value.includes(String(cond.value));
      case "greater_than":
        return typeof value === "number" && value > Number(cond.value);
      case "less_than":
        return typeof value === "number" && value < Number(cond.value);
      case "exists":
        return value !== undefined && value !== null;
      default:
        return false;
    }
  });
}

/** Return a human-readable description of a condition. */
export function describeCondition(cond: Condition): string {
  return `${cond.field} ${cond.operator.replace("_", " ")} "${cond.value}"`;
}

/** Validate that a workflow has required fields. */
export function validateWorkflow(
  name: string,
  triggerType: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!name.trim()) errors.push("Workflow name is required.");
  if (!triggerType) errors.push("A trigger must be selected.");
  return { valid: errors.length === 0, errors };
}
