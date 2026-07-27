/**
 * EnvironmentValidator — V9.0
 * Validates that all required and optional environment variables are present.
 * Reports missing / misformatted values at startup with clear diagnostics.
 */

export type EnvStatus = 'ok' | 'missing' | 'invalid' | 'demo';

export interface EnvCheck {
  key: string;
  label: string;
  status: EnvStatus;
  value?: string;   // masked if sensitive
  hint: string;
  required: boolean;
  group: string;
}

export interface EnvReport {
  checks: EnvCheck[];
  allRequiredOk: boolean;
  missingRequired: string[];
  demoMode: boolean;
  firebaseConfigured: boolean;
  aiConfigured: boolean;
  paymentConfigured: boolean;
  score: number; // 0–100
}

function mask(val: string): string {
  if (!val || val.length <= 8) return '••••••••';
  return val.slice(0, 4) + '••••' + val.slice(-4);
}

function getEnv(key: string): string {
  return (import.meta.env as Record<string, string>)[key] ?? '';
}

function checkKey(
  key: string,
  label: string,
  hint: string,
  required: boolean,
  group: string,
  validator?: (v: string) => boolean,
): EnvCheck {
  const val = getEnv(key);
  if (!val) {
    return { key, label, status: required ? 'missing' : 'demo', hint, required, group };
  }
  if (validator && !validator(val)) {
    return { key, label, status: 'invalid', value: mask(val), hint, required, group };
  }
  return { key, label, status: 'ok', value: mask(val), hint, required, group };
}

export const EnvironmentValidator = {
  validate(): EnvReport {
    const checks: EnvCheck[] = [
      // ── Firebase ────────────────────────────────────────────────────────────
      checkKey('VITE_FIREBASE_API_KEY',       'Firebase API Key',       'Required for Firebase Auth & Firestore', false, 'Firebase', v => v.length > 10),
      checkKey('VITE_FIREBASE_AUTH_DOMAIN',   'Firebase Auth Domain',   'Set to your project\'s auth domain',      false, 'Firebase', v => v.includes('.')),
      checkKey('VITE_FIREBASE_PROJECT_ID',    'Firebase Project ID',    'Your Firebase project identifier',        false, 'Firebase', v => v.length > 2),
      checkKey('VITE_FIREBASE_STORAGE_BUCKET','Firebase Storage Bucket','Optional: for file uploads',              false, 'Firebase'),
      checkKey('VITE_FIREBASE_MESSAGING_SENDER_ID','Firebase Sender ID','Optional: for push notifications',        false, 'Firebase'),
      checkKey('VITE_FIREBASE_APP_ID',        'Firebase App ID',        'Your Firebase app identifier',            false, 'Firebase', v => v.includes(':')),

      // ── AI Providers ────────────────────────────────────────────────────────
      checkKey('VITE_GEMINI_API_KEY',    'Gemini API Key',    'Get from Google AI Studio',    false, 'AI', v => v.startsWith('AI') || v.length > 20),
      checkKey('VITE_OPENAI_API_KEY',    'OpenAI API Key',    'Get from platform.openai.com', false, 'AI', v => v.startsWith('sk-')),
      checkKey('VITE_ANTHROPIC_API_KEY', 'Anthropic API Key', 'Get from console.anthropic.com', false, 'AI', v => v.startsWith('sk-ant')),

      // ── Payments ────────────────────────────────────────────────────────────
      checkKey('VITE_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key', 'Get from Stripe dashboard', false, 'Payments', v => v.startsWith('pk_')),
      checkKey('VITE_PAYSTACK_PUBLIC_KEY',    'Paystack Public Key',    'Get from Paystack dashboard', false, 'Payments', v => v.startsWith('pk_')),
      checkKey('VITE_FLUTTERWAVE_PUBLIC_KEY', 'Flutterwave Public Key', 'Get from Flutterwave dashboard', false, 'Payments'),
    ];

    const firebaseKeys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID'];
    const firebaseConfigured = firebaseKeys.every(k => getEnv(k).length > 0);

    const aiKeys = ['VITE_GEMINI_API_KEY', 'VITE_OPENAI_API_KEY', 'VITE_ANTHROPIC_API_KEY'];
    const aiConfigured = aiKeys.some(k => getEnv(k).length > 0);

    const paymentKeys = ['VITE_STRIPE_PUBLISHABLE_KEY', 'VITE_PAYSTACK_PUBLIC_KEY', 'VITE_FLUTTERWAVE_PUBLIC_KEY'];
    const paymentConfigured = paymentKeys.some(k => getEnv(k).length > 0);

    const missingRequired = checks.filter(c => c.required && c.status === 'missing').map(c => c.key);
    const allRequiredOk = missingRequired.length === 0;

    // Score: each configured optional group is worth points
    const okCount = checks.filter(c => c.status === 'ok').length;
    const score = Math.round((okCount / checks.length) * 100);

    return {
      checks,
      allRequiredOk,
      missingRequired,
      demoMode: !firebaseConfigured && !aiConfigured,
      firebaseConfigured,
      aiConfigured,
      paymentConfigured,
      score,
    };
  },

  /** Get cached report (computed once per session). */
  _cached: null as EnvReport | null,
  getReport(): EnvReport {
    if (!this._cached) this._cached = this.validate();
    return this._cached;
  },

  /** Group checks by their group name. */
  byGroup(checks: EnvCheck[]): Record<string, EnvCheck[]> {
    return checks.reduce((acc, c) => {
      (acc[c.group] = acc[c.group] ?? []).push(c);
      return acc;
    }, {} as Record<string, EnvCheck[]>);
  },
};
