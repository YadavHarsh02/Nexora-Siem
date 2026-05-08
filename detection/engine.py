import json
import os

from detection.rules import DetectionRules


class DetectionEngine:

    def __init__(self, parsed_log_file):

        self.parsed_log_file = parsed_log_file
        self.events = []
        self.alerts = []

    def load_events(self):

        if not os.path.exists(self.parsed_log_file):

            print("[ERROR] Parsed log file not found")
            return False

        with open(self.parsed_log_file, "r") as file:

            self.events = json.load(file)

        return True

    def run_detection(self):

        rules = DetectionRules(self.events)

        self.alerts = rules.run_all_rules()

        return self.alerts

    def display_alerts(self):

        if not self.alerts:

            print("[INFO] No alerts detected")
            return

        print("\n" + "=" * 50)
        print(" DETECTED ALERTS ")
        print("=" * 50)

        for index, alert in enumerate(self.alerts, start=1):

            print(f"\nAlert #{index}")

            for key, value in alert.items():
                print(f"{key}: {value}")
