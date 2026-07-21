// ── V5.4 Subscription Engine ──────────────────────────────────────────────────
// All subscription state lives in localStorage — zero config required.
// Designed for plug-in replacement with a real backend later.

import type {
  Subscription, UsageStats, BillingRecord, PlanId, BillingInterval, PlanLimits,
} from "./SubscriptionTypes";
import { getPlan } from "./SubscriptionPlans";

const KEY_SUB     = "voxora-subscription";
const KEY_USAGE   = "voxora-sub-usage";
const KEY_BILLING = "voxora-billing-history";

function makeId(): string {
  return Math.random().toString(36).slice(2, 11);
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

function saveJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function defaultSubscription(): Subscription {
  const now = new Date();
  return {
    planId: "free",
    status: "active",
    interval: "monthly",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: addMonths(now, 1).toISOString(),
    cancelAtPeriodEnd: false,
  };
}

function defaultUsage(): UsageStats {
  const now = new Date();
  return {
    aiRequests: 0,
    projects: 0,
    teamMembers: 0,
    storageGB: 0,
    exports: 0,
    periodStart: now.toISOString(),
    periodEnd: addMonths(now, 1).toISOString(),
  };
}

export const SubscriptionEngine = {
  // ── Read ───────────────────────────────────────────────────────────────────
  getSubscription(): Subscription {
    return loadJson<Subscription>(KEY_SUB) ?? defaultSubscription();
  },

  getUsage(): UsageStats {
    const usage = loadJson<UsageStats>(KEY_USAGE) ?? defaultUsage();
    // Auto-reset usage if billing period has rolled over
    if (new Date(usage.periodEnd) < new Date()) {
      const fresh = defaultUsage();
      saveJson(KEY_USAGE, fresh);
      return fresh;
    }
    return usage;
  },

  getBillingHistory(): BillingRecord[] {
    return loadJson<BillingRecord[]>(KEY_BILLING) ?? [];
  },

  // ── Write ──────────────────────────────────────────────────────────────────
  saveSubscription(sub: Subscription): void {
    saveJson(KEY_SUB, sub);
  },

  saveUsage(usage: UsageStats): void {
    saveJson(KEY_USAGE, usage);
  },

  // ── Feature gating ─────────────────────────────────────────────────────────
  isWithinLimit(feature: keyof PlanLimits): boolean {
    const sub = this.getSubscription();
    const plan = getPlan(sub.planId);
    const limit = plan.limits[feature];
    if (limit === -1) return true;
    const usage = this.getUsage();
    return (usage[feature as keyof UsageStats] as number) < limit;
  },

  getUsagePercent(feature: keyof PlanLimits): number {
    const sub = this.getSubscription();
    const plan = getPlan(sub.planId);
    const limit = plan.limits[feature];
    if (limit === -1) return 0;
    const usage = this.getUsage();
    return Math.min(100, Math.round(((usage[feature as keyof UsageStats] as number) / limit) * 100));
  },

  // ── Status helpers ─────────────────────────────────────────────────────────
  isActive(): boolean {
    const sub = this.getSubscription();
    return sub.status === "active" || sub.status === "trialing";
  },

  isExpired(): boolean {
    const sub = this.getSubscription();
    if (sub.status === "expired" || sub.status === "cancelled") return true;
    if (sub.status === "trialing" && sub.trialEnd) {
      return new Date(sub.trialEnd) < new Date();
    }
    return new Date(sub.currentPeriodEnd) < new Date();
  },

  getDaysUntilRenewal(): number {
    const sub = this.getSubscription();
    const end = sub.status === "trialing" && sub.trialEnd
      ? new Date(sub.trialEnd)
      : new Date(sub.currentPeriodEnd);
    const ms = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  },

  trialDaysRemaining(): number {
    const sub = this.getSubscription();
    if (sub.status !== "trialing" || !sub.trialEnd) return 0;
    const ms = new Date(sub.trialEnd).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  },

  // ── Trial ──────────────────────────────────────────────────────────────────
  startTrial(planId: PlanId): void {
    const now = new Date();
    const sub: Subscription = {
      planId,
      status: "trialing",
      interval: "monthly",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: addDays(now, 14).toISOString(),
      trialEnd: addDays(now, 14).toISOString(),
      cancelAtPeriodEnd: false,
    };
    this.saveSubscription(sub);
  },

  // ── Upgrade ────────────────────────────────────────────────────────────────
  upgradePlan(planId: PlanId, interval: BillingInterval): void {
    const now = new Date();
    const periodEnd = interval === "yearly" ? addMonths(now, 12) : addMonths(now, 1);
    const sub: Subscription = {
      planId,
      status: "active",
      interval,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      paymentProvider: "demo",
    };
    this.saveSubscription(sub);
    // Record billing entry
    const plan = getPlan(planId);
    const amount = interval === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice;
    if (amount > 0) {
      this.addBillingRecord({
        description: `${plan.name} Plan — ${interval === "yearly" ? "Annual" : "Monthly"}`,
        amount,
        status: "paid",
      });
    }
  },

  // ── Downgrade ──────────────────────────────────────────────────────────────
  downgradePlan(): void {
    const sub = this.getSubscription();
    this.saveSubscription({
      ...sub,
      planId: "free",
      status: "active",
      cancelAtPeriodEnd: false,
      paymentProvider: undefined,
    });
  },

  cancelAtPeriodEnd(cancel: boolean): void {
    const sub = this.getSubscription();
    this.saveSubscription({ ...sub, cancelAtPeriodEnd: cancel });
  },

  // ── Usage tracking ─────────────────────────────────────────────────────────
  incrementUsage(feature: keyof PlanLimits): void {
    const usage = this.getUsage();
    (usage[feature as keyof UsageStats] as number) += 1;
    this.saveUsage(usage);
  },

  syncProjectCount(count: number): void {
    const usage = this.getUsage();
    usage.projects = count;
    this.saveUsage(usage);
  },

  // ── Billing history ────────────────────────────────────────────────────────
  addBillingRecord(record: Omit<BillingRecord, "id" | "date">): void {
    const history = this.getBillingHistory();
    history.unshift({ id: makeId(), date: new Date().toISOString(), ...record });
    saveJson(KEY_BILLING, history.slice(0, 50));
  },
};
