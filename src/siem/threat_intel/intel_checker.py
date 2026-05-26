from siem.config import get_settings


class ThreatIntelChecker:

    def __init__(self):

        self.malicious_ips = []

        self.load_feed()

    def load_feed(self):

        feed_path = get_settings().threat_intel_file

        with open(feed_path, "r", encoding="utf-8") as file:

            self.malicious_ips = [

                line.strip()

                for line in file
            ]

    def is_malicious_ip(self, ip):

        return ip in self.malicious_ips
