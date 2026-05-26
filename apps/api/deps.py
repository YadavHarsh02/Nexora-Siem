from functools import lru_cache

from siem.database.db import ElasticsearchConnector
from siem.services.alert_service import AlertService
from siem.services.correlation_service import CorrelationService
from siem.services.dashboard_service import DashboardService
from siem.services.hunt_service import HuntService


@lru_cache(maxsize=1)
def get_db() -> ElasticsearchConnector:
    return ElasticsearchConnector()


def get_alert_service() -> AlertService:
    return AlertService(get_db())


def get_hunt_service() -> HuntService:
    return HuntService(get_db())


def get_correlation_service() -> CorrelationService:
    return CorrelationService(get_db())


def get_dashboard_service() -> DashboardService:
    return DashboardService(get_db())
