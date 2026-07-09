import { useState } from "react";

function ChatAssistant() {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    // VERY SIMPLE NLP (safe & predictable)
    const data = {};

    if (text.toLowerCase().includes("dr")) {
      data.hcpName = text.match(/dr\.?\s+\w+/i)?.[0] || "";
    }

    if (text.toLowerCase().includes("drug")) {
      data.product = "Discussed drug";
    }

    data.summary = text;

    // Emit custom event to form
    window.dispatchEvent(
      new CustomEvent("ai-fill-form", { detail: data })
    );

    setText("");
  };

  return (
    <div className="chat-card">
      <h3>🤖 AI Assistant</h3>

      <div className="chat-bubble">
        Log interaction details here (e.g., "Met Dr. Smith, discussed
        hypertension drug, positive sentiment on 9th July at 11am") or ask for help.
      </div>

      <div className="chat-input">
        <input
          placeholder="Describe interaction..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatAssistant;
