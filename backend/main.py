from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from backend.agent.graph import agent
from backend.database import Base, engine, get_db
from backend.models import Interaction
from backend.tools.followup import followup_recommendation_tool
from backend.tools.check_form import check_form_tool

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-First CRM – HCP Module",
    description="Log HCP interactions using LangGraph + LLM",
    version="2.0.0"
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

# --- Stats ---

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Interaction).count()

    by_sentiment = db.query(Interaction.sentiment, func.count(Interaction.id)).group_by(Interaction.sentiment).all()
    by_type = db.query(Interaction.interaction_type, func.count(Interaction.id)).group_by(Interaction.interaction_type).all()

    week_ago = datetime.utcnow() - timedelta(days=7)
    weekly = db.query(Interaction).filter(Interaction.created_at >= week_ago).count()

    top_hcps = db.query(Interaction.hcp_name, func.count(Interaction.id).label("cnt")).filter(Interaction.hcp_name.isnot(None)).group_by(Interaction.hcp_name).order_by(func.count(Interaction.id).desc()).limit(5).all()

    return {
        "total": total,
        "by_sentiment": {s or "Unknown": c for s, c in by_sentiment},
        "by_type": {t or "Unknown": c for t, c in by_type},
        "weekly": weekly,
        "top_hcps": [{"name": h, "count": c} for h, c in top_hcps],
    }


# --- Existing Routes (updated with auth) ---

@app.get("/")
def health_check():
    return {"status": "API is running"}


@app.post("/interaction")
def handle_interaction(request: InteractionRequest):
    try:
        result = agent.invoke({
            "user_input": request.user_input,
            "messages": [m.dict() for m in request.messages] if request.messages else [],
        })
        return result
    except RuntimeError as e:
        return {"status": "error", "messageToUser": str(e), "hcpName": "", "result": {"status": "error", "messageToUser": str(e)}}
    except Exception as e:
        return {"status": "error", "messageToUser": f"Something went wrong: {str(e)[:200]}", "hcpName": "", "result": {"status": "error", "messageToUser": f"Something went wrong: {str(e)[:200]}"}}


@app.post("/suggestions")
def get_suggestions(data: InteractionResponse):
    try:
        result = followup_recommendation_tool(data.dict())
        return result
    except RuntimeError as e:
        return {"status": "error", "suggestions": [], "messageToUser": str(e)}
    except Exception as e:
        return {"status": "error", "suggestions": [], "messageToUser": f"Something went wrong: {str(e)[:200]}"}


@app.post("/check-form")
def check_form(data: InteractionResponse):
    try:
        result = check_form_tool(data.dict())
        return result
    except RuntimeError as e:
        return {"status": "error", "messageToUser": str(e), "isComplete": False}
    except Exception as e:
        return {"status": "error", "messageToUser": f"Something went wrong: {str(e)[:200]}", "isComplete": False}


@app.post("/interactions")
def create_interaction(data: InteractionResponse, db: Session = Depends(get_db)):
    interaction = Interaction(
        user_id=None,
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
    return {"success": True, "id": interaction.id}


@app.delete("/interactions")
def delete_all_interactions(db: Session = Depends(get_db)):
    db.query(Interaction).delete()
    db.commit()
    return {"success": True, "message": "All interactions deleted"}


@app.get("/interactions")
def get_interactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=500),
    search: str = Query("", max_length=100),
    db: Session = Depends(get_db),
):
    query = db.query(Interaction)
    if search.strip():
        like = f"%{search.strip()}%"
        query = query.filter(
            Interaction.hcp_name.ilike(like) |
            Interaction.topics.ilike(like) |
            Interaction.interaction_type.ilike(like) |
            Interaction.sentiment.ilike(like) |
            Interaction.outcomes.ilike(like)
        )
    total = query.count()
    offset = (page - 1) * page_size
    rows = query.order_by(Interaction.created_at.desc()).offset(offset).limit(page_size).all()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
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
    }
