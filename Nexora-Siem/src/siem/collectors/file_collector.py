import logging
import os
import shutil
import subprocess
from datetime import datetime

from siem.config import get_settings

_settings = get_settings()

logging.basicConfig(
    filename=_settings.log_file,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)


class FileCollector:

    def __init__(self, source_log=None):
        self.source_log = source_log

    def collect_batch(self):

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        _settings.raw_logs_dir.mkdir(parents=True, exist_ok=True)

        destination = os.path.join(
            str(_settings.raw_logs_dir),
            f"auth_{timestamp}.log",
        )

        # METHOD 1 → Traditional log file
        if self.source_log and os.path.exists(self.source_log):

            shutil.copy2(self.source_log, destination)

            print(f"[INFO] Log collected: {destination}")

            logging.info(f"Collected log file: {destination}")

            return destination

        # METHOD 2 → journalctl logs
        else:

            print("[INFO] Using journalctl logs...")

            try:

                logs = subprocess.check_output(
                    ["journalctl", "-n", "200"],
                    text=True
                )

                with open(destination, "w") as file:
                    file.write(logs)

                print(f"[INFO] Journal logs saved: {destination}")

                logging.info(f"Collected journal logs: {destination}")

                return destination

            except Exception as e:

                print(f"[ERROR] Failed collecting logs: {e}")

                logging.error(str(e))

                return None

    def follow_log(self):

        print("[INFO] Real-time monitoring via journalctl")

        logging.info("Started real-time journal monitoring")

        process = subprocess.Popen(
            ["journalctl", "-f"],
            stdout=subprocess.PIPE,
            text=True
        )

        for line in process.stdout:
            print(line.strip())
