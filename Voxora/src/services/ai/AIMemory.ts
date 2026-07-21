// ── V4.1 AI Engine — Conversation Memory ─────────────────────────────────────
import type { Conversation, AIMessage, FavouritePrompt } from './types/AITypes';

const STORAGE_KEY   = 'voxora-ai-conversations';
const PROMPTS_KEY   = 'voxora-ai-recent-prompts';
const FAV_KEY       = 'voxora-ai-fav-prompts';
const MAX_RECENT    = 20;
const MAX_FAV       = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────
function load(): Conversation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function save(convs: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

function uid(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── AIMemory API ──────────────────────────────────────────────────────────────
export const AIMemory = {

  // ─ Conversations ──────────────────────────────────────────────────────────
  getAll(): Conversation[] {
    return load().filter(c => !c.archived);
  },

  getArchived(): Conversation[] {
    return load().filter(c => c.archived);
  },

  get(id: string): Conversation | undefined {
    return load().find(c => c.id === id);
  },

  create(workspace: string, firstMessage?: AIMessage): Conversation {
    const now = Date.now();
    const conv: Conversation = {
      id:        uid(),
      title:     `New conversation`,
      messages:  firstMessage ? [firstMessage] : [],
      createdAt: now,
      updatedAt: now,
      workspace,
      pinned:    false,
      archived:  false,
    };
    const convs = load();
    convs.unshift(conv);
    save(convs);
    return conv;
  },

  addMessage(id: string, message: AIMessage): void {
    const convs = load();
    const idx = convs.findIndex(c => c.id === id);
    if (idx === -1) return;
    convs[idx].messages.push(message);
    convs[idx].updatedAt = Date.now();
    // Auto-title from first user message
    if (convs[idx].title === 'New conversation' && message.role === 'user') {
      convs[idx].title = message.content.slice(0, 60) + (message.content.length > 60 ? '…' : '');
    }
    save(convs);
  },

  rename(id: string, title: string): void {
    const convs = load();
    const idx = convs.findIndex(c => c.id === id);
    if (idx !== -1) { convs[idx].title = title; save(convs); }
  },

  pin(id: string): void {
    const convs = load();
    const idx = convs.findIndex(c => c.id === id);
    if (idx !== -1) { convs[idx].pinned = !convs[idx].pinned; save(convs); }
  },

  archive(id: string): void {
    const convs = load();
    const idx = convs.findIndex(c => c.id === id);
    if (idx !== -1) { convs[idx].archived = true; convs[idx].pinned = false; save(convs); }
  },

  delete(id: string): void {
    save(load().filter(c => c.id !== id));
  },

  getPinned(): Conversation[] {
    return load().filter(c => c.pinned && !c.archived);
  },

  // ── V5.6 Favourite ────────────────────────────────────────────────────────
  favourite(id: string): void {
    const convs = load();
    const idx = convs.findIndex(c => c.id === id);
    if (idx !== -1) { convs[idx].favourite = !convs[idx].favourite; save(convs); }
  },

  getFavourites(): Conversation[] {
    return load().filter(c => c.favourite && !c.archived);
  },

  getRecent(limit = 5): Conversation[] {
    return load()
      .filter(c => !c.archived)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  },

  totalMessages(): number {
    return load().reduce((sum, c) => sum + c.messages.length, 0);
  },

  // ─ Recent Prompts ─────────────────────────────────────────────────────────
  addRecentPrompt(text: string, workspace: string): void {
    const prompts: { text: string; workspace: string; usedAt: number }[] = (() => {
      try { return JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]'); }
      catch { return []; }
    })();
    // Deduplicate
    const filtered = prompts.filter(p => p.text !== text);
    filtered.unshift({ text, workspace, usedAt: Date.now() });
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  },

  getRecentPrompts(): { text: string; workspace: string; usedAt: number }[] {
    try { return JSON.parse(localStorage.getItem(PROMPTS_KEY) || '[]'); }
    catch { return []; }
  },

  // ─ Favourite Prompts ──────────────────────────────────────────────────────
  addFavouritePrompt(text: string, workspace: string): FavouritePrompt {
    const favs: FavouritePrompt[] = (() => {
      try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
      catch { return []; }
    })();
    const fp: FavouritePrompt = {
      id: `fav_${Date.now()}`,
      text,
      workspace,
      savedAt: Date.now(),
    };
    favs.unshift(fp);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs.slice(0, MAX_FAV)));
    return fp;
  },

  getFavouritePrompts(): FavouritePrompt[] {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
    catch { return []; }
  },

  removeFavouritePrompt(id: string): void {
    const favs = AIMemory.getFavouritePrompts().filter(f => f.id !== id);
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  },
};
