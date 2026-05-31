import json
import os

from siem.alerts.dedup import is_duplicate
from siem.alerts.notifier import TelegramNotifier
from siem.config import get_settings
from siem.database.db import ElasticsearchConnector


class AlertGenerator:

    def __init__(self, alerts, attack_chains, ml_result, db=None):

        self.alerts = alerts
        self.attack_chains = attack_chains
        self.ml_result = ml_result

        self.notifier = TelegramNotifier()
        self.db = db if db is not None else ElasticsearchConnector()

    # =========================
    # TELEGRAM ALERTS (DEDUPED SEPARATELY)
    # =========================

    def send_telegram_alerts(self):

        sent_count = 0

        for alert in self.alerts:

            # 🔥 Telegram-level dedup ONLY
            if is_duplicate(alert, stage="telegram"):
                continue

            severity = alert.get("severity", "LOW")

            if severity in ["HIGH", "MEDIUM", "LOW"]:

                message = (
                    f"🚨 MINI SIEM ALERT 🚨\n\n"
                    f"Type: {alert.get('alert_type')}\n"
                    f"Severity: {severity}\n"
                    f"Description: {alert.get('description')}\n"
                    f"Risk Score: {alert.get('risk_score', 'N/A')}\n"
                    f"User: {alert.get('username', 'unknown')}\n"
                    f"IP: {alert.get('source_ip', 'unknown')}"
                )

                self.notifier.send_alert(message)
                sent_count += 1

        print(f"[INFO] Telegram alerts sent: {sent_count}")

    # =========================
    # ELASTICSEARCH STORAGE (DEDUPED SEPARATELY)
    # =========================

    def store_alerts(self):

        stored_count = 0

        for alert in self.alerts:

            # 🔥 Storage-level dedup ONLY
            if is_duplicate(alert, stage="storage"):
                continue

            self.db.store_alert(alert)
            stored_count += 1

        print(f"[INFO] Alerts stored in Elasticsearch: {stored_count}")

    # =========================
    # DASHBOARD EXPORT
    # =========================

    def save_dashboard_data(self):

        dashboard_data = {
            "alerts": self.alerts,
            "attack_chains": self.attack_chains,
            "ml_analysis": self.ml_result,
            "alert_count": len(self.alerts),
            "attack_chain_count": len(self.attack_chains)
        }

        settings = get_settings()
        output_file = settings.dashboard_export_file

        settings.exports_dir.mkdir(parents=True, exist_ok=True)

        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(dashboard_data, file, indent=4)

        print(f"[INFO] Dashboard data saved: {output_file}")
