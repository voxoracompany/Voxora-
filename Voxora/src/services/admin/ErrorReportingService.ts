// ── V5.9 Error Reporting Service ─────────────────────────────────────────────

export type ErrorCategory =
  | "runtime"
  | "api"
  | "ai"
  | "firebase"
  | "integration"
  | "unknown";

export type ErrorSeverity = "critical" | "high" | "medium" | "low";

export interface VoxoraError {
  id: string;
  timestamp: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  source?: string;
  stack?: string;
  context?: Record<string, unknown>;
  resolved: boolean;
}

const STORAGE_KEY = "voxora-error-log";
const MAX_ERRORS = 200;

function genId(): string {
  return `err-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function load(): VoxoraError[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(errors: VoxoraError[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(errors.slice(0, MAX_ERRORS)));
  } catch {
    /* quota exceeded — ignore */
  }
}

export class ErrorReportingService {
  // ── Report ────────────────────────────────────────────────────────────────
  static report(
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      source?: string;
      stack?: string;
      context?: Record<string, unknown>;
    } = {}
  ): VoxoraError {
    const error: VoxoraError = {
      id: genId(),
      timestamp: new Date().toISOString(),
      category: options.category ?? "unknown",
      severity: options.severity ?? "medium",
      message,
      source: options.source,
      stack: options.stack,
      context: options.context,
      resolved: false,
    };
    const existing = load();
    save([error, ...existing]);
    console.error(`[Voxora/${error.category}] ${message}`, options.context ?? "");
    return error;
  }

  static reportFromError(
    err: unknown,
    category: ErrorCategory = "runtime",
    source?: string
  ): VoxoraError {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return ErrorReportingService.report(message, { category, source, stack, severity: "high" });
  }

  // ── Seed demo errors ──────────────────────────────────────────────────────
  static seed(): void {
    const existing = load();
    if (existing.length > 0) return;
    const demo: VoxoraError[] = [
      {
        id: "err-demo-1",
        timestamp: new Date(Date.now() - 3600_000).toISOString(),
        category: "ai",
        severity: "medium",
        message: "Gemini API rate limit approached (80% quota used)",
        source: "GeminiProvider",
        resolved: false,
      },
      {
        id: "err-demo-2",
        timestamp: new Date(Date.now() - 7200_000).toISOString(),
        category: "firebase",
        severity: "low",
        message: "Firestore read latency elevated (>500ms)",
        source: "FirebaseBackendProvider",
        resolved: true,
      },
      {
        id: "err-demo-3",
        timestamp: new Date(Date.now() - 14400_000).toISOString(),
        category: "integration",
        severity: "high",
        message: "GitHub integration token expired — reconnect required",
        source: "GitHubProvider",
        resolved: false,
      },
      {
        id: "err-demo-4",
        timestamp: new Date(Date.now() - 86400_000).toISOString(),
        category: "runtime",
        severity: "low",
        message: "LocalStorage quota warning: 85% used",
        source: "BackendService",
        resolved: true,
      },
    ];
    save(demo);
  }

  // ── Query ─────────────────────────────────────────────────────────────────
  static getAll(): VoxoraError[] {
    return load();
  }

  static getByCategory(category: ErrorCategory): VoxoraError[] {
    return load().filter((e) => e.category === category);
  }

  static getBySeverity(severity: ErrorSeverity): VoxoraError[] {
    return load().filter((e) => e.severity === severity);
  }

  static getUnresolved(): VoxoraError[] {
    return load().filter((e) => !e.resolved);
  }

  static getStats(): {
    total: number;
    unresolved: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
  } {
    const all = load();
    const bySeverity: Record<ErrorSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    const byCategory: Record<ErrorCategory, number> = {
      runtime: 0, api: 0, ai: 0, firebase: 0, integration: 0, unknown: 0,
    };
    for (const e of all) {
      bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
    }
    return { total: all.length, unresolved: all.filter((e) => !e.resolved).length, bySeverity, byCategory };
  }

  // ── Mutate ────────────────────────────────────────────────────────────────
  static resolve(id: string): void {
    const errors = load().map((e) => (e.id === id ? { ...e, resolved: true } : e));
    save(errors);
  }

  static deleteError(id: string): void {
    save(load().filter((e) => e.id !== id));
  }

  static clearResolved(): void {
    save(load().filter((e) => !e.resolved));
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ── Export ────────────────────────────────────────────────────────────────
  static exportAsJSON(): string {
    return JSON.stringify(load(), null, 2);
  }

  static exportAsCSV(): string {
    const rows = load();
    const header = "id,timestamp,category,severity,message,source,resolved";
    const lines = rows.map((e) =>
      [e.id, e.timestamp, e.category, e.severity, `"${e.message.replace(/"/g, '""')}"`, e.source ?? "", e.resolved].join(",")
    );
    return [header, ...lines].join("\n");
  }
}
