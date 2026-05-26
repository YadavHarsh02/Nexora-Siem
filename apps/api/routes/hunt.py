from fastapi import APIRouter, Depends, Query

from apps.api.deps import get_hunt_service
from siem.services.hunt_service import HuntService

router = APIRouter(tags=["hunt"])


@router.get("/hunt/raw")
def raw_search(
    ip: str | None = None,
    user: str | None = None,
    severity: str | None = None,
    service: HuntService = Depends(get_hunt_service),
):
    return service.raw_search(ip=ip, user=user, severity=severity)


@router.get("/hunt/query")
def hunt_query(
    q: str = Query(...),
    service: HuntService = Depends(get_hunt_service),
):
    return service.hunt_query(q)


@router.get("/hunt/bruteforce")
def bruteforce(service: HuntService = Depends(get_hunt_service)):
    return service.by_alert_type("brute_force_attack")


@router.get("/hunt/sudo")
def sudo_activity(service: HuntService = Depends(get_hunt_service)):
    return service.by_alert_type("sudo_activity")


@router.get("/hunt/invalid")
def invalid_users(service: HuntService = Depends(get_hunt_service)):
    return service.by_alert_type("invalid_user_attempt")
