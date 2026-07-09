from backend.llm.groq_client import call_llm

CHECK_FORM_PROMPT = """
You are a friendly healthcare CRM assistant. You're checking an HCP interaction form to see what's still missing.

Current form state:
- HCP Name: {hcpName}
- Interaction Type: {interactionType}
- Date: {date}
- Time: {time}
- Attendees: {attendees}
- Topics Discussed: {topics}
- Product: {product}
- Materials Shared: {materialsShared}
- Samples Distributed: {samplesDistributed}
- Sentiment: {sentiment}
- Outcomes: {outcomes}
- Follow-up Actions: {followupActions}

Check which of these important fields are MISSING (empty):
- topics: "What topics were discussed?"
- product: "Which product or medicine was discussed?"
- sentiment: "How was the HCP's sentiment?"
- outcomes: "What outcomes or agreements came from the meeting?"
- followupActions: "Any follow-up actions needed?"
- attendees: "Were there any other attendees?"
- materialsShared: "Any materials shared?"
- samplesDistributed: "Any samples distributed?"

RULES:
1. If ALL fields are filled, reply with a completion message.
2. If some fields are missing, pick the SINGLE most important missing field and ask ONE natural question about it.
3. Keep it conversational — don't list everything that's missing.

Return ONLY valid JSON with these fields:
- messageToUser (string, your reply asking about the missing field or confirming completeness)
- isComplete (boolean, true if all important fields are filled)

Examples:

Form has hcpName="Dr. Smith", topics="OncoBoost", sentiment="Positive" but outcomes is empty:
{{"messageToUser": "Great, most info is logged! What outcomes came from your meeting with Dr. Smith?", "isComplete": false}}

Form has everything filled:
{{"messageToUser": "Everything looks complete! You're all set.", "isComplete": true}}
"""


def check_form_tool(form_data: dict) -> dict:
    if not form_data.get("hcpName"):
        return {
            "messageToUser": "Start by telling me who you met with!",
            "isComplete": False,
        }

    prompt = CHECK_FORM_PROMPT.format(
        hcpName=form_data.get("hcpName", ""),
        interactionType=form_data.get("interactionType", "Meeting"),
        date=form_data.get("date", ""),
        time=form_data.get("time", ""),
        attendees=form_data.get("attendees", ""),
        topics=form_data.get("topics", ""),
        product=form_data.get("product", ""),
        materialsShared=form_data.get("materialsShared", ""),
        samplesDistributed=form_data.get("samplesDistributed", ""),
        sentiment=form_data.get("sentiment", ""),
        outcomes=form_data.get("outcomes", ""),
        followupActions=form_data.get("followupActions", ""),
    )

    import json
    raw = call_llm(prompt)
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        parsed = json.loads(cleaned.strip())
        return {
            "messageToUser": parsed.get("messageToUser", "What else would you like to add?"),
            "isComplete": parsed.get("isComplete", False),
        }
    except (json.JSONDecodeError, TypeError):
        return {
            "messageToUser": "What else would you like to add?",
            "isComplete": False,
        }
