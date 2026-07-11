<div align="center">
  <img src="/aivoa-logo.jpg" alt="AIVOA.AI" width="120" />
  <h1>AI-First CRM – HCP Interaction Logger</h1>
  <p>
    <strong>A smart CRM system for Healthcare Professionals to log, track, and manage field interactions using AI</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react" alt="React 18">
    <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python" alt="Python 3.11">
    <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi" alt="FastAPI">
    <img src="https://img.shields.io/badge/LangGraph-0.2-FF6F00?style=flat" alt="LangGraph">
    <img src="https://img.shields.io/badge/Groq-LLM-1E90FF?style=flat" alt="Groq LLM">
    <img src="https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite" alt="SQLite">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
  </p>
</div>

---

## 📋 Overview

AI-First CRM is a full-stack application built for **medical representatives and sales professionals** who meet doctors and healthcare professionals (HCPs) in the field. It provides two ways to log interactions:

- **Manual Form** — Fill in structured fields for precise data entry
- **AI Chat Mode** — Describe your meeting in plain English; the AI extracts the details and auto-fills the form

The backend uses **LangGraph**, a graph-based AI agent framework, to intelligently route user requests — whether it's logging a new interaction, editing an existing one, generating summaries, suggesting follow-ups, or checking compliance.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI-Powered Chat** | Speak naturally — "Met Dr. Sharma today, discussed hypertension drug" — AI extracts and fills everything |
| 📝 **Manual Form Entry** | Traditional form with all fields for those who prefer structured input |
| 📊 **Interaction History** | View, search, and manage all past interactions in one place |
| 🔄 **Edit Existing Entries** | Update previously logged interactions via chat or form |
| 📈 **Smart Summaries** | Get quick counts and overviews of all logged interactions |
| 🎯 **Follow-up Suggestions** | AI recommends next steps based on meeting context |
| ✅ **Compliance Check** | Validate interactions for regulatory compliance issues |
| 🔍 **Form Completeness Validation** | Ensures no required fields are missed before submission |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Manual Form  │  │ AI Chat      │  │ Interaction List │  │
│  │  Component    │  │ Component    │  │ Component        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│         └────────┬────────┘────────────────────┘             │
│                  │ HTTP REST                                │
│           ┌──────▼──────┐                                   │
│           │  Redux Store │                                   │
│           └─────────────┘                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (FastAPI + Python)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              LangGraph AI Agent                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ Log      │ │ Edit     │ │Summarize │ │Follow- │  │   │
│  │  │Interact. │ │Interact. │ │          │ │up      │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐                           │   │
│  │  │Compliance│ │Check Form│                           │   │
│  │  └──────────┘ └──────────┘                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │          Groq LLM (llama-3.3-70b-versatile)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │          SQLite Database (SQLAlchemy ORM)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with modern Hooks API |
| **Redux Toolkit** | State management — interactions, chat, form state |
| **Vite** | Fast dev server and build tool |
| **react-hot-toast** | Lightweight toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance REST API server |
| **LangGraph** | Orchestrates the AI agent's decision graph |
| **Groq LLM** | `llama-3.3-70b-versatile` — fast, free inference |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Lightweight, file-based database |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| Python | 3.11+ |
| Groq API Key | Free at [console.groq.com](https://console.groq.com) |

### Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd ai-first-crm-hcp-main
```

**2. Install frontend dependencies**
```bash
npm install
```

**3. Install backend dependencies**
```bash
pip install -r backend/requirements.txt
```

**4. Configure environment variables**

Create a `.env` file in the project root:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

> ⚠️ This file is already in `.gitignore` — it will not be committed.

### Running the Application

Open **two terminals**:

#### Terminal 1 — Backend Server
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

#### Terminal 2 — Frontend Dev Server
```bash
npm run dev
```
Expected output:
```
VITE v5.x  ready in X ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 📖 Usage Guide

### Mode 1: Manual Form

Fill in the form fields directly:

| Field | Description |
|-------|-------------|
| HCP Name | Doctor or healthcare professional's name |
| Interaction Type | Meeting, Call, or Email |
| Date & Time | When the interaction occurred |
| Attendees | Other people present |
| Topics Discussed | Key discussion points |
| Materials/Samples | What was shared or distributed |
| Sentiment | Positive, Neutral, or Negative |
| Outcomes | Results of the meeting |
| Follow-up Actions | Next steps |

Click **Submit Interaction** to save.

### Mode 2: AI Chat

Toggle to chat mode and describe your meeting naturally:

> *"Met Dr. Sharma today, discussed the new hypertension drug. He was positive about it and wants samples next week."*

The AI will:
1. Parse the message and extract structured data
2. Auto-fill the form with extracted information
3. Ask clarifying questions if any fields are missing

You can also use commands like:
- *"Give me a summary"* — returns interaction count
- *"Suggest follow-ups"* — AI recommends next steps
- *"Edit the last entry"* — modify existing records
- *"Check compliance"* — validate for compliance issues

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — verifies server is running |
| `POST` | `/interaction` | Send user input to the LangGraph agent |
| `POST` | `/interactions` | Save a new interaction to the database |
| `GET` | `/interactions` | Retrieve all logged interactions |
| `DELETE` | `/interactions` | Delete all interactions |
| `POST` | `/suggestions` | Generate AI follow-up suggestions |
| `POST` | `/check-form` | Validate form completeness |

---

## 📁 Project Structure

```
ai-first-crm-hcp-main/
│
├── src/                              # React frontend source
│   ├── main.jsx                      # Application entry point
│   ├── App.jsx                       # Root layout component
│   ├── App.css                       # Global styles
│   ├── app/
│   │   └── store.js                  # Redux store configuration
│   ├── interaction/
│   │   ├── InteractionForm.jsx       # Manual data entry form
│   │   ├── ChatAssistant.jsx         # AI chat interface
│   │   ├── InteractionList.jsx       # Logged interactions display
│   │   ├── InfoTip.jsx               # Tooltip helper component
│   │   └── interactionSlice.js       # Redux state slice
│   └── services/
│       └── interactionApi.js         # HTTP client for backend API
│
├── backend/                          # Python backend source
│   ├── main.py                       # FastAPI application & routes
│   ├── database.py                   # SQLAlchemy engine & session
│   ├── models.py                     # Database ORM models
│   ├── requirements.txt              # Python package dependencies
│   │
│   ├── agent/                        # LangGraph AI agent
│   │   ├── graph.py                  # Agent state graph definition
│   │   └── state.py                  # Graph state type definitions
│   │
│   ├── llm/                          # LLM integration
│   │   └── groq_client.py            # Groq API client
│   │
│   └── tools/                        # Agent tool implementations
│       ├── log_interaction.py        # Parse & log new interaction
│       ├── edit_interaction.py       # Modify existing interaction
│       ├── summarize.py              # Count all interactions
│       ├── followup.py               # Suggest follow-up actions
│       ├── compliance.py             # Compliance validation
│       └── check_form.py             # Form completeness check
│
├── .env                              # Environment variables (gitignored)
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 💡 Agent Tools Detail

The LangGraph agent has **5 core tools** that it routes to automatically based on user intent:

| Tool | Trigger Phrases | What It Does |
|------|----------------|--------------|
| **Log Interaction** | *"Met Dr...", "Had a meeting...", "Called..."* | Extracts structured data from natural language |
| **Edit Interaction** | *"Edit...", "Update...", "Change..."* | Modifies previously saved entries |
| **Summarize** | *"Summary...", "How many...", "Count..."* | Returns total number of logged interactions |
| **Follow-up Recommendation** | *"Suggest...", "Next steps...", "Follow up..."* | Analyzes context and recommends actions |
| **Compliance Check** | *"Compliance...", "Check...", "Validate..."* | Validates interactions for compliance issues |

---

## ⚙️ Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Your Groq API key for LLM access |

---

## 🪟 Windows Notes

- Use `python -m uvicorn` instead of `uvicorn` directly (PATH issue)
- On first run, `crm.db` (SQLite) is created automatically in the project root

---

## 📄 License

This project is licensed under the MIT License.
