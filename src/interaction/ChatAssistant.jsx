import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFormPrefill, refreshList } from "./interactionSlice";
import { sendChatMessage } from "../services/interactionApi";

const API_URL = "http://localhost:8000";

const greeting = "Hi! I'm your CRM assistant. Tell me about your HCP interaction — who did you meet, what was discussed, and how it went?";

function ChatAssistant() {
  const dispatch = useDispatch();
  const historyRef = useRef([]);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const msgs = historyRef.current;
  const allMessages = [{ role: "assistant", text: greeting }, ...msgs];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const clearLog = () => {
    historyRef.current = [];
    setCount((c) => c + 1);
  };

  const clearAll = async () => {
    historyRef.current = [];
    setCount((c) => c + 1);
    try {
      await fetch(`${API_URL}/interactions`, { method: "DELETE" });
    } catch {}
    dispatch(refreshList());
  };

  const handleSend = async () => {
    if (!text.trim() || loading) return;

    const userMsg = text;
    setText("");
    setLoading(true);

    try {
      const history = historyRef.current;
      const data = await sendChatMessage(userMsg, history);

      const result = data?.result;
      const parsed = typeof result === "string" ? JSON.parse(result) : result;
      const assistantReply =
        parsed?.messageToUser || JSON.stringify(parsed || data, null, 2);

      historyRef.current = [
        ...history,
        { role: "user", text: userMsg },
        { role: "assistant", text: assistantReply },
      ];

      if (parsed && parsed.hcpName && (parsed.status === "logged" || parsed.status === "updated")) {
        dispatch(setFormPrefill(parsed));
      }
      dispatch(refreshList());
    } catch (err) {
      historyRef.current = [
        ...historyRef.current,
        { role: "user", text: userMsg },
        { role: "assistant", text: "Error connecting to AI. Make sure the backend is running." },
      ];
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-card">
      <div className="chat-header-row">
        <div>
          <h3>AI Assistant</h3>
          <span className="chat-subtitle">Log interaction via chat</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="clear-btn" onClick={clearLog} type="button">Clear Chat</button>
          <button className="clear-all-btn" onClick={clearAll} type="button">Clear All</button>
        </div>
      </div>

      <div className="chat-box">
        {allMessages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant typing">Thinking...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          placeholder="Describe interaction..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading} className="log-btn">
          {loading ? "Thinking..." : <><span className="sparkle">&#x2728;</span> Log</>}
        </button>
      </div>
    </div>
  );
}

export default ChatAssistant;
