// Shared browser-storage and export helpers — V8.0
// Keep all imported data bounded and treat user-provided strings as text.

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function writeString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function downloadBlob(filename: string, content: BlobPart, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Safe localStorage getter with a size guard.
 * Returns null (not the fallback) when the stored value exceeds maxBytes.
 */
export function readJsonGuarded<T>(key: string, fallback: T, maxBytes = 2 * 1024 * 1024): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    if (raw.length > maxBytes) {
      console.warn(`[SafeStorage] Key "${key}" exceeds ${maxBytes} bytes — skipping.`);
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Remove a key from localStorage without throwing.
 */
export function removeItem(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

/**
 * Return the approximate size of a localStorage key in bytes.
 */
export function itemSizeBytes(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Blob([raw]).size : 0;
  } catch {
    return 0;
  }
}

/**
 * Estimate total localStorage usage in bytes across all keys.
 */
export function totalStorageBytes(): number {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) total += itemSizeBytes(key);
    }
  } catch { /* ignore */ }
  return total;
}

export function validateBackup(value: unknown): value is {
  version: string;
  projects: unknown[];
  favorites?: unknown[];
  pinned?: unknown[];
  activities?: unknown[];
  chat?: unknown[];
  chatCount?: number;
  profile?: Record<string, unknown>;
} {
  if (!value || typeof value !== "object") return false;
  const backup = value as Record<string, unknown>;
  return typeof backup.version === "string"
    && Array.isArray(backup.projects)
    && backup.projects.length <= 5000
    && (!backup.favorites || Array.isArray(backup.favorites))
    && (!backup.pinned || Array.isArray(backup.pinned))
    && (!backup.activities || Array.isArray(backup.activities))
    && (!backup.chat || Array.isArray(backup.chat))
    && (!backup.profile || typeof backup.profile === "object");
}