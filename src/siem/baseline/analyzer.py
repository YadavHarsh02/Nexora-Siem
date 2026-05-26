from collections import defaultdict


class BaselineAnalyzer:

    def __init__(self, events):

        self.events = events

    def calculate_login_baseline(self):

        user_activity = defaultdict(int)

        for event in self.events:

            event_type = event.get(
                "event_type"
            )

            username = event.get(
                "username"
            )

            if (
                event_type
                in [
                    "successful_login",
                    "failed_login"
                ]
                and username
            ):

                user_activity[
                    username
                ] += 1

        return user_activity

    def detect_anomalies(self):

        anomalies = []

        baseline = (
            self.calculate_login_baseline()
        )

        for username, count in (
            baseline.items()
        ):

            # SIMPLE THRESHOLD

            if count >= 5:

                anomalies.append({

                    "alert_type":
                        "behavior_anomaly",

                    "severity":
                        "HIGH",

                    "username":
                        username,

                    "activity_count":
                        count,

                    "description":
                        f"Unusual login activity "
                        f"detected for {username}"
                })

        return anomalies
