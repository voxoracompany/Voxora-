// ── V5.6 Project Memory Engine — Export ──────────────────────────────────────
import { MemoryService } from './MemoryService';
import { AIMemory } from '../ai/AIMemory';

export const MemoryExport = {

  /** Download all memory + conversations as a single JSON file. */
  downloadJSON(): void {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: '5.6',
      memory: MemoryService.getAll(),
      conversations: AIMemory.getAll(),
      archivedConversations: AIMemory.getArchived(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxora-memory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Download memory items only as CSV. */
  downloadCSV(): void {
    const items = MemoryService.getAll();
    const headers = ['id', 'type', 'title', 'content', 'projectId', 'tags', 'favourite', 'createdAt', 'updatedAt'];
    const rows = items.map(m => [
      m.id,
      m.type,
      `"${m.title.replace(/"/g, '""')}"`,
      `"${m.content.slice(0, 500).replace(/"/g, '""')}"`,
      m.projectId ?? '',
      `"${m.tags.join(', ')}"`,
      m.favourite ? 'true' : 'false',
      new Date(m.createdAt).toISOString(),
      new Date(m.updatedAt).toISOString(),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxora-memory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Import memory from a previously exported JSON file. Returns count of items imported. */
  importJSON(jsonString: string): { memoryCount: number; conversationCount: number } {
    try {
      const data = JSON.parse(jsonString);
      let memoryCount = 0;
      let conversationCount = 0;

      if (Array.isArray(data.memory)) {
        const existing = MemoryService.getAll();
        const existingIds = new Set(existing.map(m => m.id));
        for (const item of data.memory) {
          if (!existingIds.has(item.id)) {
            MemoryService.saveMemory(item);
            memoryCount++;
          }
        }
      }

      if (Array.isArray(data.conversations)) {
        const existingIds = new Set(AIMemory.getAll().map(c => c.id));
        for (const conv of data.conversations) {
          if (!existingIds.has(conv.id)) {
            // Re-create conversation via internal storage
            try {
              const convs: typeof conv[] = (() => {
                try { return JSON.parse(localStorage.getItem('voxora-ai-conversations') || '[]'); }
                catch { return []; }
              })();
              convs.push(conv);
              localStorage.setItem('voxora-ai-conversations', JSON.stringify(convs));
              conversationCount++;
            } catch { /* skip */ }
          }
        }
      }

      return { memoryCount, conversationCount };
    } catch {
      throw new Error('Invalid Voxora memory export file.');
    }
  },

  /** Get a human-readable memory size estimate. */
  getSizeLabel(): string {
    const stats = MemoryService.getStats();
    const bytes = stats.estimatedBytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
