from typing import Any, Dict, List, Optional

from database import get_db
from models.job import JobCreate


def _row_to_dict(row) -> Dict[str, Any]:
    data = dict(row)
    if data.get("is_flagged") is not None:
        data["is_flagged"] = bool(data["is_flagged"])
    return data


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
            VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?)
            """,
            (
                user_id,
                job.platform,
                job.fare,
                job.distance,
                job.duration,
                job.shift,
                job.ride_date.isoformat(),
            ),
        )
        conn.commit()

        # TODO(fairness-integration): call the teammate-owned fairness service here
        # when it is ready, then persist expected_fare, difference, and is_flagged.
        created_job = conn.execute("SELECT * FROM jobs WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _row_to_dict(created_job)
    finally:
        conn.close()


def delete_job(job_id: int, user_id: int) -> bool:
    conn = get_db()
    try:
        cursor = conn.execute("DELETE FROM jobs WHERE id = ? AND user_id = ?", (job_id, user_id))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()
