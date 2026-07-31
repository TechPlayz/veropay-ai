"""
ai_service.py
-------------
Thin adapter between the chat route and gemini_service.

All Gemini interactions go through gemini_service.chat_with_system().
This module owns only the system prompt and the error taxonomy exposed
to the HTTP layer.
"""

import logging
from collections.abc import Sequence

from app.services.gemini_service import chat_with_system

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are VeroPay AI, a helpful assistant for gig workers in India. "
    "Focus on fair-pay estimates, ride profitability, earnings patterns, and respectful "
    "payment-review guidance. Use the supplied ride data when relevant. VeroPay's fair "
    "fare is an estimate, not proof of wrongdoing — do not claim a platform acted illegally. "
    "For safety, financial, legal, or tax questions give general information and encourage "
    "the worker to seek an appropriate professional. Keep answers clear, practical, and concise."
)


class AIConfigurationError(Exception):
    """Raised when Gemini is not configured (no API key)."""


class AIProviderError(Exception):
    """Raised when Gemini is configured but the request fails."""


def generate_chat_response(
    messages: Sequence[dict[str, str]],
    ride_context: str,
    use_web_search: bool,
) -> str:
    # Build Gemini history from all messages except the last
    # Gemini uses "user" / "model" roles (not "assistant")
    history = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [m["content"]]}
        for m in messages[:-1]
    ]
    last_message = messages[-1]["content"]

    system_instruction = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Recent ride-analysis context:\n{ride_context}"
    )

    try:
        answer = chat_with_system(
            system_instruction=system_instruction,
            history=history,
            message=last_message,
            use_web_search=use_web_search,
        )
    except RuntimeError as exc:
        # gemini_service raises RuntimeError when the API key is absent
        raise AIConfigurationError(
            "AI is not configured yet. Add GEMINI_API_KEY to backend/.env and restart the server."
        ) from exc
    except Exception as exc:
        logger.exception(
            "generate_chat_response failed: %s: %s",
            type(exc).__name__,
            exc,
        )
        raise AIProviderError(
            "The AI service could not answer right now. Please try again."
        ) from exc

    if not answer:
        raise AIProviderError("Gemini returned an empty response.")

    return answer
