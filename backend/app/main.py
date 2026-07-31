from datetime import datetime, time

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
    RouteInfoRequest,
    RouteInfoResponse,
    VehicleResponse,
)
from .services.ai_service import AIConfigurationError, AIProviderError, generate_chat_response
from .services.fairness_engine import calculate_fairness
from .services.location_service import LocationServiceError, get_route_info

app = FastAPI(title="VeroPay API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


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
    db = SessionLocal()
    try:
        seed_reference_data(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "VeroPay API is running"}


@app.get("/api/vehicles", response_model=list[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).order_by(Vehicle.brand, Vehicle.model).all()


@app.get("/api/vehicles/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@app.post("/api/route-info", response_model=RouteInfoResponse)
def route_info(payload: RouteInfoRequest):
    """
    Given pickup and drop location names, returns real distance (km),
    estimated duration (minutes), live weather condition, and coordinates.
    """
    try:
        result = get_route_info(
            pickup=payload.pickup,
            dropoff=payload.dropoff,
        )
    except LocationServiceError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return result


@app.post("/api/rides/analyze", response_model=RideAnalysisResponse, status_code=201)
def analyze_ride(payload: RideAnalyzeRequest, db: Session = Depends(get_db)):
    vehicle = db.get(Vehicle, payload.vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    mileage = payload.mileage if payload.mileage is not None else vehicle.average_mileage
    maintenance = payload.maintenance_cost_per_km if payload.maintenance_cost_per_km is not None else vehicle.maintenance_cost_per_km
    try:
        result = calculate_fairness(
            offered_fare=payload.offered_fare, distance_km=payload.distance_km,
            duration_minutes=payload.duration_minutes, mileage=mileage,
            maintenance_cost_per_km=maintenance, fuel_price=payload.fuel_price,
            traffic_level=payload.traffic_level, weather=payload.weather, platform=payload.platform,
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    demo_user = db.query(User).first()
    ride = Ride(
        user_id=demo_user.id, vehicle_id=vehicle.id, platform=payload.platform, city=payload.city,
        offered_fare=payload.offered_fare, distance_km=payload.distance_km, duration_minutes=payload.duration_minutes,
        traffic_level=payload.traffic_level, weather=payload.weather, fuel_price=payload.fuel_price,
        mileage_used=mileage, maintenance_cost_per_km_used=maintenance,
        fuel_cost=result.fuel_cost, maintenance_cost=result.maintenance_cost, time_cost=result.time_cost,
        expected_fare=result.expected_fare, net_profit=result.net_profit, fairness_score=result.fairness_score,
        recommendation=result.recommendation, ai_explanation=result.ai_explanation,
    )
    db.add(ride)
    db.commit()
    db.refresh(ride)
    return ride


@app.get("/api/rides", response_model=list[RideAnalysisResponse])
def get_rides(db: Session = Depends(get_db)):
    return db.query(Ride).order_by(Ride.created_at.desc()).all()


@app.get("/api/rides/{ride_id}", response_model=RideAnalysisResponse)
def get_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.get(Ride, ride_id)
    if ride is None:
        raise HTTPException(status_code=404, detail="Ride not found")
    return ride


@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    today_start = datetime.combine(datetime.today().date(), time.min)
    rides = db.query(Ride).filter(Ride.created_at >= today_start).all()
    count = len(rides)
    return {
        "today_earnings": round(sum(ride.offered_fare for ride in rides), 2),
        "today_profit": round(sum(ride.net_profit for ride in rides), 2),
        "average_fairness": round(sum(ride.fairness_score for ride in rides) / count if count else 0, 2),
        "total_rides": count,
        "rejected_ride_suggestions": sum(ride.recommendation == "Reject" for ride in rides),
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    recent_rides = db.query(Ride).order_by(Ride.created_at.desc()).limit(5).all()
    if recent_rides:
        ride_context = "\n".join(
            f"{ride.platform}: offered Rs. {ride.offered_fare:.2f}, expected Rs. {ride.expected_fare:.2f}, "
            f"fairness {ride.fairness_score:.0f}%, recommendation {ride.recommendation}."
            for ride in recent_rides
        )
    else:
        ride_context = "No rides have been analysed yet."

    try:
        answer = generate_chat_response(
            messages=[message.model_dump() for message in payload.messages],
            ride_context=ride_context,
            use_web_search=payload.use_web_search,
        )
    except AIConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except AIProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    return ChatResponse(response=answer)
