// ── V5.4 Subscription Context ─────────────────────────────────────────────────
// Exposes subscription state, plan info, usage, and billing actions.
// Works in Demo Billing Mode (no env vars) or with a real payment provider.

import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from "react";
import { SubscriptionEngine } from "../services/subscription/SubscriptionEngine";
import { getPlan, PLANS } from "../services/subscription/SubscriptionPlans";
import { getPaymentProvider, getPaymentProviderName, isPaymentConfigured } from "../services/payment/PaymentService";
import type { Subscription, UsageStats, BillingRecord, PlanId, BillingInterval } from "../services/subscription/SubscriptionTypes";
import type { Plan } from "../services/subscription/SubscriptionTypes";

interface SubscriptionContextValue {
  // State
  subscription: Subscription;
  currentPlan: Plan;
  usage: UsageStats;
  billingHistory: BillingRecord[];
  allPlans: Plan[];

  // Status
  isActive: boolean;
  isExpired: boolean;
  isTrial: boolean;
  trialDaysRemaining: number;
  daysUntilRenewal: number;
  isDemoBillingMode: boolean;
  paymentProviderName: string;

  // Actions
  upgradePlan: (planId: PlanId, interval: BillingInterval) => Promise<{ ok: boolean; error?: string }>;
  startTrial: (planId: PlanId) => void;
  cancelAtPeriodEnd: (cancel: boolean) => void;
  downgradePlan: () => void;
  refresh: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(() => SubscriptionEngine.getSubscription());
  const [usage, setUsage] = useState<UsageStats>(() => SubscriptionEngine.getUsage());
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>(() => SubscriptionEngine.getBillingHistory());

  const refresh = useCallback(() => {
    setSubscription(SubscriptionEngine.getSubscription());
    setUsage(SubscriptionEngine.getUsage());
    setBillingHistory(SubscriptionEngine.getBillingHistory());
  }, []);

  // Sync on mount and when storage changes in other tabs
  useEffect(() => {
    refresh();
    const handler = (e: StorageEvent) => {
      if (e.key === "voxora-subscription" || e.key === "voxora-sub-usage" || e.key === "voxora-billing-history") {
        refresh();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [refresh]);

  const upgradePlan = useCallback(async (planId: PlanId, interval: BillingInterval): Promise<{ ok: boolean; error?: string }> => {
    const provider = await getPaymentProvider();
    const plan = getPlan(planId);

    if (plan.enterprise) {
      return { ok: false, error: "Contact sales for Enterprise." };
    }

    if (!isPaymentConfigured()) {
      // Demo Mode — upgrade immediately without a real payment
      SubscriptionEngine.upgradePlan(planId, interval);
      refresh();
      return { ok: true };
    }

    // Real provider flow
    const result = await provider.createCheckout({
      planId,
      interval,
      email: "",
      userId: "",
    });

    if (result.ok) {
      // In production, redirect to result.sessionUrl
      // For now apply locally so the UI updates
      SubscriptionEngine.upgradePlan(planId, interval);
      refresh();
    }
    return { ok: result.ok, error: result.error };
  }, [refresh]);

  const startTrial = useCallback((planId: PlanId) => {
    SubscriptionEngine.startTrial(planId);
    refresh();
  }, [refresh]);

  const cancelAtPeriodEnd = useCallback((cancel: boolean) => {
    SubscriptionEngine.cancelAtPeriodEnd(cancel);
    refresh();
  }, [refresh]);

  const downgradePlan = useCallback(() => {
    SubscriptionEngine.downgradePlan();
    refresh();
  }, [refresh]);

  const currentPlan = getPlan(subscription.planId);
  const isTrial = subscription.status === "trialing";

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      currentPlan,
      usage,
      billingHistory,
      allPlans: PLANS,
      isActive: SubscriptionEngine.isActive(),
      isExpired: SubscriptionEngine.isExpired(),
      isTrial,
      trialDaysRemaining: SubscriptionEngine.trialDaysRemaining(),
      daysUntilRenewal: SubscriptionEngine.getDaysUntilRenewal(),
      isDemoBillingMode: !isPaymentConfigured(),
      paymentProviderName: getPaymentProviderName(),
      upgradePlan,
      startTrial,
      cancelAtPeriodEnd,
      downgradePlan,
      refresh,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
