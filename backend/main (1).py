from fastapi import FastAPI
from pydantic import BaseModel

from backend.agent.graph import agent

app = FastAPI(
    title="AI-First CRM – HCP Module",
    description="Log HCP interactions using LangGraph + LLM",
    version="1.0.0"
)


# -------------------------
# Request Schemas
# -------------------------
class InteractionRequest(BaseModel):
    user_input: str


# -------------------------
# Health Check
# -------------------------
@app.get("/")
def health_check():
    return {"status": "API is running"}


# -------------------------
# Core Endpoint (LangGraph)
# -------------------------
@app.post("/interaction")
def handle_interaction(request: InteractionRequest):
    """
    This endpoint sends user input to the LangGraph agent
    and returns the agent's structured response.
    """
    result = agent.invoke({
        "user_input": request.user_input
    })
    return result
