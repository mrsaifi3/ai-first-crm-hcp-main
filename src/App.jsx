import InteractionForm from "./interaction/InteractionForm";
import InteractionList from "./interaction/InteractionList";
import ChatAssistant from "./interaction/ChatAssistant";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1>AI-First CRM – Log HCP Interaction</h1>
      </div>

      <div className="main-row">
        <InteractionForm />
        <ChatAssistant />
      </div>

      <InteractionList />
    </div>
  );
}

export default App;
