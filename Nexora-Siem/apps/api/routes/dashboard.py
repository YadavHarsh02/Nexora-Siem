from fastapi import APIRouter, Depends

from apps.api.deps import get_dashboard_service
from siem.services.dashboard_service import DashboardService

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/stats")
def dashboard_stats(
    service: DashboardService = Depends(get_dashboard_service),
):
    return service.stats()


@router.get("/dashboard/recent")
def dashboard_recent(
    service: DashboardService = Depends(get_dashboard_service),
):
    return service.recent()


@router.get("/dashboard/top-ips")
def top_ips(service: DashboardService = Depends(get_dashboard_service)):
    return service.top_ips()
