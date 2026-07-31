from datetime import date
from typing import Optional

from app.database import get_db


def get_dashboard(user_id: int) -> dict:
    today = date.today().isoformat()
    conn = get_db()
    try:
        today_row = conn.execute(
            """
            SELECT
                COALESCE(SUM(fare), 0) AS today_earnings,
                COUNT(*) AS ride_count
            FROM jobs
            WHERE user_id = ?
              AND COALESCE(ride_date, date(created_at)) = ?
            """,
            (user_id, today),
        ).fetchone()

        loss_row = conn.execute(
            """
            SELECT
                COALESCE(SUM(CASE
                    WHEN difference IS NOT NULL AND difference > 0
                    THEN difference
                    ELSE 0
                END), 0) AS potential_lost_earnings
            FROM jobs
            WHERE user_id = ?
            """,
            (user_id,),
        ).fetchone()

        return {
            "today_earnings": float(today_row["today_earnings"]),
            "ride_count": int(today_row["ride_count"]),
            "average_fairness": _average_fairness(conn, user_id),
            "potential_lost_earnings": float(loss_row["potential_lost_earnings"]),
        }
    finally:
        conn.close()


def _average_fairness(conn, user_id: int) -> Optional[float]:
    columns = {row[1] for row in conn.execute("PRAGMA table_info(jobs)").fetchall()}
    if "fairness_score" not in columns:
        return None

    # Fairness scoring is owned by the separate fairness service. When that service
    # persists fairness_score, the dashboard can aggregate it without recalculating it.
    row = conn.execute(
        "SELECT AVG(fairness_score) AS average_fairness FROM jobs WHERE user_id = ?",
        (user_id,),
    ).fetchone()
    return float(row["average_fairness"]) if row["average_fairness"] is not None else None
