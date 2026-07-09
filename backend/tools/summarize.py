from backend.database import SessionLocal
from backend.models import Interaction


def summarize_interactions_tool():
    db = SessionLocal()
    count = db.query(Interaction).count()
    db.close()
    return f"Total interactions logged: {count}"
