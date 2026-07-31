from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6)


class VehicleInfo(BaseModel):
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = None
    fuel_type: Optional[str] = None
    mileage: Optional[float] = None


class UserResponse(VehicleInfo):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    rc_file_path: Optional[str] = None
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    extracted_vehicle: Optional[VehicleInfo] = None
