// ── V5.8 Admin & Monitoring — Types ──────────────────────────────────────────

export type UserRole = "owner" | "admin" | "team" | "user";
export type UserStatus = "active" | "suspended" | "pending" | "deleted";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarEmoji: string;
  createdAt: string;
  lastLogin: string;
  projectCount: number;
  aiRequests: number;
  plan: string;
  emailVerified: boolean;
}

// ── Audit Log ────────────────────────────────────────────────────────────────

export type AuditEventType =
  | "login" | "logout" | "ai_request" | "project_create" | "project_delete"
  | "billing_change" | "integration_event" | "automation_event"
  | "settings_change" | "user_role_change" | "user_suspend"
  | "user_reactivate" | "user_delete" | "feature_flag_change"
  | "maintenance_mode";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, string>;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  icon: string;
}

// ── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = "success" | "warning" | "error" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  source?: string;
}

// ── Feature Flags ────────────────────────────────────────────────────────────

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  category: "ai" | "backend" | "payments" | "integrations" | "platform";
}

// ── System Monitoring ────────────────────────────────────────────────────────

export type ServiceStatus = "operational" | "degraded" | "down" | "unknown";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency: number; // ms
  uptime: number;  // percent
  lastChecked: string;
  icon: string;
}

export interface SystemMetrics {
  cpuUsage: number;        // percent (demo)
  memoryUsage: number;     // percent
  storageUsed: number;     // bytes
  apiRequests: number;
  aiRequests: number;
  activeUsers: number;
  services: ServiceHealth[];
  updatedAt: string;
}

// ── Admin Dashboard Stats ────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  projectsCreated: number;
  aiRequests: number;
  revenue: string;
  storageUsed: number;
  integrationsConnected: number;
  systemHealth: ServiceStatus;
  subscriptionBreakdown: {
    free: number;
    pro: number;
    enterprise: number;
  };
}
