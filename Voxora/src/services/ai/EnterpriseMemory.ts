// ── V8.2 Enterprise AI Memory ─────────────────────────────────────────────────
// Stores persistent business context so AI agents and automations can deliver
// personalised, context-aware responses. Uses the existing localStorage pattern;
// ready for Firebase sync via BackendService.

const PROFILE_KEY = "voxora-enterprise-memory-v1";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProductEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  pricePoint: string;
  stage: "concept" | "beta" | "live" | "deprecated";
  addedAt: number;
}

export type WritingTone =
  | "professional"
  | "conversational"
  | "technical"
  | "inspirational"
  | "bold"
  | "empathetic";

export interface EnterpriseProfile {
  // Company Profile
  companyName: string;
  industry: string;
  stage: "idea" | "pre-seed" | "seed" | "series-a" | "series-b" | "growth" | "enterprise";
  foundedYear: string;
  teamSize: string;
  location: string;
  website: string;
  description: string;

  // Products
  products: ProductEntry[];

  // Brand Tone
  brandTone: WritingTone;
  brandKeywords: string[];
  brandAvoid: string[];
  brandMission: string;

  // Customer Profile
  customerIdealTitle: string;
  customerIndustry: string;
  customerPainPoints: string;
  customerGoals: string;
  customerAgeRange: string;
  customerGeography: string;

  // Preferred Writing Style
  writingStyle: "formal" | "casual" | "data-driven" | "storytelling" | "bullet-points";
  writingPersona: string;
  writingVoiceNotes: string;

  // Previous AI Context
  previousAIContext: string;
  lastContextUpdatedAt?: number;

  updatedAt: number;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: EnterpriseProfile = {
  companyName: "",
  industry: "",
  stage: "idea",
  foundedYear: "",
  teamSize: "",
  location: "",
  website: "",
  description: "",
  products: [],
  brandTone: "professional",
  brandKeywords: [],
  brandAvoid: [],
  brandMission: "",
  customerIdealTitle: "",
  customerIndustry: "",
  customerPainPoints: "",
  customerGoals: "",
  customerAgeRange: "",
  customerGeography: "",
  writingStyle: "formal",
  writingPersona: "",
  writingVoiceNotes: "",
  previousAIContext: "",
  updatedAt: 0,
};

// ── Service ───────────────────────────────────────────────────────────────────

export const EnterpriseMemory = {
  get(): EnterpriseProfile {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return { ...DEFAULT_PROFILE };
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  },

  save(profile: Partial<EnterpriseProfile>): EnterpriseProfile {
    const current = this.get();
    const updated: EnterpriseProfile = { ...current, ...profile, updatedAt: Date.now() };
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    } catch { /* storage full */ }
    return updated;
  },

  // ── Products ────────────────────────────────────────────────────────────

  addProduct(product: Omit<ProductEntry, "id" | "addedAt">): ProductEntry {
    const entry: ProductEntry = {
      ...product,
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      addedAt: Date.now(),
    };
    const profile = this.get();
    profile.products = [entry, ...profile.products];
    this.save(profile);
    return entry;
  },

  updateProduct(id: string, updates: Partial<Omit<ProductEntry, "id" | "addedAt">>): void {
    const profile = this.get();
    profile.products = profile.products.map((p) => p.id === id ? { ...p, ...updates } : p);
    this.save(profile);
  },

  removeProduct(id: string): void {
    const profile = this.get();
    profile.products = profile.products.filter((p) => p.id !== id);
    this.save(profile);
  },

  // ── AI Context helpers ───────────────────────────────────────────────────

  /** Build a compact system context string from the enterprise profile. */
  buildAIContext(): string {
    const p = this.get();
    const parts: string[] = [];

    if (p.companyName) parts.push(`Company: ${p.companyName} (${p.industry}, ${p.stage} stage)`);
    if (p.description) parts.push(`About: ${p.description}`);
    if (p.brandMission) parts.push(`Mission: ${p.brandMission}`);
    if (p.products.length > 0) {
      parts.push(`Products: ${p.products.filter((pr) => pr.stage !== "deprecated").map((pr) => `${pr.name} (${pr.stage})`).join(", ")}`);
    }
    if (p.customerIdealTitle) parts.push(`Target Customer: ${p.customerIdealTitle} in ${p.customerIndustry}`);
    if (p.customerPainPoints) parts.push(`Pain Points: ${p.customerPainPoints}`);
    if (p.brandTone) parts.push(`Brand Tone: ${p.brandTone}`);
    if (p.writingStyle) parts.push(`Writing Style: ${p.writingStyle}`);
    if (p.previousAIContext) parts.push(`Additional context: ${p.previousAIContext}`);

    return parts.join("\n");
  },

  isConfigured(): boolean {
    const p = this.get();
    return !!(p.companyName || p.description || p.products.length > 0);
  },

  getCompletionScore(): number {
    const p = this.get();
    let score = 0;
    const checks = [
      p.companyName, p.industry, p.stage, p.description,
      p.brandMission, p.brandTone, p.brandKeywords.length > 0,
      p.customerIdealTitle, p.customerPainPoints, p.customerGoals,
      p.writingStyle, p.writingPersona, p.products.length > 0,
      p.previousAIContext,
    ];
    checks.forEach((c) => { if (c) score += 1; });
    return Math.round((score / checks.length) * 100);
  },

  reset(): void {
    localStorage.removeItem(PROFILE_KEY);
  },
};
