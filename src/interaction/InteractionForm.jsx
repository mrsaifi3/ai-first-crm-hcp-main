import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFormPrefill, refreshList } from "./interactionSlice";
import toast from "react-hot-toast";
import { submitInteraction, fetchSuggestions } from "../services/interactionApi";
import InfoTip from "./InfoTip";

const initialState = {
  hcpName: "",
  interactionType: "Meeting",
  date: "",
  time: "",
  attendees: "",
  topics: "",
  product: "",
  summary: "",
  materialsShared: "",
  samplesDistributed: "",
  sentiment: "Neutral",
  outcomes: "",
  followupActions: "",
};

const sentimentOptions = [
  {
    value: "Positive",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3"/><path d="M9 11C9.5 11 10.5 10.5 10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M19 11C18.5 11 17.5 10.5 17.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 17C9 17 11 20 14 20C17 20 19 17 19 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    value: "Neutral",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3"/><path d="M9 11C9.5 11 10.5 10.5 10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M19 11C18.5 11 17.5 10.5 17.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 17H19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
  {
    value: "Negative",
    icon: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.3"/><path d="M9 11C9.5 11 10.5 10.5 10.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M19 11C18.5 11 17.5 10.5 17.5 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 19C9 19 11 16 14 16C17 16 19 19 19 19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  },
];

const fieldInfo = {
  hcpName: "Name of the Healthcare Professional (doctor, specialist, etc.)",
  interactionType: "Type of interaction \u2013 Meeting, Call, or Email",
  date: "Date when the interaction took place",
  time: "Time when the interaction took place",
  attendees: "Other people present during the interaction",
  topics: "Key discussion points and topics covered during the interaction",
  materialsShared: "Documents, brochures, or materials provided to the HCP",
  samplesDistributed: "Product samples given to the HCP",
  sentiment: "Observed or inferred sentiment of the HCP during the interaction",
  outcomes: "Key outcomes, agreements, or decisions from the interaction",
  followupActions: "Next steps, tasks, or follow-up items",
  aiSuggestions: "AI-generated suggestions for follow-up actions based on the interaction",
};

export default function InteractionForm({ onSaved }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [showMaterialInput, setShowMaterialInput] = useState(false);
  const [showSampleInput, setShowSampleInput] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const formPrefill = useSelector((state) => state.interaction.formPrefill);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);

  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const normalizeTime = (value) => {
    if (!value) return "";
    const match = value.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) return value;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3]?.toUpperCase();
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
  };

  useEffect(() => {
    if (formPrefill) {
      const prefilled = { ...formPrefill };
      if (prefilled.date) prefilled.date = normalizeDate(prefilled.date);
      if (prefilled.time) prefilled.time = normalizeTime(prefilled.time);
      setFormData((prev) => ({ ...prev, ...prefilled }));
      dispatch(setFormPrefill(null));
    }
  }, [formPrefill, dispatch]);

  const loadSuggestions = useCallback(async (data) => {
    setSuggestionsLoading(true);
    try {
      const res = await fetchSuggestions(data);
      if (res?.status === "error" && res?.messageToUser) {
        toast.error(res.messageToUser);
        setSuggestions([]);
      } else if (res?.suggestions?.length) {
        setSuggestions(res.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!formData.hcpName && !formData.topics && !formData.outcomes) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSuggestions(formDataRef.current);
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formData.hcpName, formData.topics, formData.outcomes, formData.sentiment, loadSuggestions]);

  const handleChange = (e) => {
    const { name, value, tagName } = e.target;
    if (tagName === "TEXTAREA") {
      e.target.style.height = "auto";
      e.target.style.height = e.target.scrollHeight + "px";
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const normalizeDate = (value) => {
    const lower = value.toLowerCase().trim();
    const today = new Date();
    if (lower === "today") return today.toISOString().split("T")[0];
    if (lower === "tomorrow" || lower === "tom") {
      const d = new Date(today); d.setDate(d.getDate() + 1);
      return d.toISOString().split("T")[0];
    }
    if (lower === "yesterday" || lower === "yest") {
      const d = new Date(today); d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    }
    return value;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "date") {
      const converted = normalizeDate(value);
      if (converted !== value) setFormData((prev) => ({ ...prev, date: converted }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const normalized = { ...formData, date: normalizeDate(formData.date) };
    setFormData(normalized);
    try {
      await submitInteraction(normalized);
      toast.success("Interaction saved successfully");
      setFormData(initialState);
      if (onSaved) onSaved();
      dispatch(refreshList());
    } catch (err) {
      toast.error("Failed to save interaction");
    } finally {
      setLoading(false);
    }
  };

  const handleSentimentChange = (value) => {
    setFormData((prev) => ({ ...prev, sentiment: value }));
  };

  const handleVoiceNote = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice not supported. Use Chrome browser on localhost.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      toast.success("Speak now...", { duration: 3000 });
    };

    recognition.onspeechstart = () => {
      toast.success("Listening...", { duration: 2000 });
    };

    recognition.onresult = async (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (!transcript.trim()) return;
      recognition.stop();
      toast.success("Voice captured! Processing...");
      try {
        const { sendChatMessage } = await import("../services/interactionApi");
        const res = await sendChatMessage(transcript, []);
        const data = res?.result || res;
        const parsed = typeof data === "string" ? (() => { try { return JSON.parse(data); } catch { return {}; } })() : data;
        const extract = (obj) => (obj && typeof obj === "object" ? obj : {});
        const best = extract(parsed);
        const prefill = {};
        if (best.hcpName || best.hcp_name) prefill.hcpName = best.hcp_name || best.hcpName;
        if (best.interactionType) prefill.interactionType = best.interactionType;
        if (best.date) prefill.date = best.date;
        if (best.time) prefill.time = best.time;
        if (best.attendees) prefill.attendees = best.attendees;
        if (best.topics) prefill.topics = best.topics;
        if (best.materialsShared) prefill.materialsShared = best.materialsShared;
        if (best.samplesDistributed) prefill.samplesDistributed = best.samplesDistributed;
        if (best.sentiment) prefill.sentiment = best.sentiment;
        if (best.outcomes) prefill.outcomes = best.outcomes;
        if (best.followupActions) prefill.followupActions = best.followupActions;
        if (Object.keys(prefill).length > 0) {
          dispatch(setFormPrefill(prefill));
          toast.success("Form auto-filled from voice");
        } else {
          dispatch(setFormPrefill({ topics: transcript }));
          toast.success("Transcript added to topics");
        }
      } catch {
        dispatch(setFormPrefill({ topics: transcript }));
        toast.success("Transcript added to topics");
      }
    };

    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === "aborted") return;
      const msg = event.error;
      if (msg === "not-allowed") toast.error("Mic access denied. Allow mic in browser settings and refresh.");
      else if (msg === "no-speech") toast.error("No speech detected. Make sure mic is connected and speak clearly.");
      else if (msg === "network") toast.error("Network error. Check internet connection.");
      else toast.error("Voice error: " + msg + ". Try Chrome on desktop.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAddMaterial = (type) => {
    const val = prompt(`Enter ${type} details:`);
    if (val && val.trim()) {
      const key = type === "material" ? "materialsShared" : "samplesDistributed";
      setFormData((prev) => ({
        ...prev,
        [key]: prev[key] ? prev[key] + "; " + val.trim() : val.trim(),
      }));
    }
  };

  const handleAddSuggestion = (text) => {
    setFormData((prev) => ({
      ...prev,
      followupActions: prev.followupActions
        ? prev.followupActions + "\n" + text
        : text,
    }));
    toast.success("Added to follow-up actions");
  };

  return (
      <form className="form-layout" onSubmit={handleSubmit} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit(e); }}>
        <div className="form-group full-width">
          <label>HCP Name <InfoTip title="HCP Name" text={fieldInfo.hcpName} /></label>
          <input
            name="hcpName"
            placeholder="Search or select HCP..."
            value={formData.hcpName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Interaction Type <InfoTip title="Interaction Type" text={fieldInfo.interactionType} /></label>
          <select name="interactionType" value={formData.interactionType} onChange={handleChange}>
            <option>Meeting</option>
            <option>Call</option>
            <option>Email</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date <InfoTip title="Date" text={fieldInfo.date} /></label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} onBlur={handleBlur} />
        </div>

        <div className="form-group">
          <label>Time <InfoTip title="Time" text={fieldInfo.time} /></label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} />
        </div>

        <div className="form-group full-width">
          <label>Attendees <InfoTip title="Attendees" text={fieldInfo.attendees} /></label>
          <input
            name="attendees"
            placeholder="Enter names or search..."
            value={formData.attendees}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label>Topics Discussed <InfoTip title="Topics Discussed" text={fieldInfo.topics} /></label>
          <div className="textarea-with-mic">
            <textarea
              name="topics"
              placeholder="Enter key discussion points..."
              value={formData.topics}
              onChange={handleChange}
            />
            <button type="button" className={`mic-icon-btn ${listening ? "active" : ""}`} title={listening ? "Stop recording" : "Use voice input"} onClick={handleVoiceNote}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M3.5 8.5C3.5 11.5 6 14 9 14C12 14 14.5 11.5 14.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M9 14V17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <button type="button" className={`voice-note-btn ${listening ? "listening" : ""}`} onClick={handleVoiceNote}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V8M8 8L5.5 5.5M8 8L10.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.5 8.5C3.5 11 5.5 13 8 13C10.5 13 12.5 11 12.5 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M8 13V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {listening ? "Listening... Tap to stop" : "Summarize from Voice Note"}
          </button>
        </div>

        <div className="form-section">
          <span className="form-section-label">Materials Shared / Samples Distributed</span>
          <span className="form-section-line"></span>
        </div>

        <div className="form-group full-width">
          <div className="material-row">
            <div className="material-label">
              <strong>Materials Shared <InfoTip title="Materials Shared" text={fieldInfo.materialsShared} /></strong>
              <span className="material-status">
                {formData.materialsShared || "No materials added."}
              </span>
            </div>
            <button type="button" className="add-btn" onClick={() => handleAddMaterial("material")}>
              &#x1F50D; Search/Add
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <div className="material-row">
            <div className="material-label">
              <strong>Samples Distributed <InfoTip title="Samples Distributed" text={fieldInfo.samplesDistributed} /></strong>
              <span className="material-status">
                {formData.samplesDistributed || "No samples added."}
              </span>
            </div>
            <button type="button" className="add-btn" onClick={() => handleAddMaterial("sample")}>
              &#x1F4E6; Add Sample
            </button>
          </div>
        </div>

        <div className="form-section">
          <span className="form-section-label">Observed/Inferred HCP Sentiment <InfoTip title="HCP Sentiment" text={fieldInfo.sentiment} /></span>
          <span className="form-section-line"></span>
        </div>

        <div className="form-group full-width">
          <div className="sentiment-row">
            {sentimentOptions.map((opt) => (
              <label
                key={opt.value}
                className={`sentiment-option ${formData.sentiment === opt.value ? "selected" : ""}`} data-value={opt.value}
              >
                <input
                  type="radio"
                  name="sentiment"
                  value={opt.value}
                  checked={formData.sentiment === opt.value}
                  onChange={() => handleSentimentChange(opt.value)}
                />
                <span className="sentiment-emoji">{opt.icon}</span>
                <span className="sentiment-label">{opt.value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <span className="form-section-label">Outcomes &amp; Follow-ups</span>
          <span className="form-section-line"></span>
        </div>

        <div className="form-group full-width">
          <label>Outcomes <InfoTip text={fieldInfo.outcomes} /></label>
          <textarea
            name="outcomes"
            placeholder="Key outcomes or agreements..."
            value={formData.outcomes}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label>Follow-up Actions <InfoTip title="Follow-up Actions" text={fieldInfo.followupActions} /></label>
          <textarea
            name="followupActions"
            placeholder="Enter next steps or tasks..."
            value={formData.followupActions}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label>AI Suggested Follow-ups <InfoTip title="AI Suggestions" text={fieldInfo.aiSuggestions} /></label>
          <div className="ai-suggestions-header">
            <span>AI Suggested</span>
            <button type="button" className="refresh-suggestions-btn" onClick={() => { if (debounceRef.current) clearTimeout(debounceRef.current); loadSuggestions(formDataRef.current); }} title="Refresh suggestions">
              &#x21BB;
            </button>
          </div>
          <div className="ai-suggestions">
            {suggestionsLoading ? (
              <div className="suggestions-loading">Generating suggestions...</div>
            ) : suggestions.length === 0 ? (
              <div className="suggestions-empty">Fill in HCP name, topics, or outcomes to get AI suggestions.</div>
            ) : (
              suggestions.map((text, i) => (
                <div key={i} className="suggestion-item">
                  <span
                    className="suggestion-text"
                    onClick={() => handleAddSuggestion(text)}
                    title="Click to add"
                  >
                    {text}
                  </span>
                  <button
                    type="button"
                    className="add-suggestion-btn"
                    onClick={() => handleAddSuggestion(text)}
                    title="Add to follow-up actions"
                  >
                    +
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group full-width submit-row">
          <div className="submit-btn-row">
            <button type="submit" className="submit-btn ripple-btn" disabled={loading}>
              {loading ? "Saving..." : "Submit Interaction"}
            </button>
            <button type="button" className="clear-form-btn ripple-btn dark-ripple" onClick={() => { setFormData(initialState); toast.success("Form cleared"); }}>
              Clear
            </button>
          </div>
        </div>
      </form>
  );
}
