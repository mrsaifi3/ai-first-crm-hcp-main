# AI Backend – LangGraph & FastAPI (Task 1)

This backend implements the AI reasoning and interaction logic for the AI-First CRM HCP module.

---

## Overview

The backend is designed around:
- **FastAPI** for REST endpoints
- **LangGraph** for agent-based reasoning
- Modular tool-driven architecture

The system supports AI-assisted HCP interaction logging and analysis.

---

## Architecture

### Core Components

- `main.py`
  - FastAPI application entry point
  - Exposes REST APIs

- `app/models.py`
  - Pydantic models for structured data

- `app/database.py`
  - Persistence layer abstraction

- `app/log_interaction.py`
  - Tool for logging new interactions

- `app/edit_interaction.py`
  - Tool for editing interactions

- `app/followup.py`
  - Follow-up recommendation logic

- `app/summarize.py`
  - Interaction summarization logic

- `app/compliance.py`
  - Compliance validation checks

- `app/groq_client.py`
  - LLM / Groq client abstraction

- `app/state.py`
  - LangGraph agent state definition

- `app/graph.py`
  - LangGraph workflow and tool orchestration

---

## LangGraph Usage

LangGraph is used to:
- Maintain agent state
- Route between tools
- Execute structured reasoning flows
- Support future LLM-powered decision making

The workflow is implemented using `StateGraph` and modular tool nodes.

---

## Development Environment

Initial experimentation and validation were done in **Google Colab**.
The exported notebook is available in:


---

## API Endpoints

| Method | Endpoint | Description |
|------|--------|-------------|
| POST | `/interaction/chat` | AI-assisted interaction |
| GET | `/interactions` | Fetch interactions |
| POST | `/interactions` | Create interaction |

Swagger UI available at:

---

## Notes

This backend is **production-ready in structure** and **backend-agnostic**.
It can be connected to:
- Real databases
- Production LLMs
- External CRM systems
