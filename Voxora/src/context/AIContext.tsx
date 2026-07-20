/* @refresh reset */
// ── V5.1 AI Engine — AIContext ────────────────────────────────────────────────
// Exposes: settings, provider status, usage, memory, health, cache stats.

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { aiService }       from '../services/ai/AIService';
import { AIUsage }         from '../services/ai/AIUsage';
import { AIMemory }        from '../services/ai/AIMemory';
import { AIHealthMonitor } from '../services/ai/AIHealthMonitor';
import { AICache }         from '../services/ai/AICache';
import type { AISettings, AIProviderName, ProviderHealth, AICacheStats } from '../services/ai/types/AITypes';

// ── Snapshot types ────────────────────────────────────────────────────────────
interface UsageSnapshot {
  todayCount:        number;
  todayTokens:       number;
  weeklyCount:       number;
  mostUsedWorkspace: string;
  avgResponseTime:   number;
}

interface ConversationSnapshot {
  count:         number;
  totalMessages: number;
  pinned:        number;
}

// ── Context shape ─────────────────────────────────────────────────────────────
interface AIContextValue {
  // Settings
  settings:       AISettings;
  updateSettings: (patch: Partial<AISettings>) => void;

  // Provider status
  isDemoMode:     boolean;
  activeProvider: AIProviderName;

  // Usage
  usage:          UsageSnapshot;
  refreshUsage:   () => void;

  // Memory (conversations)
  memory:         ConversationSnapshot;
  refreshMemory:  () => void;

  // V5.1 — Health
  health:         ProviderHealth[];
  refreshHealth:  () => void;

  // V5.1 — Cache
  cacheStats:     AICacheStats;
  refreshCache:   () => void;
  clearCache:     () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

// ── Snapshot helpers ──────────────────────────────────────────────────────────
function snapUsage(): UsageSnapshot {
  return {
    todayCount:        AIUsage.getTodayCount(),
    todayTokens:       AIUsage.getTodayTokens(),
    weeklyCount:       AIUsage.getWeeklyCount(),
    mostUsedWorkspace: AIUsage.getMostUsedWorkspace(),
    avgResponseTime:   AIUsage.getAverageResponseTime(),
  };
}

function snapMemory(): ConversationSnapshot {
  const all = AIMemory.getAll();
  return {
    count:         all.length,
    totalMessages: AIMemory.totalMessages(),
    pinned:        AIMemory.getPinned().length,
  };
}

function snapHealth(): ProviderHealth[] {
  return AIHealthMonitor.getAllHealth();
}

function snapCache(): AICacheStats {
  return AICache.getStats();
}

// ── Provider component ────────────────────────────────────────────────────────
export function AIProvider({ children }: { children: ReactNode }) {
  const [settings,       setSettings]       = useState<AISettings>(() => aiService.settings);
  const [isDemoMode,     setDemoMode]       = useState(() => aiService.isDemoMode());
  const [activeProvider, setActiveProvider] = useState<AIProviderName>(() => aiService.providerName);
  const [usage,          setUsage]          = useState<UsageSnapshot>(snapUsage);
  const [memory,         setMemory]         = useState<ConversationSnapshot>(snapMemory);
  const [health,         setHealth]         = useState<ProviderHealth[]>(snapHealth);
  const [cacheStats,     setCacheStats]     = useState<AICacheStats>(snapCache);

  const refreshUsage  = useCallback(() => setUsage(snapUsage()),    []);
  const refreshMemory = useCallback(() => setMemory(snapMemory()),  []);
  const refreshHealth = useCallback(() => setHealth(snapHealth()),  []);
  const refreshCache  = useCallback(() => setCacheStats(snapCache()), []);
  const clearCache    = useCallback(() => { AICache.clear(); setCacheStats(snapCache()); }, []);

  const updateSettings = useCallback((patch: Partial<AISettings>) => {
    aiService.updateSettings(patch);
    const s = aiService.settings;
    setSettings(s);
    setDemoMode(aiService.isDemoMode());
    setActiveProvider(aiService.providerName);
  }, []);

  // Subscribe to health updates from the monitor
  useEffect(() => {
    const unsub = AIHealthMonitor.subscribe(() => setHealth(snapHealth()));
    return unsub;
  }, []);

  // Refresh all stats every 30 seconds
  useEffect(() => {
    const id = setInterval(() => {
      refreshUsage();
      refreshMemory();
      refreshHealth();
      refreshCache();
    }, 30_000);
    return () => clearInterval(id);
  }, [refreshUsage, refreshMemory, refreshHealth, refreshCache]);

  return (
    <AIContext.Provider value={{
      settings,
      updateSettings,
      isDemoMode,
      activeProvider,
      usage,
      refreshUsage,
      memory,
      refreshMemory,
      health,
      refreshHealth,
      cacheStats,
      refreshCache,
      clearCache,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAIContext(): AIContextValue {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAIContext must be used inside AIProvider');
  return ctx;
}
