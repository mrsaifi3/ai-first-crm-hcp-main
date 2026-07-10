import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()


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

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        err_str = str(e).lower()
        if "rate limit" in err_str or "rate_limit" in err_str:
            raise RuntimeError("Groq API rate limit exceeded. Please wait a moment and try again.")
        if "quota" in err_str or "exhausted" in err_str:
            raise RuntimeError("Groq API quota exhausted. Check your plan or API key.")
        if "api key" in err_str or "unauthorized" in err_str or "auth" in err_str:
            raise RuntimeError("Invalid Groq API key. Check your GROQ_API_KEY.")
        if "timeout" in err_str:
            raise RuntimeError("Groq API timed out. Please try again.")
        raise RuntimeError(f"Groq API error: {str(e)[:200]}")
