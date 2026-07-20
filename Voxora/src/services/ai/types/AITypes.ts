// ── V4.1 AI Engine — Core Types ───────────────────────────────────────────────

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
}

export interface AIResponse {
  content:      string;
  provider:     AIProviderName;
  tokensUsed:   number;
  responseTime: number;
  model:        string;
}

// ── Provider Interface ────────────────────────────────────────────────────────
export interface AIProvider {
  readonly name:  AIProviderName;
  readonly model: string;
  generate(req: AIRequest): Promise<AIResponse>;
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
  tokensUsed:   number;
  responseTime: number;
  promptId?:    string;
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
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider:         'mock',
  temperature:      0.7,
  maxTokens:        1024,
  streaming:        true,
  memoryEnabled:    true,
  defaultWorkspace: 'assistant',
  promptStyle:      'detailed',
  apiKeys: { openai: '', gemini: '', anthropic: '' },
};
