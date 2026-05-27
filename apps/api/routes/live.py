from fastapi import APIRouter, Depends

from siem.services.live_pipeline import LivePipelineService

router = APIRouter(prefix="/api/v1/live", tags=["live"])


@router.get("/dashboard")
def live_dashboard():
    """
    Pull events from Elastic Cloud, run detection/ML/correlation,
    return results for the Nexora dashboard.
    """
    return LivePipelineService("dev_user").run()


@router.get("/status")
def live_status():
    from siem.database.user_elastic import UserElasticsearch

    elastic = UserElasticsearch("dev_user")
    events = elastic.get_user_events(size=1)

    return {
        "user_id": "dev_user",
        "connected": len(events) > 0,
        "latest_event": events[0] if events else None,
    }
