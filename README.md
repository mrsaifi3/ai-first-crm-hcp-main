<div align="center">
  <img src="/aivoa-logo.jpg" alt="AIVOA.AI" width="120" />
  <h1>AI-First CRM – HCP Interaction Logger</h1>
  <p>
    <strong>Intelligent field interaction management for healthcare professionals, powered by LangGraph & Groq LLM</strong>
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

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Agent Tools](#agent-tools)
- [Configuration](#configuration)
- [Testing](#testing)
- [Windows Notes](#windows-notes)
- [License](#license)

---

## Overview

AI-First CRM is a full-stack application purpose-built for **medical representatives, field sales professionals, and healthcare liaison teams** who regularly interact with doctors, specialists, and healthcare providers (HCPs). The platform replaces manual note-taking and spreadsheet logging with an intelligent, dual-mode interaction management system.

Users can log their field meetings in two ways:

- **Manual Form Entry** — Structured input with validated fields for precise, compliant data entry.
- **AI Chat Mode** — Describe your meeting in natural language; the AI agent extracts all relevant details, auto-fills the form, and saves the interaction — no typing required.

The backend is orchestrated by a **LangGraph-based AI agent** that intelligently routes user intents — logging, editing, summarizing, compliance checking, or follow-up recommendations — to the appropriate tool. All LLM inference runs on **Groq's llama-3.3-70b-versatile** for fast, cost-free inference.

---

## Key Features

| Feature | Details |
|---------|---------|
| **AI-Powered Chat** | Speak naturally — *"Met Dr. Sharma today, discussed CardioRelief"* — AI extracts every field and submits the form |
| **Manual Form Entry** | Complete structured form with validation, tooltips, sentiment selector, and auto-suggestions |
| **Interaction History** | Searchable, sortable, paginated table of all logged interactions with export support |
| **Edit via Chat** | Modify previously logged entries by simply saying *"Edit the last entry — change the date to tomorrow"* |
| **Smart Summaries** | *"Give me a summary"* returns total counts, weekly stats, sentiment breakdown, and top HCPs |
| **Follow-up Suggestions** | AI analyzes meeting context and recommends actionable next steps |
| **Compliance Validation** | Flags off-label discussions, missing required fields, and regulatory concerns |
| **Form Completeness Check** | Validates all critical fields before submission with real-time feedback |
| **Analytics Dashboard** | Visual breakdown of sentiment, interaction types, top HCPs, and recent activity with animated charts |
| **Voice Input** | Dictate meeting notes directly using browser speech recognition |
| **Dark / Light / Adaptive Theme** | Three theme modes — dark, light, and adaptive (auto-switches based on time of day) |
| **Auto-suggestions** | AI generates follow-up action suggestions as you type form fields |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │  InteractionForm  │  │ ChatAssistant  │  │ InteractionList│   │
│  │  (Manual Entry)   │  │  (AI Chat)     │  │  (History)     │   │
│  └────────┬─────────┘  └───────┬────────┘  └───────┬────────┘   │
│           │                    │                    │            │
│           └─────────┬──────────┴────────────────────┘            │
│                     │ HTTP REST (JSON)                           │
│              ┌──────▼──────┐                                     │
│              │  Redux Store │                                     │
│              └─────────────┘                                     │
└─────────────────────────┬─────────────────────────────────────────┘
                          │ REST API
┌─────────────────────────▼─────────────────────────────────────────┐
│                      Backend (FastAPI + Python)                    │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                 LangGraph AI Agent                          │   │
│  │                                                             │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────┐  │   │
│  │  │ LogInteract  │ │ EditInteract │ │Summarize │ │Follow│  │   │
│  │  └──────────────┘ └──────────────┘ └──────────┘ │ up   │  │   │
│  │  ┌──────────────┐ ┌──────────────┐              └──────┘  │   │
│  │  │ Compliance   │ │  CheckForm   │                         │   │
│  │  └──────────────┘ └──────────────┘                         │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                            │                                       │
│  ┌─────────────────────────▼───────────────────────────────────┐   │
│  │              Groq LLM (llama-3.3-70b-versatile)              │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                            │                                       │
│  ┌─────────────────────────▼───────────────────────────────────┐   │
│  │              SQLite Database (SQLAlchemy ORM)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User sends a message via the ChatAssistant UI or fills the manual form.
2. For chat: the request hits `POST /interaction`, which invokes the LangGraph agent.
3. The agent's router (`detect_intent`) classifies the intent — log, edit, summarize, followup, or compliance.
4. The appropriate tool processes the request using Groq LLM for NLP extraction.
5. Structured data is returned to the frontend, which auto-fills the form and optionally saves to the database.
6. For manual form: `POST /interactions` directly persists the data via SQLAlchemy.

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI library with modern Hooks API |
| Redux Toolkit | 2.1 | State management — interactions, chat, form state, prefill |
| React Router DOM | 7.x | Client-side routing |
| Recharts | 3.9 | Dashboard charts & analytics visualizations |
| Vite | 5.x | Fast dev server and build tool with HMR |
| Vitest | 1.6 | Unit and integration testing (JSDOM environment) |
| react-hot-toast | 2.6 | Lightweight, customizable toast notifications |
| Testing Library | 16.x | Component testing utilities |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Core runtime |
| FastAPI | 0.115 | High-performance async REST API framework |
| Uvicorn | — | ASGI server for FastAPI |
| LangGraph | 0.2 | Graph-based AI agent orchestration framework |
| Groq SDK | — | LLM inference via llama-3.3-70b-versatile |
| SQLAlchemy | — | ORM for database operations and migrations |
| SQLite | — | Lightweight, file-based relational database |
| Pydantic | — | Request/response model validation |
| python-jose | — | JWT token-based authentication |

---

## Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Includes npm |
| Python | 3.11+ | Includes pip |
| Groq API Key | Free | Sign up at [console.groq.com](https://console.groq.com) |

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/mrsaifi3/ai-first-crm-hcp-main.git
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

> This file is in `.gitignore` and will not be committed.

### Running the Application

Open two terminal windows:

**Terminal 1 — Backend API Server**

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Terminal 2 — Frontend Dev Server**

```bash
npm run dev
```

Expected output:
```
VITE v5.x  ready in X ms
  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser. The dashboard will load and connect to the backend automatically.

### Quick Start Prompts

Try these example interactions in the AI Chat tab:

```
Met Dr. Priya Sharma, cardiologist, at 10:30 AM today at Apollo Hospital.
Discussed CardioRelief for hypertension. She was positive and requested samples for 10 patients.
Shared brochure. Follow up next week with pricing.
```

```
Had a call with Dr. Vikram Mehta at 3:45 PM today.
Discussed NeuroRelax for migraine patients. He was neutral but interested.
Needs Phase 3 trial data before prescribing.
```

```
Met Dr. Rajesh Khanna at Max Hospital at 9 AM.
Discussed OsteoGuard injections. He was negative due to delayed delivery.
Refused to prescribe until RWE is shared.
```

---

## Usage Guide

### Mode 1: Manual Form Entry

The manual form provides a complete set of structured fields for logging interactions:

| Field | Type | Description |
|-------|------|-------------|
| HCP Name | Text | Healthcare professional's name with search |
| Interaction Type | Select | Meeting, Call, or Email |
| Date | Date picker | Date of interaction (supports "today", "yesterday", "tomorrow") |
| Time | Time picker | Time of interaction |
| Attendees | Text | Other participants present |
| Topics Discussed | Textarea | Key discussion points (supports voice input) |
| Product | Text | Product or medicine discussed |
| Materials Shared | Text | Documents, brochures provided |
| Samples Distributed | Text | Product samples given |
| Sentiment | Radio (3 options) | Positive, Neutral, or Negative with visual icons |
| Outcomes | Textarea | Results, agreements, or decisions |
| Follow-up Actions | Textarea | Next steps and tasks |
| AI Suggested Follow-ups | Generated | AI-powered suggestions based on form context |

Click **Submit Interaction** to save. The form validates required fields and shows success/error toasts.

### Mode 2: AI Chat

Toggle to the AI Chat tab and describe your meeting conversationally:

> *"Met Dr. Sharma today at Fortis Hospital, discussed the new hypertension drug CardioRelief. He was very positive and wants samples next week."*

The AI will:
1. Parse the natural language input and extract all structured fields
2. Auto-fill the manual form with extracted data
3. Ask clarifying questions if any critical fields (HCP name, topics, sentiment) are missing
4. Save the interaction to the database automatically

#### Available Chat Commands

| Command | Example | Action |
|---------|---------|--------|
| Log interaction | *"Met Dr. X, discussed Y"* | Extracts and logs a new interaction |
| Edit entry | *"Edit the last entry — change date to tomorrow"* | Modifies existing records |
| Summary | *"Give me a summary"* or *"How many interactions?"* | Returns total count and stats |
| Follow-up suggestions | *"Suggest follow-ups"* | AI recommends next actions |
| Compliance check | *"Check compliance"* | Validates for regulatory issues |

### Dashboard

The analytics dashboard provides:
- Animated counters for total interactions, weekly activity, interaction types, and active HCPs
- Pie chart for sentiment distribution (Positive/Neutral/Negative)
- Bar chart for interaction type breakdown (Meeting/Call/Email)
- Top HCPs leaderboard with avatar initials
- Recent activity feed with color-coded sentiment indicators

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | No | Health check — verifies server is running |
| `GET` | `/stats` | No | Dashboard statistics (counts, sentiment, types, top HCPs) |
| `POST` | `/interaction` | No | Send user input to the LangGraph AI agent |
| `POST` | `/interactions` | No | Save a new interaction to the database |
| `GET` | `/interactions` | No | Retrieve paginated interactions (supports search) |
| `DELETE` | `/interactions` | No | Delete all interactions |
| `POST` | `/suggestions` | No | Generate AI follow-up suggestions based on form data |
| `POST` | `/check-form` | No | Validate form completeness and compliance |

### Query Parameters

**GET /interactions**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number (1-indexed) |
| `page_size` | int | 20 | Items per page (max 500) |
| `search` | string | "" | Search across HCP name, topics, type, sentiment, outcomes |

---

## Project Structure

```
ai-first-crm-hcp-main/
│
├── src/                              # React frontend
│   ├── main.jsx                      # Application entry point
│   ├── App.jsx                       # Root component with routing & layout
│   ├── App.css                       # Global styles (iOS-inspired design system)
│   ├── index.css                     # Base reset styles
│   │
│   ├── app/
│   │   └── store.js                  # Redux store configuration
│   │
│   ├── interaction/
│   │   ├── InteractionForm.jsx       # Manual data entry form with validation
│   │   ├── ChatAssistant.jsx         # AI chat interface with message history
│   │   ├── InteractionList.jsx       # Paginated, searchable interaction table
│   │   ├── InfoTip.jsx               # Field-level tooltip modal component
│   │   └── interactionSlice.js       # Redux state slice for interactions
│   │
│   ├── auth/
│   │   └── Dashboard.jsx             # Analytics dashboard with Recharts
│   │
│   ├── services/
│   │   └── interactionApi.js         # HTTP client for all backend API calls
│   │
│   └── __tests__/
│       ├── setup.js                  # Vitest + Testing Library setup
│       └── AuthAndDashboard.test.jsx # Dashboard rendering & auth tests
│
├── backend/                          # Python backend
│   ├── __init__.py
│   ├── main.py                       # FastAPI app — routes, CORS, error handling
│   ├── database.py                   # SQLAlchemy engine, session factory, get_db
│   ├── models.py                     # ORM model: Interaction table definition
│   ├── auth.py                       # JWT authentication utilities
│   ├── requirements.txt              # Python package dependencies
│   │
│   ├── agent/                        # LangGraph AI agent
│   │   ├── graph.py                  # State graph definition & intent routing
│   │   └── state.py                  # AgentState TypedDict definition
│   │
│   ├── llm/                          # LLM integration
│   │   └── groq_client.py            # Groq API client with prompt handling
│   │
│   ├── tools/                        # Agent tool implementations
│   │   ├── log_interaction.py        # Extract & log new interactions via LLM
│   │   ├── edit_interaction.py       # Modify existing interactions
│   │   ├── summarize.py              # Count & summarize all interactions
│   │   ├── followup.py               # Generate follow-up recommendations
│   │   ├── compliance.py             # Validate interactions for compliance
│   │   └── check_form.py             # Check form completeness before submit
│   │
│   └── tests/
│       └── test_main.py              # Backend API test suite
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment variable template
├── .gitignore
├── package.json                      # Node dependencies & scripts
├── package-lock.json
├── vite.config.js                    # Vite configuration with React plugin
├── vitest.config.js                  # Vitest configuration with JSDOM
├── eslint.config.js                  # ESLint configuration
├── db.json                           # JSON server data (legacy)
└── README.md
```

---

## Agent Tools

The LangGraph agent uses a **state machine architecture** with 5 specialized tools. The router node classifies each user input based on intent keywords and conversation context, then dispatches to the correct tool:

| Tool | File | Trigger Keywords | Function |
|------|------|------------------|----------|
| **Log Interaction** | `tools/log_interaction.py` | *"Met Dr...", "Had a meeting...", "Called...", "Discussed..."* | Sends user text to Groq LLM with a structured extraction prompt, parses the JSON response, extracts all fields (HCP name, specialty, product, sentiment, date/time, attendees, topics, materials, outcomes, follow-ups), saves to SQLite, and returns structured data to frontend |
| **Edit Interaction** | `tools/edit_interaction.py` | *"Edit...", "Update...", "Change...", "Modify..."* | Handles follow-up questions from the assistant, updates existing database records based on user corrections |
| **Summarize** | `tools/summarize.py` | *"Summary...", "How many...", "Count...", "Total..."* | Queries the database and returns aggregated statistics: total count, sentiment breakdown, and recent activity |
| **Follow-up Recommendation** | `tools/followup.py` | *"Suggest...", "Follow up...", "Next steps..."* | Analyzes the most recent interaction context and generates actionable follow-up recommendations |
| **Compliance Check** | `tools/compliance.py` | *"Compliance...", "Check...", "Validate..."*, *"Off-label..."* | Reviews interaction data for regulatory compliance issues, off-label discussions, and missing required fields |

### Intent Routing Logic

The `detect_intent` function in `agent/graph.py` follows this priority:

1. If the last assistant message contains a question mark → route to **edit** (continuing conversation)
2. Check the first 200 characters of user input for command keywords
3. If no command detected → default to **log** (new interaction)

---

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | — | Your Groq API key for LLM inference. Get one free at [console.groq.com](https://console.groq.com) |

---

## Testing

### Frontend Tests

```bash
npm test
```

Runs Vitest with JSDOM environment. Tests cover:
- Dashboard component rendering (stats cards, charts, greetings, empty states)
- Authentication flow simulation
- Component mounting and API mocking via `jest-fetch-mock`

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

Tests cover API endpoint responses, health check, and interaction CRUD operations.

<div align="center">
  <p>
    Built with React, FastAPI, LangGraph & Groq
  </p>
  <p>
    <a href="https://github.com/mrsaifi3/ai-first-crm-hcp-main">GitHub Repository</a>
  </p>
  <p>Made by Md Saifi</p>
</div>
