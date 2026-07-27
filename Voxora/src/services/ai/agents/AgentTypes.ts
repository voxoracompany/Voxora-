// ── V8.2 AI Agents — Types ────────────────────────────────────────────────────

export type AgentId =
  | "ceo"
  | "marketing"
  | "sales"
  | "finance"
  | "support"
  | "hr"
  | "research";

export type AgentStatus = "idle" | "thinking" | "streaming" | "error";

export interface AgentConfig {
  id: AgentId;
  name: string;
  title: string;
  icon: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
  suggestedPrompts: string[];
}

export interface AgentMessage {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: number;
  agentId: AgentId;
}

export interface AgentConversation {
  id: string;
  agentId: AgentId;
  title: string;
  messages: AgentMessage[];
  createdAt: number;
  updatedAt: number;
  archived: boolean;
}

export interface AgentUsageStat {
  agentId: AgentId;
  messagesTotal: number;
  conversationsTotal: number;
  lastUsedAt?: number;
}
