from fastapi import APIRouter, Depends

from services import auth_service, dashboard_service


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(current_user: dict = Depends(auth_service.get_current_user)):
    return dashboard_service.get_dashboard(current_user["id"])
