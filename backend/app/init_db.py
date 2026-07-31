import sqlite3

from app.database import get_db


USER_COLUMNS = {
    "phone": "TEXT",
    "password_hash": "TEXT",
    "rc_file_path": "TEXT",
    "vehicle_make": "TEXT",
    "vehicle_model": "TEXT",
    "vehicle_year": "INTEGER",
    "fuel_type": "TEXT",
    "mileage": "REAL",
}


def _column_names(cursor, table_name):
    return {row[1] for row in cursor.execute(f"PRAGMA table_info({table_name})").fetchall()}


def _ensure_columns(cursor, table_name, columns):
    existing_columns = _column_names(cursor, table_name)
    for column_name, column_type in columns.items():
        if column_name not in existing_columns:
            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")


def _safe_create_unique_index(cursor, index_name, table_name, column_name):
    try:
        cursor.execute(
            f"""
            CREATE UNIQUE INDEX IF NOT EXISTS {index_name}
            ON {table_name}({column_name})
            WHERE {column_name} IS NOT NULL
            """
        )
    except sqlite3.IntegrityError:
        # Existing duplicate data must be cleaned manually before the index can be enforced.
        pass


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            password_hash TEXT,
            rc_file_path TEXT,
            vehicle_make TEXT,
            vehicle_model TEXT,
            vehicle_year INTEGER,
            fuel_type TEXT,
            mileage REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    _ensure_columns(cursor, "users", USER_COLUMNS)
    _safe_create_unique_index(cursor, "idx_users_email_unique", "users", "email")
    _safe_create_unique_index(cursor, "idx_users_phone_unique", "users", "phone")

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            platform TEXT NOT NULL,
            fare REAL NOT NULL,
            distance REAL NOT NULL,
            duration INTEGER NOT NULL,
            expected_fare REAL,
            difference REAL,
            is_flagged INTEGER DEFAULT 0,
            shift TEXT,
            ride_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            role TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")
