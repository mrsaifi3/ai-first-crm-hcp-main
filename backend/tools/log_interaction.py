import json
from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction


CRITICAL_FIELDS = ["hcpName", "topics", "sentiment"]
NEXT_QUESTIONS = {
    "topics": "What topics were discussed?",
    "product": "Which product or medicine was discussed?",
    "sentiment": "How was the HCP's sentiment — positive, neutral, or negative?",
    "outcomes": "What outcomes or agreements came from the meeting?",
    "followupActions": "Any follow-up actions needed?",
    "attendees": "Were there any other attendees?",
    "materialsShared": "Any materials shared with the HCP?",
    "samplesDistributed": "Any samples distributed?",
}

EXTRACTION_PROMPT = """
You are a friendly healthcare CRM assistant. Your job is to log HCP interactions naturally.

CRITICAL RULE: Your messageToUser MUST ALWAYS end with a question to keep the conversation going. Never just confirm — always ask about the next missing field.

MISSING FIELD PRIORITY (ask about these in order):
1. topics — "What topics were discussed?"
2. product — "Which product or medicine was discussed?"
3. sentiment — "How was the HCP's sentiment?"
4. outcomes — "What outcomes or agreements came from the meeting?"
5. followupActions — "Any follow-up actions needed?"
6. attendees — "Were there any other attendees?"
7. materialsShared — "Any materials shared?"
8. samplesDistributed — "Any samples distributed?"

FLOW:
1. Extract ALL fields you can from what the user says.
2. If hcpName OR topics OR sentiment is missing → shouldLog: false, ask about the most important missing one.
3. If all critical fields are present (hcpName + topics + sentiment) → shouldLog: true.
4. EVEN WHEN LOGGING, ALWAYS ask ONE follow-up about the next missing field. Never end without a question.
5. If ALL fields are filled, ask "Is there anything else to add?"
6. Use conversation history — never repeat a question that was already answered.

Return ONLY valid JSON:
- shouldLog (boolean)
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
- messageToUser (string, MUST end with a question)

Examples:

User: "Met Dr. Smith"
Assistant: {"shouldLog": false, "hcpName": "Dr. Smith", "messageToUser": "Got it! What did you discuss with Dr. Smith?"}

User: "Met Dr. Smith, discussed OncoBoost"
Assistant: {"shouldLog": false, "hcpName": "Dr. Smith", "topics": "OncoBoost", "messageToUser": "Thanks! How was Dr. Smith's sentiment — positive, neutral, or negative?"}

User: "Met Dr. Smith, discussed OncoBoost with positive response"
Assistant: {"shouldLog": true, "hcpName": "Dr. Smith", "topics": "OncoBoost", "sentiment": "Positive", "interactionType": "Meeting", "summary": "Met Dr. Smith, discussed OncoBoost, positive response", "messageToUser": "Logged the meeting with Dr. Smith! Were there any outcomes or follow-up actions?"}

User: "I met with Dr Rahul, discussed about the HIV, negative sentiment on 8th July at 17:28, where saifi was also in meeting"
Assistant: {"shouldLog": true, "hcpName": "Dr. Rahul", "date": "2025-07-08", "time": "17:28", "attendees": "Saifi", "topics": "HIV discussion", "sentiment": "Negative", "interactionType": "Meeting", "summary": "Met Dr. Rahul on 8th July at 17:28, discussed HIV, Saifi attended, negative sentiment", "messageToUser": "Got it — logged Dr. Rahul's visit. What outcomes or next steps came from this meeting?"}

Latest user input: {text}
"""


def _pick_next_question(parsed: dict) -> str:
    order = ["topics", "product", "sentiment", "outcomes", "followupActions", "attendees", "materialsShared", "samplesDistributed"]
    for field in order:
        if field == "sentiment":
            continue  # handled by critical check
        if not parsed.get(field):
            return NEXT_QUESTIONS[field]
    return "Is there anything else to add?"


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
            "messageToUser": "I didn't quite catch that. Could you tell me about the HCP interaction?",
        }

    should_log = parsed.get("shouldLog", False)

    if not should_log:
        return {
            "status": "asking",
            "hcpName": parsed.get("hcpName", ""),
            "specialty": parsed.get("specialty", ""),
            "interactionType": parsed.get("interactionType", "Meeting"),
            "date": parsed.get("date", ""),
            "time": parsed.get("time", ""),
            "attendees": parsed.get("attendees", ""),
            "topics": parsed.get("topics", ""),
            "product": parsed.get("product", ""),
            "summary": parsed.get("summary", ""),
            "sentiment": parsed.get("sentiment", ""),
            "materialsShared": parsed.get("materialsShared", ""),
            "samplesDistributed": parsed.get("samplesDistributed", ""),
            "outcomes": parsed.get("outcomes", ""),
            "followupActions": parsed.get("followupActions", ""),
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
            f"Logged interaction with {hcp_name}. " + _pick_next_question(parsed),
        ),
    }
