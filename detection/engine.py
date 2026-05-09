import json
import os

from detection.rules import DetectionRules
from detection.correlation import AlertCorrelationEngine
from mitre.mapper import MitreMapper

from ml.features import FeatureExtractor
from ml.model import ThreatClassifier


class DetectionEngine:

    def __init__(self, parsed_log_file):

        self.parsed_log_file = parsed_log_file

        self.events = []
        self.alerts = []
        self.attack_chains = []

        self.ml_result = None

        self.mitre_mapper = MitreMapper()

    def load_events(self):

        if not os.path.exists(self.parsed_log_file):

            print("[ERROR] Parsed log file not found")
            return False

        with open(self.parsed_log_file, "r") as file:

            self.events = json.load(file)

        return True

    def run_detection(self):

        rules = DetectionRules(self.events)

        raw_alerts = rules.run_all_rules()

        self.alerts = [
            self.mitre_mapper.enrich_alert(alert)
            for alert in raw_alerts
        ]

        return self.alerts

    def run_correlation(self):

        correlation_engine = AlertCorrelationEngine(
            self.events
        )

        raw_chains = correlation_engine.run_correlation()

        self.attack_chains = [
            self.mitre_mapper.enrich_alert(chain)
            for chain in raw_chains
        ]

        return self.attack_chains

    def run_ml_analysis(self):

        extractor = FeatureExtractor(
            self.events
        )

        features = extractor.extract_features()

        classifier = ThreatClassifier()

        classifier.train_model()

        self.ml_result = (
            classifier.predict_threat(features)
        )

        return self.ml_result

    def display_alerts(self):

        if not self.alerts:

            print("[INFO] No alerts detected")
            return

        print("\n" + "=" * 50)
        print(" DETECTED ALERTS ")
        print("=" * 50)

        for index, alert in enumerate(
            self.alerts,
            start=1
        ):

            print(f"\nAlert #{index}")

            for key, value in alert.items():

                if key == "mitre_attack":

                    print("MITRE ATT&CK:")

                    for mk, mv in value.items():

                        print(f"   {mk}: {mv}")

                else:

                    print(f"{key}: {value}")

    def display_attack_chains(self):

        if not self.attack_chains:

            print("\n[INFO] No attack chains detected")
            return

        print("\n" + "=" * 50)
        print(" CORRELATED INCIDENTS ")
        print("=" * 50)

        for index, chain in enumerate(
            self.attack_chains,
            start=1
        ):

            print(f"\nIncident #{index}")

            for key, value in chain.items():

                if key == "mitre_attack":

                    print("MITRE ATT&CK:")

                    for mk, mv in value.items():

                        print(f"   {mk}: {mv}")

                else:

                    print(f"{key}: {value}")

    def display_ml_result(self):

        if not self.ml_result:
            return

        print("\n" + "=" * 50)
        print(" ML THREAT ANALYSIS ")
        print("=" * 50)

        for key, value in self.ml_result.items():

            print(f"{key}: {value}")
