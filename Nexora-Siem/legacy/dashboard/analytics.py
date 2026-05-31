from collections import Counter


class DashboardAnalytics:

    def __init__(self, data):

        self.alerts = data.get(
            "alerts", []
        )

    def severity_distribution(self):

        counter = Counter()

        for alert in self.alerts:

            counter[alert.get(
                "severity",
                "LOW"
            )] += 1

        return counter

    def attack_type_distribution(self):

        counter = Counter()

        for alert in self.alerts:

            counter[alert.get(
                "alert_type",
                "unknown"
            )] += 1

        return counter

    def top_source_ips(self):

        counter = Counter()

        for alert in self.alerts:

            ip = alert.get("source_ip")

            if ip:

                counter[ip] += 1

        return counter.most_common(5)
