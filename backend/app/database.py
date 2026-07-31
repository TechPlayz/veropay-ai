import sqlite3
from pathlib import Path

DATABASE_NAME = Path(__file__).with_name("gigshield.db")

def get_db():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn
