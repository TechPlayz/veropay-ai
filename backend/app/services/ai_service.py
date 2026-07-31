import os
from collections.abc import Sequence
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class AIConfigurationError(Exception):
    """Raised when the server has no OpenAI API key configured."""


class AIProviderError(Exception):
    """Raised when OpenAI cannot complete a chat request."""


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
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise AIConfigurationError(
            "AI is not configured yet. Add OPENAI_API_KEY to backend/.env and restart the server."
        )

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        system_content = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Recent ride-analysis context:\n{ride_context}"
        )

        conversation = [
            {"role": "system", "content": system_content},
            *messages,
        ]

        # web_search_preview tool is available on gpt-4o and gpt-4o-mini via the Responses API.
        # For the standard Chat Completions API we skip it to stay compatible with all models.
        if use_web_search:
            response = client.responses.create(
                model=model,
                input=conversation,
                tools=[{"type": "web_search_preview"}],
            )
            answer = response.output_text.strip()
        else:
            completion = client.chat.completions.create(
                model=model,
                messages=conversation,
            )
            answer = (completion.choices[0].message.content or "").strip()

        if not answer:
            raise AIProviderError("The AI service returned an empty response.")
        return answer
    except AIConfigurationError:
        raise
    except Exception as error:
        raise AIProviderError("The AI service could not answer right now. Please try again.") from error
