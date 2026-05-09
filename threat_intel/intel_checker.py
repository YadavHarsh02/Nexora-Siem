class ThreatIntelChecker:

    def __init__(self):

        self.malicious_ips = []

        self.load_feed()

    def load_feed(self):

        with open(
            "threat_intel/malicious_ips.txt",
            "r"
        ) as file:

            self.malicious_ips = [

                line.strip()

                for line in file
            ]

    def is_malicious_ip(self, ip):

        return ip in self.malicious_ips
