// ── V5.4 Stripe Provider — Placeholder ───────────────────────────────────────
// Activate by setting VITE_STRIPE_PUBLISHABLE_KEY.
// For live integration: add a backend endpoint to create Checkout Sessions and
// Customer Portal sessions, then replace the stubs below.

import type {
  PaymentProvider, CheckoutOptions, CheckoutResult, PortalResult, CancelResult,
} from "../PaymentTypes";

export class StripeProvider implements PaymentProvider {
  readonly name = "stripe" as const;

  isConfigured(): boolean {
    return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }

  async createCheckout(_options: CheckoutOptions): Promise<CheckoutResult> {
    console.info("[Voxora/Stripe] createCheckout — not yet wired. Set VITE_STRIPE_PUBLISHABLE_KEY and add a backend checkout-session endpoint.");
    return {
      ok: false,
      error: "Stripe is not yet configured. Add VITE_STRIPE_PUBLISHABLE_KEY and a backend checkout endpoint.",
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<CancelResult> {
    return { ok: false, error: "Stripe is not yet configured." };
  }

  async getPortalUrl(_customerId: string): Promise<PortalResult> {
    return { ok: false, error: "Stripe is not yet configured." };
  }
}
