"""
location_service.py
-------------------
Uses two free/low-cost APIs:

1. OpenRouteService (ORS) — geocoding + road distance + duration
   Free tier: 2 000 requests/day, 40/minute.
   Key required: set ORS_API_KEY in backend/.env

2. Open-Meteo — live weather at the pickup coordinates
   Completely free, no key needed.
"""

import os
from dataclasses import dataclass
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

ORS_BASE = "https://api.openrouteservice.org"

# WMO weather-code → VeroPay weather bucket
_WMO_TO_WEATHER: dict[int, str] = {
    0: "Sunny", 1: "Sunny", 2: "Sunny", 3: "Sunny",
    45: "Sunny", 48: "Sunny",
    51: "Rain", 53: "Rain", 55: "Rain",
    61: "Rain", 63: "Rain", 65: "Rain",
    71: "Rain", 73: "Rain", 75: "Rain", 77: "Rain",
    80: "Rain", 81: "Rain", 82: "Rain",
    85: "Rain", 86: "Rain",
    95: "Storm", 96: "Storm", 99: "Storm",
}


class LocationServiceError(Exception):
    pass


@dataclass(frozen=True)
class RouteResult:
    distance_km: float
    duration_minutes: int
    weather: str
    pickup_display: str
    dropoff_display: str
    pickup_lat: float
    pickup_lon: float


def _geocode(place: str, api_key: str) -> tuple[float, float, str]:
    """Return (lon, lat, display_name) for a place name."""
    resp = requests.get(
        f"{ORS_BASE}/geocode/search",
        params={"api_key": api_key, "text": place, "size": 1},
        timeout=10,
    )
    if resp.status_code != 200:
        raise LocationServiceError(f"Geocoding failed for '{place}': {resp.text[:200]}")
    features = resp.json().get("features", [])
    if not features:
        raise LocationServiceError(f"Could not find location: '{place}'. Try a more specific name.")
    coords = features[0]["geometry"]["coordinates"]  # [lon, lat]
    label = features[0]["properties"].get("label", place)
    return coords[0], coords[1], label


def _road_route(
    origin_lon: float, origin_lat: float,
    dest_lon: float, dest_lat: float,
    api_key: str,
) -> tuple[float, int]:
    """Return (distance_km, duration_minutes) via ORS Directions."""
    resp = requests.post(
        f"{ORS_BASE}/v2/directions/driving-car/json",
        headers={"Authorization": api_key, "Content-Type": "application/json"},
        json={"coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]]},
        timeout=15,
    )
    if resp.status_code != 200:
        raise LocationServiceError(f"Route calculation failed: {resp.text[:200]}")
    summary = resp.json()["routes"][0]["summary"]
    distance_km = round(summary["distance"] / 1000, 2)
    duration_minutes = max(1, round(summary["duration"] / 60))
    return distance_km, duration_minutes


def _live_weather(lat: float, lon: float) -> str:
    """Return a VeroPay weather bucket using Open-Meteo (free, no key)."""
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "weathercode,temperature_2m",
                "timezone": "auto",
            },
            timeout=8,
        )
        if resp.status_code == 200:
            code = resp.json()["current"]["weathercode"]
            # Extreme heat: clear sky + temperature > 40 °C
            temp = resp.json()["current"].get("temperature_2m", 0)
            if code in (0, 1) and temp >= 40:
                return "Extreme Heat"
            return _WMO_TO_WEATHER.get(code, "Sunny")
    except Exception:
        pass
    return "Sunny"  # safe fallback


def get_route_info(pickup: str, dropoff: str) -> RouteResult:
    api_key = os.getenv("ORS_API_KEY", "")
    if not api_key:
        raise LocationServiceError(
            "ORS_API_KEY is not set. Add it to backend/.env — get a free key at openrouteservice.org."
        )

    pickup_lon, pickup_lat, pickup_label = _geocode(pickup, api_key)
    drop_lon, drop_lat, drop_label = _geocode(dropoff, api_key)
    distance_km, duration_minutes = _road_route(pickup_lon, pickup_lat, drop_lon, drop_lat, api_key)
    weather = _live_weather(pickup_lat, pickup_lon)

    return RouteResult(
        distance_km=distance_km,
        duration_minutes=duration_minutes,
        weather=weather,
        pickup_display=pickup_label,
        dropoff_display=drop_label,
        pickup_lat=pickup_lat,
        pickup_lon=pickup_lon,
    )
