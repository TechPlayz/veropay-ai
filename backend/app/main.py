from fastapi import FastAPI

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .fairness_models import Ride, User, Vehicle
from .schemas import (
    ChatRequest,
    ChatResponse,
    RideAnalysisResponse,
    RideAnalyzeRequest,
    VehicleResponse,
)
from .services.ai_service import AIConfigurationError, AIProviderError, generate_chat_response
from .services.fairness_engine import calculate_fairness

from .init_db import init_db
from .routes.auth import router as auth_router
from .routes.dashboard import router as dashboard_router
from .routes.jobs import router as jobs_router
from .routes.ocr import router as ocr_router

app = FastAPI(title="VeroPay API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# Register routers from incoming branch
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(jobs_router)
app.include_router(ocr_router)


def seed_reference_data(db: Session) -> None:
    if db.query(User).first() is None:
        db.add(User(name="Demo Worker", email="demo@veropay.local"))
    if db.query(Vehicle).first() is None:
        db.add_all([
            Vehicle(brand="Honda", model="Activa 6G", fuel_type="Petrol", average_mileage=45, maintenance_cost_per_km=1.20),
            Vehicle(brand="TVS", model="Jupiter", fuel_type="Petrol", average_mileage=48, maintenance_cost_per_km=1.10),
            Vehicle(brand="Suzuki", model="Access 125", fuel_type="Petrol", average_mileage=45, maintenance_cost_per_km=1.20),
            Vehicle(brand="Hero", model="Splendor Plus", fuel_type="Petrol", average_mileage=60, maintenance_cost_per_km=1.00),
            Vehicle(brand="Honda", model="Shine", fuel_type="Petrol", average_mileage=55, maintenance_cost_per_km=1.30),
            Vehicle(brand="Bajaj", model="Pulsar 150", fuel_type="Petrol", average_mileage=45, maintenance_cost_per_km=1.50),
        ])
    db.commit()


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    # Ensure any external initialization from incoming branch runs
    init_db()
    db = SessionLocal()
    try:
        seed_reference_data(db)
    finally:
        db.close()



@app.get("/")
def root():
    return {"message": "VeroPay API is running"}
