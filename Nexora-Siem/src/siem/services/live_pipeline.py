from __future__ import annotations

from typing import Any

from siem.alerts.generator import AlertGenerator
from siem.database.user_elastic import UserElasticsearch
from siem.detection.engine import DetectionEngine
from siem.ingest.es_event_adapter import elastic_doc_to_detection_event


class LivePipelineService:
    """
    Fetch user's logs from Elastic Cloud, run Nexora detection pipeline,
    persist alerts, return dashboard payload.
    """

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.elastic = UserElasticsearch(user_id)

    def run(self) -> dict[str, Any]:
        raw_docs = self.elastic.get_user_events(size=200)

        events = []
        for doc in raw_docs:
            event = elastic_doc_to_detection_event(doc)
            if event:
                events.append(event)

        if not events:
            return {
                "user_id": self.user_id,
                "event_count": 0,
                "alerts": [],
                "attack_chains": [],
                "ml_analysis": None,
                "message": "No events yet. Install Winlogbeat and send logs to Elastic.",
            }

        engine = DetectionEngine(events=events)
        engine.run_detection()
        engine.run_correlation()
        engine.run_ml_analysis()

        alerts = engine.alerts or []
        for alert in alerts:
            alert["nexora_user_id"] = self.user_id

        if alerts:
            generator = AlertGenerator(
                alerts,
                engine.attack_chains,
                engine.ml_result,
                db=self.elastic,
            )
            generator.store_alerts()

        metrics = None
        if engine.metrics:
            metrics = {
                "total_alerts": engine.metrics.total_alerts(),
                "high_risk_pct": engine.metrics.high_risk_ratio(),
                "medium_risk_pct": engine.metrics.medium_risk_ratio(),
                "ml_prediction": engine.metrics.ml_prediction(),
                "ml_confidence": engine.metrics.ml_confidence(),
                "soc_health_score": engine.metrics.soc_health_score(),
            }

        return {
            "user_id": self.user_id,
            "event_count": len(events),
            "alerts": alerts,
            "attack_chains": engine.attack_chains or [],
            "ml_analysis": engine.ml_result,
            "metrics": metrics,
        }
