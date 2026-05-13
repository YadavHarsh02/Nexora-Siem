import os
import glob

from collectors.file_collector import FileCollector
from parsers.auth_parser import AuthLogParser
from detection.engine import DetectionEngine
from alerts.generator import AlertGenerator
from threat_intel.feed_updater import ThreatFeedUpdater


def get_latest_log():

    log_files = glob.glob("data/raw/*.log")

    if not log_files:
        return None

    return max(log_files, key=os.path.getctime)


def main():

    print("=" * 50)
    print(" MINI SIEM STARTED ")
    print("=" * 50)

    print("\n1. Collect Logs")
    print("2. Parse Logs")
    print("3. Run Detection + Correlation + ML + Metrics")

    choice = input("\nSelect mode: ")

    collector = FileCollector()

    # =========================
    # COLLECT LOGS
    # =========================
    if choice == "1":

        collected_file = collector.collect_batch()

        if collected_file:
            print(f"[SUCCESS] Collected file: {collected_file}")

    # =========================
    # PARSE LOGS
    # =========================
    elif choice == "2":

        latest_log = get_latest_log()

        if not latest_log:
            print("[ERROR] No raw logs found")
            return

        parser = AuthLogParser()

        parsed_logs = parser.parse_file(latest_log)

        print(f"[INFO] Parsed events: {len(parsed_logs)}")

        output_file = "data/parsed/parsed_logs.json"

        parser.save_parsed_logs(output_file)

    # =========================
    # FULL PIPELINE
    # =========================
    elif choice == "3":

        print("[INFO] Updating threat feed...")
        feed_updater = ThreatFeedUpdater()
        feed_updater.update_feed()

        detection_engine = DetectionEngine("data/parsed/parsed_logs.json")

        if detection_engine.load_events():

            detection_engine.run_detection()
            detection_engine.run_correlation()
            detection_engine.run_ml_analysis()

            detection_engine.display_alerts()
            detection_engine.display_attack_chains()
            detection_engine.display_ml_result()
            detection_engine.display_metrics()

            generator = AlertGenerator(
                detection_engine.alerts,
                detection_engine.attack_chains,
                detection_engine.ml_result
            )

            # 🔥 FIXED SAFE ORDER (IMPORTANT)
            generator.store_alerts()
            generator.send_telegram_alerts()
            generator.save_dashboard_data()

        else:
            print("[ERROR] Could not load events")

    else:
        print("[ERROR] Invalid option")


if __name__ == "__main__":
    main()
