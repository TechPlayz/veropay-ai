import re
from typing import Dict, List, Optional, Tuple

from app.services.gemini_service import correct_vehicle_details, estimate_vehicle_mileage


MIN_OCR_CONFIDENCE = 0.45

# Fraction of a detection's height that two boxes must vertically overlap
# to be considered "on the same line".
SAME_LINE_OVERLAP = 0.4

# If a bounding box is roughly square (aspect ratio close to 1) and its text
# is short pure-alphanumeric noise it is almost certainly a QR code fragment.
QR_MAX_ASPECT_RATIO = 1.4   # width / height  ≤ this  →  candidate for QR
QR_MAX_TEXT_LEN     = 6     # and text length  ≤ this  →  drop it

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

# ---------------------------------------------------------------------------
# Detection dataclass (plain dict for simplicity)
# Each detection: {"bbox": [[x0,y0],[x1,y1],[x2,y2],[x3,y3]], "text": str, "conf": float}
# Derived helpers add: "cx", "cy", "left", "right", "top", "bottom", "height"
# ---------------------------------------------------------------------------

def _bbox_bounds(bbox) -> Tuple[float, float, float, float]:
    """Return (left, top, right, bottom) from a 4-point bbox."""
    xs = [p[0] for p in bbox]
    ys = [p[1] for p in bbox]
    return min(xs), min(ys), max(xs), max(ys)


def _enrich(det: dict) -> dict:
    left, top, right, bottom = _bbox_bounds(det["bbox"])
    det["left"]   = left
    det["top"]    = top
    det["right"]  = right
    det["bottom"] = bottom
    det["height"] = bottom - top
    det["width"]  = right - left
    det["cy"]     = (top + bottom) / 2
    det["cx"]     = (left + right) / 2
    return det


def _is_qr_noise(det: dict) -> bool:
    """Heuristic: drop detections that look like QR-code fragments."""
    h = det["height"]
    w = det["width"]
    if h == 0:
        return True
    aspect = w / h
    text = det["text"].strip()
    # Square-ish box with very short text → QR fragment
    if aspect <= QR_MAX_ASPECT_RATIO and len(text) <= QR_MAX_TEXT_LEN:
        return True
    # Pure noise: only punctuation / single chars
    if re.fullmatch(r"[^a-zA-Z0-9]{1,4}", text):
        return True
    return False


def _same_line(a: dict, b: dict) -> bool:
    """True when two detections share enough vertical overlap to be on one line."""
    overlap = min(a["bottom"], b["bottom"]) - max(a["top"], b["top"])
    min_height = min(a["height"], b["height"])
    if min_height == 0:
        return False
    return (overlap / min_height) >= SAME_LINE_OVERLAP


def _read_rc_detections(
    file_bytes: bytes,
    content_type: Optional[str],
) -> Tuple[List[dict], float]:
    """
    Run EasyOCR with detail=1 and return enriched, QR-filtered detections
    plus the mean confidence.  Returns ([], 0.0) on any failure.
    """
    if content_type == "application/pdf":
        return [], 0.0

    try:
        import easyocr
        reader = easyocr.Reader(["en"], gpu=False)
        raw = reader.readtext(file_bytes, detail=1, paragraph=False)
    except Exception:
        return [], 0.0

    detections: List[dict] = []
    confidences: List[float] = []

    for item in raw:
        if len(item) < 3:
            continue
        bbox, text, conf = item[0], str(item[1]), float(item[2])
        det = _enrich({"bbox": bbox, "text": text, "conf": conf})
        if _is_qr_noise(det):
            continue
        detections.append(det)
        confidences.append(conf)

    if not detections:
        return [], 0.0

    return detections, sum(confidences) / len(confidences)


# ---------------------------------------------------------------------------
# Spatial value lookup
# ---------------------------------------------------------------------------

def _find_label(detections: List[dict], *patterns: str) -> Optional[dict]:
    """
    Return the first detection whose text matches any of the given regex
    patterns (case-insensitive).
    """
    for det in detections:
        for pattern in patterns:
            if re.search(pattern, det["text"], re.IGNORECASE):
                return det
    return None


def _value_near_label(
    detections: List[dict],
    label_det: dict,
    exclude_patterns: Tuple[str, ...] = (),
) -> Optional[str]:
    """
    Given a label detection, find the best candidate value:

    Priority 1 — same-line detection to the RIGHT of the label.
                 Among all same-line candidates pick the closest one.
    Priority 2 — detection on the NEXT line directly below the label
                 (centre-x within the label's horizontal span ± 50 %).
    Priority 3 — same-line detection to the RIGHT with relaxed Y tolerance.

    Detections whose text matches any exclude_pattern are skipped (avoids
    picking up another label as a value).
    """
    label_cx = label_det["cx"]
    label_width = label_det["width"]

    def is_excluded(text: str) -> bool:
        for pat in exclude_patterns:
            if re.search(pat, text, re.IGNORECASE):
                return True
        return False

    # --- Priority 1: same line, to the right ---
    same_line_right = [
        d for d in detections
        if d is not label_det
        and d["left"] > label_det["right"] - 5   # strictly right (small tolerance)
        and _same_line(label_det, d)
        and not is_excluded(d["text"])
    ]
    if same_line_right:
        return min(same_line_right, key=lambda d: d["left"])["text"]

    # --- Priority 2: next line, horizontally aligned with label ---
    x_tolerance = max(label_width * 0.5, 40)
    next_line = [
        d for d in detections
        if d is not label_det
        and d["top"] > label_det["bottom"] - 5
        and d["top"] < label_det["bottom"] + label_det["height"] * 2
        and abs(d["cx"] - label_cx) < x_tolerance
        and not is_excluded(d["text"])
    ]
    if next_line:
        return min(next_line, key=lambda d: d["top"])["text"]

    return None


# ---------------------------------------------------------------------------
# Field extractors (spatial)
# ---------------------------------------------------------------------------

# Labels that should never be treated as values
_LABEL_PATTERNS = (
    r"maker", r"model", r"fuel", r"month", r"year", r"reg", r"owner",
    r"chassis", r"engine", r"class", r"body", r"colour", r"color",
    r"address", r"district", r"state", r"pin", r"rto", r"vehicle",
    r"fitness", r"tax", r"insurance", r"permit", r"norms",
)


def _extract_make_spatial(detections: List[dict]) -> Optional[str]:
    label = _find_label(
        detections,
        r"maker'?s?\s*name",
        r"^maker$",
        r"make\b",
        r"manufacturer",
    )
    if label:
        value = _value_near_label(detections, label, _LABEL_PATTERNS)
        if value:
            cleaned = _clean_vehicle_text(value)
            # Validate against known list (fuzzy: check if any known make is a substring)
            for mfr in KNOWN_MANUFACTURERS:
                if mfr.lower() in cleaned.lower() or cleaned.lower() in mfr.lower():
                    return mfr
            return cleaned if len(cleaned) >= 2 else None

    # Fallback: scan all detections for a known manufacturer name
    full_text = " ".join(d["text"] for d in detections)
    for mfr in KNOWN_MANUFACTURERS:
        if mfr.lower() in full_text.lower():
            return mfr
    return None


def _extract_model_spatial(detections: List[dict]) -> Optional[str]:
    label = _find_label(
        detections,
        r"maker'?s?\s*class",
        r"vehicle\s*class",
        r"^model\b",
        r"model\s*name",
    )
    if label:
        value = _value_near_label(detections, label, _LABEL_PATTERNS)
        if value:
            return _clean_vehicle_text(value) or None
    return None


def _extract_fuel_spatial(detections: List[dict]) -> Optional[str]:
    label = _find_label(
        detections,
        r"fuel\s*type",
        r"^fuel$",
        r"propulsion",
    )
    if label:
        value = _value_near_label(detections, label, _LABEL_PATTERNS)
        if value:
            normalized = value.strip().lower()
            for ft in KNOWN_FUEL_TYPES:
                if ft in normalized:
                    return ft.title()
            return _clean_vehicle_text(value) or None

    # Fallback: scan all detections for a standalone fuel keyword
    for det in detections:
        normalized = det["text"].strip().lower()
        for ft in KNOWN_FUEL_TYPES:
            if re.fullmatch(rf"{re.escape(ft)}", normalized):
                return ft.title()
    return None


def _extract_year_spatial(detections: List[dict]) -> Optional[int]:
    # RC cards show "Month of Mfg" or "Reg Date" — look for a label then
    # grab the year from the value text.
    label = _find_label(
        detections,
        r"month\s*of\s*mfg",
        r"mfg\s*month",
        r"date\s*of\s*mfg",
        r"manufactur",
        r"reg(?:istration)?\s*date",
        r"regn\s*date",
    )
    if label:
        value = _value_near_label(detections, label, _LABEL_PATTERNS)
        if value:
            year = _parse_year_from_text(value)
            if year:
                return year

    # Fallback: find any detection that looks like MM/YYYY or YYYY
    for det in detections:
        year = _parse_year_from_text(det["text"])
        if year:
            return year
    return None


def _parse_year_from_text(text: str) -> Optional[int]:
    # MM/YYYY or MM-YYYY
    m = re.search(r"\b\d{1,2}[/\-](20\d{2}|19\d{2})\b", text)
    if m:
        return int(m.group(1))
    # Standalone 4-digit year
    m = re.search(r"\b(20\d{2}|19\d{2})\b", text)
    if m:
        year = int(m.group(1))
        if 1990 <= year <= 2030:
            return year
    return None


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_vehicle_info(
    file_bytes: bytes,
    content_type: Optional[str],
) -> Dict[str, Optional[object]]:
    detections, confidence = _read_rc_detections(file_bytes, content_type)
    

    if confidence < MIN_OCR_CONFIDENCE or not detections:
        return _empty_vehicle_info()

    vehicle_make  = _extract_make_spatial(detections)
    vehicle_model = _extract_model_spatial(detections)
    vehicle_year  = _extract_year_spatial(detections)
    fuel_type     = _extract_fuel_spatial(detections)

    # --- Gemini correction layer ---
    # Fixes OCR spelling mistakes and normalises values before mileage lookup.
    corrected = correct_vehicle_details(vehicle_make, vehicle_model, vehicle_year, fuel_type)
    vehicle_make  = corrected["vehicle_make"]
    vehicle_model = corrected["vehicle_model"]
    vehicle_year  = corrected["vehicle_year"]
    fuel_type     = corrected["fuel_type"]

    mileage = estimate_mileage(vehicle_make, vehicle_model, vehicle_year, fuel_type)

    return {
        "vehicle_make":  vehicle_make,
        "vehicle_model": vehicle_model,
        "vehicle_year":  vehicle_year,
        "fuel_type":     fuel_type,
        "mileage":       mileage,
    }


def estimate_mileage(
    vehicle_make: Optional[str],
    vehicle_model: Optional[str],
    vehicle_year: Optional[int],
    fuel_type: Optional[str],
) -> Optional[float]:
    """Delegates to the centralised Gemini service."""
    return estimate_vehicle_mileage(vehicle_make, vehicle_model, vehicle_year, fuel_type)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _empty_vehicle_info() -> Dict[str, Optional[object]]:
    return {
        "vehicle_make":  None,
        "vehicle_model": None,
        "vehicle_year":  None,
        "fuel_type":     None,
        "mileage":       None,
    }


def _clean_vehicle_text(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9 ]", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value.title()
