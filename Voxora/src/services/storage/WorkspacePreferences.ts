const RECENT_KEY = "voxora-recent-workspaces";
const FAVORITES_KEY = "voxora-favorite-workspaces";
const MAX_RECENT = 8;

function loadList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function saveList(key: string, values: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Private browsing and quota limits should not prevent navigation.
  }
}

export const WorkspacePreferences = {
  getRecent(): string[] {
    return loadList(RECENT_KEY);
  },

  getFavorites(): string[] {
    return loadList(FAVORITES_KEY);
  },

  record(workspace: string): string[] {
    if (!workspace || workspace === "dashboard") return this.getRecent();
    const next = [workspace, ...this.getRecent().filter((item) => item !== workspace)].slice(0, MAX_RECENT);
    saveList(RECENT_KEY, next);
    return next;
  },

  toggleFavorite(workspace: string): string[] {
    const favorites = this.getFavorites();
    const next = favorites.includes(workspace)
      ? favorites.filter((item) => item !== workspace)
      : [workspace, ...favorites].slice(0, MAX_RECENT);
    saveList(FAVORITES_KEY, next);
    return next;
  },

  clear(): void {
    localStorage.removeItem(RECENT_KEY);
    localStorage.removeItem(FAVORITES_KEY);
  },
};