from collections import Counter

from siem.database.db import ElasticsearchConnector
from siem.services.alert_service import _hits_from_response


class DashboardService:

    def __init__(self, db: ElasticsearchConnector | None = None):
        self.db = db or ElasticsearchConnector()

    def _recent_alerts(self) -> list[dict]:
        return _hits_from_response(self.db.get_recent_alerts())

    def stats(self) -> dict:
        alerts = self._recent_alerts()

        if not alerts:
            return {
                "total_alerts": 0,
                "high_severity": 0,
                "medium_severity": 0,
                "low_severity": 0,
            }

        counts = Counter(a.get("severity") for a in alerts)

        return {
            "total_alerts": len(alerts),
            "high_severity": counts.get("HIGH", 0),
            "medium_severity": counts.get("MEDIUM", 0),
            "low_severity": counts.get("LOW", 0),
        }

    def recent(self) -> list[dict]:
        return self._recent_alerts()

    def top_ips(self) -> dict:
        alerts = self._recent_alerts()
        ip_count: dict[str, int] = {}

        for alert in alerts:
            ip = alert.get("source_ip", "unknown")
            ip_count[ip] = ip_count.get(ip, 0) + 1

        return ip_count
