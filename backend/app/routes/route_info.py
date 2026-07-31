from fastapi import APIRouter, HTTPException

from app.schemas import RouteInfoRequest, RouteInfoResponse
from app.services.location_service import LocationServiceError, get_route_info

router = APIRouter(prefix="/api/route-info", tags=["route-info"])


@router.post("", response_model=RouteInfoResponse)
def route_info(payload: RouteInfoRequest):
    try:
        result = get_route_info(pickup=payload.pickup, dropoff=payload.dropoff)
    except LocationServiceError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return result
