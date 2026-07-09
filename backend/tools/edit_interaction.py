import json
from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction


EDIT_PROMPT = """
You are a healthcare CRM assistant. The user wants to CORRECT a previously logged HCP interaction.
Based on the conversation history and the latest correction, extract ONLY the fields that need to be UPDATED.
Return ONLY valid JSON with the fields that changed. Possible fields:
- hcpName (string)
- specialty (string)
- interactionType (string: Meeting/Call/Email)
- date (string, YYYY-MM-DD)
- time (string, HH:MM)
- attendees (string)
- topics (string)
- product (string)
- summary (string)
- sentiment (string: Positive/Neutral/Negative)

Only include fields that are being corrected. Example:
User: "Sorry, the name was actually Dr. John and the sentiment was negative"
Return: {"hcpName": "Dr. John", "sentiment": "Negative"}

Correction: {text}
"""


def edit_interaction_tool(user_text: str, history: list = None):
    prompt = EDIT_PROMPT.format(text=user_text)
    raw = call_llm(prompt, history=history)

    parsed = {}
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned.strip())
    except json.JSONDecodeError:
        return {
            "status": "error",
            "messageToUser": "Could not understand the correction. Please try again.",
        }

    changed = list(parsed.keys())
    hcp_name = parsed.get("hcpName", "")
    summary = parsed.get("summary", "")

    if hcp_name or summary:
        db = SessionLocal()
        latest = db.query(Interaction).order_by(Interaction.id.desc()).first()
        if latest:
            if hcp_name:
                latest.hcp_name = hcp_name
            if summary:
                latest.summary = summary
            db.commit()
        db.close()

    return {
        "status": "updated",
        "messageToUser": f"Updated fields: {', '.join(changed)}.",
        **parsed,
    }
