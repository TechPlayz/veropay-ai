import os
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.models.user import AuthResponse, LoginRequest, UserResponse, VehicleInfo
from app.services import auth_service, user_service, vehicle_service


router = APIRouter(prefix="/api/auth", tags=["auth"])

ALLOWED_RC_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_RC_CONTENT_TYPES = {"application/pdf", "image/png", "image/jpeg"}
MAX_RC_SIZE_BYTES = 10 * 1024 * 1024
APP_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = APP_DIR / "uploads" / "rc"


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    rc: UploadFile = File(...),
    vehicle_make: Optional[str] = Form(None),
    vehicle_model: Optional[str] = Form(None),
    vehicle_year: Optional[int] = Form(None),
    fuel_type: Optional[str] = Form(None),
    mileage: Optional[float] = Form(None),
):
    file_bytes = await _validate_rc_upload(rc)
    rc_path = _save_rc_file(rc.filename or "rc", file_bytes)
    extracted_vehicle = vehicle_service.extract_vehicle_info(file_bytes, rc.content_type)

    try:
        user = user_service.create_user(
            name=name,
            email=email,
            phone=phone,
            password=password,
            rc_file_path=os.path.relpath(rc_path, APP_DIR),
            vehicle_make=vehicle_make,
            vehicle_model=vehicle_model,
            vehicle_year=vehicle_year,
            fuel_type=fuel_type,
            mileage=mileage,
        )
    except ValueError as exc:
        _remove_file(rc_path)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except Exception:
        _remove_file(rc_path)
        raise

    return {
        "access_token": auth_service.create_access_token(user["id"]),
        "user": user,
        "extracted_vehicle": VehicleInfo(**extracted_vehicle),
    }


@router.post("/login", response_model=AuthResponse)
def login(credentials: LoginRequest):
    user = auth_service.authenticate_user(credentials.email, credentials.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "access_token": auth_service.create_access_token(user["id"]),
        "user": user,
        "extracted_vehicle": None,
    }


@router.get("/me", response_model=UserResponse)
def me(current_user: dict = Depends(auth_service.get_current_user)):
    return current_user


async def _validate_rc_upload(rc: UploadFile) -> bytes:
    extension = Path(rc.filename or "").suffix.lower()
    if extension not in ALLOWED_RC_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RC file must be a PDF, PNG, JPG, or JPEG.",
        )
    if rc.content_type and rc.content_type not in ALLOWED_RC_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="RC file must be a PDF, PNG, JPG, or JPEG.",
        )

    file_bytes = await rc.read()
    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="RC file is empty.")
    if len(file_bytes) > MAX_RC_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="RC file exceeds 10 MB.")
    return file_bytes


def _save_rc_file(original_filename: str, file_bytes: bytes) -> Path:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    extension = Path(original_filename).suffix.lower()
    rc_path = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    with rc_path.open("wb") as destination:
        destination.write(file_bytes)
    return rc_path


def _remove_file(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass
