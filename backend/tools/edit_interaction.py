import json
from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction


FIELD_MAP = {
    "hcpName": "hcp_name",
    "specialty": "specialty",
    "interactionType": "interaction_type",
    "product": "product",
    "summary": "summary",
    "sentiment": "sentiment",
    "date": "date",
    "time": "time",
    "attendees": "attendees",
    "topics": "topics",
    "materialsShared": "materials_shared",
    "samplesDistributed": "samples_distributed",
    "outcomes": "outcomes",
    "followupActions": "followup_actions",
}

EDIT_PROMPT = """
You are a healthcare CRM assistant. The user is providing ADDITIONAL or CORRECTED info about the last HCP interaction.

Based on the conversation history and the latest input, determine what fields to ADD or UPDATE.
Return ONLY valid JSON with ALL the fields you can determine from the full conversation so far.
If a field is not mentioned, leave it as an empty string "".

Possible fields:
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
- materialsShared (string)
- samplesDistributed (string)
- outcomes (string)
- followupActions (string)

After determining the fields, in messageToUser, confirm what was added and ask if there's anything else missing.

Examples:

User: "Outcomes were positive, need to follow up in 2 weeks"
Assistant: {"outcomes": "Positive outcomes", "followupActions": "Follow up in 2 weeks", "messageToUser": "Added outcomes and follow-up. Anything else to add?"}

User: "The sentiment was actually negative"
Assistant: {"sentiment": "Negative", "messageToUser": "Updated sentiment to Negative. Any other changes?"}

Latest input: {text}
"""


def edit_interaction_tool(user_text: str, history: list = None):
    prompt = EDIT_PROMPT.replace("{text}", user_text)
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

    changed = [k for k in parsed.keys() if k != "messageToUser" and parsed.get(k)]

    db = SessionLocal()
    latest = db.query(Interaction).order_by(Interaction.id.desc()).first()

    if latest and changed:
        for frontend_key, db_col in FIELD_MAP.items():
            if frontend_key in parsed and parsed.get(frontend_key):
                setattr(latest, db_col, parsed[frontend_key])
        db.commit()
        db.refresh(latest)
    db.close()

    result = {
        "status": "updated",
        "messageToUser": parsed.get(
            "messageToUser",
            f"Updated interaction. Added: {', '.join(changed)}." if changed else "No changes detected.",
        ),
    }

    if latest:
        result.update({
            "hcpName": latest.hcp_name,
            "specialty": latest.specialty or "",
            "interactionType": latest.interaction_type or "Meeting",
            "product": latest.product or "",
            "summary": latest.summary or "",
            "sentiment": latest.sentiment or "Neutral",
            "date": latest.date or "",
            "time": latest.time or "",
            "attendees": latest.attendees or "",
            "topics": latest.topics or "",
            "materialsShared": latest.materials_shared or "",
            "samplesDistributed": latest.samples_distributed or "",
            "outcomes": latest.outcomes or "",
            "followupActions": latest.followup_actions or "",
        })
    else:
        result.update(parsed)

    return result
