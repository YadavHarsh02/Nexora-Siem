from __future__ import annotations
from siem.database.db import ElasticsearchConnector


def _hits_from_response(response: dict | None) -> list[dict]:
    if not response:
        return []
    return [
        hit["_source"]
        for hit in response.get("hits", {}).get("hits", [])
    ]


class AlertService:

    def __init__(self, db: ElasticsearchConnector | None = None):
        self.db = db or ElasticsearchConnector()

    def recent_alerts(self) -> dict:
        try:
            response = self.db.get_recent_alerts()
        except Exception as exc:
            return {
                "count": 0,
                "alerts": [],
                "error": f"Elasticsearch unavailable: {exc}",
            }

        if not response:
            return {
                "count": 0,
                "alerts": [],
                "error": "No response from Elasticsearch",
            }

        alerts = _hits_from_response(response)
        return {"count": len(alerts), "alerts": alerts}

    def alerts_by_ip(self, ip: str) -> dict:
        try:
            return self._wrap(self.db.search_by_ip(ip))
        except Exception as exc:
            return {"count": 0, "alerts": [], "error": str(exc)}

    def alerts_by_user(self, username: str) -> dict:
        try:
            return self._wrap(self.db.search_by_username(username))
        except Exception as exc:
            return {"count": 0, "alerts": [], "error": str(exc)}

    def alerts_by_type(self, alert_type: str) -> dict:
        try:
            return self._wrap(self.db.search_by_alert_type(alert_type))
        except Exception as exc:
            return {"count": 0, "alerts": [], "error": str(exc)}

    def alerts_by_severity(self, severity: str) -> dict:
        try:
            return self._wrap(self.db.search_by_severity(severity))
        except Exception as exc:
            return {"count": 0, "alerts": [], "error": str(exc)}

    def _wrap(self, response) -> dict:
        if not response:
            return {"count": 0, "alerts": []}

        alerts = _hits_from_response(response)
        return {"count": len(alerts), "alerts": alerts}
