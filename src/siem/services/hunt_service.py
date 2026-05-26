from siem.database.db import ElasticsearchConnector
from siem.services.hunter import ThreatHunter


def _hits_from_response(response: dict | None) -> list[dict]:
    if not response:
        return []
    return [
        hit["_source"]
        for hit in response.get("hits", {}).get("hits", [])
    ]


class HuntService:

    def __init__(self, db: ElasticsearchConnector | None = None):
        self.db = db or ElasticsearchConnector()
        self.hunter = ThreatHunter(self.db)

    def raw_search(self, ip: str | None = None, user: str | None = None, severity: str | None = None) -> dict:
        query = {"bool": {"must": []}}

        if ip:
            query["bool"]["must"].append({"match": {"source_ip": ip}})

        if user:
            query["bool"]["must"].append({"match": {"username": user}})

        if severity:
            query["bool"]["must"].append({"match": {"severity": severity}})

        response = self.db.search_alerts(query)

        if not response:
            return {"error": "Elasticsearch unavailable"}

        results = _hits_from_response(response)
        return {"count": len(results), "results": results}

    def hunt_query(self, q: str) -> dict:
        result = self.hunter.hunt_query(q)

        if not result:
            return {
                "query": q,
                "count": 0,
                "results": [],
                "message": "No results found",
            }

        results = _hits_from_response(result)
        return {"query": q, "count": len(results), "results": results}

    def by_alert_type(self, alert_type: str) -> dict:
        response = self.db.search_by_alert_type(alert_type)
        results = _hits_from_response(response)
        return {"count": len(results), "results": results}
