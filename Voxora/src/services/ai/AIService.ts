// ── V5.1 AI Engine — Central AI Service ──────────────────────────────────────
// Singleton orchestrator. Routes every AI request through:
//   AIRequestManager → AICache → AIContextManager → Provider
//   → AIHealthMonitor + AIUsage (recording)
// Falls back to MockProvider automatically. Never crashes.

import type { AIProvider, AIRequest, AIResponse, AIMessage, AISettings } from './types/AITypes';
import { DEFAULT_AI_SETTINGS } from './types/AITypes';
import { MockProvider }        from './providers/MockProvider';
import { OpenAIProvider }      from './providers/OpenAIProvider';
import { GeminiProvider }      from './providers/GeminiProvider';
import { AnthropicProvider }   from './providers/AnthropicProvider';
import { PromptLibrary }       from './PromptLibrary';
import { AIUsage }             from './AIUsage';
import { AICache }             from './AICache';
import { AIHealthMonitor }     from './AIHealthMonitor';
import { AIRequestManager }    from './AIRequestManager';
import { AIContextManager }    from './AIContextManager';

const SETTINGS_KEY = 'voxora-ai-settings';

// ── Settings helpers ──────────────────────────────────────────────────────────
function loadSettings(): AISettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AI_SETTINGS };
    return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_AI_SETTINGS };
  }
}

function saveSettings(s: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ── Provider factory ──────────────────────────────────────────────────────────
function buildProvider(settings: AISettings): AIProvider {
  const mock = new MockProvider();
  switch (settings.provider) {
    case 'openai': {
      const p = new OpenAIProvider(settings.apiKeys.openai);
      return p.isAvailable() ? p : mock;
    }
    case 'gemini': {
      const p = new GeminiProvider(settings.apiKeys.gemini);
      return p.isAvailable() ? p : mock;
    }
    case 'anthropic': {
      const p = new AnthropicProvider(settings.apiKeys.anthropic);
      return p.isAvailable() ? p : mock;
    }
    default:
      return mock;
  }
}

// ── AIService class ───────────────────────────────────────────────────────────
class AIService {
  private _settings: AISettings;
  private _provider: AIProvider;

  constructor() {
    this._settings = loadSettings();
    this._provider = buildProvider(this._settings);
  }

  /** Re-read settings and reinitialise provider (call after updating settings). */
  reload(): void {
    this._settings = loadSettings();
    this._provider = buildProvider(this._settings);
  }

  get settings(): AISettings { return { ...this._settings }; }
  get provider(): AIProvider { return this._provider; }
  get providerName() { return this._provider.name; }

  /** True when the selected provider has no API key — running on Mock. */
  isDemoMode(): boolean {
    if (this._settings.provider === 'mock') return true;
    return !this._provider.isAvailable();
  }

  // ─ Internal helpers ────────────────────────────────────────────────────────
  private mergeReq(req: AIRequest): AIRequest {
    return {
      temperature: this._settings.temperature,
      maxTokens:   this._settings.maxTokens,
      ...req,
    };
  }

  private recordUsage(req: AIRequest, res: AIResponse): void {
    AIUsage.record({
      timestamp:    Date.now(),
      provider:     res.provider,
      workspace:    req.workspace ?? 'general',
      tokensUsed:   res.tokensUsed,
      responseTime: res.responseTime,
      promptId:     req.promptId,
    });
  }

  // ── Core generate — full V5.1 pipeline ────────────────────────────────────
  // Cache → RequestManager → ContextManager → Provider → Health + Usage

  /** Generate a single completion. */
  async generate(req: AIRequest): Promise<AIResponse> {
    const merged   = this.mergeReq(req);
    const provider = this._provider;
    const workspace = merged.workspace ?? 'general';

    // 1. Cache lookup (skip for streaming-destined calls that have messages)
    if (!merged.messages || merged.messages.length === 0) {
      const cached = AICache.get(merged.prompt, workspace, provider.name);
      if (cached) return cached;
    }

    // 2. Inject conversation context
    const withCtx = AIContextManager.injectContext(merged);

    // 3. Enqueue through request manager
    const managed = AIRequestManager.enqueue(
      merged.prompt,
      workspace,
      async () => {
        const start = Date.now();
        try {
          const res = await provider.generate(withCtx);
          AIHealthMonitor.recordSuccess(provider.name, res.responseTime);
          return res;
        } catch (err) {
          AIHealthMonitor.recordError(provider.name, Date.now() - start);
          throw err;
        }
      },
    );

    try {
      const res = await managed.promise;
      this.recordUsage(merged, res);

      // 4. Store in cache (only non-contextual single-turn responses)
      if (!merged.messages || merged.messages.length === 0) {
        AICache.set(merged.prompt, workspace, provider.name, res);
      }

      // 5. Record exchange in context manager
      AIContextManager.record(workspace, merged.prompt, res.content);

      return res;
    } catch {
      // Auto-fallback to mock
      const mock  = new MockProvider();
      const res   = await mock.generate(merged);
      this.recordUsage(merged, res);
      AIHealthMonitor.recordSuccess('mock', res.responseTime);
      return res;
    }
  }

  /** Stream a completion, calling onChunk for each token. */
  async stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const merged    = this.mergeReq(req);
    const useStream = this._settings.streaming;
    const start     = Date.now();
    try {
      const res = useStream
        ? await this._provider.stream(merged, onChunk)
        : await this._provider.generate(merged).then(r => { onChunk(r.content); return r; });
      this.recordUsage(merged, res);
      AIHealthMonitor.recordSuccess(this._provider.name, res.responseTime);
      AIContextManager.record(merged.workspace ?? 'general', merged.prompt, res.content);
      return res;
    } catch {
      AIHealthMonitor.recordError(this._provider.name, Date.now() - start);
      const mock = new MockProvider();
      const res  = await mock.stream(merged, onChunk);
      this.recordUsage(merged, res);
      return res;
    }
  }

  /** Multi-turn chat. */
  async chat(messages: AIMessage[], workspace = 'assistant'): Promise<AIResponse> {
    const prompt = PromptLibrary.build('chat', messages.at(-1)?.content ?? '');
    return this.generate({
      prompt:       prompt.user,
      systemPrompt: prompt.system,
      messages,
      workspace,
      promptId:     'chat',
    });
  }

  /** Stream multi-turn chat. */
  async chatStream(
    messages: AIMessage[],
    onChunk:  (chunk: string) => void,
    workspace = 'assistant',
  ): Promise<AIResponse> {
    const lastUser = messages.filter(m => m.role === 'user').at(-1)?.content ?? '';
    const prompt   = PromptLibrary.build('chat', lastUser);
    return this.stream({
      prompt:       prompt.user,
      systemPrompt: prompt.system,
      messages,
      workspace,
      promptId: 'chat',
    }, onChunk);
  }

  /** Summarise a block of text. */
  async summarize(text: string, workspace = 'general'): Promise<AIResponse> {
    return this.generate({
      prompt:       `Summarise the following in 3–5 bullet points, each starting with a relevant emoji:\n\n${text}`,
      systemPrompt: 'You are a concise summarisation assistant. Be clear, structured, and brief.',
      workspace,
    });
  }

  /** Brainstorm ideas on a topic. */
  async brainstorm(topic: string, workspace = 'general'): Promise<AIResponse> {
    const p = PromptLibrary.build('contentIdeas', topic, this._settings.promptStyle);
    return this.generate({ prompt: p.user, systemPrompt: p.system, workspace, promptId: 'contentIdeas' });
  }

  /** Run a structured analysis by type (swot | competitor | market | etc). */
  async analyze(subject: string, type: string, workspace = 'general'): Promise<AIResponse> {
    const promptMap: Record<string, Parameters<typeof PromptLibrary.build>[0]> = {
      swot:              'swot',
      competitor:        'competitorAnalysis',
      market:            'marketingStrategy',
      business:          'businessModel',
      validation:        'productValidation',
      research:          'customerResearch',
      persona:           'customerPersona',
      startup:           'startupValidation',
      apps:              'appIdeas',
      seoPlanner:        'seoPlanning',
      emailCampaign:     'emailCampaign',
      socialMedia:       'socialMedia',
      marketingStrategy: 'marketingStrategy',
      adCopy:            'adCopy',
      contentCalendar:   'contentCalendar',
      brandVoice:        'brandVoice',
      // V4.4 Investor Studio
      fundraisingStrategy: 'fundraisingStrategy',
      termSheet:           'termSheet',
      dueDiligence:        'dueDiligence',
      investorNarrative:   'investorNarrative',
      capTable:            'capTable',
      // V4.3 Financial Studio
      financialForecast: 'financialForecast',
      revenueModel:      'revenueModel',
      pricingStrategy:   'pricingStrategy',
      unitEconomics:     'unitEconomics',
      breakEven:         'breakEven',
      pitchDeck:         'pitchDeck',
      executiveSummary:  'executiveSummary',
      // V4.5–V4.6 Growth & Analytics
      growthPlanner:           'growthPlanner',
      growthOpportunity:       'growthOpportunity',
      aiGrowthRecommendations: 'aiGrowthRecommendations',
      analyticsReports:        'analyticsReports',
      collaborationPlan:       'collaborationPlan',
    };
    const id  = promptMap[type] ?? 'swot';
    const p   = PromptLibrary.build(id, subject, this._settings.promptStyle);
    return this.generate({ prompt: p.user, systemPrompt: p.system, workspace, promptId: id });
  }

  /** Rewrite text in a new style. */
  async rewrite(text: string, style: string, workspace = 'general'): Promise<AIResponse> {
    return this.generate({
      prompt:       `Rewrite the following text in a ${style} style. Keep the core meaning intact:\n\n${text}`,
      systemPrompt: 'You are an expert editor. Rewrite clearly while preserving intent.',
      workspace,
    });
  }

  /** Validate a startup or product idea. */
  async validate(idea: string, workspace = 'validation'): Promise<AIResponse> {
    const p = PromptLibrary.build('productValidation', idea, this._settings.promptStyle);
    return this.generate({ prompt: p.user, systemPrompt: p.system, workspace, promptId: 'productValidation' });
  }

  // ─ V5.1 Engine accessors ──────────────────────────────────────────────────
  get cache()          { return AICache; }
  get healthMonitor()  { return AIHealthMonitor; }
  get requestManager() { return AIRequestManager; }
  get contextManager() { return AIContextManager; }

  // ─ Settings management ────────────────────────────────────────────────────
  updateSettings(patch: Partial<AISettings>): void {
    const prevProvider = this._settings.provider;
    this._settings = { ...this._settings, ...patch };
    saveSettings(this._settings);
    this.reload();
    // Invalidate cache when provider changes
    if (patch.provider && patch.provider !== prevProvider) {
      AICache.invalidateProvider(prevProvider);
      AIHealthMonitor.reset(prevProvider);
    }
  }

  getPromptLibrary() { return PromptLibrary; }
}

// ── Singleton export ──────────────────────────────────────────────────────────
export const aiService = new AIService();
