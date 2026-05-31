import os
import json
from datetime import datetime

from dotenv import load_dotenv
from elasticsearch import Elasticsearch

from siem.config import get_settings

load_dotenv(get_settings().project_root / ".env")

class ElasticsearchConnector:
    def __init__(self):
        self.offline = False
        self.client = None
        self.index_name = "mini_siem_alerts"
        
        try:
            url = os.getenv("ELASTIC_URL")
            if not url or "your-deployment" in url:
                raise ValueError("ELASTIC_URL is empty or not configured")
                
            api_key = os.getenv("ELASTICSEARCH_API")
            if api_key and ":" in api_key:
                api_key = tuple(api_key.split(":", 1))
                
            self.client = Elasticsearch(
                url,
                api_key=api_key,
                request_timeout=15
            )
            # =========================
            # ENSURE INDEX EXISTS
            # =========================
            if not self.client.indices.exists(
                index=self.index_name
            ):
                self.client.indices.create(
                    index=self.index_name
                )
                print(
                    "[INFO] Elasticsearch index created"
                )
        except Exception as e:
            self.offline = True
            print(
                "[WARN] Elasticsearch offline/unconfigured, using local logs fallback. Error:",
                str(e)
            )

    # =========================
    # SIMULATED LOCAL FILE STORE HELPERS
    # =========================
    def _get_simulated_alerts_file(self):
        settings = get_settings()
        return settings.exports_dir / "simulated_alerts.json"

    def _load_simulated_alerts(self):
        file_path = self._get_simulated_alerts_file()
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _save_simulated_alerts(self, alerts):
        file_path = self._get_simulated_alerts_file()
        file_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(alerts, f, indent=4)
        except Exception as e:
            print("[ERROR] Failed to save simulated alerts:", e)

    def _simulated_search(self, query: dict, size: int = 50):
        all_alerts = self._load_simulated_alerts()
        # Sort by timestamp descending
        all_alerts = sorted(
            all_alerts,
            key=lambda x: x.get("timestamp", x.get("@timestamp", "")),
            reverse=True
        )
        
        # Simple query parser
        filters = {}
        if query:
            if "match" in query:
                for k, v in query["match"].items():
                    filters[k] = v
            elif "bool" in query and "must" in query["bool"]:
                for item in query["bool"]["must"]:
                    if "match" in item:
                        for k, v in item["match"].items():
                            filters[k] = v

        filtered = []
        for a in all_alerts:
            match = True
            for k, v in filters.items():
                alert_val = str(a.get(k, "")).lower()
                if str(v).lower() not in alert_val:
                    match = False
                    break
            if match:
                filtered.append(a)

        return {
            "hits": {
                "hits": [
                    {"_source": a} for a in filtered[:size]
                ]
            }
        }

    # =========================
    # STORE ALERT
    # =========================
    def store_alert(self, alert):
        try:
            alert = dict(alert)
            if "@timestamp" not in alert:
                alert["@timestamp"] = (
                    datetime.utcnow().isoformat()
                )
                
            if self.offline:
                alerts = self._load_simulated_alerts()
                # Simple de-duplication to prevent flooding
                is_dup = False
                for existing in alerts[-100:]:
                    if (
                        existing.get("alert_type") == alert.get("alert_type") and
                        existing.get("source_ip") == alert.get("source_ip") and
                        existing.get("username") == alert.get("username") and
                        existing.get("description") == alert.get("description")
                    ):
                        is_dup = True
                        break
                if not is_dup:
                    alerts.append(alert)
                    self._save_simulated_alerts(alerts)
                    print("[INFO] Alert stored in simulated local database")
                return {"result": "created", "_id": "simulated"}

            response = self.client.index(
                index=self.index_name,
                document=alert
            )
            result = response.get("result")
            if result != "created":
                print(
                    "[WARN] ES store result:",
                    result
                )
            else:
                print(
                    "[INFO] Alert stored in Elasticsearch"
                )
            return response
        except Exception as e:
            print(
                "[ERROR] store_alert failed:",
                str(e)
            )
            return None

    def search_alerts(self, query: dict, size: int = 50):
        if self.offline:
            return self._simulated_search(query, size)
        try:
            return self.client.search(
                index=self.index_name,
                size=size,
                query=query,
            )
        except Exception as e:
            print("[ERROR] search_alerts failed:", str(e))
            return None

    # =========================
    # RECENT ALERTS
    # =========================
    def get_recent_alerts(self):
        return self.search_alerts({"match_all": {}}, size=20)

    # =========================
    # SEARCH BY IP
    # =========================
    def search_by_ip(self, ip):
        return self.search_alerts({"match": {"source_ip": ip}})

    # =========================
    # SEARCH BY USERNAME
    # =========================
    def search_by_username(self, username):
        return self.search_alerts({"match": {"username": username}})

    # =========================
    # SEARCH BY ALERT TYPE
    # =========================
    def search_by_alert_type(self, alert_type):
        return self.search_alerts({"match": {"alert_type": alert_type}})

    # =========================
    # SEARCH BY SEVERITY
    # =========================
    def search_by_severity(self, severity):
        return self.search_alerts({"match": {"severity": severity}})
