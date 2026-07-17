import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import "./AIAssistant.css";

interface AIAssistantProps {
  setWorkspace: (workspace: string) => void;
}

type Message = {
  sender: "user" | "voxora";
  text: string;
};

export default function AIAssistant({
  setWorkspace,
}: AIAssistantProps) {
  const { saveProject } = useProjects();

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages =
      localStorage.getItem("voxora-chat");

    return savedMessages
      ? JSON.parse(savedMessages)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "voxora-chat",
      JSON.stringify(messages)
    );
  }, [messages]);

  const askAI = () => {
    if (!question.trim()) return;

    const currentCount =
      Number(
        localStorage.getItem(
          "voxora-chat-count"
        )
      ) || 0;

    localStorage.setItem(
      "voxora-chat-count",
      String(currentCount + 1)
    );

    const userName =
      localStorage.getItem("voxora-name") ||
      "there";

    const userGoal =
      localStorage.getItem("voxora-goal") ||
      "building better products";

    const userMessage: Message = {
      sender: "user",
      text: question,
    };

    const aiMessage: Message = {
      sender: "voxora",
      text: `Hello ${userName} 👋

Your current goal:
${userGoal}

Based on "${question}", here are ideas focused on your objectives, customer needs, market opportunities, and possible solutions.`,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      aiMessage,
    ]);

    setQuestion("");
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(
      "voxora-chat"
    );
  };

  return (
    <div className="ai-container">

      <button
        onClick={() =>
          setWorkspace("dashboard")
        }
      >
        ← Back to Dashboard
      </button>

      <h1>
        🤖 Voxora AI Assistant
      </h1>

      <p>
        Ask Voxora about ideas,
        customers, and business
        opportunities.
      </p>

      <div className="chat-box">

        {messages.map((message, index) => (

          <div
            key={index}
            className={
              message.sender === "user"
                ? "message user-message"
                : "message voxora-message"
            }
          >

            <strong>
              {message.sender === "user"
                ? "You:"
                : "Voxora AI:"}
            </strong>

            <p>
              {message.text}
            </p>

            {message.sender ===
              "voxora" && (

              <button
                onClick={() => {

                  saveProject({
                    id: Date.now().toString(),
                    title: `AI Chat - ${new Date().toLocaleDateString()}`,
                    category: "AI Assistant",
                    createdAt: new Date().toISOString(),
                    notes: message.text,
                  });

                  alert(
                    "✅ Conversation saved to Saved Projects!"
                  );

                }}
              >
                💾 Save Conversation
              </button>

            )}

          </div>

        ))}

      </div>

      <div className="chat-input">

        <input
          placeholder="Ask Voxora AI..."
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
        />

        <button
          onClick={askAI}
        >
          Ask AI
        </button>

      </div>

      <div className="chat-actions">

        <button
          onClick={clearChat}
        >
          Clear Chat
        </button>

      </div>

    </div>
  );
}