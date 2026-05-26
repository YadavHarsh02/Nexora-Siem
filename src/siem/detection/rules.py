from collections import defaultdict

from siem.threat_intel.intel_checker import (
    ThreatIntelChecker
)

from siem.baseline.analyzer import (
    BaselineAnalyzer
)


class DetectionRules:

    def __init__(self, events):

        self.events = events

        self.alerts = []

        self.threat_intel = (
            ThreatIntelChecker()
        )

        self.baseline_analyzer = (
            BaselineAnalyzer(events)
        )

    # =========================
    # BRUTE FORCE DETECTION
    # =========================

    def detect_brute_force(self):

        failed_logins = defaultdict(list)

        # COLLECT FAILED LOGINS

        for event in self.events:

            if (
                event.get("event_type")
                == "failed_login"
            ):

                ip = event.get(
                    "source_ip",
                    "unknown"
                )

                username = event.get(
                    "username",
                    "unknown"
                )

                # IPv6-safe separator
                key = f"{ip}|{username}"

                failed_logins[key].append(
                    event
                )

        # ANALYZE LOGIN FAILURES

        for key, events in failed_logins.items():

            count = len(events)

            if count < 3:
                continue

            ip, username = key.split("|")

            # DYNAMIC SEVERITY

            if count >= 10:

                severity = "HIGH"

            elif count >= 5:

                severity = "MEDIUM"

            else:

                severity = "LOW"

            latest_event = events[-1]

            self.alerts.append({

                "alert_type":
                    "brute_force_attack",

                "severity":
                    severity,

                "description":
                    f"Repeated failed login "
                    f"attempts detected "
                    f"against user {username}",

                "timestamp":
                    latest_event.get(
                        "timestamp",
                        ""
                    ),

                "source_ip":
                    ip,

                "username":
                    username,

                "event_count":
                    count
            })

    # =========================
    # INVALID USER DETECTION
    # =========================

    def detect_invalid_users(self):

        for event in self.events:

            if (
                event.get("event_type")
                == "invalid_user"
            ):

                self.alerts.append({

                    "alert_type":
                        "invalid_user_attempt",

                    "severity":
                        "MEDIUM",

                    "description":
                        "Invalid user login attempt detected",

                    "timestamp":
                        event.get("timestamp", ""),

                    "source_ip":
                        event.get("source_ip", ""),

                    "username":
                        event.get("username", ""),

                    "event_count":
                        1
                })

    # =========================
    # SUDO DETECTION
    # =========================

    def detect_suspicious_sudo(self):

        for event in self.events:

            if (
                event.get("event_type")
                == "sudo_command"
            ):

                self.alerts.append({

                    "alert_type":
                        "sudo_activity",

                    "severity":
                        "LOW",

                    "description":
                        "Sudo command execution detected",

                    "timestamp":
                        event.get("timestamp", ""),

                    "source_ip":
                        event.get("source_ip", ""),

                    "username":
                        event.get("username", ""),

                    "event_count":
                        1
                })

    # =========================
    # AUTH FAILURE DETECTION
    # =========================

    def detect_auth_failures(self):

        auth_failures = defaultdict(list)

        for event in self.events:

            if (
                event.get("event_type")
                == "authentication_failure"
            ):

                ip = event.get(
                    "source_ip",
                    "unknown"
                )

                auth_failures[ip].append(
                    event
                )

        for ip, events in auth_failures.items():

            count = len(events)

            if count < 2:
                continue

            # DYNAMIC SEVERITY

            if count >= 8:

                severity = "HIGH"

            elif count >= 4:

                severity = "MEDIUM"

            else:

                severity = "LOW"

            latest_event = events[-1]

            self.alerts.append({

                "alert_type":
                    "authentication_failures",

                "severity":
                    severity,

                "description":
                    "Multiple authentication failures detected",

                "timestamp":
                    latest_event.get(
                        "timestamp",
                        ""
                    ),

                "source_ip":
                    ip,

                "username":
                    latest_event.get(
                        "username",
                        ""
                    ),

                "event_count":
                    count
            })

    # =========================
    # THREAT INTEL DETECTION
    # =========================

    def detect_malicious_ip(self):

        for event in self.events:

            source_ip = event.get(
                "source_ip"
            )

            if not source_ip:
                continue

            if (
                self.threat_intel
                .is_malicious_ip(source_ip)
            ):

                self.alerts.append({

                    "alert_type":
                        "known_malicious_ip",

                    "severity":
                        "HIGH",

                    "description":
                        "Known malicious IP detected",

                    "timestamp":
                        event.get("timestamp", ""),

                    "source_ip":
                        source_ip,

                    "username":
                        event.get("username", ""),

                    "event_count":
                        1
                })

    # =========================
    # UEBA / ANOMALY DETECTION
    # =========================

    def detect_behavior_anomalies(self):

        anomalies = (
            self.baseline_analyzer
            .detect_anomalies()
        )

        for anomaly in anomalies:

            anomaly.setdefault(
                "timestamp", ""
            )

            anomaly.setdefault(
                "source_ip", ""
            )

            anomaly.setdefault(
                "username", ""
            )

            anomaly.setdefault(
                "event_count", 1
            )

        self.alerts.extend(
            anomalies
        )

    # =========================
    # RUN ALL RULES
    # =========================

    def run_all_rules(self):

        self.detect_brute_force()

        self.detect_invalid_users()

        self.detect_suspicious_sudo()

        self.detect_auth_failures()

        self.detect_malicious_ip()

        self.detect_behavior_anomalies()

        return self.alerts
