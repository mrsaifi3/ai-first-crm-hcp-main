from backend.database import SessionLocal
from backend.models import Interaction

def edit_interaction_tool(interaction_id: int, new_summary: str):
    db = SessionLocal()
    interaction = db.query(Interaction).filter(
        Interaction.id == interaction_id
    ).first()

    if not interaction:
        return {"error": "Interaction not found"}

    interaction.summary = new_summary
    db.commit()
    db.close()

    return {
        "status": "updated",
        "interaction_id": interaction_id
    }
