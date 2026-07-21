// ── V5.8 System Monitoring Service ───────────────────────────────────────────

import type { ServiceHealth, ServiceStatus, SystemMetrics } from "./AdminTypes";

function storageUsedBytes(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    total += new Blob([key + (localStorage.getItem(key) || "")]).size;
  }
  return total;
}

function aiRequestCount(): number {
  try {
    const usage = JSON.parse(localStorage.getItem("voxora-ai-usage") || "[]");
    return Array.isArray(usage) ? usage.length : 0;
  } catch { return 0; }
}

function memoryUsedPercent(): number {
  // Approximate: localStorage quota is ~5MB
  const used = storageUsedBytes();
  const quota = 5 * 1024 * 1024;
  return Math.min(100, Math.round((used / quota) * 100));
}

function demoServiceStatus(seed: number): ServiceStatus {
  // Stable demo values based on seed
  const v = seed % 10;
  if (v < 7) return "operational";
  if (v < 9) return "degraded";
  return "operational";
}

export class MonitoringService {
  static getMetrics(): SystemMetrics {
    const storageUsed = storageUsedBytes();
    const memUsage    = memoryUsedPercent();
    const aiReqs      = aiRequestCount();

    const services: ServiceHealth[] = [
      {
        name:        "Firebase Auth",
        status:      demoServiceStatus(1),
        latency:     42,
        uptime:      99.9,
        lastChecked: new Date().toISOString(),
        icon:        "🔥",
      },
      {
        name:        "Firestore DB",
        status:      demoServiceStatus(2),
        latency:     67,
        uptime:      99.7,
        lastChecked: new Date().toISOString(),
        icon:        "🗄️",
      },
      {
        name:        "Gemini AI",
        status:      demoServiceStatus(3),
        latency:     380,
        uptime:      98.5,
        lastChecked: new Date().toISOString(),
        icon:        "♊",
      },
      {
        name:        "OpenAI",
        status:      demoServiceStatus(4),
        latency:     520,
        uptime:      99.1,
        lastChecked: new Date().toISOString(),
        icon:        "🧠",
      },
      {
        name:        "Payment Provider",
        status:      demoServiceStatus(5),
        latency:     210,
        uptime:      99.5,
        lastChecked: new Date().toISOString(),
        icon:        "💳",
      },
      {
        name:        "Integration Engine",
        status:      demoServiceStatus(6),
        latency:     55,
        uptime:      99.8,
        lastChecked: new Date().toISOString(),
        icon:        "🔌",
      },
      {
        name:        "Automation Engine",
        status:      demoServiceStatus(7),
        latency:     30,
        uptime:      99.9,
        lastChecked: new Date().toISOString(),
        icon:        "⚡",
      },
    ];

    return {
      cpuUsage:    28,   // demo fixed value
      memoryUsage: memUsage,
      storageUsed,
      apiRequests: aiReqs * 3,  // rough estimate
      aiRequests:  aiReqs,
      activeUsers: 1,
      services,
      updatedAt:   new Date().toISOString(),
    };
  }

  static statusColor(status: ServiceStatus): string {
    return {
      operational: "#10b981",
      degraded:    "#f59e0b",
      down:        "#ef4444",
      unknown:     "#94a3b8",
    }[status];
  }

  static statusIcon(status: ServiceStatus): string {
    return {
      operational: "🟢",
      degraded:    "🟡",
      down:        "🔴",
      unknown:     "⚪",
    }[status];
  }

  static formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
