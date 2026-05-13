from collections import defaultdict


class AlertCorrelationEngine:

    def __init__(self, events):

        self.events = events

        self.chains = []

    def run_correlation(self):

        # =========================
        # GROUP EVENTS
        # =========================

        grouped = defaultdict(list)

        for event in self.events:

            ip = event.get(
                "source_ip",
                "unknown"
            )

            user = event.get(
                "username",
                "unknown"
            )

            key = f"{ip}_{user}"

            grouped[key].append(event)

        # =========================
        # ANALYZE EVENT GROUPS
        # =========================

        for key, events in grouped.items():

            if len(events) < 1:
                continue

            # SORT EVENTS BY TIMESTAMP

            sorted_events = sorted(

                events,

                key=lambda x: x.get(
                    "timestamp",
                    ""
                )
            )

            attack_pattern = [

                e.get("event_type")

                for e in sorted_events
            ]

            # =========================
            # RULE 1:
            # FAILED LOGIN → SUDO
            # =========================

            if (

                "failed_login" in attack_pattern

                and

                "sudo_command" in attack_pattern
            ):

                self.chains.append({

                    "chain_type":
                        "privilege_escalation",

                    "source":
                        key,

                    "events":
                        attack_pattern,

                    "severity":
                        "HIGH",

                    "description":
                        "Failed login followed "
                        "by sudo activity"
                })

                print(
                    f"[INFO] Attack chain detected: "
                    f"privilege_escalation ({key})"
                )

            # =========================
            # RULE 2:
            # MULTIPLE FAILED LOGINS
            # =========================

            elif (

                attack_pattern.count(
                    "failed_login"
                ) >= 3
            ):

                self.chains.append({

                    "chain_type":
                        "brute_force_sequence",

                    "source":
                        key,

                    "events":
                        attack_pattern,

                    "severity":
                        "MEDIUM",

                    "description":
                        "Repeated failed login "
                        "attempts detected"
                })

                print(
                    f"[INFO] Attack chain detected: "
                    f"brute_force_sequence ({key})"
                )

            # =========================
            # RULE 3:
            # AUTH FAILURE + INVALID USER
            # =========================

            elif (

                "authentication_failure"
                in attack_pattern

                and

                "invalid_user"
                in attack_pattern
            ):

                self.chains.append({

                    "chain_type":
                        "credential_stuffing",

                    "source":
                        key,

                    "events":
                        attack_pattern,

                    "severity":
                        "MEDIUM",

                    "description":
                        "Mixed authentication "
                        "failures detected"
                })

                print(
                    f"[INFO] Attack chain detected: "
                    f"credential_stuffing ({key})"
                )

        return self.chains
