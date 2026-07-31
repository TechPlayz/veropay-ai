from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    platform: str = Field(..., min_length=1, max_length=100)
    fare: float = Field(..., gt=0)
    distance: float = Field(..., ge=0)
    duration: int = Field(..., ge=0)
    shift: Optional[str] = Field(default=None, max_length=50)
    ride_date: date


class JobResponse(JobCreate):
    id: int
    expected_fare: Optional[float] = None
    difference: Optional[float] = None
    is_flagged: Optional[bool] = None
    created_at: datetime
