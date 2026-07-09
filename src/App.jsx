import { useSelector, useDispatch } from "react-redux";
import { toggleMode } from "./interaction/interactionSlice";
import InteractionForm from "./interaction/InteractionForm";
import InteractionList from "./interaction/InteractionList";
import ChatAssistant from "./interaction/ChatAssistant";
import "./App.css";

function App() {
  const mode = useSelector((state) => state.interaction.mode);
  const dispatch = useDispatch();

  return (
    <div className="app-container">
      <div className="header">
        <h1>AI-First CRM – Log HCP Interaction</h1>
        <button className="switch-btn" onClick={() => dispatch(toggleMode())}>
          Switch to {mode === "form" ? "Chat" : "Form"} Mode
        </button>
        <p>
          Current mode: <b>{mode}</b>
        </p>
      </div>

      <div className="dashboard">
        {mode === "form" ? <InteractionForm /> : <ChatAssistant />}
        <InteractionList />
      </div>
    </div>
  );
}

export default App;
