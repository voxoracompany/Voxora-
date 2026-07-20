// ── V4.1 AI Engine — Usage Tracking ──────────────────────────────────────────
import type { AIUsageRecord, AIProviderName } from './types/AITypes';

const STORAGE_KEY = 'voxora-ai-usage';
const MAX_RECORDS = 1000; // rolling window

function load(): AIUsageRecord[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(records: AIUsageRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
}

function todayStart(): number {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
}
function weekStart(): number {
  const d = new Date(); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); return d.getTime();
}

export const AIUsage = {
  record(entry: Omit<AIUsageRecord, 'id'>): void {
    const records = load();
    records.unshift({ id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...entry });
    save(records);
  },

  getAll(): AIUsageRecord[] {
    return load();
  },

  getTodayRecords(): AIUsageRecord[] {
    const start = todayStart();
    return load().filter(r => r.timestamp >= start);
  },

  getTodayCount(): number {
    return AIUsage.getTodayRecords().length;
  },

  getTodayTokens(): number {
    return AIUsage.getTodayRecords().reduce((s, r) => s + r.tokensUsed, 0);
  },

  getWeeklyCount(): number {
    const start = weekStart();
    return load().filter(r => r.timestamp >= start).length;
  },

  getAverageResponseTime(): number {
    const all = load();
    if (all.length === 0) return 0;
    const avg = all.reduce((s, r) => s + r.responseTime, 0) / all.length;
    return Math.round(avg);
  },

  getMostUsedWorkspace(): string {
    const records = load();
    if (records.length === 0) return '—';
    const counts: Record<string, number> = {};
    for (const r of records) counts[r.workspace] = (counts[r.workspace] || 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  },

  getMostUsedProvider(): AIProviderName {
    const records = load();
    if (records.length === 0) return 'mock';
    const counts: Record<string, number> = {};
    for (const r of records) counts[r.provider] = (counts[r.provider] || 0) + 1;
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mock') as AIProviderName;
  },

  getTotalTokens(): number {
    return load().reduce((s, r) => s + r.tokensUsed, 0);
  },

  /** Timestamp (ms) of the most recent successful (non-mock) request, or 0. */
  getLastSuccessfulTimestamp(): number {
    const records = load().filter(r => r.provider !== 'mock');
    return records.length > 0 ? records[0].timestamp : 0;
  },

  /** The provider used in the most recent successful request. */
  getLastSuccessfulProvider(): string {
    const records = load().filter(r => r.provider !== 'mock');
    return records.length > 0 ? records[0].provider : '';
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
