from __future__ import annotations
import os
import time
from datetime import datetime

from siem.config import get_settings
from siem.detection.engine import DetectionEngine
from siem.parsers.auth_parser import AuthLogParser


def get_latest_log_file() -> str | None:
    settings = get_settings()
    log_dir = settings.raw_logs_dir

    if not log_dir.exists():
        return None

    files = [
        str(log_dir / f)
        for f in os.listdir(log_dir)
        if f.startswith("auth_")
    ]

    if not files:
        return None

    return max(files, key=os.path.getctime)


class RealTimeSIEM:

    def __init__(self, log_file: str):
        self.log_file = log_file
        self.parser = AuthLogParser()
        self.detector = DetectionEngine(events=[])
        self.processed_lines: set[str] = set()

    def process_new_logs(self):
        try:
            with open(self.log_file, "r", encoding="utf-8") as file:
                lines = file.readlines()

                for line in lines:
                    if line in self.processed_lines:
                        continue

                    self.processed_lines.add(line)

                    event = self.parser.parse_line(line)

                    if not event:
                        continue

                    print(f"[{datetime.now()}] EVENT:", event)

                    self.detector.add_event(event)
                    alerts = self.detector.run_detection()

                    if alerts:
                        print("\n🚨 DETECTED ALERTS:")
                        for alert in alerts:
                            print(alert)

        except Exception as exc:
            print("[ERROR] realtime pipeline failed:", str(exc))

    def run(self):
        print("=" * 50)
        print(" REAL-TIME MINI SIEM ENGINE ")
        print("=" * 50)
        print(f"[INFO] Monitoring file: {self.log_file}")

        while True:
            self.process_new_logs()
            print("[INFO] Waiting for new logs...")
            time.sleep(5)


def main():
    log_file = get_latest_log_file()

    if not log_file:
        print("[ERROR] No log files found in data/raw/")
        raise SystemExit(1)

    engine = RealTimeSIEM(log_file)
    engine.run()


if __name__ == "__main__":
    main()
