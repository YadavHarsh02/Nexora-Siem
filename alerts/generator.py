import json


class AlertGenerator:

    def __init__(self, alerts):
        self.alerts = alerts

    def save_alerts(self, output_file):

        with open(output_file, "w") as file:
            json.dump(self.alerts, file, indent=4)

        print(f"[INFO] Alerts saved to {output_file}")
