// ── V5.4 Payment Service — Provider Factory ───────────────────────────────────
// Selects the active payment provider based on configured VITE_ env vars.
// Falls back to Demo Mode (no env vars required).
//
// Priority: Stripe → Flutterwave → Paystack → Demo
// Set VITE_STRIPE_PUBLISHABLE_KEY, VITE_FLUTTERWAVE_PUBLIC_KEY, or
// VITE_PAYSTACK_PUBLIC_KEY to activate a real provider.

import type { PaymentProvider, PaymentProviderName } from "./PaymentTypes";

export type { PaymentProviderName };

export function getPaymentProviderName(): PaymentProviderName {
  if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)     return "stripe";
  if (import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY)     return "flutterwave";
  if (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY)        return "paystack";
  return "demo";
}

export function isPaymentConfigured(): boolean {
  return getPaymentProviderName() !== "demo";
}

let _provider: PaymentProvider | null = null;

export async function getPaymentProvider(): Promise<PaymentProvider> {
  if (_provider) return _provider;

  const name = getPaymentProviderName();

  if (name === "stripe") {
    const { StripeProvider } = await import("./providers/StripeProvider");
    _provider = new StripeProvider();
    console.info("[Voxora] 💳 Payment provider: Stripe");
    return _provider;
  }

  if (name === "flutterwave") {
    const { FlutterwaveProvider } = await import("./providers/FlutterwaveProvider");
    _provider = new FlutterwaveProvider();
    console.info("[Voxora] 💳 Payment provider: Flutterwave");
    return _provider;
  }

  if (name === "paystack") {
    const { PaystackProvider } = await import("./providers/PaystackProvider");
    _provider = new PaystackProvider();
    console.info("[Voxora] 💳 Payment provider: Paystack");
    return _provider;
  }

  // Demo provider — always available, no API calls
  _provider = {
    name: "demo",
    isConfigured: () => true,
    async createCheckout() {
      console.info("[Voxora] 💳 Demo Billing Mode — no real payment processed.");
      return { ok: true, sessionId: "demo-session" };
    },
    async cancelSubscription() { return { ok: true }; },
    async getPortalUrl() { return { ok: true, url: "#" }; },
  };
  console.info("[Voxora] 💳 Demo Billing Mode — set VITE_STRIPE_PUBLISHABLE_KEY (or Flutterwave/Paystack) to enable live payments.");
  return _provider;
}

/** Reset singleton (useful for hot-reload / testing). */
export function _resetPaymentService(): void {
  _provider = null;
}
