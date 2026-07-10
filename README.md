# AI-First CRM – HCP Interaction Module

Log, manage, and analyze Healthcare Professional (HCP) interactions via structured form or conversational AI chat. Built with React + Redux Toolkit (frontend) and FastAPI + LangGraph + Groq LLM (backend).

## Tech Stack

- **Frontend:** React 18, Redux Toolkit, Vite, react-hot-toast
- **Backend:** Python, FastAPI, LangGraph, Groq (llama-3.3-70b-versatile)
- **Database:** SQLite (via SQLAlchemy)
- **Agent Tools:** Log, Edit, Summarize, Follow-up, Compliance check

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Groq API key (free at https://console.groq.com)

### 1. Clone & Install

```bash
# Frontend
cd ai-first-crm-hcp-main
npm install

# Backend
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Set API Key

Create `.env` in the root `ai-first-crm-hcp-main` folder:

```
GROQ_API_KEY=gsk_your_key_here
```

The backend auto-loads this via python-dotenv.

### 3. Run

Open **two terminals**:

**Terminal 1 – Backend (port 8000):**
```bash
cd ai-first-crm-hcp-main
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 – Frontend (port 5173):**
```bash
cd ai-first-crm-hcp-main
npm run dev
```

Open http://localhost:5173

## Features

- **Form Mode** – Manual structured input with sentiment selector, materials, outcomes
- **AI Chat Mode** – Natural language logging with auto-form-fill
- **LangGraph Agent** – Routes intents: log, edit, summary, follow-up, compliance
- **Live Suggestions** – AI suggests follow-up actions as you type
- **Dashboard** – View all logged interactions with delete option

## Project Structure

```
ai-first-crm-hcp-main/
├── src/                    # React frontend
│   ├── interaction/        # Form, Chat, List components + Redux slice
│   ├── app/store.js        # Redux store
│   └── services/           # API client
├── backend/
│   ├── main.py             # FastAPI server
│   ├── agent/              # LangGraph state + graph
│   ├── tools/              # Agent tool functions
│   ├── llm/                # Groq LLM client
│   ├── database.py         # SQLAlchemy setup
│   └── models.py           # Interaction model
├── .env                    # API key (gitignored)
└── package.json
```
