from database import get_db

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # USERS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # JOBS TABLE
    cursor.execute("""
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
    """)

    # CHAT HISTORY
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        role TEXT NOT NULL,
        message TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully!")