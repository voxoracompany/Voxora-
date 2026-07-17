import { useEffect, useRef, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useActivity } from "../../context/ActivityContext";
import { useToast } from "../../context/ToastContext";
import "./AIAssistant.css";

type Message = { sender: "user" | "voxora"; text: string };

export default function AIAssistant({ setWorkspace }: { setWorkspace: (workspace: string) => void }) {
  const { saveProject } = useProjects();
  const { addActivity } = useActivity();
  const { showToast } = useToast();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    try { return JSON.parse(localStorage.getItem("voxora-chat") || "[]"); } catch { return []; }
  });
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("voxora-chat", JSON.stringify(messages));
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const askAI = () => {
    if (!question.trim()) return;

    const currentCount = Number(localStorage.getItem("voxora-chat-count")) || 0;
    localStorage.setItem("voxora-chat-count", String(currentCount + 1));

    const userName = localStorage.getItem("voxora-name") || "there";
    const userGoal = localStorage.getItem("voxora-goal") || "building better products";

    const userMessage: Message = { sender: "user", text: question };
    const aiMessage: Message = {
      sender: "voxora",
      text: `Hello ${userName} 👋\n\nYour current goal: ${userGoal}\n\nBased on "${question}", here are ideas focused on your objectives, customer needs, market opportunities, and possible solutions.\n\nKey considerations:\n• Understand your target customer's pain points deeply\n• Validate before building — talk to 10 potential customers first\n• Start with the smallest version that delivers real value\n• Iterate based on feedback, not assumptions`,
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setQuestion("");

    addActivity({
      type: "ai_chat",
      title: "AI Conversation",
      description: `Asked Voxora AI: "${question.slice(0, 60)}${question.length > 60 ? "…" : ""}"`,
      category: "AI",
      icon: "🤖",
    });
  };

  const saveConversation = (msg: Message) => {
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
    showToast("Chat cleared.", "info");
  };

  return (
    <div className="ai-container">
      <button onClick={() => setWorkspace("dashboard")}>← Back to Dashboard</button>
      <h1>🤖 Voxora AI Assistant</h1>
      <p>Ask Voxora about ideas, customers, and business opportunities.</p>

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
            <p style={{ whiteSpace: "pre-wrap" }}>{message.text}</p>
            {message.sender === "voxora" && (
              <button onClick={() => saveConversation(message)}>💾 Save Conversation</button>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          placeholder="Ask Voxora AI..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
        />
        <button onClick={askAI}>Ask AI</button>
      </div>

      {messages.length > 0 && (
        <div className="chat-actions">
          <button onClick={clearChat}>🗑 Clear Chat</button>
        </div>
      )}
    </div>
  );
}
