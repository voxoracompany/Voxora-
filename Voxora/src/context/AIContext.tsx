// ── V4.1 AI Engine — AIContext ────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { aiService }  from '../services/ai/AIService';
import { AIUsage }    from '../services/ai/AIUsage';
import { AIMemory }   from '../services/ai/AIMemory';
import type { AISettings, AIProviderName } from '../services/ai/types/AITypes';

interface UsageSnapshot {
  todayCount:       number;
  todayTokens:      number;
  weeklyCount:      number;
  mostUsedWorkspace: string;
  avgResponseTime:  number;
}

interface ConversationSnapshot {
  count:         number;
  totalMessages: number;
  pinned:        number;
}

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

  // Memory
  memory:         ConversationSnapshot;
  refreshMemory:  () => void;
}

const AIContext = createContext<AIContextValue | null>(null);

function snapUsage(): UsageSnapshot {
  return {
    todayCount:       AIUsage.getTodayCount(),
    todayTokens:      AIUsage.getTodayTokens(),
    weeklyCount:      AIUsage.getWeeklyCount(),
    mostUsedWorkspace: AIUsage.getMostUsedWorkspace(),
    avgResponseTime:  AIUsage.getAverageResponseTime(),
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

export function AIProvider({ children }: { children: ReactNode }) {
  const [settings,  setSettings]  = useState<AISettings>(() => aiService.settings);
  const [isDemoMode, setDemoMode] = useState(() => aiService.isDemoMode());
  const [activeProvider, setActiveProvider] = useState<AIProviderName>(() => aiService.providerName);
  const [usage,   setUsage]   = useState<UsageSnapshot>(snapUsage);
  const [memory,  setMemory]  = useState<ConversationSnapshot>(snapMemory);

  const refreshUsage  = useCallback(() => setUsage(snapUsage()),   []);
  const refreshMemory = useCallback(() => setMemory(snapMemory()), []);

  const updateSettings = useCallback((patch: Partial<AISettings>) => {
    aiService.updateSettings(patch);
    const s = aiService.settings;
    setSettings(s);
    setDemoMode(aiService.isDemoMode());
    setActiveProvider(aiService.providerName);
  }, []);

  // Refresh usage stats every 30 seconds while the dashboard is open
  useEffect(() => {
    const id = setInterval(() => { refreshUsage(); refreshMemory(); }, 30_000);
    return () => clearInterval(id);
  }, [refreshUsage, refreshMemory]);

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
