from collections import defaultdict


class DetectionRules:

    def __init__(self, events):
        self.events = events
        self.alerts = []

    def detect_brute_force(self):

        failed_logins = defaultdict(int)

        for event in self.events:

            if event["event_type"] == "failed_login":

                ip = event.get("source_ip", "unknown")

                failed_logins[ip] += 1

        for ip, count in failed_logins.items():

            if count >= 3:

                self.alerts.append({
                    "alert_type": "brute_force_attack",
                    "severity": "HIGH",
                    "source_ip": ip,
                    "failed_attempts": count,
                    "description": f"Multiple failed login attempts detected from {ip}"
                })

    def detect_invalid_users(self):

        for event in self.events:

            if event["event_type"] == "invalid_user":

                self.alerts.append({
                    "alert_type": "invalid_user_attempt",
                    "severity": "MEDIUM",
                    "source_ip": event.get("source_ip"),
                    "username": event.get("username"),
                    "description": "Invalid user login attempt detected"
                })

    def detect_suspicious_sudo(self):

        for event in self.events:

            if event["event_type"] == "sudo_command":

                self.alerts.append({
                    "alert_type": "sudo_activity",
                    "severity": "LOW",
                    "username": event.get("username"),
                    "description": "Sudo command execution detected"
                })

    def detect_auth_failures(self):

        failure_count = 0

        for event in self.events:

            if event["event_type"] == "authentication_failure":
                failure_count += 1

        if failure_count >= 2:

            self.alerts.append({
                "alert_type": "authentication_failures",
                "severity": "MEDIUM",
                "count": failure_count,
                "description": "Multiple authentication failures detected"
            })

    def run_all_rules(self):

        self.detect_brute_force()
        self.detect_invalid_users()
        self.detect_suspicious_sudo()
        self.detect_auth_failures()

        return self.alerts
