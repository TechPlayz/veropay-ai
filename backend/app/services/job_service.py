import sqlite3
from typing import Any, Dict, List, Optional

from app.database import get_db
from app.models.job import JobCreate
from app.services.fairness_engine import calculate_fairness

# Defaults used when the user has no vehicle profile stored.
_DEFAULT_MILEAGE = 40.0            # km/l  — conservative urban two-wheeler
_DEFAULT_MAINTENANCE = 1.20        # ₹/km
_DEFAULT_FUEL_PRICE = 105.0        # ₹/litre  — approximate Indian petrol price
_FAIRNESS_FLAG_THRESHOLD = 80.0    # rides below this score are flagged


def _row_to_dict(row) -> Dict[str, Any]:
    data = dict(row)
    if data.get("is_flagged") is not None:
        data["is_flagged"] = bool(data["is_flagged"])
    return data


def _get_user_vehicle(conn, user_id: int) -> Dict[str, Any]:
    """Return the stored vehicle profile for a user, or an empty dict."""
    row = conn.execute(
        "SELECT mileage, fuel_type FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    return dict(row) if row else {}


def get_all_jobs(user_id: int) -> List[Dict[str, Any]]:
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
        return [_row_to_dict(row) for row in rows]
    finally:
        conn.close()


def get_job_by_id(job_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT * FROM jobs WHERE id = ? AND user_id = ?",
            (job_id, user_id),
        ).fetchone()
        return _row_to_dict(row) if row else None
    finally:
        conn.close()


def create_job(job: JobCreate, user_id: int) -> Dict[str, Any]:
    conn = get_db()
    try:
        vehicle = _get_user_vehicle(conn, user_id)
        mileage = vehicle.get("mileage") or _DEFAULT_MILEAGE

        result = calculate_fairness(
            offered_fare=job.fare,
            distance_km=job.distance,
            duration_minutes=job.duration,
            mileage=mileage,
            maintenance_cost_per_km=_DEFAULT_MAINTENANCE,
            fuel_price=_DEFAULT_FUEL_PRICE,
            traffic_level="Medium",
            weather="Sunny",
            platform=job.platform,
        )

        is_flagged = result.fairness_score < _FAIRNESS_FLAG_THRESHOLD
        difference = round(result.expected_fare - job.fare, 2) if is_flagged else 0.0

        cursor = conn.execute(
            """
            INSERT INTO jobs (
                user_id,
                platform,
                fare,
                distance,
                duration,
                expected_fare,
                difference,
                is_flagged,
                shift,
                ride_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                job.platform,
                job.fare,
                job.distance,
                job.duration,
                result.expected_fare,
                difference,
                int(is_flagged),
                job.shift,
                job.ride_date.isoformat(),
            ),
        )
        conn.commit()

        created_job = conn.execute(
            "SELECT * FROM jobs WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _row_to_dict(created_job)
    finally:
        conn.close()


def delete_job(job_id: int, user_id: int) -> bool:
    conn = get_db()
    try:
        cursor = conn.execute(
            "DELETE FROM jobs WHERE id = ? AND user_id = ?", (job_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
