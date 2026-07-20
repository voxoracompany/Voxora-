// ── V5.1 AI Engine — Core Types ───────────────────────────────────────────────

export type AIProviderName = 'openai' | 'gemini' | 'anthropic' | 'mock';
export type PromptStyle    = 'concise' | 'detailed' | 'creative';
export type AIWorkspace    =
  | 'assistant' | 'content' | 'apps' | 'startup' | 'swot' | 'competitor'
  | 'market'    | 'research' | 'persona' | 'validation' | 'business'
  | 'financial' | 'pitch'   | 'roadmap' | 'general';

// ── Request / Response ────────────────────────────────────────────────────────
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIRequest {
  prompt:       string;
  systemPrompt?: string;
  messages?:    AIMessage[];
  temperature?: number;
  maxTokens?:   number;
  workspace?:   string;
  promptId?:    string;
  /** V5.1: skip cache lookup for this request */
  noCache?:     boolean;
  /** V5.1: skip context injection for this request */
  noContext?:   boolean;
}

/**
 * Standard AI response format shared across all workspaces.
 * Every provider (Mock, OpenAI, Gemini, Anthropic) returns this shape.
 */
export interface AIResponse {
  content:      string;
  provider:     AIProviderName;
  tokensUsed:   number;
  responseTime: number;
  model:        string;
  /** V5.1: true when the response came from the local cache */
  fromCache?:   boolean;
  /** V5.1: request ID assigned by AIRequestManager */
  requestId?:   string;
}

// ── Provider Interface ────────────────────────────────────────────────────────
export interface AIProvider {
  readonly name:  AIProviderName;
  readonly model: string;
  generate(req: AIRequest): Promise<AIResponse>;
  /** Streaming-ready: emit tokens via onChunk, return complete response. */
  stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse>;
  isAvailable(): boolean;
}

// ── Conversation Memory ───────────────────────────────────────────────────────
export interface Conversation {
  id:        string;
  title:     string;
  messages:  AIMessage[];
  createdAt: number;
  updatedAt: number;
  workspace: string;
  pinned:    boolean;
  archived:  boolean;
}

export interface FavouritePrompt {
  id:        string;
  text:      string;
  workspace: string;
  savedAt:   number;
}

// ── Usage Tracking ────────────────────────────────────────────────────────────
export interface AIUsageRecord {
  id:           string;
  timestamp:    number;
  provider:     AIProviderName;
  workspace:    string;
  /** Actual tokens from provider, or estimated count for MockProvider. */
  tokensUsed:   number;
  responseTime: number;
  promptId?:    string;
}

// ── V5.1 Cache Types ──────────────────────────────────────────────────────────
export interface AICacheStats {
  totalEntries: number;
  hits:         number;
  misses:       number;
  /** 0–1 ratio of cache hits to total lookups this session. */
  hitRate:      number;
}

// ── V5.1 Health Monitor Types ─────────────────────────────────────────────────
export type HealthStatus = 'healthy' | 'degraded' | 'unavailable' | 'unknown';

export interface ProviderHealth {
  provider:     AIProviderName;
  status:       HealthStatus;
  /** Rolling average latency of the last 10 requests (ms). */
  latencyMs:    number;
  /** Fraction of the last 10 requests that failed (0–1). */
  errorRate:    number;
  lastChecked:  number;
  requestCount: number;
  errorCount:   number;
}

// ── V5.1 Request Manager Types ────────────────────────────────────────────────
export type RequestStatus = 'pending' | 'running' | 'done' | 'error' | 'cancelled';

export interface RequestConcurrencyInfo {
  running: number;
  queued:  number;
  max:     number;
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface AISettings {
  provider:         AIProviderName;
  temperature:      number;
  maxTokens:        number;
  streaming:        boolean;
  memoryEnabled:    boolean;
  defaultWorkspace: string;
  promptStyle:      PromptStyle;
  apiKeys: {
    openai:    string;
    gemini:    string;
    anthropic: string;
  };
  /** V5.1: whether to use the AI Cache layer */
  cacheEnabled:    boolean;
  /** V5.1: whether to inject conversation context into requests */
  contextEnabled:  boolean;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider:         'mock',
  temperature:      0.7,
  maxTokens:        1024,
  streaming:        true,
  memoryEnabled:    true,
  defaultWorkspace: 'assistant',
  promptStyle:      'detailed',
  apiKeys:          { openai: '', gemini: '', anthropic: '' },
  cacheEnabled:     true,
  contextEnabled:   false, // opt-in per-workspace
};
