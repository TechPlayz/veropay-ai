from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    rides: Mapped[list["Ride"]] = relationship(back_populates="user")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    brand: Mapped[str] = mapped_column(String(100), index=True)
    model: Mapped[str] = mapped_column(String(100))
    fuel_type: Mapped[str] = mapped_column(String(30))
    average_mileage: Mapped[float] = mapped_column(Float)
    maintenance_cost_per_km: Mapped[float] = mapped_column(Float)


class Ride(Base):
    __tablename__ = "rides"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    platform: Mapped[str] = mapped_column(String(50))
    city: Mapped[str] = mapped_column(String(100))
    offered_fare: Mapped[float] = mapped_column(Float)
    distance_km: Mapped[float] = mapped_column(Float)
    duration_minutes: Mapped[int] = mapped_column(Integer)
    traffic_level: Mapped[str] = mapped_column(String(30))
    weather: Mapped[str] = mapped_column(String(30))
    fuel_price: Mapped[float] = mapped_column(Float)
    mileage_used: Mapped[float] = mapped_column(Float)
    maintenance_cost_per_km_used: Mapped[float] = mapped_column(Float)
    fuel_cost: Mapped[float] = mapped_column(Float)
    maintenance_cost: Mapped[float] = mapped_column(Float)
    time_cost: Mapped[float] = mapped_column(Float)
    expected_fare: Mapped[float] = mapped_column(Float)
    net_profit: Mapped[float] = mapped_column(Float)
    fairness_score: Mapped[float] = mapped_column(Float)
    recommendation: Mapped[str] = mapped_column(String(100))
    ai_explanation: Mapped[str] = mapped_column(String(1500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="rides")
    vehicle: Mapped["Vehicle"] = relationship()
