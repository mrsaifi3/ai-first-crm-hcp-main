import InteractionForm from "./interaction/InteractionForm";
import InteractionList from "./interaction/InteractionList";
import ChatAssistant from "./interaction/ChatAssistant";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1>AI-First CRM – Log HCP Interaction</h1>
        <button className="switch-btn">Switch Mode</button>
        <p>
          Current mode: <b>form</b>
        </p>
      </div>

      <div className="dashboard">
        <InteractionForm />
        <ChatAssistant />
      </div>
    </div>
  );
}

export default App;

