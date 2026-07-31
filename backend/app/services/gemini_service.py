"""
gemini_service.py
-----------------
Single reusable Gemini client for the entire VeroPay backend.

All AI features route through this module:
  - Vehicle OCR correction       → correct_vehicle_details()
  - Mileage estimation           → estimate_vehicle_mileage()
  - Generic text generation      → generate_response()
  - Conversational / RAG chat    → chat()

Never instantiate google.generativeai anywhere else in the codebase.

NOTE: This module uses google-generativeai (0.8.x).
      To access Gemini 2.5 Flash, upgrade to the google-genai package
      and update _get_client() accordingly.
"""

import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------

# "gemini-1.5-flash-latest" resolves to the newest 1.5 Flash via the old SDK.
# When the project upgrades to google-genai, change this to
# "gemini-2.5-flash" and update _get_client().
_MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

_GENERATION_CONFIG = {
    "temperature": 0,
    "top_p": 1,
    "top_k": 1,
}

# ---------------------------------------------------------------------------
# Lazy singleton — the client is created once on first use.
# Returns None when GEMINI_API_KEY is absent so callers can degrade gracefully.
# ---------------------------------------------------------------------------

_client = None
_client_initialised = False


def _get_client():
    global _client, _client_initialised
    if _client_initialised:
        return _client

    _client_initialised = True
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — Gemini features will be skipped.")
        return None

    try:
        import google.generativeai as genai  # noqa: PLC0415

        genai.configure(api_key=api_key)
        _client = genai.GenerativeModel(
            model_name=_MODEL_NAME,
            generation_config=_GENERATION_CONFIG,
        )
        logger.info("Gemini client initialised with model %s.", _MODEL_NAME)
    except Exception:
        logger.exception("Failed to initialise Gemini client.")
        _client = None

    return _client


# ---------------------------------------------------------------------------
# Vehicle OCR correction
# ---------------------------------------------------------------------------

_CORRECTION_PROMPT = """\
You are correcting OCR output extracted from an Indian Vehicle Registration Certificate.
The OCR system has already extracted the correct fields.
Your job is ONLY to correct OCR spelling mistakes and normalize values.

Rules:
- Do NOT invent information.
- Do NOT change values that already appear correct.
- Preserve the same vehicle.
- Correct obvious OCR mistakes.
- Normalize manufacturer names (e.g. "BAJAJ AUTOLTD" → "Bajaj").
- Normalize fuel names (e.g. "PEIROL" → "Petrol").
- Keep years unchanged unless clearly impossible.
- If uncertain, return the original value unchanged.
- Never guess a different vehicle.

Return ONLY valid JSON with exactly these four keys:
vehicle_make, vehicle_model, vehicle_year, fuel_type

OCR DATA:
{ocr_json}"""


def correct_vehicle_details(
    vehicle_make: Optional[str],
    vehicle_model: Optional[str],
    vehicle_year: Optional[int],
    fuel_type: Optional[str],
) -> Dict[str, Any]:
    """
    Send raw OCR-extracted vehicle fields to Gemini for spelling correction
    and normalization.  Returns a dict with the same four keys.

    On any failure (no API key, network error, bad JSON) the original values
    are returned unchanged — registration must never break.
    """
    original = {
        "vehicle_make": vehicle_make,
        "vehicle_model": vehicle_model,
        "vehicle_year": vehicle_year,
        "fuel_type": fuel_type,
    }

    # Skip if all fields are None — nothing to correct
    if all(v is None for v in original.values()):
        return original

    client = _get_client()
    if client is None:
        return original

    ocr_json = json.dumps(original, ensure_ascii=False)
    prompt = _CORRECTION_PROMPT.format(ocr_json=ocr_json)

    for attempt in range(2):
        try:
            response = client.generate_content(prompt)
            text = (response.text or "").strip()
            corrected = _parse_json_response(text)
            if corrected is not None:
                return _merge_correction(original, corrected)
        except Exception:
            logger.exception("Gemini correction attempt %d failed.", attempt + 1)

    logger.warning("Gemini correction failed after 2 attempts — returning original OCR values.")
    return original


def _parse_json_response(text: str) -> Optional[Dict[str, Any]]:
    """Extract the first JSON object from a Gemini response string."""
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?", "", text).strip()
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def _merge_correction(
    original: Dict[str, Any],
    corrected: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Merge corrected values back, keeping the original for any key that
    Gemini dropped or returned as None when the original was not None.
    Also coerce vehicle_year back to int if Gemini returned it as a string.
    """
    result = dict(original)
    for key in ("vehicle_make", "vehicle_model", "vehicle_year", "fuel_type"):
        new_val = corrected.get(key)
        if new_val is not None:
            if key == "vehicle_year":
                try:
                    new_val = int(new_val)
                except (TypeError, ValueError):
                    new_val = original.get(key)
            result[key] = new_val
    return result


# ---------------------------------------------------------------------------
# Mileage estimation
# ---------------------------------------------------------------------------

_MILEAGE_PROMPT = """\
Estimate the typical real-world mileage in km per liter for this Indian gig-work vehicle.
Return ONLY valid JSON in the format: {{"mileage": <number>}}
Treat the value as a real-world estimate, not the manufacturer's claimed figure.

Vehicle: {make} {model}
Year: {year}
Fuel: {fuel}"""


def estimate_vehicle_mileage(
    vehicle_make: Optional[str],
    vehicle_model: Optional[str],
    vehicle_year: Optional[int],
    fuel_type: Optional[str],
) -> Optional[float]:
    """
    Ask Gemini to estimate real-world mileage (km/l) for the given vehicle.
    Returns None when the API key is absent or the call fails.
    """
    if not vehicle_make or not vehicle_model:
        return None

    client = _get_client()
    if client is None:
        return None

    prompt = _MILEAGE_PROMPT.format(
        make=vehicle_make,
        model=vehicle_model,
        year=vehicle_year,
        fuel=fuel_type,
    )

    try:
        response = client.generate_content(prompt)
        text = (response.text or "").strip()
        data = _parse_json_response(text)
        if data is None:
            return None
        mileage = data.get("mileage")
        return float(mileage) if mileage is not None else None
    except Exception:
        logger.exception("Gemini mileage estimation failed.")
        return None


# ---------------------------------------------------------------------------
# Generic text generation  (reusable by future endpoints)
# ---------------------------------------------------------------------------

def generate_response(prompt: str) -> Optional[str]:
    """
    Send a plain text prompt to Gemini and return the response string.
    Returns None on failure.
    """
    client = _get_client()
    if client is None:
        return None
    try:
        response = client.generate_content(prompt)
        return (response.text or "").strip() or None
    except Exception:
        logger.exception("Gemini generate_response failed.")
        return None


# ---------------------------------------------------------------------------
# Conversational chat  (reusable by the RAG assistant)
# ---------------------------------------------------------------------------

def chat(history: List[Dict[str, str]], message: str) -> Optional[str]:
    """
    Continue a multi-turn conversation.

    history format (mirrors the google.generativeai ChatSession format):
        [{"role": "user", "parts": ["..."]}, {"role": "model", "parts": ["..."]}]

    Returns the model's reply string, or None on failure.

    The RAG assistant must call this function — never create its own client.
    """
    client = _get_client()
    if client is None:
        return None
    try:
        session = client.start_chat(history=history)
        response = session.send_message(message)
        return (response.text or "").strip() or None
    except Exception:
        logger.exception("Gemini chat failed.")
        return None


def chat_with_system(
    system_instruction: str,
    history: List[Dict[str, str]],
    message: str,
    use_web_search: bool = False,
) -> Optional[str]:
    """
    Start a chat session with a custom system instruction and optional
    Google Search grounding.  Creates a short-lived model instance so the
    system prompt can include per-request context (e.g. recent ride data).

    history format: [{"role": "user"|"model", "parts": ["..."]}]

    Returns the model's reply string, or None on failure.
    Raises RuntimeError when the API key is absent (caller maps to 503).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    try:
        import google.generativeai as genai  # noqa: PLC0415

        genai.configure(api_key=api_key)
        tools = ["google_search_retrieval"] if use_web_search else None
        model = genai.GenerativeModel(
            model_name=_MODEL_NAME,
            system_instruction=system_instruction,
            tools=tools,
        )
        session = model.start_chat(history=history)
        response = session.send_message(message)
        text = (response.text or "").strip()
        return text or None
    except RuntimeError:
        raise
    except Exception:
        logger.exception(
            "Gemini chat_with_system failed (model=%s, web_search=%s).",
            _MODEL_NAME,
            use_web_search,
        )
        raise
