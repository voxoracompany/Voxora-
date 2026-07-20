// ── V5.1 AI Engine — useAI Hook ───────────────────────────────────────────────
// Unified hook used by every AI workspace. Routes through the shared AI engine.
// All workspaces call this hook — no workspace has its own AI implementation.

import { useState, useCallback } from 'react';
import { aiService }    from '../services/ai/AIService';
import { useAIContext } from '../context/AIContext';
import type { AIMessage, AIResponse } from '../services/ai/types/AITypes';

export interface UseAIReturn {
  // Core generators
  generate:    (prompt: string) => Promise<string | null>;
  stream:      (prompt: string, onChunk: (c: string) => void) => Promise<string | null>;
  chatStream:  (messages: AIMessage[], onChunk: (c: string) => void) => Promise<string | null>;

  // Structured helpers (all proxy through the shared AI engine)
  analyze:     (subject: string, type: string) => Promise<string | null>;
  brainstorm:  (topic: string) => Promise<string | null>;
  validate:    (idea: string) => Promise<string | null>;
  rewrite:     (text: string, style: string) => Promise<string | null>;
  summarize:   (text: string) => Promise<string | null>;

  // V5.1 — full response (includes provider, tokens, requestId, fromCache)
  generateFull:  (prompt: string) => Promise<AIResponse | null>;

  // Status
  isLoading:   boolean;
  error:       string | null;
  isDemoMode:  boolean;

  /** Clear any error state. */
  clearError:  () => void;
}

export function useAI(workspace = 'general'): UseAIReturn {
  const { isDemoMode, refreshUsage, refreshCache } = useAIContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // ── Internal runner — handles loading / error / refresh ────────────────────
  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      refreshUsage();
      refreshCache();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsage, refreshCache]);

  // ── Core generators ────────────────────────────────────────────────────────

  /** Generate a single completion and return the text content. */
  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    return run(async () => {
      const res = await aiService.generate({ prompt, workspace });
      return res.content;
    });
  }, [run, workspace]);

  /**
   * Generate and return the full AIResponse (provider, tokens, fromCache, etc.).
   * Use when the workspace needs metadata beyond just the text.
   */
  const generateFull = useCallback(async (prompt: string): Promise<AIResponse | null> => {
    return run(() => aiService.generate({ prompt, workspace }));
  }, [run, workspace]);

  /** Stream a completion; onChunk is called as tokens arrive. Returns full text. */
  const stream = useCallback(async (
    prompt:  string,
    onChunk: (chunk: string) => void,
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiService.stream({ prompt, workspace }, onChunk);
      refreshUsage();
      refreshCache();
      return res.content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspace, refreshUsage, refreshCache]);

  /** Multi-turn chat stream. Passes full message history to the AI engine. */
  const chatStream = useCallback(async (
    messages: AIMessage[],
    onChunk:  (chunk: string) => void,
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiService.chatStream(messages, onChunk, workspace);
      refreshUsage();
      refreshCache();
      return res.content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspace, refreshUsage, refreshCache]);

  // ── Structured helpers (all proxy the shared AI engine) ───────────────────

  /** Run a structured analysis — swot | competitor | market | startup | etc. */
  const analyze = useCallback(async (subject: string, type: string): Promise<string | null> => {
    return run(() => aiService.analyze(subject, type, workspace).then(r => r.content));
  }, [run, workspace]);

  /** Brainstorm ideas on a topic. */
  const brainstorm = useCallback(async (topic: string): Promise<string | null> => {
    return run(() => aiService.brainstorm(topic, workspace).then(r => r.content));
  }, [run, workspace]);

  /** Validate a startup or product idea. */
  const validate = useCallback(async (idea: string): Promise<string | null> => {
    return run(() => aiService.validate(idea, workspace).then(r => r.content));
  }, [run, workspace]);

  /** Rewrite text in a new style. */
  const rewrite = useCallback(async (text: string, style: string): Promise<string | null> => {
    return run(() => aiService.rewrite(text, style, workspace).then(r => r.content));
  }, [run, workspace]);

  /** Summarise a block of text. */
  const summarize = useCallback(async (text: string): Promise<string | null> => {
    return run(() => aiService.summarize(text, workspace).then(r => r.content));
  }, [run, workspace]);

  return {
    generate, generateFull, stream, chatStream,
    analyze, brainstorm, validate, rewrite, summarize,
    isLoading, error, isDemoMode, clearError,
  };
}
