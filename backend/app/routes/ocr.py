from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.services.ocr_service import OCRProcessingError, extract_ride_values
from app.services.vehicle_service import extract_vehicle_info


router = APIRouter(prefix="/ocr", tags=["ocr"])

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_RC_TYPES = ALLOWED_IMAGE_TYPES | {"application/pdf", "application/octet-stream"}


class RideOCRResponse(BaseModel):
    fare: Optional[float] = None
    distance: Optional[float] = None
    duration: Optional[int] = None


class VehicleOCRResponse(BaseModel):
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = None
    fuel_type: Optional[str] = None
    mileage: Optional[float] = None


@router.post("/ride", response_model=RideOCRResponse)
async def ocr_ride(file: UploadFile = File(...)):
    if file.content_type and file.content_type not in ALLOWED_IMAGE_TYPES | {"application/octet-stream"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image (PNG, JPG, WEBP).",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    try:
        return extract_ride_values(image_bytes)
    except OCRProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc


@router.post("/vehicle", response_model=VehicleOCRResponse)
async def ocr_vehicle(file: UploadFile = File(...)):
    if file.content_type and file.content_type not in ALLOWED_RC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image or PDF.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    return extract_vehicle_info(file_bytes, file.content_type)
