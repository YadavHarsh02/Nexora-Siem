import json
import os

from analytics.metrics import SIEMMetrics

from detection.rules import DetectionRules
from detection.correlation import AlertCorrelationEngine
from mitre.mapper import MitreMapper

from ml.features import FeatureExtractor
from ml.model import ThreatClassifier
from alerts.prioritizer import AlertPrioritizer


class DetectionEngine:

    def __init__(self, parsed_log_file=None, events=None):

        # supports BOTH batch + realtime
        self.parsed_log_file = parsed_log_file

        self.events = events if events is not None else []

        self.alerts = []
        self.attack_chains = []

        self.ml_result = None
        self.metrics = None

        self.mitre_mapper = MitreMapper()
        self.prioritizer = AlertPrioritizer()

    # =========================
    # LOAD EVENTS (BATCH MODE)
    # =========================
    def load_events(self):

        if not self.parsed_log_file:
            return False

        if not os.path.exists(self.parsed_log_file):

            print("[ERROR] Parsed log file not found")
            return False

        with open(self.parsed_log_file, "r") as file:

            self.events = json.load(file)

        return True

    # =========================
    # REALTIME SUPPORT
    # =========================
    def add_event(self, event):

        if event:
            self.events.append(event)

    # =========================
    # DETECTION ENGINE
    # =========================
    def run_detection(self):

        if not self.events:
            return []

        rules = DetectionRules(self.events)

        raw_alerts = rules.run_all_rules()

        enriched_alerts = [
            self.mitre_mapper.enrich_alert(alert)
            for alert in raw_alerts
        ]

        self.alerts = self.prioritizer.prioritize_alerts(enriched_alerts)

        return self.alerts

    # =========================
    # CORRELATION ENGINE
    # =========================
    def run_correlation(self):

        correlation_engine = AlertCorrelationEngine(self.events)

        raw_chains = correlation_engine.run_correlation()

        self.attack_chains = [
            self.mitre_mapper.enrich_alert(chain)
            for chain in raw_chains
        ]

        return self.attack_chains

    # =========================
    # ML ANALYSIS
    # =========================
    def run_ml_analysis(self):

        extractor = FeatureExtractor(self.events)

        features = extractor.extract_features()

        classifier = ThreatClassifier()
        classifier.train_model()

        self.ml_result = classifier.predict_threat(features)

        # METRICS
        self.metrics = SIEMMetrics({
            "alerts": self.alerts,
            "ml_analysis": self.ml_result
        })

        return self.ml_result

    # =========================
    # DISPLAY ALERTS
    # =========================
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

                if key == "mitre_attack":

                    print("MITRE ATT&CK:")

                    for mk, mv in value.items():
                        print(f"   {mk}: {mv}")

                else:
                    print(f"{key}: {value}")

    # =========================
    # DISPLAY ATTACK CHAINS
    # =========================
    def display_attack_chains(self):

        if not self.attack_chains:

            print("\n[INFO] No attack chains detected")
            return

        print("\n" + "=" * 50)
        print(" CORRELATED INCIDENTS ")
        print("=" * 50)

        for index, chain in enumerate(self.attack_chains, start=1):

            print(f"\nIncident #{index}")

            for key, value in chain.items():

                if key == "mitre_attack":

                    print("MITRE ATT&CK:")

                    for mk, mv in value.items():
                        print(f"   {mk}: {mv}")

                else:
                    print(f"{key}: {value}")

    # =========================
    # ML RESULT DISPLAY
    # =========================
    def display_ml_result(self):

        if not self.ml_result:
            return

        print("\n" + "=" * 50)
        print(" ML THREAT ANALYSIS ")
        print("=" * 50)

        for key, value in self.ml_result.items():
            print(f"{key}: {value}")

    # =========================
    # METRICS DISPLAY
    # =========================
    def display_metrics(self):

        if not self.metrics:
            return

        print("\n" + "=" * 50)
        print(" SIEM METRICS DASHBOARD ")
        print("=" * 50)

        print("Total Alerts:", self.metrics.total_alerts())
        print("High Risk %:", self.metrics.high_risk_ratio())
        print("Medium Risk %:", self.metrics.medium_risk_ratio())
        print("ML Prediction:", self.metrics.ml_prediction())
        print("ML Confidence:", self.metrics.ml_confidence())
        print("SOC Health Score:", self.metrics.soc_health_score(), "/100")
