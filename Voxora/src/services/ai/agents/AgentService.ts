// ── V8.2 AI Agent Service ─────────────────────────────────────────────────────
// 7 specialized agents built on top of the existing AIService provider abstraction.
// Each agent has a unique system prompt, persistent conversation history, and
// works in Demo Mode using the MockProvider fallback.

import type { AgentId, AgentConfig, AgentConversation, AgentMessage, AgentUsageStat } from "./AgentTypes";
import { aiService } from "../AIService";
import { sanitizeText } from "../../validation/InputValidator";

const CONV_KEY  = "voxora-agent-conversations-v1";
const USAGE_KEY = "voxora-agent-usage-v1";
const MAX_CONV  = 100;

// ── Agent definitions ────────────────────────────────────────────────────────

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  ceo: {
    id: "ceo",
    name: "CEO Agent",
    title: "Chief Executive Officer",
    icon: "👔",
    color: "#6C63FF",
    systemPrompt: `You are an experienced CEO and strategic advisor working within Voxora. You think at the highest level — vision, company direction, board-level decisions, fundraising strategy, competitive positioning, and organisational leadership. Be decisive, data-informed, and action-oriented. Use structured thinking (frameworks, prioritisation matrices) when relevant. Always consider the long-term company health.`,
    capabilities: ["Strategic planning", "Board communication", "Vision & mission", "Fundraising", "Competitive analysis", "OKR setting"],
    suggestedPrompts: [
      "Create a 12-month strategic roadmap for my startup",
      "Help me prepare for a board meeting",
      "What should my company's North Star metric be?",
      "Analyse my competitive positioning and suggest a differentiation strategy",
    ],
  },
  marketing: {
    id: "marketing",
    name: "Marketing Agent",
    title: "Chief Marketing Officer",
    icon: "📣",
    color: "#f59e0b",
    systemPrompt: `You are a world-class CMO and growth marketer working within Voxora. You specialise in brand positioning, demand generation, content strategy, SEO, paid media, social media, email marketing, and go-to-market execution. You think in funnels, channels, conversion rates, and customer acquisition costs. Always tie marketing to measurable business outcomes.`,
    capabilities: ["Brand strategy", "Go-to-market", "Content planning", "SEO/SEM", "Email campaigns", "Social media", "Performance marketing"],
    suggestedPrompts: [
      "Build a complete go-to-market strategy for my product launch",
      "Create a content calendar for the next 30 days",
      "Help me write a high-converting email campaign sequence",
      "What's the best channel mix for a B2B SaaS with a $5k CAC budget?",
    ],
  },
  sales: {
    id: "sales",
    name: "Sales Agent",
    title: "Chief Sales Officer",
    icon: "🤝",
    color: "#10b981",
    systemPrompt: `You are an elite Sales leader and revenue strategist working within Voxora. You specialise in sales process design, pipeline management, outbound prospecting, demo scripts, objection handling, closing techniques, CRM optimisation, and revenue forecasting. You understand both PLG and sales-led growth motions. Focus on helping close deals and build repeatable revenue systems.`,
    capabilities: ["Sales process", "Pipeline management", "Cold outreach", "Demo scripts", "Objection handling", "Revenue forecasting", "CRM strategy"],
    suggestedPrompts: [
      "Write a cold outreach sequence for enterprise prospects",
      "Help me handle the 'too expensive' objection",
      "Design a sales process for a 30-day deal cycle",
      "Create a territory plan and quota model for a 5-person team",
    ],
  },
  finance: {
    id: "finance",
    name: "Finance Agent",
    title: "Chief Financial Officer",
    icon: "💰",
    color: "#3b82f6",
    systemPrompt: `You are a seasoned CFO and financial strategist working within Voxora. You specialise in financial modelling, cash flow management, unit economics, fundraising, runway planning, burn rate optimisation, pricing strategy, and investor reporting. You are rigorous with numbers, precise with assumptions, and always focused on capital efficiency and financial sustainability.`,
    capabilities: ["Financial modelling", "Cash flow planning", "Unit economics", "Pricing strategy", "Runway planning", "Investor reporting", "Burn rate"],
    suggestedPrompts: [
      "Build a 18-month financial model with three scenarios",
      "Calculate my unit economics and LTV:CAC ratio",
      "Help me prepare a financial report for investors",
      "What's my optimal pricing strategy given these costs?",
    ],
  },
  support: {
    id: "support",
    name: "Support Agent",
    title: "Customer Success Director",
    icon: "🎧",
    color: "#8b5cf6",
    systemPrompt: `You are an expert Customer Success and Support leader working within Voxora. You specialise in customer onboarding, retention strategy, churn prevention, support ticket resolution, knowledge base creation, NPS improvement, and customer health scoring. You balance empathy with efficiency, and always advocate for the customer while protecting business interests.`,
    capabilities: ["Customer onboarding", "Churn prevention", "Support scripts", "Knowledge base", "NPS improvement", "Customer health", "Escalation handling"],
    suggestedPrompts: [
      "Write a customer onboarding email sequence",
      "Create a support playbook for common product issues",
      "Help me design a churn prevention programme",
      "Draft a response to an angry enterprise customer",
    ],
  },
  hr: {
    id: "hr",
    name: "HR Agent",
    title: "Chief People Officer",
    icon: "👥",
    color: "#ec4899",
    systemPrompt: `You are an expert Chief People Officer and HR strategist working within Voxora. You specialise in talent acquisition, compensation design, performance management, culture building, team structure, employee engagement, org design, and people operations. You balance company needs with employee wellbeing and always approach people decisions with fairness and data.`,
    capabilities: ["Talent acquisition", "Compensation design", "Performance management", "Culture building", "Org design", "Employee engagement", "HR policies"],
    suggestedPrompts: [
      "Help me design a performance review process",
      "Write a job description for a Senior Full-Stack Engineer",
      "Create an employee onboarding plan for the first 90 days",
      "Design a compensation structure for a 10-person startup",
    ],
  },
  research: {
    id: "research",
    name: "Research Agent",
    title: "Head of Research & Intelligence",
    icon: "🔬",
    color: "#06b6d4",
    systemPrompt: `You are a rigorous research analyst and market intelligence expert working within Voxora. You specialise in primary and secondary market research, competitive intelligence, industry analysis, consumer behaviour, trend forecasting, and data synthesis. You structure insights clearly, cite assumptions explicitly, and always distinguish between validated data and informed hypotheses.`,
    capabilities: ["Market research", "Competitive intelligence", "Consumer behaviour", "Trend analysis", "Industry sizing", "Data synthesis", "Research design"],
    suggestedPrompts: [
      "Analyse the market opportunity for my product category",
      "Design a user research study to validate my hypothesis",
      "Create a competitive landscape analysis",
      "Summarise the key trends shaping my industry over the next 2 years",
    ],
  },
};

// ── Persistence helpers ───────────────────────────────────────────────────────

function loadConversations(): AgentConversation[] {
  try { return JSON.parse(localStorage.getItem(CONV_KEY) || "[]"); }
  catch { return []; }
}

function saveConversations(convs: AgentConversation[]): void {
  try { localStorage.setItem(CONV_KEY, JSON.stringify(convs.slice(0, MAX_CONV))); }
  catch { /* storage full */ }
}

function loadUsage(): AgentUsageStat[] {
  try { return JSON.parse(localStorage.getItem(USAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveUsage(stats: AgentUsageStat[]): void {
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(stats)); }
  catch { /* storage full */ }
}

function uid(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function recordUsage(agentId: AgentId): void {
  const stats = loadUsage();
  const idx = stats.findIndex((s) => s.agentId === agentId);
  if (idx === -1) {
    stats.push({ agentId, messagesTotal: 1, conversationsTotal: 0, lastUsedAt: Date.now() });
  } else {
    stats[idx] = { ...stats[idx], messagesTotal: stats[idx].messagesTotal + 1, lastUsedAt: Date.now() };
  }
  saveUsage(stats);
}

// ── Agent Service ─────────────────────────────────────────────────────────────

export const AgentService = {
  /** Return all agent configs. */
  getAgents(): AgentConfig[] {
    return Object.values(AGENT_CONFIGS);
  },

  getAgent(id: AgentId): AgentConfig | undefined {
    return AGENT_CONFIGS[id];
  },

  // ── Conversations ─────────────────────────────────────────────────────────

  getConversations(agentId?: AgentId): AgentConversation[] {
    const all = loadConversations().filter((c) => !c.archived);
    return agentId ? all.filter((c) => c.agentId === agentId) : all;
  },

  getConversation(id: string): AgentConversation | undefined {
    return loadConversations().find((c) => c.id === id);
  },

  createConversation(agentId: AgentId): AgentConversation {
    const agent = AGENT_CONFIGS[agentId];
    const now = Date.now();
    const conv: AgentConversation = {
      id: uid(),
      agentId,
      title: `${agent.name} — ${new Date(now).toLocaleDateString()}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
    const convs = loadConversations();
    saveConversations([conv, ...convs]);
    // bump conversation count in usage
    const stats = loadUsage();
    const idx = stats.findIndex((s) => s.agentId === agentId);
    if (idx === -1) {
      stats.push({ agentId, messagesTotal: 0, conversationsTotal: 1, lastUsedAt: now });
    } else {
      stats[idx] = { ...stats[idx], conversationsTotal: stats[idx].conversationsTotal + 1, lastUsedAt: now };
    }
    saveUsage(stats);
    return conv;
  },

  archiveConversation(id: string): void {
    const convs = loadConversations().map((c) => c.id === id ? { ...c, archived: true } : c);
    saveConversations(convs);
  },

  deleteConversation(id: string): void {
    saveConversations(loadConversations().filter((c) => c.id !== id));
  },

  // ── Messaging ─────────────────────────────────────────────────────────────

  /** Send a message to an agent and get a response. Returns updated conversation. */
  async sendMessage(conversationId: string, userInput: string): Promise<AgentConversation> {
    const convs = loadConversations();
    const idx = convs.findIndex((c) => c.id === conversationId);
    if (idx === -1) throw new Error(`Conversation ${conversationId} not found`);

    const conv = convs[idx];
    const agent = AGENT_CONFIGS[conv.agentId];

    // Sanitise input for security
    const sanitized = sanitizeText(userInput);
    if (!sanitized.trim()) throw new Error("Message cannot be empty");

    const userMsg: AgentMessage = {
      id: uid(),
      role: "user",
      content: sanitized,
      timestamp: Date.now(),
      agentId: conv.agentId,
    };

    // Build message history for context (last 20 messages)
    const historyMessages = conv.messages.slice(-20).map((m) => ({
      role: m.role === "agent" ? "assistant" as const : "user" as const,
      content: m.content,
    }));

    // Build prompt string from history + new message
    const historyText = historyMessages.length > 0
      ? historyMessages.map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`).join("\n") + "\n"
      : "";
    const fullPrompt = `${historyText}User: ${sanitized}`;

    // Call AI provider via existing AIService
    const response = await aiService.generate({
      prompt: fullPrompt,
      systemPrompt: agent.systemPrompt,
      temperature: 0.7,
      maxTokens: 1024,
      workspace: `agent_${conv.agentId}`,
      noCache: true,
    });

    const agentMsg: AgentMessage = {
      id: uid(),
      role: "agent",
      content: response.content,
      timestamp: Date.now(),
      agentId: conv.agentId,
    };

    // Auto-title from first user message
    const isFirstMessage = conv.messages.length === 0;
    const newTitle = isFirstMessage
      ? sanitized.slice(0, 60) + (sanitized.length > 60 ? "…" : "")
      : conv.title;

    const updatedConv: AgentConversation = {
      ...conv,
      title: newTitle,
      messages: [...conv.messages, userMsg, agentMsg],
      updatedAt: Date.now(),
    };

    convs[idx] = updatedConv;
    saveConversations(convs);
    recordUsage(conv.agentId);

    return updatedConv;
  },

  // ── Usage stats ───────────────────────────────────────────────────────────

  getUsage(): AgentUsageStat[] {
    return loadUsage();
  },

  getUsageForAgent(agentId: AgentId): AgentUsageStat {
    return loadUsage().find((s) => s.agentId === agentId) ?? {
      agentId,
      messagesTotal: 0,
      conversationsTotal: 0,
    };
  },

  getTotalMessages(): number {
    return loadUsage().reduce((sum, s) => sum + s.messagesTotal, 0);
  },

  getMostUsedAgent(): AgentConfig | undefined {
    const stats = loadUsage();
    if (stats.length === 0) return undefined;
    const top = stats.reduce((a, b) => a.messagesTotal >= b.messagesTotal ? a : b);
    return AGENT_CONFIGS[top.agentId];
  },
};
