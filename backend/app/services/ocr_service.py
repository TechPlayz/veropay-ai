import re
from functools import lru_cache
from typing import Dict, Optional


class OCRProcessingError(Exception):
    pass


@lru_cache(maxsize=1)
def _get_reader():
    import easyocr

    return easyocr.Reader(["en"], gpu=False)


def extract_ride_values(image_bytes: bytes) -> Dict[str, Optional[float]]:
    try:
        reader = _get_reader()
        text_parts = reader.readtext(image_bytes, detail=0, paragraph=True)
    except Exception as exc:
        raise OCRProcessingError("Could not read text from the uploaded image.") from exc

    text = " ".join(str(part) for part in text_parts)
    if not text.strip():
        return {"fare": None, "distance": None, "duration": None}

    return {
        "fare": _parse_fare(text),
        "distance": _parse_distance(text),
        "duration": _parse_duration_minutes(text),
    }


def _parse_fare(text: str) -> Optional[float]:
    patterns = [
        r"(?:fare|earned|earnings|paid|price|amount|total)\D{0,30}(?:rs\.?|inr|\u20b9|\$)?\s*([0-9]+(?:[.,][0-9]{1,2})?)",
        r"(?:rs\.?|inr|\u20b9|\$)\s*([0-9]+(?:[.,][0-9]{1,2})?)",
    ]
    return _first_float_match(patterns, text)


def _parse_distance(text: str) -> Optional[float]:
    patterns = [
        r"(?:distance|trip)\D{0,30}([0-9]+(?:[.,][0-9]+)?)\s*(?:km|kilometers?|mi|miles?)",
        r"([0-9]+(?:[.,][0-9]+)?)\s*(?:km|kilometers?|mi|miles?)",
    ]
    return _first_float_match(patterns, text)


def _parse_duration_minutes(text: str) -> Optional[int]:
    normalized = text.lower()

    hour_minute_match = re.search(
        r"(?:(?:duration|time|trip time)\D{0,30})?(?:(\d+)\s*(?:h|hr|hrs|hour|hours))\s*(?:(\d+)\s*(?:m|min|mins|minute|minutes))?",
        normalized,
        re.IGNORECASE,
    )
    if hour_minute_match:
        hours = int(hour_minute_match.group(1) or 0)
        minutes = int(hour_minute_match.group(2) or 0)
        return hours * 60 + minutes

    minute_match = re.search(
        r"(?:(?:duration|time|trip time)\D{0,30})?(\d+)\s*(?:m|min|mins|minute|minutes)",
        normalized,
        re.IGNORECASE,
    )
    if minute_match:
        return int(minute_match.group(1))

    return None


def _first_float_match(patterns, text: str) -> Optional[float]:
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", "."))
    return None
