import json
from backend.llm.groq_client import call_llm
from backend.database import SessionLocal
from backend.models import Interaction


EXTRACTION_PROMPT = """
Based on the conversation so far and the latest user input, extract structured fields from the HCP interaction.
Return ONLY valid JSON with these fields:
- hcpName (string, the doctor's name)
- specialty (string, medical specialty)
- interactionType (string: Meeting/Call/Email)
- date (string, date in YYYY-MM-DD format)
- time (string, time in HH:MM format)
- attendees (string, comma-separated)
- topics (string, topics discussed)
- product (string, product or material shared)
- summary (string, brief summary)
- sentiment (string: Positive/Neutral/Negative)
- materialsShared (string, materials shared with HCP)
- samplesDistributed (string, samples distributed)
- outcomes (string, key outcomes or agreements)
- followupActions (string, follow-up actions or next steps)

Latest input: {text}
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
        parsed = {"summary": raw, "hcpName": "Unknown"}

    hcp_name = parsed.get("hcpName", "Unknown")
    specialty = parsed.get("specialty", "")
    product = parsed.get("product", "")
    summary = parsed.get("summary", raw)
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
        "messageToUser": f"Logged interaction with {hcp_name} ({interaction_type}, {date}). Summary: {summary}",
    }
