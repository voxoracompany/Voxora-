// ── V5.4 Flutterwave Provider — Placeholder ───────────────────────────────────
// Activate by setting VITE_FLUTTERWAVE_PUBLIC_KEY.
// For live integration: load the Flutterwave inline JS SDK and open a payment modal.

import type {
  PaymentProvider, CheckoutOptions, CheckoutResult, PortalResult, CancelResult,
} from "../PaymentTypes";

export class FlutterwaveProvider implements PaymentProvider {
  readonly name = "flutterwave" as const;

  isConfigured(): boolean {
    return !!import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
  }

  async createCheckout(_options: CheckoutOptions): Promise<CheckoutResult> {
    console.info("[Voxora/Flutterwave] createCheckout — not yet wired. Set VITE_FLUTTERWAVE_PUBLIC_KEY.");
    return {
      ok: false,
      error: "Flutterwave is not yet configured. Add VITE_FLUTTERWAVE_PUBLIC_KEY.",
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<CancelResult> {
    return { ok: false, error: "Flutterwave is not yet configured." };
  }

  async getPortalUrl(_customerId: string): Promise<PortalResult> {
    return { ok: false, error: "Flutterwave does not provide a self-serve portal. Manage subscriptions via the Flutterwave dashboard." };
  }
}
