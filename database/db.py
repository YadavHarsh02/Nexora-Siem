from elasticsearch import Elasticsearch
from datetime import datetime


class ElasticsearchConnector:

    def __init__(self):

        self.client = Elasticsearch("http://localhost:9200")
        self.index_name = "mini_siem_alerts"

        # 🔥 ensure index exists
        if not self.client.indices.exists(index=self.index_name):
            self.client.indices.create(index=self.index_name)

    # =========================
    # STORE ALERT (FIXED + SAFE)
    # =========================

    def store_alert(self, alert):

        try:

            alert = dict(alert)  # prevent mutation issues

            alert["@timestamp"] = datetime.utcnow().isoformat()

            response = self.client.index(
                index=self.index_name,
                document=alert
            )

            result = response.get("result")

            if result != "created":
                print("[WARN] ES store result:", result)

            else:
                print("[INFO] Alert stored in Elasticsearch: created")

            return response

        except Exception as e:
            print("[ERROR] store_alert failed:", str(e))
            return None

    # =========================
    # RECENT ALERTS
    # =========================

    def get_recent_alerts(self):

        try:

            return self.client.search(
                index=self.index_name,
                size=20,
                query={"match_all": {}}
            )

        except Exception as e:
            print("[ERROR] recent alerts:", str(e))
            return None

    # =========================
    # SEARCH FUNCTIONS (UNCHANGED BUT SAFE)
    # =========================

    def search_by_ip(self, ip):

        try:
            return self.client.search(
                index=self.index_name,
                query={"match": {"source_ip": ip}}
            )
        except Exception as e:
            print("[ERROR] IP search failed:", str(e))
            return None

    def search_by_username(self, username):

        try:
            return self.client.search(
                index=self.index_name,
                query={"match": {"username": username}}
            )
        except Exception as e:
            print("[ERROR] user search failed:", str(e))
            return None

    def search_by_alert_type(self, alert_type):

        try:
            return self.client.search(
                index=self.index_name,
                query={"match": {"alert_type": alert_type}}
            )
        except Exception as e:
            print("[ERROR] type search failed:", str(e))
            return None

    def search_by_severity(self, severity):

        try:
            return self.client.search(
                index=self.index_name,
                query={"match": {"severity": severity}}
            )
        except Exception as e:
            print("[ERROR] severity search failed:", str(e))
            return None
