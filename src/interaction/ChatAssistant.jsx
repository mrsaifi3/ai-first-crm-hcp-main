import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFormPrefill, refreshList } from "./interactionSlice";
import { sendChatMessage, checkForm } from "../services/interactionApi";

const API_URL = "http://localhost:8000";

const greeting = "Hi! I'm your CRM assistant. Tell me about your HCP interaction — who did you meet, what was discussed, and how it went?";

function ChatAssistant() {
  const dispatch = useDispatch();
  const historyRef = useRef([]);
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
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

  const addAssistantMessage = (text) => {
    historyRef.current = [...historyRef.current, { role: "assistant", text }];
    setCount((c) => c + 1);
  };

  const handleCheckForm = async (formData) => {
    if (checking || !formData?.hcpName) return;
    setChecking(true);
    try {
      const res = await checkForm(formData);
      if (res?.messageToUser) {
        addAssistantMessage(res.messageToUser);
      }
    } catch {
      // silent
    } finally {
      setChecking(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || loading) return;

    const userMsg = text;
    setText("");
    setLoading(true);

    try {
      const history = historyRef.current;
      const data = await sendChatMessage(userMsg, history);

      // Try multiple paths to find parsed data
      let parsed = data?.result || data;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); } catch { parsed = {}; }
      }

      let assistantReply =
        parsed?.messageToUser || JSON.stringify(parsed || data, null, 2);
      if (!assistantReply.trim().endsWith("?") && !assistantReply.trim().endsWith("؟")) {
        const fallbacks = [
          " Is there anything else to add?",
          " Any other details?",
          " What else can I help with?",
        ];
        assistantReply += fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      historyRef.current = [
        ...history,
        { role: "user", text: userMsg },
        { role: "assistant", text: assistantReply },
      ];

      // Prefill form with any fields we can find
      const fillData = parsed && parsed.hcpName ? parsed : (data?.hcpName ? data : null);
      if (fillData && fillData.hcpName) {
        dispatch(setFormPrefill(fillData));
        setTimeout(() => handleCheckForm(fillData), 600);
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
