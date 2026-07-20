// ── V4.1 AI Engine — Google Gemini Provider ───────────────────────────────────
import type { AIProvider, AIRequest, AIResponse } from '../types/AITypes';

const MODEL    = 'gemini-1.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent`;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function buildContents(req: AIRequest) {
  if (req.messages && req.messages.length > 0) {
    return req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role:  m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
  }
  return [{ role: 'user', parts: [{ text: req.prompt }] }];
}

function buildSystemInstruction(req: AIRequest) {
  if (req.systemPrompt) return { parts: [{ text: req.systemPrompt }] };
  return undefined;
}

export class GeminiProvider implements AIProvider {
  readonly name  = 'gemini' as const;
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
      contents:           buildContents(req),
      generationConfig: {
        temperature:     req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens  ?? 1024,
      },
    };
    const si = buildSystemInstruction(req);
    if (si) body.systemInstruction = si;

    const res = await fetch(`${BASE_URL}?key=${this.apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini error: ${err?.error?.message ?? res.statusText}`);
    }

    const data    = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return {
      content,
      provider:     'gemini',
      tokensUsed:   data.usageMetadata?.totalTokenCount ?? estimateTokens(req.prompt + content),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }

  async stream(req: AIRequest, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const start = Date.now();

    const body: Record<string, unknown> = {
      contents:         buildContents(req),
      generationConfig: {
        temperature:     req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens  ?? 1024,
      },
    };
    const si = buildSystemInstruction(req);
    if (si) body.systemInstruction = si;

    const res = await fetch(`${STREAM_URL}?key=${this.apiKey}&alt=sse`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini stream error: ${err?.error?.message ?? res.statusText}`);
    }

    const reader      = res.body!.getReader();
    const decoder     = new TextDecoder();
    let   fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        try {
          const json  = JSON.parse(line.slice(6));
          const delta = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (delta) { fullContent += delta; onChunk(delta); }
        } catch { /* ignore */ }
      }
    }

    return {
      content:      fullContent,
      provider:     'gemini',
      tokensUsed:   estimateTokens(req.prompt + fullContent),
      responseTime: Date.now() - start,
      model:        MODEL,
    };
  }
}
