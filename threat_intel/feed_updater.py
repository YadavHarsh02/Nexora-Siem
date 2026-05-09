import requests


class ThreatFeedUpdater:

    def __init__(self):

        self.feed_url = (
            "https://feodotracker.abuse.ch/"
            "downloads/ipblocklist.txt"
        )

        self.output_file = (
            "threat_intel/malicious_ips.txt"
        )

    def update_feed(self):

        print(
            "[INFO] Downloading threat feed..."
        )

        response = requests.get(
            self.feed_url
        )

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
