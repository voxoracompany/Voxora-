// ── V5.6 Project Memory Engine — Cross-Entity Search ─────────────────────────
import { MemoryService } from './MemoryService';
import type { MemoryItem } from './MemoryTypes';
import { AIMemory } from '../ai/AIMemory';
import type { Conversation } from '../ai/types/AITypes';

export type SearchEntityType = 'memory' | 'conversation' | 'all';

export interface SearchResultItem {
  kind: 'memory';
  item: MemoryItem;
  snippet: string;
  score: number;
}

export interface SearchResultConversation {
  kind: 'conversation';
  conversation: Conversation;
  snippet: string;
  score: number;
}

export type UnifiedSearchResult = SearchResultItem | SearchResultConversation;

function scoreText(text: string, query: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t === q) return 10;
  if (t.startsWith(q)) return 8;
  if (t.includes(q)) return 5;
  return 0;
}

function snippet(text: string, query: string, maxLen = 140): string {
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? '…' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

export const MemorySearch = {

  /**
   * Search across memory items.
   */
  searchMemory(query: string): SearchResultItem[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MemoryService.getAll()
      .map(item => {
        const titleScore = scoreText(item.title, q) * 2;
        const contentScore = scoreText(item.content, q);
        const tagScore = item.tags.some(t => t.toLowerCase().includes(q)) ? 3 : 0;
        const score = titleScore + contentScore + tagScore;
        if (score === 0) return null;
        return {
          kind: 'memory' as const,
          item,
          snippet: snippet(item.content || item.title, query),
          score,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score) as SearchResultItem[];
  },

  /**
   * Search across AI conversations.
   */
  searchConversations(query: string): SearchResultConversation[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return AIMemory.getAll()
      .map(conv => {
        const titleScore = scoreText(conv.title, q) * 2;
        const msgScore = conv.messages.some(m => m.content.toLowerCase().includes(q)) ? 4 : 0;
        const score = titleScore + msgScore;
        if (score === 0) return null;
        const matchMsg = conv.messages.find(m => m.content.toLowerCase().includes(q));
        return {
          kind: 'conversation' as const,
          conversation: conv,
          snippet: matchMsg ? snippet(matchMsg.content, query) : conv.title,
          score,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score) as SearchResultConversation[];
  },

  /**
   * Unified search across all entity types.
   */
  searchAll(query: string): UnifiedSearchResult[] {
    const memResults = this.searchMemory(query);
    const convResults = this.searchConversations(query);
    return [...memResults, ...convResults].sort((a, b) => b.score - a.score);
  },
};
