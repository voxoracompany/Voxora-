// ── V5.2 AI Engine — AI Assistant Workspace ──────────────────────────────────
import { useEffect, useRef, useState, useCallback } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import { AIMemory }    from "../../services/ai/AIMemory";
import type { AIMessage } from "../../services/ai/types/AITypes";
import "./AIAssistant.css";

type DisplayMessage = {
  sender:    "user" | "voxora";
  text:      string;
  streaming?: boolean;
  timestamp: number;   // V5.2 — epoch ms
  failed?:   boolean;  // V5.2 — marks a failed response
  retryPrompt?: string; // V5.2 — original prompt for retry
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIAssistant({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { chatStream, isLoading, isDemoMode, error, clearError } = useAI("assistant");

  const [question,    setQuestion]    = useState("");
  const [lastHistory, setLastHistory] = useState<AIMessage[]>([]); // V5.2 — for retry
  const [messages, setMessages] = useState<DisplayMessage[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("voxora-chat") || "[]");
      // Migrate old messages without timestamp
      return raw.map((m: Omit<DisplayMessage, "timestamp"> & { timestamp?: number }) => ({
        ...m,
        timestamp: m.timestamp ?? Date.now(),
      }));
    } catch { return []; }
  });
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storable = messages.filter(m => !m.streaming);
    localStorage.setItem("voxora-chat", JSON.stringify(storable));
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  // ── Core ask function ─────────────────────────────────────────────────────
  const askAI = useCallback(async (
    asked: string,
    history: AIMessage[],
  ) => {
    clearError();
    const userMsg: DisplayMessage = { sender: "user",   text: asked,  timestamp: Date.now() };
    const placeholder: DisplayMessage = { sender: "voxora", text: "", timestamp: Date.now(), streaming: true };

    setMessages(prev => [...prev, userMsg, placeholder]);

    let accumulated = "";

    await chatStream(history, (chunk) => {
      accumulated += chunk;
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.streaming) {
          updated[lastIdx] = { sender: "voxora", text: accumulated, timestamp: updated[lastIdx].timestamp, streaming: true };
        }
        return updated;
      });
    });

    const didFail = !accumulated;

    // Finalise the streaming message
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.streaming) {
        updated[lastIdx] = {
          sender:      "voxora",
          text:        didFail ? "⚠️ AI request failed. Please try again." : accumulated,
          timestamp:   updated[lastIdx].timestamp,
          failed:      didFail,
          retryPrompt: didFail ? asked : undefined,
        };
      }
      return updated;
    });

    if (!didFail) {
      // Track usage
      const count = Number(localStorage.getItem("voxora-chat-count")) || 0;
      localStorage.setItem("voxora-chat-count", String(count + 1));

      // Save to AIMemory
      if (AIMemory.getAll().length === 0 || !localStorage.getItem("voxora-active-conv")) {
        const conv = AIMemory.create("assistant");
        localStorage.setItem("voxora-active-conv", conv.id);
      }
      const convId = localStorage.getItem("voxora-active-conv") || "";
      if (convId) {
        AIMemory.addMessage(convId, { role: "user",      content: asked });
        AIMemory.addMessage(convId, { role: "assistant", content: accumulated });
        AIMemory.addRecentPrompt(asked, "assistant");
      }

      addActivity({
        type:        "ai_chat",
        title:       "AI Conversation",
        description: `Asked Voxora AI: "${asked.slice(0, 60)}${asked.length > 60 ? "…" : ""}"`,
        category:    "AI",
        icon:        "🤖",
      });
    }
  }, [chatStream, clearError, addActivity]);

  // ── Send new message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!question.trim() || isLoading) return;

    const history: AIMessage[] = messages
      .filter(m => !m.streaming && !m.failed)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: question });

    setLastHistory(history);
    const asked = question;
    setQuestion("");
    await askAI(asked, history);
  };

  // ── Retry last failed message ─────────────────────────────────────────────
  const handleRetry = useCallback(async (retryPrompt: string) => {
    // Remove the failed message pair (user + failed assistant)
    setMessages(prev => {
      const updated = [...prev];
      // Remove trailing failed assistant message
      if (updated.at(-1)?.failed) updated.pop();
      // Remove trailing user message if it matches
      if (updated.at(-1)?.sender === "user" && updated.at(-1)?.text === retryPrompt) updated.pop();
      return updated;
    });

    const history: AIMessage[] = messages
      .filter(m => !m.streaming && !m.failed)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: retryPrompt });
    setLastHistory(history);
    await askAI(retryPrompt, history);
  }, [messages, askAI]);

  const saveConversation = (msg: DisplayMessage) => {
    saveProject({
      id:        Date.now().toString(),
      title:     `AI Chat — ${new Date().toLocaleDateString()}`,
      category:  "AI Assistant",
      createdAt: new Date().toISOString(),
      notes:     msg.text,
    });
    showToast("💾 Conversation saved to projects!");
  };

  const clearChat = () => {
    setMessages([]);
    setLastHistory([]);
    localStorage.removeItem("voxora-chat");
    localStorage.removeItem("voxora-active-conv");
    showToast("Chat cleared.", "info");
  };

  return (
    <div className="ai-container">
      <button onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🤖 Voxora AI Assistant</h1>
      <p>Ask Voxora about ideas, customers, and business opportunities.</p>

      {isDemoMode && (
        <DemoBanner onConfigure={() => setWorkspace("aiSettings")} />
      )}

      {messages.length === 0 && (
        <div className="workspace-empty" style={{ margin: "20px 0" }}>
          <div className="workspace-empty-icon">🤖</div>
          <p>Ask Voxora anything about your startup, product, or business strategy.</p>
        </div>
      )}

      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === "user" ? "user-message" : "voxora-message"} ${message.failed ? "message-failed" : ""}`}>
            <div className="message-header">
              <strong>{message.sender === "user" ? "You" : "Voxora AI"}</strong>
              <span className="message-timestamp">{formatTime(message.timestamp)}</span>
            </div>

            {message.streaming
              ? <p style={{ whiteSpace: "pre-wrap" }}>{message.text}<span className="ai-cursor">▋</span></p>
              : <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
            }

            {/* Loading dots when streaming starts but no content yet */}
            {message.streaming && message.text === "" && (
              <div className="ai-typing-indicator">
                <span /><span /><span />
              </div>
            )}

            {message.sender === "voxora" && !message.streaming && !message.failed && (
              <button className="chat-action-btn" onClick={() => saveConversation(message)}>💾 Save</button>
            )}

            {message.failed && message.retryPrompt && (
              <button
                className="chat-action-btn retry-btn"
                onClick={() => handleRetry(message.retryPrompt!)}
                disabled={isLoading}
              >
                🔄 Retry
              </button>
            )}
          </div>
        ))}

        {/* Global error banner for non-streaming errors */}
        {error && !isLoading && (
          <div className="chat-error-banner">
            ⚠️ {error}
            <button onClick={() => handleRetry(lastHistory.at(-1)?.content ?? "")} disabled={!lastHistory.length}>
              🔄 Retry
            </button>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          placeholder="Ask Voxora AI..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !question.trim()}>
          {isLoading ? <span className="btn-spinner" /> : "Ask AI"}
        </button>
      </div>

      {messages.length > 0 && (
        <div className="chat-actions">
          <button onClick={clearChat}>🗑 Clear Chat</button>
        </div>
      )}

      <style>{`
        /* V5.2 — message header with timestamp */
        .message-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
        .message-timestamp { font-size: 11px; color: #9ca3af; font-weight: 400; }
        .message-failed { border-left: 3px solid #ef4444 !important; opacity: .9; }

        /* Streaming cursor */
        .ai-cursor { animation: blink .7s step-end infinite; }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }

        /* Typing indicator */
        .ai-typing-indicator { display: flex; gap: 5px; padding: 4px 0; }
        .ai-typing-indicator span {
          width: 8px; height: 8px; border-radius: 50%; background: #6C63FF;
          animation: bounce .9s infinite; flex-shrink: 0;
        }
        .ai-typing-indicator span:nth-child(2) { animation-delay: .15s; }
        .ai-typing-indicator span:nth-child(3) { animation-delay: .30s; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0) } 30% { transform: translateY(-6px) } }

        /* In-message action buttons */
        .chat-action-btn {
          margin-top: 8px; padding: 4px 12px; font-size: 12px;
          border-radius: 7px; border: 1.5px solid #d1d5db;
          background: transparent; cursor: pointer; transition: all .15s;
        }
        .chat-action-btn:hover { border-color: #6C63FF; color: #6C63FF; }
        .retry-btn { border-color: #ef4444; color: #ef4444; margin-left: 6px; }
        .retry-btn:hover { background: #ef4444; color: #fff; }
        .retry-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* Error banner */
        .chat-error-banner {
          display: flex; align-items: center; gap: 10px; justify-content: space-between;
          background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: #dc2626;
        }
        .chat-error-banner button {
          padding: 4px 12px; border-radius: 7px; border: 1.5px solid #dc2626;
          background: transparent; color: #dc2626; cursor: pointer; font-size: 12px;
        }
        .chat-error-banner button:hover { background: #dc2626; color: #fff; }

        /* Send button spinner */
        .btn-spinner {
          display: inline-block; width: 14px; height: 14px;
          border: 2.5px solid rgba(255,255,255,.4); border-top-color: #fff;
          border-radius: 50%; animation: spin .7s linear infinite; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        [data-theme="dark"] .message-timestamp { color: #6b7280; }
        [data-theme="dark"] .chat-error-banner { background: #450a0a; border-color: #7f1d1d; color: #fca5a5; }
        [data-theme="dark"] .chat-action-btn { border-color: #374151; color: #9ca3af; }
        [data-theme="dark"] .chat-action-btn:hover { border-color: #7c6fd4; color: #a5b4fc; }
      `}</style>
    </div>
  );
}
