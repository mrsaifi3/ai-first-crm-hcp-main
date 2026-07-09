import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFormPrefill } from "./interactionSlice";
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
  { value: "Positive", emoji: "\u{1F642}" },
  { value: "Neutral", emoji: "\u{1F610}" },
  { value: "Negative", emoji: "\u{1F641}" },
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

export default function InteractionForm() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [showMaterialInput, setShowMaterialInput] = useState(false);
  const [showSampleInput, setShowSampleInput] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const formPrefill = useSelector((state) => state.interaction.formPrefill);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (formPrefill) {
      setFormData((prev) => ({ ...prev, ...formPrefill }));
      dispatch(setFormPrefill(null));
    }
  }, [formPrefill, dispatch]);

  const loadSuggestions = useCallback(async (data) => {
    if (!data.hcpName && !data.topics && !data.outcomes) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const res = await fetchSuggestions(data);
      setSuggestions(res.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadSuggestions(formData);
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [formData.hcpName, formData.topics, formData.outcomes, formData.sentiment, loadSuggestions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitInteraction(formData);
      toast.success("Interaction saved successfully");
      setFormData(initialState);
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
    toast.success("Voice recording started... (demo)");
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
    <div className="form-card">
      <h2>Interaction Details</h2>

      <form onSubmit={handleSubmit}>
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
          <input type="date" name="date" value={formData.date} onChange={handleChange} />
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
            <button type="button" className="mic-icon-btn" title="Use voice input" onClick={handleVoiceNote}>
              &#x1F3A4;
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <button type="button" className="voice-note-btn" onClick={handleVoiceNote}>
            <span className="sparkle">&#x2728;</span> Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        <div className="section-divider full-width">
          <span>Materials Shared / Samples Distributed</span>
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

        <div className="section-divider full-width">
          <span>Observed/Inferred HCP Sentiment <InfoTip title="HCP Sentiment" text={fieldInfo.sentiment} /></span>
        </div>

        <div className="form-group full-width">
          <div className="sentiment-row">
            {sentimentOptions.map((opt) => (
              <label
                key={opt.value}
                className={`sentiment-option ${formData.sentiment === opt.value ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="sentiment"
                  value={opt.value}
                  checked={formData.sentiment === opt.value}
                  onChange={() => handleSentimentChange(opt.value)}
                />
                <span className="sentiment-emoji">{opt.emoji}</span>
                <span className="sentiment-label">{opt.value}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="section-divider full-width">
          <span>Outcomes &amp; Follow-ups</span>
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
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Saving..." : "Submit Interaction"}
          </button>
        </div>
      </form>
    </div>
  );
}
