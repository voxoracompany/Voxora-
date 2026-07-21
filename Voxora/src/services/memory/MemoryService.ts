// ── V5.6 Project Memory Engine — Service ──────────────────────────────────────
import type { MemoryItem, MemoryItemType, MemoryStats } from './MemoryTypes';

const STORAGE_KEY = 'voxora-memory-items';

function uid(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function load(): MemoryItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(items: MemoryItem[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch { /* storage full */ }
}

export const MemoryService = {

  // ── Create / Update ──────────────────────────────────────────────────────────

  saveMemory(data: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'favourite'>): MemoryItem {
    const now = Date.now();
    const item: MemoryItem = { ...data, id: uid(), favourite: false, createdAt: now, updatedAt: now };
    const items = load();
    items.unshift(item);
    save(items);
    return item;
  },

  updateMemory(id: string, patch: Partial<Omit<MemoryItem, 'id' | 'createdAt'>>): void {
    const items = load();
    const idx = items.findIndex(m => m.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], ...patch, updatedAt: Date.now() };
    save(items);
  },

  // ── Read ─────────────────────────────────────────────────────────────────────

  getMemory(id: string): MemoryItem | undefined {
    return load().find(m => m.id === id);
  },

  getAll(): MemoryItem[] {
    return load();
  },

  getProjectMemory(projectId: string): MemoryItem[] {
    return load().filter(m => m.projectId === projectId);
  },

  getRecentMemory(limit = 10): MemoryItem[] {
    return load()
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },

  getByType(type: MemoryItemType): MemoryItem[] {
    return load().filter(m => m.type === type);
  },

  getFavourites(): MemoryItem[] {
    return load().filter(m => m.favourite);
  },

  // ── Delete ───────────────────────────────────────────────────────────────────

  deleteMemory(id: string): void {
    save(load().filter(m => m.id !== id));
  },

  deleteAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  deleteByProject(projectId: string): void {
    save(load().filter(m => m.projectId !== projectId));
  },

  // ── Favourite ────────────────────────────────────────────────────────────────

  toggleFavourite(id: string): void {
    const items = load();
    const idx = items.findIndex(m => m.id === id);
    if (idx !== -1) {
      items[idx].favourite = !items[idx].favourite;
      items[idx].updatedAt = Date.now();
      save(items);
    }
  },

  // ── Search ───────────────────────────────────────────────────────────────────

  searchMemory(query: string, options?: { type?: MemoryItemType; projectId?: string; favourite?: boolean }): MemoryItem[] {
    const q = query.toLowerCase().trim();
    let items = load();

    if (options?.type) items = items.filter(m => m.type === options.type);
    if (options?.projectId) items = items.filter(m => m.projectId === options.projectId);
    if (options?.favourite) items = items.filter(m => m.favourite);

    if (!q) return items;

    return items.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  },

  // ── Stats ────────────────────────────────────────────────────────────────────

  getStats(): MemoryStats {
    const items = load();
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    const byType: MemoryStats['byType'] = {};
    for (const item of items) {
      byType[item.type] = (byType[item.type] ?? 0) + 1;
    }
    return {
      total: items.length,
      byType,
      favourites: items.filter(m => m.favourite).length,
      estimatedBytes: new Blob([raw]).size,
    };
  },

  // ── Export ───────────────────────────────────────────────────────────────────

  exportMemory(): string {
    return JSON.stringify({ exportedAt: new Date().toISOString(), items: load() }, null, 2);
  },

  /** Build a concise project context string for AI injection (max ~1500 chars). */
  buildProjectContext(projectId?: string): string {
    const items = projectId ? this.getProjectMemory(projectId) : this.getRecentMemory(5);
    if (items.length === 0) return '';
    const lines = items.map(m => `[${m.type}] ${m.title}: ${m.content.slice(0, 200)}`);
    return `\n\n--- Project Context ---\n${lines.join('\n')}\n--- End Context ---`;
  },
};
