# AI-First CRM – HCP Interaction Logger

A smart CRM system for Healthcare Professionals (HCPs) where you can log your field interactions either by filling a form manually or just chatting with an AI assistant. Built as a full-stack application with React on the frontend and a Python AI agent on the backend.

---

## What it does

If you're a medical representative or sales person who meets doctors and healthcare professionals, this tool lets you:

- Log details of your meetings (who, when, what was discussed, how it went)
- Use an AI chat to describe the meeting in plain English and have the form auto-fill
- Get AI-powered suggestions for follow-up actions
- Check if your form is complete before submitting
- View all your past interactions in one place

The AI uses LangGraph (a graph-based agent framework) to understand what you want to do — whether it's logging a new interaction, editing an existing one, getting a summary, or checking compliance — and routes your request to the right handler automatically.

---

## Tech Stack

**Frontend:**
- React 18 with Hooks
- Redux Toolkit (state management)
- Vite (build tool)
- react-hot-toast (notifications)

**Backend:**
- Python FastAPI (REST server)
- LangGraph (AI agent graph)
- Groq LLM (llama-3.3-70b-versatile) — free, fast inference
- SQLAlchemy + SQLite (database)

**Agent has 5 tools:**
1. Log Interaction — understands natural language and extracts structured data
2. Edit Interaction — updates previously logged entries
3. Summarize — gives you a count of all interactions
4. Follow-up Recommendation — suggests next steps based on context
5. Compliance Check — validates interactions for compliance issues

---

## How to run

### What you need

- Node.js 18 or higher
- Python 3.11 or higher
- A Groq API key (free signup at https://console.groq.com)

### Step-by-step

**1. Install frontend dependencies**

Open a terminal in the project folder and run:

```bash
npm install
```

This installs React, Redux, Vite, and everything else needed for the UI.

**2. Install backend dependencies**

```bash
pip install -r backend/requirements.txt
```

This installs FastAPI, LangGraph, Groq SDK, SQLAlchemy, and python-dotenv.

**3. Add your Groq API key**

Create a file named `.env` in the project root (inside `ai-first-crm-hcp-main/`) with this content:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

Replace `gsk_your_actual_key_here` with your real key from Groq. This file is already in `.gitignore` so it won't accidentally get committed.

**4. Start the backend (Terminal 1)**

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Keep this running. It starts the FastAPI server on port 8000 with auto-reload (so changes take effect automatically). You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**5. Start the frontend (Terminal 2)**

Open a second terminal and run:

```bash
npm run dev
```

This starts the Vite dev server. You should see:

```
VITE v5.x  ready in X ms
➜  Local:   http://localhost:5173/
```

**6. Open the app**

Go to http://localhost:5173 in your browser. You'll see the CRM dashboard with a form on the left and a chat assistant on the right.

---

## How to use

### Form Mode

Fill in the fields manually:
- HCP Name — the doctor or healthcare professional you met
- Interaction Type — Meeting, Call, or Email
- Date and Time
- Attendees — anyone else who was there
- Topics Discussed — what you talked about
- Materials Shared / Samples Distributed — what you gave them
- Sentiment — Positive, Neutral, or Negative
- Outcomes — what came out of the meeting
- Follow-up Actions — next steps

Click "Submit Interaction" to save it.

### AI Chat Mode

Click the toggle to switch to chat mode. Type something like:

```
Met Dr. Sharma today, discussed the new hypertension drug. He was positive about it and wants samples next week.
```

The AI will:
1. Parse your message and extract the details
2. Auto-fill the form with what it understood
3. Ask follow-up questions if anything is missing

You can also say things like "Give me a summary" or "Suggest follow-ups" and the AI agent will route to the right tool.

---

## Project Structure

```
ai-first-crm-hcp-main/
│
├── src/                          # React frontend
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Main layout component
│   ├── App.css                   # All styles
│   ├── app/
│   │   └── store.js              # Redux store config
│   ├── interaction/
│   │   ├── InteractionForm.jsx   # Manual form component
│   │   ├── ChatAssistant.jsx     # AI chat component
│   │   ├── InteractionList.jsx   # List of logged interactions
│   │   ├── InfoTip.jsx           # Tooltip helper component
│   │   └── interactionSlice.js   # Redux state slice
│   └── services/
│       └── interactionApi.js     # API calls to backend
│
├── backend/
│   ├── main.py                   # FastAPI server with all endpoints
│   ├── database.py               # SQLAlchemy engine and session
│   ├── models.py                 # Database model (Interaction table)
│   ├── requirements.txt          # Python dependencies
│   ├── __init__.py
│   │
│   ├── agent/
│   │   ├── graph.py              # LangGraph state graph definition
│   │   ├── state.py              # Agent state type definition
│   │   └── __init__.py
│   │
│   ├── llm/
│   │   ├── groq_client.py        # Groq API client with dotenv support
│   │   └── __init__.py
│   │
│   └── tools/
│       ├── log_interaction.py    # Tool: log new interaction via LLM
│       ├── edit_interaction.py   # Tool: edit existing interaction
│       ├── summarize.py          # Tool: count all interactions
│       ├── followup.py           # Tool: suggest follow-up actions
│       ├── compliance.py         # Tool: compliance check
│       ├── check_form.py         # Tool: validate form completeness
│       └── __init__.py
│
├── .env                          # Your API key (DO NOT commit)
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check |
| POST | `/interaction` | Send user input to LangGraph agent |
| POST | `/interactions` | Save a new interaction to database |
| GET | `/interactions` | Get all logged interactions |
| DELETE | `/interactions` | Delete all interactions |
| POST | `/suggestions` | Get AI follow-up suggestions |
| POST | `/check-form` | Check if form is complete |

---

## One-time Note (Windows PowerShell)

If you're on Windows, `uvicorn` may not be in your PATH. Use `python -m uvicorn` instead of just `uvicorn` as shown above.

The first time you run the backend, SQLite database file `crm.db` will be created automatically in the project root with the correct table schema.
