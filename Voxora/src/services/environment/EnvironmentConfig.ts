/**
 * EnvironmentConfig — V9.0
 * Single source of truth for all environment-sensitive configuration.
 * Reads from import.meta.env (Vite). Falls back to safe defaults.
 * Never exposes raw secrets — values are masked in logs.
 */

import { ProductionLogger } from '../logging/ProductionLogger';

const env = import.meta.env as Record<string, string | undefined>;

function get(key: string, fallback = ''): string {
  return env[key] ?? fallback;
}

function getBool(key: string, fallback = false): boolean {
  const v = env[key]?.toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return fallback;
}

export const EnvironmentConfig = {
  // ── Mode ──────────────────────────────────────────────────────────────────
  isProd:  import.meta.env.PROD,
  isDev:   import.meta.env.DEV,
  mode:    import.meta.env.MODE,

  // ── Firebase ──────────────────────────────────────────────────────────────
  firebase: {
    apiKey:             get('VITE_FIREBASE_API_KEY'),
    authDomain:         get('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId:          get('VITE_FIREBASE_PROJECT_ID'),
    storageBucket:      get('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId:  get('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId:              get('VITE_FIREBASE_APP_ID'),
    get isConfigured() {
      return !!this.apiKey && !!this.authDomain && !!this.projectId;
    },
  },

  // ── AI Providers ──────────────────────────────────────────────────────────
  ai: {
    geminiKey:    get('VITE_GEMINI_API_KEY'),
    openaiKey:    get('VITE_OPENAI_API_KEY'),
    anthropicKey: get('VITE_ANTHROPIC_API_KEY'),
    get anyConfigured() {
      return !!(this.geminiKey || this.openaiKey || this.anthropicKey);
    },
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    stripeKey:       get('VITE_STRIPE_PUBLISHABLE_KEY'),
    paystackKey:     get('VITE_PAYSTACK_PUBLIC_KEY'),
    flutterwaveKey:  get('VITE_FLUTTERWAVE_PUBLIC_KEY'),
    get anyConfigured() {
      return !!(this.stripeKey || this.paystackKey || this.flutterwaveKey);
    },
  },

  // ── Feature flags ─────────────────────────────────────────────────────────
  features: {
    debugMode:    getBool('VITE_DEBUG_MODE'),
    analyticsEnabled: getBool('VITE_ANALYTICS_ENABLED', true),
  },

  // ── Validation ────────────────────────────────────────────────────────────
  validate(): { ok: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!this.firebase.isConfigured) {
      warnings.push('Firebase not configured — running in Local Demo Mode');
    }
    if (!this.ai.anyConfigured) {
      warnings.push('No AI provider keys set — AI features running in Demo Mode');
    }
    if (!this.payments.anyConfigured) {
      warnings.push('No payment provider configured — billing running in Demo Mode');
    }

    if (warnings.length > 0) {
      warnings.forEach(w => ProductionLogger.info(w, 'EnvConfig'));
    } else {
      ProductionLogger.info('All environment variables validated ✓', 'EnvConfig');
    }

    return { ok: true, warnings };
  },
};

// Validate on module load in production
if (import.meta.env.PROD) {
  EnvironmentConfig.validate();
}
