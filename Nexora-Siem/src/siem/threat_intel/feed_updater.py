import os

import requests

from siem.config import get_settings


class ThreatFeedUpdater:

    def __init__(self):

        settings = get_settings()

        self.feed_url = (
            "https://feodotracker.abuse.ch/"
            "downloads/ipblocklist.txt"
        )

        self.output_file = str(settings.threat_intel_file)

    def update_feed(self):

        print(
            "[INFO] Downloading threat feed..."
        )

        try:
            response = requests.get(
                self.feed_url,
                timeout=30,
            )
        except requests.RequestException as exc:
            print(
                f"[WARN] Could not download threat feed: {exc}"
            )
            if os.path.exists(self.output_file):
                print(
                    f"[INFO] Using existing threat feed: "
                    f"{self.output_file}"
                )
            else:
                print(
                    "[WARN] No local threat feed; "
                    "continuing without update"
                )
            return

        if response.status_code != 200:

            print(
                "[ERROR] Failed to "
                "download threat feed"
            )

            return

        malicious_ips = []

        for line in response.text.splitlines():

            line = line.strip()

            # Ignore comments
            if (
                not line
                or line.startswith("#")
            ):

                continue

            malicious_ips.append(line)

        with open(
            self.output_file,
            "w"
        ) as file:

            for ip in malicious_ips:

                file.write(f"{ip}\n")

        print(
            f"[INFO] Threat feed updated: "
            f"{len(malicious_ips)} IPs loaded"
        )


if __name__ == "__main__":

    updater = ThreatFeedUpdater()

    updater.update_feed()
