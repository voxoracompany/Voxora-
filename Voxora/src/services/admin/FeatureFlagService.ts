// ── V5.8 Feature Flag Service ─────────────────────────────────────────────────

import type { FeatureFlag } from "./AdminTypes";

const STORAGE_KEY = "voxora-feature-flags";

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    id:          "gemini_ai",
    name:        "Gemini AI",
    description: "Enable Google Gemini as an AI provider.",
    enabled:     true,
    icon:        "♊",
    category:    "ai",
  },
  {
    id:          "ai_memory",
    name:        "AI Memory",
    description: "Persist AI conversation context across sessions.",
    enabled:     true,
    icon:        "🧠",
    category:    "ai",
  },
  {
    id:          "firebase",
    name:        "Firebase Backend",
    description: "Use Firebase Auth and Firestore for cloud sync.",
    enabled:     true,
    icon:        "🔥",
    category:    "backend",
  },
  {
    id:          "payments",
    name:        "Payments & Billing",
    description: "Enable Stripe, Paystack, and Flutterwave payment providers.",
    enabled:     true,
    icon:        "💳",
    category:    "payments",
  },
  {
    id:          "integrations",
    name:        "Third-Party Integrations",
    description: "Allow connecting external services (Slack, Notion, GitHub, etc.).",
    enabled:     true,
    icon:        "🔌",
    category:    "integrations",
  },
  {
    id:          "automation",
    name:        "Automation Engine",
    description: "Enable the workflow automation system.",
    enabled:     true,
    icon:        "⚡",
    category:    "integrations",
  },
  {
    id:          "analytics",
    name:        "Analytics Studio",
    description: "Enable advanced analytics and reporting features.",
    enabled:     true,
    icon:        "📊",
    category:    "platform",
  },
  {
    id:          "team_collab",
    name:        "Team Collaboration",
    description: "Enable team management and collaboration tools.",
    enabled:     true,
    icon:        "🤝",
    category:    "platform",
  },
  {
    id:          "prompt_library",
    name:        "Prompt Library",
    description: "Enable the curated AI prompt template library.",
    enabled:     true,
    icon:        "📚",
    category:    "ai",
  },
  {
    id:          "maintenance_mode",
    name:        "Maintenance Mode",
    description: "Put the application into maintenance mode (demo only).",
    enabled:     false,
    icon:        "🔧",
    category:    "platform",
  },
];

export class FeatureFlagService {
  private static load(): FeatureFlag[] {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored) return [...DEFAULT_FLAGS];
      // Merge defaults with stored to pick up new flags
      const storedMap = new Map<string, FeatureFlag>(stored.map((f: FeatureFlag) => [f.id, f]));
      return DEFAULT_FLAGS.map((def) => {
        const s = storedMap.get(def.id);
        return s ? { ...def, enabled: s.enabled } : def;
      });
    } catch {
      return [...DEFAULT_FLAGS];
    }
  }

  private static save(flags: FeatureFlag[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
    } catch { /* storage full */ }
  }

  static getAll(): FeatureFlag[] {
    return this.load();
  }

  static getByCategory(category: FeatureFlag["category"]): FeatureFlag[] {
    return this.load().filter((f) => f.category === category);
  }

  static isEnabled(id: string): boolean {
    return this.load().find((f) => f.id === id)?.enabled ?? true;
  }

  static toggle(id: string): boolean {
    const flags = this.load().map((f) =>
      f.id === id ? { ...f, enabled: !f.enabled } : f,
    );
    this.save(flags);
    return flags.find((f) => f.id === id)?.enabled ?? false;
  }

  static set(id: string, enabled: boolean): void {
    const flags = this.load().map((f) => (f.id === id ? { ...f, enabled } : f));
    this.save(flags);
  }

  static reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
