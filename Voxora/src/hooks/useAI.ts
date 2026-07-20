// ── V4.1 AI Engine — useAI Hook ───────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { aiService }   from '../services/ai/AIService';
import { useAIContext } from '../context/AIContext';
import type { AIMessage } from '../services/ai/types/AITypes';

export function useAI(workspace = 'general') {
  const { isDemoMode, refreshUsage } = useAIContext();
  const [isLoading, setIsLoading]   = useState(false);
  const [error,     setError]       = useState<string | null>(null);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fn();
      refreshUsage();
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsage]);

  /** Generate a single completion and return the text. */
  const generate = useCallback(async (prompt: string): Promise<string | null> => {
    return run(async () => {
      const res = await aiService.generate({ prompt, workspace });
      return res.content;
    });
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
      return res.content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspace, refreshUsage]);

  /** Multi-turn chat stream. */
  const chatStream = useCallback(async (
    messages: AIMessage[],
    onChunk:  (chunk: string) => void,
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiService.chatStream(messages, onChunk, workspace);
      refreshUsage();
      return res.content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [workspace, refreshUsage]);

  /** Run a structured analysis (swot | competitor | market | business | etc). */
  const analyze = useCallback(async (subject: string, type: string): Promise<string | null> => {
    return run(() =>
      aiService.analyze(subject, type, workspace).then(r => r.content)
    );
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
    generate, stream, chatStream,
    analyze, brainstorm, validate, rewrite, summarize,
    isLoading, error, isDemoMode,
  };
}
