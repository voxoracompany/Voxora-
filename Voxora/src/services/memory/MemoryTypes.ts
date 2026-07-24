// ── V5.6 Project Memory Engine — Types ────────────────────────────────────────

export type MemoryItemType =
  | 'project_title'
  | 'startup_idea'
  | 'customer_research'
  | 'marketing_plan'
  | 'financial_analysis'
  | 'investor_report'
  | 'roadmap'
  | 'ai_conversation'
  | 'note'
  | 'document'
  | 'generated_content';

export interface MemoryItem {
  id: string;
  type: MemoryItemType;
  title: string;
  content: string;
  projectId?: string;
  tags: string[];
  favourite: boolean;
  createdAt: number;
  updatedAt: number;
  workspace?: string;
}

export interface MemoryStats {
  total: number;
  byType: Partial<Record<MemoryItemType, number>>;
  favourites: number;
  /** Rough estimate of bytes used in localStorage for memory items */
  estimatedBytes: number;
}

export interface MemorySearchResult {
  item: MemoryItem;
  score: number;
  matchedFields: string[];
}

export const MEMORY_TYPE_LABELS: Record<MemoryItemType, string> = {
  project_title:     'Project',
  startup_idea:      'Startup Idea',
  customer_research: 'Customer Research',
  marketing_plan:    'Marketing Plan',
  financial_analysis:'Financial Analysis',
  investor_report:   'Investor Report',
  roadmap:           'Roadmap',
  ai_conversation:   'AI Conversation',
  note:              'Note',
  document:          'Document',
  generated_content: 'Generated Content',
};

export const MEMORY_TYPE_ICONS: Record<MemoryItemType, string> = {
  project_title:     '📁',
      startup_idea:      '✨',
  customer_research: '🔬',
  marketing_plan:    '📣',
  financial_analysis:'💰',
  investor_report:   '📊',
  roadmap:           '🗺️',
  ai_conversation:   '🤖',
  note:              '📝',
  document:          '📄',
  generated_content: '✨',
};
