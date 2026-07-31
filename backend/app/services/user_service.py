import sqlite3
from typing import Optional

from app.database import get_db
from app.services.auth_service import hash_password


def _clean_optional_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip()
    return value or None


def create_user(
    *,
    name: str,
    email: str,
    phone: str,
    password: str,
    rc_file_path: str,
    vehicle_make: Optional[str] = None,
    vehicle_model: Optional[str] = None,
    vehicle_year: Optional[int] = None,
    fuel_type: Optional[str] = None,
    mileage: Optional[float] = None,
) -> dict:
    conn = get_db()
    try:
        cursor = conn.execute(
            """
            INSERT INTO users (
                name,
                email,
                phone,
                password_hash,
                rc_file_path,
                vehicle_make,
                vehicle_model,
                vehicle_year,
                fuel_type,
                mileage
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name.strip(),
                email.strip().lower(),
                phone.strip(),
                hash_password(password),
                rc_file_path,
                _clean_optional_text(vehicle_make),
                _clean_optional_text(vehicle_model),
                vehicle_year,
                _clean_optional_text(fuel_type),
                mileage,
            ),
        )
        conn.commit()
        return get_user_by_id(cursor.lastrowid)
    except sqlite3.IntegrityError as exc:
        raise ValueError("Email or phone already exists.") from exc
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> Optional[dict]:
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()
