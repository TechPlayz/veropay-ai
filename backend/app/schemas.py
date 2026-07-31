from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class VehicleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    brand: str
    model: str
    fuel_type: str
    average_mileage: float
    maintenance_cost_per_km: float


class RideAnalyzeRequest(BaseModel):
    vehicle_id: int
    platform: str = Field(min_length=2, max_length=50)
    city: str = Field(min_length=2, max_length=100)
    offered_fare: float = Field(gt=0)
    distance_km: float = Field(gt=0, le=1000)
    duration_minutes: int = Field(gt=0, le=1440)
    traffic_level: str
    weather: str
    fuel_price: float = Field(gt=0, le=1000)
    mileage: float | None = Field(default=None, gt=0, le=500)
    maintenance_cost_per_km: float | None = Field(default=None, ge=0, le=1000)


class RideAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    platform: str
    city: str
    offered_fare: float
    distance_km: float
    duration_minutes: int
    traffic_level: str
    weather: str
    fuel_cost: float
    maintenance_cost: float
    time_cost: float
    expected_fare: float
    net_profit: float
    fairness_score: float
    recommendation: str
    ai_explanation: str
    created_at: datetime
