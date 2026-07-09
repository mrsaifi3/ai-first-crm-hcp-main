from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction

def log_interaction_tool(user_text: str):
    summary = call_llm(user_text)

    interaction = Interaction(
        hcp_name="Dr. Sharma",
        specialty="Cardiology",
        product="Hypertension Drug",
        summary=summary,
        sentiment="Positive"
    )

    db = SessionLocal()
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    db.close()

    return {
        "status": "logged",
        "interaction_id": interaction.id
    }
