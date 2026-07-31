from fastapi import APIRouter, HTTPException

from app.database import get_db
from app.schemas import RideAnalysisResponse, RideAnalyzeRequest
from app.services.fairness_engine import calculate_fairness

router = APIRouter(prefix="/api/rides", tags=["rides"])


def _row_to_ride(row) -> dict:
    return dict(row)


@router.post("/analyze", response_model=RideAnalysisResponse, status_code=201)
def analyze_ride(payload: RideAnalyzeRequest):
    conn = get_db()
    try:
        vehicle = conn.execute(
            "SELECT * FROM vehicles WHERE id = ?", (payload.vehicle_id,)
        ).fetchone()
        if vehicle is None:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        mileage = payload.mileage if payload.mileage is not None else vehicle["average_mileage"]
        maintenance = (
            payload.maintenance_cost_per_km
            if payload.maintenance_cost_per_km is not None
            else vehicle["maintenance_cost_per_km"]
        )

        try:
            result = calculate_fairness(
                offered_fare=payload.offered_fare,
                distance_km=payload.distance_km,
                duration_minutes=payload.duration_minutes,
                mileage=mileage,
                maintenance_cost_per_km=maintenance,
                fuel_price=payload.fuel_price,
                traffic_level=payload.traffic_level,
                weather=payload.weather,
                platform=payload.platform,
            )
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

        cursor = conn.execute(
            """
            INSERT INTO rides (
                platform, city, offered_fare, distance_km, duration_minutes,
                traffic_level, weather, fuel_cost, maintenance_cost, time_cost,
                expected_fare, net_profit, fairness_score, recommendation, ai_explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.platform, payload.city, payload.offered_fare,
                payload.distance_km, payload.duration_minutes,
                payload.traffic_level, payload.weather,
                result.fuel_cost, result.maintenance_cost, result.time_cost,
                result.expected_fare, result.net_profit, result.fairness_score,
                result.recommendation, result.ai_explanation,
            ),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM rides WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _row_to_ride(row)
    finally:
        conn.close()


@router.get("", response_model=list[RideAnalysisResponse])
def get_rides():
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM rides ORDER BY created_at DESC").fetchall()
        return [_row_to_ride(r) for r in rows]
    finally:
        conn.close()


@router.get("/{ride_id}", response_model=RideAnalysisResponse)
def get_ride(ride_id: int):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM rides WHERE id = ?", (ride_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Ride not found")
        return _row_to_ride(row)
    finally:
        conn.close()
