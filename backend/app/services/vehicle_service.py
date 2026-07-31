import json
import os
import re
from typing import Dict, List, Optional, Tuple


MIN_OCR_CONFIDENCE = 0.45

KNOWN_MANUFACTURERS = [
    "Maruti Suzuki",
    "Hyundai",
    "Honda",
    "Toyota",
    "Tata",
    "Mahindra",
    "Kia",
    "Renault",
    "Nissan",
    "Skoda",
    "Volkswagen",
    "Ford",
    "Chevrolet",
    "Bajaj",
    "TVS",
    "Hero",
    "Yamaha",
    "Suzuki",
]

KNOWN_FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid", "lpg"]


def extract_vehicle_info(file_bytes: bytes, content_type: Optional[str]) -> Dict[str, Optional[object]]:
    text, confidence = _read_rc_text(file_bytes, content_type)
    if confidence < MIN_OCR_CONFIDENCE:
        return _empty_vehicle_info()

    vehicle_make = _extract_make(text)
    vehicle_model = _extract_model(text)
    vehicle_year = _extract_year(text)
    fuel_type = _extract_fuel_type(text)
    mileage = estimate_mileage(vehicle_make, vehicle_model, vehicle_year, fuel_type)

    return {
        "vehicle_make": vehicle_make,
        "vehicle_model": vehicle_model,
        "vehicle_year": vehicle_year,
        "fuel_type": fuel_type,
        "mileage": mileage,
    }


def estimate_mileage(
    vehicle_make: Optional[str],
    vehicle_model: Optional[str],
    vehicle_year: Optional[int],
    fuel_type: Optional[str],
) -> Optional[float]:
    if not vehicle_make or not vehicle_model:
        return None

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            "Estimate the typical real-world mileage in km per liter for this Indian gig-work vehicle. "
            "Return only JSON like {\"mileage\": 18.5}. Treat the value as an estimate. "
            f"Vehicle: {vehicle_make} {vehicle_model}, year: {vehicle_year}, fuel: {fuel_type}."
        )
        match = re.search(r"\{.*\}", response.text or "", re.DOTALL)
        if not match:
            return None
        data = json.loads(match.group(0))
        mileage = data.get("mileage")
        return float(mileage) if mileage is not None else None
    except Exception:
        return None


def _read_rc_text(file_bytes: bytes, content_type: Optional[str]) -> Tuple[str, float]:
    if content_type == "application/pdf":
        # EasyOCR does not read PDFs directly here. Return low confidence instead of guessing.
        return "", 0.0

    try:
        import easyocr

        reader = easyocr.Reader(["en"], gpu=False)
        results = reader.readtext(file_bytes, detail=1, paragraph=False)
    except Exception:
        return "", 0.0

    text_parts: List[str] = []
    confidences: List[float] = []
    for result in results:
        if len(result) >= 3:
            text_parts.append(str(result[1]))
            confidences.append(float(result[2]))

    if not text_parts:
        return "", 0.0

    return " ".join(text_parts), sum(confidences) / len(confidences)


def _empty_vehicle_info() -> Dict[str, Optional[object]]:
    return {
        "vehicle_make": None,
        "vehicle_model": None,
        "vehicle_year": None,
        "fuel_type": None,
        "mileage": None,
    }


def _extract_make(text: str) -> Optional[str]:
    normalized = text.lower()
    for manufacturer in KNOWN_MANUFACTURERS:
        if manufacturer.lower() in normalized:
            return manufacturer
    return None


def _extract_model(text: str) -> Optional[str]:
    patterns = [
        r"(?:model|makers class|vehicle class)\s*[:\-]?\s*([a-z0-9 ]{2,40})",
        r"(?:maker'?s name|maker name)\s*[:\-]?\s*[a-z ]+\s+([a-z0-9 ]{2,30})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return _clean_vehicle_text(match.group(1))
    return None


def _extract_year(text: str) -> Optional[int]:
    match = re.search(r"(?:registration|regn|manufactur(?:e|ing)|mfg)\D{0,20}(20\d{2}|19\d{2})", text, re.IGNORECASE)
    if match:
        return int(match.group(1))

    for year_text in re.findall(r"\b(20\d{2}|19\d{2})\b", text):
        year = int(year_text)
        if 1990 <= year <= 2030:
            return year
    return None


def _extract_fuel_type(text: str) -> Optional[str]:
    normalized = text.lower()
    for fuel_type in KNOWN_FUEL_TYPES:
        if re.search(rf"\b{re.escape(fuel_type)}\b", normalized):
            return fuel_type.title()
    return None


def _clean_vehicle_text(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9 ]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.title()
