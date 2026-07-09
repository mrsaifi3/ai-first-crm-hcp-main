import json
from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction


EXTRACTION_PROMPT = """
You are a helpful healthcare CRM assistant. The user is telling you about an HCP interaction.
Your job is to extract structured data AND have a conversation — ask follow-up questions if details are missing.

IMPORTANT RULES:
1. If the user hasn't provided enough details to log a meaningful interaction, DO NOT log it.
   Instead, set "shouldLog": false and ask a friendly follow-up question in "messageToUser".
2. If the user provides enough info (at minimum: hcpName + some context), set "shouldLog": true and extract all fields.
3. Be conversational and helpful. Ask about missing key fields naturally.
4. Return ONLY valid JSON — no extra text.

Required fields to extract when shouldLog is true:
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

Examples:

User: "Met Dr. Smith today"
Assistant: {"shouldLog": false, "messageToUser": "Great, what was discussed with Dr. Smith? Any particular product or topic?"}

User: "Met Dr. Smith, discussed OncoBoost efficacy, positive response"
Assistant: {"shouldLog": true, "date": "2025-07-10", "hcpName": "Dr. Smith", "topics": "OncoBoost efficacy", "sentiment": "Positive", "interactionType": "Meeting", "summary": "Discussed OncoBoost efficacy with Dr. Smith, positive response", "messageToUser": "Logged interaction with Dr. Smith (Meeting). Do you have any follow-up actions to add?"}

User: "Met Dr. Smith yesterday at his clinic, discussed hypertension drug, he was positive, shared brochure"
Assistant: {"shouldLog": true, "date": "2025-07-09", "hcpName": "Dr. Smith", "topics": "Hypertension drug discussion", "sentiment": "Positive", "interactionType": "Meeting", "attendees": "Dr. Smith", "materialsShared": "Brochure", "summary": "Met Dr. Smith at his clinic, discussed hypertension drug, positive sentiment, shared brochure", "messageToUser": "Logged interaction with Dr. Smith. Would you like to add any outcomes or follow-up actions?"}

Latest user input: {text}
"""


def log_interaction_tool(user_text: str, history: list = None):
    prompt = EXTRACTION_PROMPT.format(text=user_text)
    raw = call_llm(prompt, history=history)

    parsed = {}
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned.strip())
    except json.JSONDecodeError:
        parsed = {
            "shouldLog": False,
            "messageToUser": "I didn't quite catch that. Could you tell me more about the interaction?",
        }

    should_log = parsed.get("shouldLog", False)

    if not should_log:
        return {
            "status": "asking",
            "hcpName": parsed.get("hcpName", ""),
            "messageToUser": parsed.get(
                "messageToUser",
                "Could you share more details about the HCP interaction?",
            ),
        }

    hcp_name = parsed.get("hcpName", "Unknown")
    specialty = parsed.get("specialty", "")
    product = parsed.get("product", "")
    summary = parsed.get("summary", user_text)
    sentiment = parsed.get("sentiment", "Neutral")
    interaction_type = parsed.get("interactionType", "Meeting")
    date = parsed.get("date", "")
    time = parsed.get("time", "")
    attendees = parsed.get("attendees", "")
    topics = parsed.get("topics", "")
    materials_shared = parsed.get("materialsShared", "")
    samples_distributed = parsed.get("samplesDistributed", "")
    outcomes = parsed.get("outcomes", "")
    followup_actions = parsed.get("followupActions", "")

    interaction = Interaction(
        hcp_name=hcp_name,
        specialty=specialty,
        interaction_type=interaction_type,
        product=product,
        summary=summary,
        sentiment=sentiment,
        date=date,
        time=time,
        attendees=attendees,
        topics=topics,
        materials_shared=materials_shared,
        samples_distributed=samples_distributed,
        outcomes=outcomes,
        followup_actions=followup_actions,
    )

    db = SessionLocal()
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    db.close()

    return {
        "status": "logged",
        "interaction_id": interaction.id,
        "hcpName": hcp_name,
        "specialty": specialty,
        "product": product,
        "summary": summary,
        "sentiment": sentiment,
        "interactionType": interaction_type,
        "date": date,
        "time": time,
        "attendees": attendees,
        "topics": topics,
        "materialsShared": materials_shared,
        "samplesDistributed": samples_distributed,
        "outcomes": outcomes,
        "followupActions": followup_actions,
        "messageToUser": parsed.get(
            "messageToUser",
            f"Logged interaction with {hcp_name} ({interaction_type}, {date}).",
        ),
    }
