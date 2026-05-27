from __future__ import annotations

import os
from typing import Any

from siem.database.db import ElasticsearchConnector


class UserElasticsearch(ElasticsearchConnector):
    """Elasticsearch access scoped to one Nexora user (Clerk ID)."""

    def __init__(self, user_id: str):
        super().__init__()
        self.user_id = user_id
        self.events_index = os.getenv("NEXORA_EVENTS_INDEX", "nexora-events")
        self.alerts_index = os.getenv("NEXORA_ALERTS_INDEX", "mini_siem_alerts")
        self._ensure_events_index()

    def _ensure_events_index(self) -> None:
        try:
            if not self.client.indices.exists(index=self.events_index):
                self.client.indices.create(
                    index=self.events_index,
                    mappings={
                        "properties": {
                            "nexora_user_id": {"type": "keyword"},
                            "@timestamp": {"type": "date"},
                            "message": {"type": "text"},
                        }
                    },
                )
        except Exception as exc:
            print(f"[WARN] events index init: {exc}")

    def _user_filter(self, query: dict | None = None) -> dict:
        clause = {"term": {"nexora_user_id": self.user_id}}
        if not query:
            return {"bool": {"filter": [clause]}}
        return {"bool": {"must": [query], "filter": [clause]}}

    def get_user_events(self, size: int = 200) -> list[dict[str, Any]]:
        try:
            response = self.client.search(
                index=self.events_index,
                size=size,
                query=self._user_filter({"match_all": {}}),
                sort=[{"@timestamp": {"order": "desc"}}],
            )
        except Exception as exc:
            print(f"[ERROR] get_user_events: {exc}")
            return []

        return [hit["_source"] for hit in response.get("hits", {}).get("hits", [])]

    def get_recent_alerts(self, size: int = 20):
        try:
            return self.client.search(
                index=self.alerts_index,
                size=size,
                query=self._user_filter({"match_all": {}}),
                sort=[{"@timestamp": {"order": "desc"}}],
            )
        except Exception as exc:
            print(f"[ERROR] user recent alerts: {exc}")
            return None

    def store_alert(self, alert):
        doc = dict(alert)
        doc["nexora_user_id"] = self.user_id
        return super().store_alert(doc)

    def search_alerts(self, query: dict, size: int = 50):
        try:
            return self.client.search(
                index=self.alerts_index,
                size=size,
                query=self._user_filter(query),
            )
        except Exception as exc:
            print(f"[ERROR] user search_alerts: {exc}")
            return None
