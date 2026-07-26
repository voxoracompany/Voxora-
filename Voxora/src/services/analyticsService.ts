/**
 * Voxora Analytics Abstraction Layer
 *
 * Provides a unified interface for tracking events. In Demo Mode all events
 * are logged to the console only. When a cloud analytics provider (e.g.
 * Google Analytics 4) is configured via environment variables, events are
 * forwarded to that provider transparently.
 *
 * Usage:
 *   import analytics from './analyticsService';
 *   analytics.track('signup_clicked', { plan: 'pro' });
 *   analytics.page('/dashboard');
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventName =
  | "page_view"
  | "signup_clicked"
  | "login_clicked"
  | "signup_completed"
  | "login_completed"
  | "logout"
  | "dashboard_opened"
  | "workspace_opened"
  | "ai_request_sent"
  | "ai_request_completed"
  | "ai_request_failed"
  | "project_created"
  | "project_deleted"
  | "export_initiated"
  | "export_completed"
  | "pricing_viewed"
  | "upgrade_clicked"
  | "contact_form_submitted"
  | "support_ticket_submitted"
  | "search_performed"
  | "feature_used"
  | "error_occurred"
  | string;

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface AnalyticsUser {
  id?: string;
  email?: string;
  plan?: string;
}

// ─── GA4 window extensions ────────────────────────────────────────────────────

interface WindowWithGA4 {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

function ga4Win(): WindowWithGA4 {
  return window as unknown as WindowWithGA4;
}

// ─── Provider Detection ───────────────────────────────────────────────────────

type Provider = "ga4" | "console";

function detectProvider(): Provider {
  const env = import.meta.env as Record<string, string | undefined>;
  if (env.VITE_GA4_MEASUREMENT_ID) return "ga4";
  return "console";
}

// ─── Analytics Service ────────────────────────────────────────────────────────

class AnalyticsService {
  private provider: Provider;
  private currentUser: AnalyticsUser | null = null;
  private queue: Array<{ name: EventName; props: EventProperties }> = [];
  private initialized = false;

  constructor() {
    this.provider = detectProvider();
    this.init();
  }

  // ─── Initialisation ─────────────────────────────────────────────────────────

  private async init() {
    try {
      if (this.provider === "ga4") {
        await this.initGA4();
      } else {
        this.initialized = true;
      }
      this.flushQueue();
    } catch {
      // Silent fallback — analytics must never break the app
      this.provider = "console";
      this.initialized = true;
      this.flushQueue();
    }
  }

  private async initGA4() {
    const env = import.meta.env as Record<string, string | undefined>;
    const measurementId = env.VITE_GA4_MEASUREMENT_ID;
    if (!measurementId) return;

    // Dynamically inject the gtag script if not already present
    if (!document.getElementById("voxora-gtag")) {
      const script = document.createElement("script");
      script.id = "voxora-gtag";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
        script.onerror = () => resolve();
      });
    }

    const w = ga4Win();
    w.dataLayer = w.dataLayer ?? [];

    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer!.push(args);
    };

    w.gtag("js", new Date());
    w.gtag("config", measurementId, { send_page_view: false });

    this.initialized = true;
  }

  // ─── Queue Management ────────────────────────────────────────────────────────

  private flushQueue() {
    this.queue.forEach(({ name, props }) => this.dispatch(name, props));
    this.queue = [];
  }

  // ─── Core Dispatch ───────────────────────────────────────────────────────────

  private dispatch(name: EventName, props: EventProperties) {
    const enriched: EventProperties = {
      timestamp: new Date().toISOString(),
      platform: "web",
      ...(this.currentUser?.id ? { user_id: this.currentUser.id } : {}),
      ...(this.currentUser?.plan ? { plan: this.currentUser.plan } : {}),
      ...props,
    };

    if (this.provider === "ga4") {
      const gtag = ga4Win().gtag;
      if (gtag) {
        gtag("event", name, enriched);
      }
    } else {
      if (import.meta.env.DEV) {
        console.debug(`[Voxora Analytics] ${name}`, enriched);
      }
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /** Track a named event with optional properties. */
  track(name: EventName, props: EventProperties = {}) {
    if (!this.initialized) {
      this.queue.push({ name, props });
      return;
    }
    this.dispatch(name, props);
  }

  /** Record a page view. Call this on every route change. */
  page(path: string, title?: string) {
    this.track("page_view", {
      page_path: path,
      page_title: title ?? document.title,
    });
  }

  /** Identify the currently signed-in user. Call after successful login. */
  identify(user: AnalyticsUser) {
    this.currentUser = user;
    if (this.provider === "ga4" && user.id) {
      const env = import.meta.env as Record<string, string | undefined>;
      ga4Win().gtag?.("config", env.VITE_GA4_MEASUREMENT_ID ?? "", {
        user_id: user.id,
      });
    }
  }

  /** Clear the current user identity (call on logout). */
  reset() {
    this.currentUser = null;
  }

  /** Convenience: track a feature usage event. */
  feature(featureName: string, props: EventProperties = {}) {
    this.track("feature_used", { feature: featureName, ...props });
  }

  /** Convenience: track an error event without throwing. */
  error(errorMessage: string, context: EventProperties = {}) {
    this.track("error_occurred", { error: errorMessage, ...context });
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

const analytics = new AnalyticsService();
export default analytics;
