from collections import Counter


class FeatureExtractor:

    def __init__(self, events):

        self.events = events

    def extract_features(self):

        counter = Counter()

        for event in self.events:

            event_type = event.get("event_type")

            counter[event_type] += 1

        features = {

            "failed_login":
                counter.get("failed_login", 0),

            "authentication_failure":
                counter.get(
                    "authentication_failure",
                    0
                ),

            "invalid_user":
                counter.get("invalid_user", 0),

            "sudo_command":
                counter.get("sudo_command", 0)
        }

        return features
