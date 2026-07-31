from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# This path is relative to the directory from which Uvicorn is started.
DATABASE_URL = "sqlite:///./veropay.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
