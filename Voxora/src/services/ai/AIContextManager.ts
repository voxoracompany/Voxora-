// ── V5.6 AI Engine — Conversation Context Manager ────────────────────────────
// Injects relevant conversation history and project context into AI requests.
// Manages context window size, workspace isolation, and context trimming.

import type { AIMessage, AIRequest } from './types/AITypes';

const MAX_CONTEXT_MESSAGES  = 20;   // max messages to inject per request
const MAX_CONTEXT_CHARS     = 8000; // rough character budget for injected history
const WORKSPACE_KEY_PREFIX  = 'voxora-ctx-';

// ── Per-workspace context store ───────────────────────────────────────────────
function ctxKey(workspace: string): string {
  return `${WORKSPACE_KEY_PREFIX}${workspace}`;
}

function loadContext(workspace: string): AIMessage[] {
  try {
    return JSON.parse(localStorage.getItem(ctxKey(workspace)) || '[]');
  } catch {
    return [];
  }
}

function saveContext(workspace: string, messages: AIMessage[]): void {
  try {
    localStorage.setItem(ctxKey(workspace), JSON.stringify(messages.slice(-MAX_CONTEXT_MESSAGES)));
  } catch { /* storage full */ }
}

// ── Trim context to fit within char budget ────────────────────────────────────
function trimToFit(messages: AIMessage[]): AIMessage[] {
  let total = 0;
  const trimmed: AIMessage[] = [];

  // Walk backwards (newest first) and include until budget exceeded
  for (let i = messages.length - 1; i >= 0; i--) {
    const chars = messages[i].content.length;
    if (total + chars > MAX_CONTEXT_CHARS) break;
    trimmed.unshift(messages[i]);
    total += chars;
  }

  return trimmed;
}

// ── Public API ────────────────────────────────────────────────────────────────
export const AIContextManager = {

  /**
   * Inject stored conversation context into a request.
   * If the request already has messages, those take precedence.
   * Otherwise the stored context is prepended.
   */
  injectContext(req: AIRequest): AIRequest {
    // If caller already built a full message list, respect it
    if (req.messages && req.messages.length > 0) return req;

    const stored = loadContext(req.workspace ?? 'general');
    if (stored.length === 0) return req;

    const context = trimToFit(stored);

    // Build: system (if any) + stored context + current user prompt
    const messages: AIMessage[] = [];
    if (req.systemPrompt) {
      messages.push({ role: 'system', content: req.systemPrompt });
    }
    messages.push(...context);
    messages.push({ role: 'user', content: req.prompt });

    return { ...req, messages };
  },

  /**
   * Record a completed exchange to the workspace context.
   * Call after a successful response so the next request has history.
   */
  record(workspace: string, userPrompt: string, assistantReply: string): void {
    const stored = loadContext(workspace);
    stored.push({ role: 'user',      content: userPrompt      });
    stored.push({ role: 'assistant', content: assistantReply  });
    saveContext(workspace, stored);
  },

  /** Get stored context for a workspace. */
  getContext(workspace: string): AIMessage[] {
    return loadContext(workspace);
  },

  /** Clear context for a specific workspace. */
  clearWorkspace(workspace: string): void {
    localStorage.removeItem(ctxKey(workspace));
  },

  /** Clear all workspace contexts. */
  clearAll(): void {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(WORKSPACE_KEY_PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  },

  /** Number of messages stored for a workspace. */
  contextLength(workspace: string): number {
    return loadContext(workspace).length;
  },

  /**
   * Summarise context for a workspace (returns raw messages).
   * Useful for displaying "X messages of context" in the UI.
   */
  getStats(workspace: string): { messageCount: number; charCount: number } {
    const msgs = loadContext(workspace);
    return {
      messageCount: msgs.length,
      charCount:    msgs.reduce((s, m) => s + m.content.length, 0),
    };
  },
};
