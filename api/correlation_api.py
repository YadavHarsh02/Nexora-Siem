from fastapi import APIRouter

from database.db import ElasticsearchConnector
from detection.engine import DetectionEngine

router = APIRouter()

db = ElasticsearchConnector()

# =========================
# CORRELATION CHAINS
# =========================

@router.get("/correlation/chains")
def correlation_chains():

    try:

        response = db.get_recent_alerts()

        if not response:

            return {
                "count": 0,
                "chains": []
            }

        hits = response.get(
            "hits",
            {}
        ).get(
            "hits",
            []
        )

        events = [
            h["_source"]
            for h in hits
        ]

        engine = DetectionEngine(
            events=events
        )

        chains = engine.run_correlation()

        return {
            "count": len(chains),
            "chains": chains
        }

    except Exception as e:

        return {
            "count": 0,
            "chains": [],
            "error": str(e)
        }
