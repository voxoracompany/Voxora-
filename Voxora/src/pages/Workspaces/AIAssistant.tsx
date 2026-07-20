// ── V4.1 AI Engine — AI Assistant Workspace ──────────────────────────────────
import { useEffect, useRef, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast }    from "../../context/ToastContext";
import { useAI }       from "../../hooks/useAI";
import DemoBanner      from "../../components/DemoBanner";
import { AIMemory }    from "../../services/ai/AIMemory";
import type { AIMessage } from "../../services/ai/types/AITypes";
import "./AIAssistant.css";

type DisplayMessage = { sender: "user" | "voxora"; text: string; streaming?: boolean };

export default function AIAssistant({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast }   = useToast();
  const { chatStream, isLoading, isDemoMode } = useAI("assistant");

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem("voxora-chat") || "[]"); } catch { return []; }
  });
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storable = messages.filter(m => !m.streaming);
    localStorage.setItem("voxora-chat", JSON.stringify(storable));
    if (chatBoxRef.current) chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [messages]);

  const askAI = async () => {
    if (!question.trim() || isLoading) return;

    const userMsg: DisplayMessage = { sender: "user", text: question };
    const placeholder: DisplayMessage = { sender: "voxora", text: "", streaming: true };

    setMessages(prev => [...prev, userMsg, placeholder]);
    const asked = question;
    setQuestion("");

    // Build message history for multi-turn context
    const history: AIMessage[] = messages
      .filter(m => !m.streaming)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));
    history.push({ role: "user", content: asked });

    let accumulated = "";

    await chatStream(history, (chunk) => {
      accumulated += chunk;
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.streaming) {
          updated[lastIdx] = { sender: "voxora", text: accumulated, streaming: true };
        }
        return updated;
      });
    });

    // Finalise the streaming message
    setMessages(prev => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]?.streaming) {
        updated[lastIdx] = { sender: "voxora", text: accumulated };
      }
      return updated;
    });

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
      type: "ai_chat",
      title: "AI Conversation",
      description: `Asked Voxora AI: "${asked.slice(0, 60)}${asked.length > 60 ? "…" : ""}"`,
      category: "AI",
      icon: "🤖",
    });
  };

  const saveConversation = (msg: DisplayMessage) => {
    saveProject({
      id: Date.now().toString(),
      title: `AI Chat — ${new Date().toLocaleDateString()}`,
      category: "AI Assistant",
      createdAt: new Date().toISOString(),
      notes: msg.text,
    });
    showToast("💾 Conversation saved to projects!");
  };

  const clearChat = () => {
    setMessages([]);
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
          <div key={index} className={`message ${message.sender === "user" ? "user-message" : "voxora-message"}`}>
            <strong>{message.sender === "user" ? "You:" : "Voxora AI:"}</strong>
            {message.streaming
              ? <p style={{ whiteSpace: "pre-wrap" }}>{message.text}<span className="ai-cursor">▋</span></p>
              : <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
            }
            {message.sender === "voxora" && !message.streaming && (
              <button onClick={() => saveConversation(message)}>💾 Save Conversation</button>
            )}
          </div>
        ))}
        {isLoading && messages.at(-1)?.streaming && messages.at(-1)?.text === "" && (
          <div className="voxora-message message">
            <strong>Voxora AI:</strong>
            <p className="ai-thinking">⏳ Thinking…</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          placeholder="Ask Voxora AI..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && askAI()}
          disabled={isLoading}
        />
        <button onClick={askAI} disabled={isLoading || !question.trim()}>
          {isLoading ? "⏳" : "Ask AI"}
        </button>
      </div>

      {messages.length > 0 && (
        <div className="chat-actions">
          <button onClick={clearChat}>🗑 Clear Chat</button>
        </div>
      )}

      <style>{`
        .ai-cursor { animation: blink .7s step-end infinite; }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        .ai-thinking { color: #9ca3af; font-style: italic; }
      `}</style>
    </div>
  );
}
