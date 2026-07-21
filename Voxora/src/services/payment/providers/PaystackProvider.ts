// ── V5.4 Paystack Provider — Placeholder ──────────────────────────────────────
// Activate by setting VITE_PAYSTACK_PUBLIC_KEY.
// For live integration: load the Paystack inline JS SDK and open a payment popup.

import type {
  PaymentProvider, CheckoutOptions, CheckoutResult, PortalResult, CancelResult,
} from "../PaymentTypes";

export class PaystackProvider implements PaymentProvider {
  readonly name = "paystack" as const;

  isConfigured(): boolean {
    return !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  }

  async createCheckout(_options: CheckoutOptions): Promise<CheckoutResult> {
    console.info("[Voxora/Paystack] createCheckout — not yet wired. Set VITE_PAYSTACK_PUBLIC_KEY.");
    return {
      ok: false,
      error: "Paystack is not yet configured. Add VITE_PAYSTACK_PUBLIC_KEY.",
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<CancelResult> {
    return { ok: false, error: "Paystack is not yet configured." };
  }

  async getPortalUrl(_customerId: string): Promise<PortalResult> {
    return { ok: false, error: "Paystack does not provide a self-serve portal. Manage subscriptions via the Paystack dashboard." };
  }
}
