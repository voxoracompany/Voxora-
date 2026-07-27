/**
 * TokenEstimator — V9.0
 * Estimates token counts for prompts and responses.
 * Uses a simple heuristic (~4 chars per token) for client-side estimation.
 * Tracks cumulative token budgets and warns on approaching limits.
 */

export interface TokenEstimate {
  promptTokens: number;
  maxResponseTokens: number;
  totalEstimate: number;
  withinBudget: boolean;
  budgetUsedPct: number;
}

const CHARS_PER_TOKEN = 4;
const TOKEN_BUDGETS: Record<string, number> = {
  'gpt-4':           8192,
  'gpt-4-turbo':     128000,
  'gpt-3.5-turbo':   16385,
  'gemini-1.5-pro':  1048576,
  'gemini-1.5-flash':1048576,
  'claude-3-opus':   200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku':  200000,
  'mock':            4096,
  'default':         8192,
};

const DAILY_BUDGET_KEY = 'voxora-token-daily-budget';
const DEFAULT_DAILY_BUDGET = 100_000;

// ── Core estimation ────────────────────────────────────────────────────────────

function charsToTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export const TokenEstimator = {
  /** Estimate tokens for a prompt string. */
  estimatePrompt(prompt: string): number {
    return charsToTokens(prompt);
  },

  /** Estimate tokens for a messages array (chat format). */
  estimateMessages(messages: Array<{ role: string; content: string }>): number {
    // Each message has ~4 token overhead for role/format
    return messages.reduce((acc, m) => acc + charsToTokens(m.content) + 4, 0);
  },

  /** Full budget estimate for a request. */
  estimate(
    prompt: string,
    maxTokens = 1024,
    model = 'default',
  ): TokenEstimate {
    const promptTokens = charsToTokens(prompt);
    const contextBudget = TOKEN_BUDGETS[model] ?? TOKEN_BUDGETS.default;
    const totalEstimate = promptTokens + maxTokens;
    const withinBudget = totalEstimate <= contextBudget;
    const budgetUsedPct = Math.min(100, Math.round((totalEstimate / contextBudget) * 100));

    return { promptTokens, maxResponseTokens: maxTokens, totalEstimate, withinBudget, budgetUsedPct };
  },

  // ── Daily budget tracking ───────────────────────────────────────────────────

  getDailyBudget(): number {
    try {
      const raw = localStorage.getItem(DAILY_BUDGET_KEY);
      if (!raw) return DEFAULT_DAILY_BUDGET;
      const parsed = JSON.parse(raw);
      // Reset if it's a new day
      const today = new Date().toDateString();
      if (parsed.date !== today) {
        this.resetDailyUsage();
        return DEFAULT_DAILY_BUDGET;
      }
      return parsed.budget ?? DEFAULT_DAILY_BUDGET;
    } catch { return DEFAULT_DAILY_BUDGET; }
  },

  getDailyUsed(): number {
    try {
      const raw = localStorage.getItem(DAILY_BUDGET_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      const today = new Date().toDateString();
      if (parsed.date !== today) return 0;
      return parsed.used ?? 0;
    } catch { return 0; }
  },

  getDailyRemaining(): number {
    return Math.max(0, this.getDailyBudget() - this.getDailyUsed());
  },

  getDailyUsedPct(): number {
    const budget = this.getDailyBudget();
    if (budget === 0) return 100;
    return Math.min(100, Math.round((this.getDailyUsed() / budget) * 100));
  },

  recordUsage(tokens: number): void {
    try {
      const today = new Date().toDateString();
      const raw = localStorage.getItem(DAILY_BUDGET_KEY);
      let parsed = raw ? JSON.parse(raw) : {};
      if (parsed.date !== today) {
        parsed = { date: today, budget: DEFAULT_DAILY_BUDGET, used: 0 };
      }
      parsed.used = (parsed.used ?? 0) + tokens;
      localStorage.setItem(DAILY_BUDGET_KEY, JSON.stringify(parsed));
    } catch { /* silent */ }
  },

  resetDailyUsage(): void {
    try {
      localStorage.setItem(DAILY_BUDGET_KEY, JSON.stringify({
        date: new Date().toDateString(),
        budget: DEFAULT_DAILY_BUDGET,
        used: 0,
      }));
    } catch { /* silent */ }
  },

  /** Format a token count for display. */
  format(tokens: number): string {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}k`;
    return String(tokens);
  },
};
