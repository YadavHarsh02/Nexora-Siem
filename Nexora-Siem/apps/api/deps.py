from functools import lru_cache

from fastapi import Depends

from siem.database.db import ElasticsearchConnector
from siem.database.user_elastic import UserElasticsearch
from siem.services.alert_service import AlertService
from siem.services.correlation_service import CorrelationService
from siem.services.dashboard_service import DashboardService
from siem.services.hunt_service import HuntService


@lru_cache(maxsize=1)
def get_db() -> ElasticsearchConnector:
    return ElasticsearchConnector()


def get_user_elastic() -> UserElasticsearch:
    return UserElasticsearch("dev_user")


def get_alert_service(
    elastic: UserElasticsearch = Depends(get_user_elastic),
) -> AlertService:
    return AlertService(elastic)


def get_hunt_service(
    elastic: UserElasticsearch = Depends(get_user_elastic),
) -> HuntService:
    return HuntService(elastic)


def get_correlation_service(
    elastic: UserElasticsearch = Depends(get_user_elastic),
) -> CorrelationService:
    return CorrelationService(elastic)


def get_dashboard_service(
    elastic: UserElasticsearch = Depends(get_user_elastic),
) -> DashboardService:
    return DashboardService(elastic)
