import json
import os


class AlertGenerator:

    def __init__(
        self,
        alerts,
        attack_chains,
        ml_result
    ):

        self.alerts = alerts
        self.attack_chains = attack_chains
        self.ml_result = ml_result

    def save_dashboard_data(self):

        dashboard_data = {

            "alerts": self.alerts,

            "attack_chains":
                self.attack_chains,

            "ml_analysis":
                self.ml_result
        }

        output_file = (
            "dashboard/static/dashboard_data.json"
        )

        os.makedirs(
            "dashboard/static",
            exist_ok=True
        )

        with open(output_file, "w") as file:

            json.dump(
                dashboard_data,
                file,
                indent=4
            )

        print(
            f"[INFO] Dashboard data saved: "
            f"{output_file}"
        )
