from siem.database.db import ElasticsearchConnector
from siem.detection.engine import DetectionEngine


def _hits_from_response(response: dict | None) -> list[dict]:
    if not response:
        return []
    return [
        hit["_source"]
        for hit in response.get("hits", {}).get("hits", [])
    ]


class CorrelationService:

    def __init__(self, db: ElasticsearchConnector | None = None):
        self.db = db or ElasticsearchConnector()

    def get_chains(self) -> dict:
        try:
            response = self.db.get_recent_alerts()

            if not response:
                return {"count": 0, "chains": []}

            events = _hits_from_response(response)

            engine = DetectionEngine(events=events)
            chains = engine.run_correlation()

            return {"count": len(chains), "chains": chains}

        except Exception as exc:
            return {"count": 0, "chains": [], "error": str(exc)}
