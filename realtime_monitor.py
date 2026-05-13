import os
import time
from datetime import datetime

from parsers.auth_parser import AuthLogParser
from detection.engine import DetectionEngine


# =========================
# GET LATEST LOG FILE
# =========================
def get_latest_log_file():

    log_dir = "data/raw"

    if not os.path.exists(log_dir):
        return None

    files = [
        os.path.join(log_dir, f)
        for f in os.listdir(log_dir)
        if f.startswith("auth_")
    ]

    if not files:
        return None

    return max(files, key=os.path.getctime)


# =========================
# REALTIME SIEM ENGINE
# =========================
class RealTimeSIEM:

    def __init__(self, log_file):

        self.log_file = log_file

        self.parser = AuthLogParser()

        # FIX: supports realtime event injection
        self.detector = DetectionEngine(events=[])

        self.processed_lines = set()

    # =========================
    # PROCESS NEW LOGS ONLY
    # =========================
    def process_new_logs(self):

        try:

            with open(self.log_file, "r") as f:

                lines = f.readlines()

                for line in lines:

                    if line in self.processed_lines:
                        continue

                    self.processed_lines.add(line)

                    event = self.parser.parse_line(line)

                    if not event:
                        continue

                    print(
                        f"[{datetime.now()}] EVENT:",
                        event
                    )

                    # feed into detection engine
                    self.detector.add_event(event)

                    alerts = self.detector.run_detection()

                    if alerts:

                        print("\n🚨 DETECTED ALERTS:")

                        for alert in alerts:

                            print(alert)

        except Exception as e:

            print("[ERROR] realtime pipeline failed:", str(e))

    # =========================
    # MAIN LOOP (SOC STREAM)
    # =========================
    def run(self):

        print("=" * 50)
        print(" REAL-TIME MINI SIEM ENGINE ")
        print("=" * 50)

        print(f"[INFO] Monitoring file: {self.log_file}")

        while True:

            self.process_new_logs()

            print("[INFO] Waiting for new logs...")

            time.sleep(5)


# =========================
# ENTRY POINT
# =========================
if __name__ == "__main__":

    log_file = get_latest_log_file()

    if not log_file:

        print("[ERROR] No log files found in data/raw/")
        exit(1)

    engine = RealTimeSIEM(log_file)

    engine.run()
