from fastapi import APIRouter

from siem.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/")
def home():
    settings = get_settings()
    return {
        "status": "Mini SIEM API Running",
        "app": settings.app_name,
    }


@router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Mini SIEM Backend",
    }
