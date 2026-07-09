# AI-First CRM – HCP Interaction Module

## Overview

AI-first CRM for Healthcare Professionals (HCP). Log, manage, and analyze HCP interactions via structured form or conversational AI chat.

Built with React + Redux (frontend) and FastAPI + LangGraph + Groq LLM (backend).

## Tech Stack

- **Frontend:** React, Redux Toolkit, Vite, Google Inter font
- **Backend:** Python, FastAPI, LangGraph, Groq (gemma2-9b-it)
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **State Management:** Redux Toolkit

## LangGraph Agent Tools

1. **Log Interaction** – Logs HCP interactions using LLM for summarization & entity extraction
2. **Edit Interaction** – Modifies existing logged interactions
3. **Summarize** – Summarizes all logged interactions
4. **Follow-up Recommendation** – Suggests follow-up actions
5. **Compliance Check** – Validates interactions for compliance issues

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
set GROQ_API_KEY=gsk_your_key_here
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- Dual input modes: Form mode & AI Chat mode
- AI auto-fills form fields from natural language
- LangGraph agent routes intents (log, edit, summary, follow-up, compliance)
- Responsive dashboard UI
