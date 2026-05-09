import json
import os

from alerts.notifier import (
    TelegramNotifier
)

from database.db import (
    ElasticsearchConnector
)


class AlertGenerator:

    def __init__(
        self,
        alerts,
        attack_chains,
        ml_result
    ):

        self.alerts = alerts

        self.attack_chains = (
            attack_chains
        )

        self.ml_result = (
            ml_result
        )

        self.notifier = (
            TelegramNotifier()
        )

        self.db = (
            ElasticsearchConnector()
        )

    def send_telegram_alerts(self):

        for alert in self.alerts:

            severity = alert.get(
                "severity",
                "LOW"
            )

            if severity in [
                "HIGH",
                "MEDIUM",
                "LOW"
            ]:

                message = (

                    f"🚨 MINI SIEM ALERT 🚨\n\n"

                    f"Type: "
                    f"{alert.get('alert_type')}\n"

                    f"Severity: "
                    f"{severity}\n"

                    f"Priority: "
                    f"{alert.get('priority')}\n"

                    f"Risk Score: "
                    f"{alert.get('risk_score')}\n"

                    f"Description: "
                    f"{alert.get('description')}"
                )

                self.notifier.send_alert(
                    message
                )

        print(
            "[INFO] Telegram alerts sent"
        )

    def save_dashboard_data(self):

        dashboard_data = {

            "alerts":
                self.alerts,

            "attack_chains":
                self.attack_chains,

            "ml_analysis":
                self.ml_result
        }

        output_file = (

            "dashboard/static/"
            "dashboard_data.json"
        )

        os.makedirs(
            "dashboard/static",
            exist_ok=True
        )

        with open(
            output_file,
            "w"
        ) as file:

            json.dump(

                dashboard_data,

                file,

                indent=4
            )

        print(

            f"[INFO] Dashboard "
            f"data saved: "
            f"{output_file}"
        )

    def store_alerts(self):

        for alert in self.alerts:

            self.db.store_alert(
                alert
            )

        print(
            "[INFO] Alerts stored "
            "in Elasticsearch"
        )
