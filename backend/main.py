from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.agent.graph import agent
from backend.database import Base, engine
from backend.models import Interaction
from backend.database import SessionLocal

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-First CRM – HCP Module",
    description="Log HCP interactions using LangGraph + LLM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    text: str


class InteractionRequest(BaseModel):
    user_input: str
    messages: Optional[List[ChatMessage]] = []


class InteractionResponse(BaseModel):
    hcpName: str = ""
    interactionType: str = "Meeting"
    date: str = ""
    time: str = ""
    attendees: str = ""
    topics: str = ""
    product: str = ""
    summary: str = ""
    sentiment: str = "Neutral"
    materialsShared: str = ""
    samplesDistributed: str = ""
    outcomes: str = ""
    followupActions: str = ""


@app.get("/")
def health_check():
    return {"status": "API is running"}


@app.post("/interaction")
def handle_interaction(request: InteractionRequest):
    result = agent.invoke({
        "user_input": request.user_input,
        "messages": [m.dict() for m in request.messages] if request.messages else [],
    })
    return result


@app.post("/interactions")
def create_interaction(data: InteractionResponse):
    db = SessionLocal()
    interaction = Interaction(
        hcp_name=data.hcpName,
        interaction_type=data.interactionType,
        product=data.product,
        summary=data.summary,
        sentiment=data.sentiment,
        date=data.date,
        time=data.time,
        attendees=data.attendees,
        topics=data.topics,
        materials_shared=data.materialsShared,
        samples_distributed=data.samplesDistributed,
        outcomes=data.outcomes,
        followup_actions=data.followupActions,
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    db.close()
    return {"success": True, "id": interaction.id}


@app.delete("/interactions")
def delete_all_interactions():
    db = SessionLocal()
    db.query(Interaction).delete()
    db.commit()
    db.close()
    return {"success": True, "message": "All interactions deleted"}


@app.get("/interactions")
def get_interactions():
    db = SessionLocal()
    rows = db.query(Interaction).all()
    db.close()
    return [
        {
            "id": r.id,
            "hcpName": r.hcp_name,
            "specialty": r.specialty,
            "interactionType": r.interaction_type,
            "product": r.product,
            "summary": r.summary,
            "sentiment": r.sentiment,
            "date": r.date or "",
            "time": r.time or "",
            "attendees": r.attendees or "",
            "topics": r.topics or "",
            "materialsShared": r.materials_shared or "",
            "samplesDistributed": r.samples_distributed or "",
            "outcomes": r.outcomes or "",
            "followupActions": r.followup_actions or "",
            "created_at": str(r.created_at)
        }
        for r in rows
    ]
