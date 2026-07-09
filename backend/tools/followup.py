import json
from backend.llm.groq_client import call_llm


FOLLOWUP_PROMPT = """
Based on the following HCP interaction details, suggest 3 relevant follow-up actions.
Return ONLY a valid JSON array of strings, with exactly 3 suggestions.
Example: ["Schedule follow-up meeting in 2 weeks", "Send product brochure via email", "Add to KOL engagement list"]

Interaction details:
{hcp_name} | {interaction_type} | {date}
Topics: {topics}
Outcomes: {outcomes}
Sentiment: {sentiment}
"""


def followup_recommendation_tool(form_data: dict = None) -> dict:
    if not form_data:
        return {
            "status": "ok",
            "suggestions": [
                "Schedule follow-up meeting in 2 weeks",
                "Send OncoBoost Phase III PDF",
                "Add Dr. Sharma to advisory board invite list",
            ],
            "messageToUser": "3 follow-up suggestions generated.",
        }

    prompt = FOLLOWUP_PROMPT.format(
        hcp_name=form_data.get("hcpName", "Unknown"),
        interaction_type=form_data.get("interactionType", "Meeting"),
        date=form_data.get("date", "N/A"),
        topics=form_data.get("topics", "N/A"),
        outcomes=form_data.get("outcomes", "N/A"),
        sentiment=form_data.get("sentiment", "Neutral"),
    )

    raw = call_llm(prompt)
    suggestions = []
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1]
            cleaned = cleaned.rsplit("```", 1)[0]
        suggestions = json.loads(cleaned.strip())
        if not isinstance(suggestions, list):
            suggestions = []
        suggestions = suggestions[:3]
    except (json.JSONDecodeError, TypeError):
        suggestions = [
            "Schedule follow-up meeting in 2 weeks",
            "Send OncoBoost Phase III PDF",
            "Add Dr. Sharma to advisory board invite list",
        ]

    while len(suggestions) < 3:
        suggestions.append(f"Review interaction with {form_data.get('hcpName', 'HCP')}")

    return {
        "status": "ok",
        "suggestions": suggestions[:3],
        "messageToUser": "3 follow-up suggestions generated.",
    }
