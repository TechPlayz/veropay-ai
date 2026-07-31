from fastapi import APIRouter, File, HTTPException, UploadFile, status

from services.ocr_service import OCRProcessingError, extract_ride_values


router = APIRouter(prefix="/ocr", tags=["ocr"])


@router.post("")
async def extract_ocr_values(file: UploadFile = File(...)):
    if file.content_type and not (
        file.content_type.startswith("image/") or file.content_type == "application/octet-stream"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image.",
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
