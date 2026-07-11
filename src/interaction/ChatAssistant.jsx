import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFormPrefill, refreshList } from "./interactionSlice";
import { sendChatMessage, checkForm } from "../services/interactionApi";
import toast from "react-hot-toast";

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

      // Show error toast if Groq failed
      if (parsed?.status === "error" && parsed?.messageToUser) {
        toast.error(parsed.messageToUser);
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

      // Prefill form — try every possible path to find HCP data
      const extract = (obj) =>
        obj && typeof obj === "object" ? obj : {};
      const toolResult = extract(data?.result);
      const topLevel = extract(data);

      // Pick the object that has hcpName
      const best =
        toolResult.hcpName || toolResult.hcp_name
          ? toolResult
          : topLevel.hcpName || topLevel.hcp_name
          ? topLevel
          : null;

      if (best) {
        const prefill = { ...best };
        if (best.hcp_name && !best.hcpName) prefill.hcpName = best.hcp_name;
        console.log("Dispatching formPrefill:", JSON.stringify(prefill).slice(0, 300));
        dispatch(setFormPrefill(prefill));
        toast.success("Form updated: " + (prefill.hcpName || "?"));
        setTimeout(() => handleCheckForm(prefill), 600);
      } else {
        console.log("No HCP data found in response:", JSON.stringify(data).slice(0, 500));
        toast.error("Could not extract HCP data from response");
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
    <div className="chat-wrapper">
      <div className="chat-actions chat-actions-inline">
        <button className="chat-btn ripple-btn dark-ripple" onClick={clearLog} type="button">Clear Chat</button>
        <button className="chat-btn danger ripple-btn dark-ripple" onClick={clearAll} type="button">Clear All</button>
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

      <div className="chat-input-bar">
        <input
          placeholder="Describe interaction..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={loading} className="send-btn ripple-btn">
          {loading ? "Thinking..." : <>Send</>}
        </button>
      </div>
    </div>
  );
}

export default ChatAssistant;
