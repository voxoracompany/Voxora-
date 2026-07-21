// ── V5.8 Notification Service ─────────────────────────────────────────────────

import type { Notification, NotificationType } from "./AdminTypes";

const STORAGE_KEY = "voxora-notifications";
const MAX_ITEMS   = 200;

function genId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function iconForType(type: NotificationType): string {
  return { success: "✅", warning: "⚠️", error: "❌", info: "ℹ️" }[type];
}

export class NotificationService {
  private static load(): Notification[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  }

  private static save(items: Notification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch { /* storage full */ }
  }

  static add(
    type: NotificationType,
    title: string,
    message: string,
    source?: string,
  ): Notification {
    const item: Notification = {
      id:        genId(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read:      false,
      archived:  false,
      source,
    };
    const existing = this.load();
    this.save([item, ...existing]);
    return item;
  }

  static getAll(): Notification[] {
    return this.load().filter((n) => !n.archived);
  }

  static getUnread(): Notification[] {
    return this.getAll().filter((n) => !n.read);
  }

  static getUnreadCount(): number {
    return this.getUnread().length;
  }

  static markRead(id: string): void {
    const items = this.load().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.save(items);
  }

  static markAllRead(): void {
    const items = this.load().map((n) => ({ ...n, read: true }));
    this.save(items);
  }

  static archive(id: string): void {
    const items = this.load().map((n) => (n.id === id ? { ...n, archived: true } : n));
    this.save(items);
  }

  static delete(id: string): void {
    this.save(this.load().filter((n) => n.id !== id));
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static iconFor(type: NotificationType): string {
    return iconForType(type);
  }

  static seed(): void {
    if (this.load().length > 0) return;
    this.add("success", "Welcome to Voxora V5.8!", "Admin & Monitoring is now available.", "System");
    this.add("info",    "AI Engine Active",         "Gemini is connected and responding normally.", "AI Engine");
    this.add("warning", "Demo Mode Active",          "Connect Firebase to enable cloud sync.", "Backend");
    this.add("info",    "V5.7 Integrations Ready",  "Automation Engine and integrations are configured.", "System");
  }
}
