import os
import glob

from collectors.file_collector import FileCollector
from parsers.auth_parser import AuthLogParser
from detection.engine import DetectionEngine


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
    print("3. Run Detection Engine")

    choice = input("\nSelect mode: ")

    collector = FileCollector()

    # LOG COLLECTION
    if choice == "1":

        collected_file = collector.collect_batch()

        if collected_file:
            print(f"[SUCCESS] Collected file: {collected_file}")

    # LOG PARSING
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

    # DETECTION ENGINE
    elif choice == "3":

        detection_engine = DetectionEngine(
            "data/parsed/parsed_logs.json"
        )

        if detection_engine.load_events():

            alerts = detection_engine.run_detection()

            detection_engine.display_alerts()

    else:
        print("[ERROR] Invalid option")


if __name__ == "__main__":
    main()
