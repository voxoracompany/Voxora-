// ── V5.4 Subscription Types ───────────────────────────────────────────────────

export type PlanId = "free" | "pro" | "team" | "enterprise";
export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "trialing" | "expired" | "cancelled" | "past_due";

export interface PlanLimits {
  aiRequests: number;   // per month; -1 = unlimited
  projects: number;     // -1 = unlimited
  teamMembers: number;  // -1 = unlimited
  storageGB: number;    // -1 = unlimited
  exports: number;      // per month; -1 = unlimited
}

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;   // USD cents (0 = free / contact sales)
  yearlyPrice: number;    // USD cents per month when billed yearly
  features: string[];
  limits: PlanLimits;
  highlighted?: boolean;  // "Most Popular" badge
  enterprise?: boolean;   // Contact Sales flow
}

export interface Subscription {
  planId: PlanId;
  status: SubscriptionStatus;
  interval: BillingInterval;
  currentPeriodStart: string;  // ISO date
  currentPeriodEnd: string;    // ISO date
  trialEnd?: string;           // ISO date — present when trialing
  cancelAtPeriodEnd: boolean;
  paymentProvider?: string;    // "stripe" | "flutterwave" | "paystack" | "demo"
}

export interface UsageStats {
  aiRequests: number;
  projects: number;
  teamMembers: number;
  storageGB: number;
  exports: number;
  periodStart: string;
  periodEnd: string;
}

export interface BillingRecord {
  id: string;
  date: string;
  description: string;
  amount: number;       // USD cents
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}
