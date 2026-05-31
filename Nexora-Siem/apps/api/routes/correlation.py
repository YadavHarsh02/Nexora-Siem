from fastapi import APIRouter, Depends

from apps.api.deps import get_correlation_service
from siem.services.correlation_service import CorrelationService

router = APIRouter(tags=["correlation"])


@router.get("/correlation/chains")
def correlation_chains(
    service: CorrelationService = Depends(get_correlation_service),
):
    return service.get_chains()
