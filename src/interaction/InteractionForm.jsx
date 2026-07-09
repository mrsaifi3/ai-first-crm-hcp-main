import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFormPrefill } from "./interactionSlice";
import toast from "react-hot-toast";
import { submitInteraction } from "../services/interactionApi";

const initialState = {
  hcpName: "",
  interactionType: "Meeting",
  date: "",
  time: "",
  attendees: "",
  topics: "",
  product: "",
  summary: "",
};

export default function InteractionForm() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const formPrefill = useSelector((state) => state.interaction.formPrefill);

  useEffect(() => {
    if (formPrefill) {
      setFormData((prev) => ({ ...prev, ...formPrefill }));
      dispatch(setFormPrefill(null));
    }
  }, [formPrefill, dispatch]);

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

  return (
    <div className="form-card">
      <h2>Log HCP Interaction</h2>

      <form onSubmit={handleSubmit}>
        <input name="hcpName" placeholder="HCP Name" value={formData.hcpName} onChange={handleChange} />
        <select name="interactionType" value={formData.interactionType} onChange={handleChange}>
          <option>Meeting</option>
          <option>Call</option>
          <option>Email</option>
        </select>
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
        <input type="time" name="time" value={formData.time} onChange={handleChange} />
        <input name="attendees" placeholder="Attendees" value={formData.attendees} onChange={handleChange} />
        <input name="topics" placeholder="Topics discussed" value={formData.topics} onChange={handleChange} />
        <input name="product" placeholder="Product / Material shared" value={formData.product} onChange={handleChange} />
        <textarea name="summary" placeholder="Summary / Notes" value={formData.summary} onChange={handleChange} />

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Submit Interaction"}
        </button>
      </form>
    </div>
  );
}






