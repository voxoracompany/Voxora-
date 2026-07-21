// ── V5.4 Payment Provider Types ───────────────────────────────────────────────

export type PaymentProviderName = "stripe" | "flutterwave" | "paystack" | "demo";

export interface CheckoutOptions {
  planId: string;
  interval: "monthly" | "yearly";
  email: string;
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResult {
  ok: boolean;
  sessionUrl?: string;
  sessionId?: string;
  error?: string;
}

export interface PortalResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export interface CancelResult {
  ok: boolean;
  error?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  isConfigured(): boolean;
  createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
  cancelSubscription(subscriptionId: string): Promise<CancelResult>;
  getPortalUrl(customerId: string): Promise<PortalResult>;
}
