from fastapi import APIRouter, Depends

from apps.api.deps import get_alert_service
from siem.services.alert_service import AlertService

router = APIRouter(tags=["alerts"])


@router.get("/alerts/recent")
def recent_alerts(service: AlertService = Depends(get_alert_service)):
    return service.recent_alerts()


@router.get("/alerts/ip/{ip}")
def alerts_by_ip(ip: str, service: AlertService = Depends(get_alert_service)):
    return service.alerts_by_ip(ip)


@router.get("/alerts/user/{username}")
def alerts_by_user(
    username: str,
    service: AlertService = Depends(get_alert_service),
):
    return service.alerts_by_user(username)


@router.get("/alerts/type/{alert_type}")
def alerts_by_type(
    alert_type: str,
    service: AlertService = Depends(get_alert_service),
):
    return service.alerts_by_type(alert_type)


@router.get("/alerts/severity/{severity}")
def alerts_by_severity(
    severity: str,
    service: AlertService = Depends(get_alert_service),
):
    return service.alerts_by_severity(severity)
