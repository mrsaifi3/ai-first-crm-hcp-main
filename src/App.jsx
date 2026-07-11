import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import InteractionForm from "./interaction/InteractionForm";
import InteractionList from "./interaction/InteractionList";
import ChatAssistant from "./interaction/ChatAssistant";
import "./App.css";

function NavBar({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState("form");

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/aivoa-logo.jpg" alt="AIVOA" className="navbar-logo" />
        <span className="navbar-brand"><span>AIVOA.AI</span></span>
      </div>
      <div className="navbar-right">
        <div className="tab-bar desktop-hide">
          <button className={`tab-btn ripple-btn dark-ripple ${activeTab === "form" ? "active" : ""}`} onClick={() => setActiveTab("form")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: 5, verticalAlign: "middle"}}>
              <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1.5 5.5H12.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 9H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Form
          </button>
          <button className={`tab-btn ripple-btn dark-ripple ${activeTab === "chat" ? "active" : ""}`} onClick={() => setActiveTab("chat")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{marginRight: 5, verticalAlign: "middle"}}>
              <path d="M1.5 7C1.5 3.96243 3.96243 1.5 7 1.5C10.0376 1.5 12.5 3.96243 12.5 7C12.5 10.0376 10.0376 12.5 7 12.5C5.89451 12.5 4.85893 12.1925 3.97995 11.6561L1.5 12.5L2.34392 10.0201C1.80746 9.14107 1.5 8.10549 1.5 7Z" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4.5 7H9.5M7 4.5V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            AI Chat
          </button>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title={`${theme === "light" ? "Light" : theme === "adaptive" ? "Adaptive" : "Dark"} mode`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {theme === "light" ? (
              <><circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.3"/><path d="M9 1V3M9 15V17M1 9H3M15 9H17M3.5 3.5L5 5M13 13L14.5 14.5M14.5 3.5L13 5M5 13L3.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></>
            ) : theme === "adaptive" ? (
              <><circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/><path d="M5 5L3 3M13 13L15 15M3 13L5 11M15 5L13 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" strokeDashoffset="2" transform="rotate(45 9 9)"/></>
            ) : (
              <><path d="M9 2C6.5 2 4 4.5 4 8C4 11.5 6.5 14 10 14C12 14 13.5 13 14.5 11.5C13 12.5 11 13 9 12C6.5 10.5 6 7.5 7 5.5C7.5 4 8.5 3 9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></>
            )}
          </svg>
        </button>
        <span className="navbar-badge">HCP Module</span>
      </div>
    </nav>
  );
}

function InteractionsPage({ activeTab, setActiveTab }) {
  return (
    <div className="main-content">
      <div className="main-grid">
        <div className="mobile-tab-content" data-tab={activeTab === "form" ? "visible" : "hidden"}>
          <div className="card">
            <div className="card-header">
              <h2>Interaction Details</h2>
              <span className="badge">Manual Entry</span>
            </div>
            <div className="card-body">
              <InteractionForm />
            </div>
          </div>
        </div>

        <div className="mobile-tab-content" data-tab={activeTab === "chat" ? "visible" : "hidden"}>
          <div className="card stretch-card">
            <div className="card-header">
              <h2>AI Assistant &mdash; <span className="chat-subtitle-header">Log interaction via chat</span></h2>
              <span className="badge">AI Chat</span>
            </div>
            <div className="card-body chat-card-body">
              <ChatAssistant />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Logged Interactions</h2>
        </div>
        <div className="card-body">
          <InteractionList />
        </div>
      </div>
    </div>
  );
}

function getAdaptiveTheme() {
  const h = new Date().getHours();
  if (h >= 6 && h < 18) return "light";
  return "dark";
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [activeTab, setActiveTab] = useState("form");

  useEffect(() => {
    const resolved = theme === "adaptive" ? getAdaptiveTheme() : theme;
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "adaptive") return;
    const id = setInterval(() => {
      document.documentElement.setAttribute("data-theme", getAdaptiveTheme());
    }, 60000);
    return () => clearInterval(id);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : p === "light" ? "adaptive" : "dark"));

  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar theme={theme} toggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<InteractionsPage activeTab={activeTab} setActiveTab={setActiveTab} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
