import { useState } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Log interaction details here (e.g., 'Met Dr. Smith, discussed hypertension drug, positive sentiment') or ask for help.",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: message },
      {
        role: "assistant",
        text: "Thanks! This will be analyzed by AI once backend is connected.",
      },
    ]);

    setMessage("");
  };

  return (
    <div className="chat-card">
      <h3>🤖 AI Assistant</h3>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.role === "user" ? "chat-user" : "chat-ai"}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Describe interaction..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default AIChat;
