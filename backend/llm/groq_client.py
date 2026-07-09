import os
from groq import Groq


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set")
    return Groq(api_key=api_key)


def call_llm(prompt: str, history: list = None) -> str:
    client = get_groq_client()

    messages = [
        {
            "role": "system",
            "content": "You are a friendly and conversational healthcare CRM assistant. You help log HCP interactions naturally — ask questions one at a time, be helpful, and keep the conversation flowing. Never dump multiple questions at once."
        }
    ]

    if history:
        for msg in history:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("text", "")})

    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7
    )

    return response.choices[0].message.content
