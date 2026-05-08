from collections import defaultdict


class AlertCorrelationEngine:

    def __init__(self, events):

        self.events = events
        self.attack_chains = []

    def correlate_by_ip(self):

        grouped_events = defaultdict(list)

        for event in self.events:

            ip = event.get("source_ip")

            if ip:
                grouped_events[ip].append(event)

        for ip, events in grouped_events.items():

            event_types = [event["event_type"] for event in events]

            # ATTACK CHAIN LOGIC
            if (
                "failed_login" in event_types
                and "successful_login" in event_types
            ):

                self.attack_chains.append({
                    "incident_type": "possible_account_compromise",
                    "severity": "HIGH",
                    "source_ip": ip,
                    "events": event_types,
                    "description": (
                        "Failed logins followed by successful login"
                    )
                })

            elif "failed_login" in event_types:

                failed_count = event_types.count("failed_login")

                if failed_count >= 3:

                    self.attack_chains.append({
                        "incident_type": "brute_force_attempt",
                        "severity": "HIGH",
                        "source_ip": ip,
                        "failed_attempts": failed_count,
                        "events": event_types,
                        "description": (
                            "Multiple failed login attempts detected"
                        )
                    })

    def correlate_privilege_escalation(self):

        users = defaultdict(list)

        for event in self.events:

            username = event.get("username")

            if username:
                users[username].append(event)

        for username, events in users.items():

            event_types = [event["event_type"] for event in events]

            if (
                "successful_login" in event_types
                and "sudo_command" in event_types
            ):

                self.attack_chains.append({
                    "incident_type": "possible_privilege_escalation",
                    "severity": "HIGH",
                    "username": username,
                    "events": event_types,
                    "description": (
                        "Successful login followed by sudo activity"
                    )
                })

    def run_correlation(self):

        self.correlate_by_ip()

        self.correlate_privilege_escalation()

        return self.attack_chains
