// ── V4.1 AI Engine — OpenAI Provider ─────────────────────────────────────────
import type { AIProvider, AIRequest, AIResponse } from '../types/AITypes';

const MODEL    = 'gpt-4o-mini';
const BASE_URL = 'https://api.openai.com/v1/chat/completions';

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildMessages(req: AIRequest) {
  const msgs = [];
  if (req.systemPrompt) msgs.push({ role: 'system', content: req.systemPrompt });
  if (req.messages && req.messages.length > 0) {
    msgs.push(...req.messages.map(m => ({ role: m.role, content: m.content })));
  } else {
    msgs.push({ role: 'user', content: req.prompt });
  }
  return msgs;
}

export class OpenAIProvider implements AIProvider {
  readonly name  = 'openai' as const;
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

    const res = await fetch(BASE_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       MODEL,
        messages:    buildMessages(req),
        temperature: req.temperature ?? 0.7,
        max_tokens:  req.maxTokens  ?? 1024,
        stream:      false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(`OpenAI error: ${err?.error?.message ?? res.statusText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return {
      content,
      provider:     'openai',
      tokensUsed:   data.usage?.total_tokens ?? estimateTokens(req.prompt + content),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }

  async stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const start = Date.now();

    const res = await fetch(BASE_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       MODEL,
        messages:    buildMessages(req),
        temperature: req.temperature ?? 0.7,
        max_tokens:  req.maxTokens  ?? 1024,
        stream:      true,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(`OpenAI stream error: ${err?.error?.message ?? res.statusText}`);
    }

    const reader  = res.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const payload = line.slice(6);
        if (payload === '[DONE]') break;
        try {
          const json  = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content ?? '';
          if (delta) { fullContent += delta; onChunk(delta); }
        } catch { /* ignore malformed chunks */ }
      }
    }

    return {
      content:      fullContent,
      provider:     'openai',
      tokensUsed:   estimateTokens(req.prompt + fullContent),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }
}
