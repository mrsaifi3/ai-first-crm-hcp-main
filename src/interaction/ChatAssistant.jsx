import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { setFormPrefill } from "./interactionSlice";
import { sendChatMessage } from "../services/interactionApi";

function ChatAssistant() {
  const dispatch = useDispatch();
  const historyRef = useRef([]);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Log interaction details here (e.g., 'Met Dr. Smith, discussed hypertension drug, positive sentiment on 9th July at 11am') or ask for summary, follow-up, or compliance check.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || loading) return;

    const userMsg = text;
    setText("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = historyRef.current;
      const data = await sendChatMessage(userMsg, history);

      const result = data?.result;
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      const assistantReply =
        parsed?.messageToUser || JSON.stringify(parsed || data, null, 2);

      setMessages((prev) => [...prev, { role: "assistant", text: assistantReply }]);

      historyRef.current = [
        ...history,
        { role: "user", text: userMsg },
        { role: "assistant", text: assistantReply },
      ];

      if (parsed && parsed.hcpName) {
        dispatch(setFormPrefill(parsed));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Error connecting to AI. Make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-card">
      <h3>AI Assistant</h3>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant">Thinking...</div>}
      </div>

      <div className="chat-input">
        <input
          placeholder="Describe interaction..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatAssistant;
