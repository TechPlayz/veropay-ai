import os
from collections.abc import Sequence
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class AIConfigurationError(Exception):
    """Raised when the server has no Gemini API key configured."""


class AIProviderError(Exception):
    """Raised when Gemini cannot complete a chat request."""


SYSTEM_PROMPT = (
    "You are VeroPay AI, a helpful assistant for gig workers in India. "
    "Focus on fair-pay estimates, ride profitability, earnings patterns, and respectful "
    "payment-review guidance. Use the supplied ride data when relevant. VeroPay's fair "
    "fare is an estimate, not proof of wrongdoing — do not claim a platform acted illegally. "
    "For safety, financial, legal, or tax questions give general information and encourage "
    "the worker to seek an appropriate professional. Keep answers clear, practical, and concise."
)


def generate_chat_response(
    messages: Sequence[dict[str, str]],
    ride_context: str,
    use_web_search: bool,
) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise AIConfigurationError(
            "AI is not configured yet. Add GEMINI_API_KEY to backend/.env and restart the server."
        )

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

        # Build tools list — Gemini supports Google Search grounding
        tools = ["google_search_retrieval"] if use_web_search else []

        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=(
                f"{SYSTEM_PROMPT}\n\n"
                f"Recent ride-analysis context:\n{ride_context}"
            ),
            tools=tools if tools else None,
        )

        # Convert messages to Gemini format
        # Gemini uses "user" and "model" roles (not "assistant")
        history = []
        for msg in messages[:-1]:
            role = "model" if msg["role"] == "assistant" else "user"
            history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=history)
        last_message = messages[-1]["content"]
        response = chat.send_message(last_message)

        answer = response.text.strip()
        if not answer:
            raise AIProviderError("Gemini returned an empty response.")
        return answer

    except AIConfigurationError:
        raise
    except Exception as error:
        raise AIProviderError(
            "The AI service could not answer right now. Please try again."
        ) from error
