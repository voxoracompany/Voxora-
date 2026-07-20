// ── V4.1 AI Engine — Anthropic Claude Provider ────────────────────────────────
import type { AIProvider, AIRequest, AIResponse } from '../types/AITypes';

const MODEL    = 'claude-3-haiku-20240307';
const BASE_URL = 'https://api.anthropic.com/v1/messages';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildMessages(req: AIRequest) {
  if (req.messages && req.messages.length > 0) {
    return req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));
  }
  return [{ role: 'user', content: req.prompt }];
}

export class AnthropicProvider implements AIProvider {
  readonly name  = 'anthropic' as const;
  readonly model = MODEL;

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return this.apiKey.length > 10;
  }

  async generate(req: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const body: Record<string, unknown> = {
      model:      MODEL,
      max_tokens: req.maxTokens ?? 1024,
      messages:   buildMessages(req),
    };
    if (req.systemPrompt) body.system = req.systemPrompt;

    const res = await fetch(BASE_URL, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic error: ${err?.error?.message ?? res.statusText}`);
    }

    const data    = await res.json();
    const content = data.content?.[0]?.text ?? '';

    return {
      content,
      provider:     'anthropic',
      tokensUsed:   (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }

  async stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const start = Date.now();

    const body: Record<string, unknown> = {
      model:      MODEL,
      max_tokens: req.maxTokens ?? 1024,
      messages:   buildMessages(req),
      stream:     true,
    };
    if (req.systemPrompt) body.system = req.systemPrompt;

    const res = await fetch(BASE_URL, {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic stream error: ${err?.error?.message ?? res.statusText}`);
    }

    const reader      = res.body!.getReader();
    const decoder     = new TextDecoder();
    let   fullContent = '';
    let   inputTokens = 0;
    let   outputTokens = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.type === 'content_block_delta' && json.delta?.text) {
            fullContent += json.delta.text;
            onChunk(json.delta.text);
          }
          if (json.type === 'message_delta' && json.usage) {
            outputTokens = json.usage.output_tokens ?? 0;
          }
          if (json.type === 'message_start' && json.message?.usage) {
            inputTokens = json.message.usage.input_tokens ?? 0;
          }
        } catch { /* ignore */ }
      }
    }

    return {
      content:      fullContent,
      provider:     'anthropic',
      tokensUsed:   inputTokens + outputTokens || estimateTokens(req.prompt + fullContent),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }
}
