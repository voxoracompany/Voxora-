// ── V8.2 AI Agents Workspace ──────────────────────────────────────────────────
import { memo, useState, useCallback, useEffect, useRef } from "react";
import { AgentService, AGENT_CONFIGS } from "../../services/ai/agents/AgentService";
import type { AgentId, AgentConversation, AgentConfig } from "../../services/ai/agents/AgentTypes";
import "./Workspace.css";

interface Props { setWorkspace: (w: string) => void }

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Agent Card (memoised) ─────────────────────────────────────────────────────
const AgentCard = memo(function AgentCard({
  agent, isSelected, convCount, onSelect,
}: {
  agent: AgentConfig;
  isSelected: boolean;
  convCount: number;
  onSelect: () => void;
}) {
  const usage = AgentService.getUsageForAgent(agent.id);
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        borderRadius: 12, border: isSelected ? `2px solid ${agent.color}` : "1px solid #e2e8f0",
        background: isSelected ? `${agent.color}15` : "#fff",
        cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 28 }}>{agent.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{agent.name}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{agent.title}</div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
          {usage.messagesTotal} messages · {convCount} conversations
        </div>
      </div>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: isSelected ? agent.color : "#e2e8f0", flexShrink: 0,
      }} />
    </button>
  );
});

// ── Message Bubble (memoised) ─────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({
  role, content, timestamp, agentColor,
}: {
  role: "user" | "agent";
  content: string;
  timestamp: number;
  agentColor: string;
}) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div style={{
        maxWidth: "80%", padding: "10px 14px", borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? agentColor : "#f1f5f9",
        color: isUser ? "#fff" : "#1e293b", fontSize: 14, lineHeight: 1.5,
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {content}
        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: isUser ? "right" : "left" }}>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
});

// ── Main Workspace ────────────────────────────────────────────────────────────
export default function AIAgents({ setWorkspace: _setWorkspace }: Props) {
  const agents = AgentService.getAgents();
  const [selectedAgent, setSelectedAgent] = useState<AgentId>("ceo");
  const [conversation, setConversation] = useState<AgentConversation | null>(null);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"chat" | "history">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentConfig = AGENT_CONFIGS[selectedAgent];

  const loadConversations = useCallback(() => {
    setConversations(AgentService.getConversations(selectedAgent));
  }, [selectedAgent]);

  useEffect(() => {
    loadConversations();
    setConversation(null);
    setInput("");
    setError(null);
  }, [selectedAgent, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleStartNew = useCallback(() => {
    const conv = AgentService.createConversation(selectedAgent);
    setConversation(conv);
    setConversations(AgentService.getConversations(selectedAgent));
    setPanel("chat");
    setInput("");
    setError(null);
  }, [selectedAgent]);

  const handleLoadConv = useCallback((id: string) => {
    const conv = AgentService.getConversation(id);
    if (conv) { setConversation(conv); setPanel("chat"); }
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    let activeConv = conversation;
    if (!activeConv) {
      activeConv = AgentService.createConversation(selectedAgent);
    }
    const text = input;
    setInput("");
    setIsLoading(true);
    setError(null);
    try {
      const updated = await AgentService.sendMessage(activeConv.id, text);
      setConversation(updated);
      loadConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get response. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversation, selectedAgent, loadConversations]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleArchive = useCallback((id: string) => {
    AgentService.archiveConversation(id);
    if (conversation?.id === id) setConversation(null);
    loadConversations();
  }, [conversation, loadConversations]);

  return (
    <div style={{ display: "flex", height: "100%", minHeight: 600, gap: 0 }}>
      {/* ── Left: Agent List ── */}
      <div style={{
        width: 260, flexShrink: 0, borderRight: "1px solid #e2e8f0",
        overflowY: "auto", padding: 16, background: "#fafafa",
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>🤖 AI Agents</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent === agent.id}
              convCount={AgentService.getConversations(agent.id).length}
              onSelect={() => setSelectedAgent(agent.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Right: Chat Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", gap: 12, background: "#fff",
        }}>
          <span style={{ fontSize: 24 }}>{agentConfig.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>{agentConfig.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{agentConfig.title}</div>
          </div>
          <button
            onClick={() => setPanel(panel === "chat" ? "history" : "chat")}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: panel === "history" ? agentConfig.color : "#f1f5f9",
              color: panel === "history" ? "#fff" : "#374151",
              border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {panel === "chat" ? "📋 History" : "💬 Chat"}
          </button>
          <button
            onClick={handleStartNew}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: agentConfig.color, color: "#fff",
              border: "none", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + New Chat
          </button>
        </div>

        {panel === "history" ? (
          /* ── History Panel ── */
          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>
              {agentConfig.name} Conversations ({conversations.length})
            </h3>
            {conversations.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", marginTop: 40 }}>
                No conversations yet. Start a new chat!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {conversations.map((conv) => (
                  <div key={conv.id} style={{
                    padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
                    background: "#fff", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {conv.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {conv.messages.length} messages · {formatRelative(conv.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadConv(conv.id)}
                      style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: agentConfig.color, color: "#fff", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >Open</button>
                    <button
                      onClick={() => handleArchive(conv.id)}
                      style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, background: "#f1f5f9", color: "#6b7280", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >Archive</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── Chat Panel ── */
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {!conversation || conversation.messages.length === 0 ? (
                /* Welcome / suggested prompts */
                <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center", paddingTop: 32 }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>{agentConfig.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{agentConfig.name}</h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                    Specialises in: {agentConfig.capabilities.join(", ")}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {agentConfig.suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSuggestedPrompt(prompt)}
                        style={{
                          padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                          background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0",
                          cursor: "pointer", textAlign: "left", lineHeight: 1.4, fontFamily: "inherit",
                          maxWidth: 280,
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                conversation.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role === "agent" ? "agent" : "user"}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    agentColor={agentConfig.color}
                  />
                ))
              )}
              {isLoading && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
                    background: "#f1f5f9", color: "#94a3b8", fontSize: 13,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ animation: "pulse 1.2s ease-in-out infinite" }}>●</span>
                    <span style={{ animation: "pulse 1.2s ease-in-out 0.2s infinite" }}>●</span>
                    <span style={{ animation: "pulse 1.2s ease-in-out 0.4s infinite" }}>●</span>
                    <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
                  </div>
                </div>
              )}
              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
                  color: "#dc2626", fontSize: 13, marginBottom: 12, border: "1px solid #fecaca",
                }}>
                  ⚠️ {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", background: "#fff" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${agentConfig.name}… (Enter to send, Shift+Enter for new line)`}
                  rows={2}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 14,
                    border: "1px solid #e2e8f0", fontFamily: "inherit", resize: "none",
                    outline: "none", lineHeight: 1.5, color: "#1e293b",
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  style={{
                    padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                    background: !input.trim() || isLoading ? "#e2e8f0" : agentConfig.color,
                    color: !input.trim() || isLoading ? "#9ca3af" : "#fff",
                    border: "none", cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.15s", whiteSpace: "nowrap",
                  }}
                >
                  {isLoading ? "Thinking…" : "Send →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
