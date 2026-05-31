import re
import json
import os


class AuthLogParser:

    def __init__(self):
        self.parsed_logs = []

    # =========================
    # SAFE HELPERS
    # =========================

    def safe_get(self, match, index, default="unknown"):
        try:
            value = match.group(index)
            return value if value else default
        except:
            return default

    def parse_line(self, line):

        parsed_event = None

        # =========================
        # FAILED LOGIN
        # =========================
        failed_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*"
            r"Failed password for "
            r"(invalid user )?(\w+) "
            r"from ([\da-fA-F\:\.]+)",
            line
        )

        # =========================
        # SUCCESS LOGIN
        # =========================
        success_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*"
            r"Accepted password for "
            r"(\w+) from "
            r"([\da-fA-F\:\.]+)",
            line
        )

        # =========================
        # INVALID USER
        # =========================
        invalid_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*"
            r"Invalid user (\w+) "
            r"from ([\da-fA-F\:\.]+)",
            line
        )

        # =========================
        # SUDO COMMAND
        # =========================
        sudo_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*"
            r"sudo\[\d+\]:\s+(\w+)\s+:",
            line
        )

        # =========================
        # AUTH FAILURE
        # =========================
        auth_fail_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*"
            r"authentication failure.*"
            r"rhost=([\da-fA-F\:\.]+)?.*"
            r"user=([\w\-]+)?",
            line
        )

        # =========================
        # EVENT BUILDING (NORMALIZED)
        # =========================

        if failed_pattern:
            parsed_event = {
                "event_type": "failed_login",
                "timestamp": self.safe_get(failed_pattern, 1),
                "username": self.safe_get(failed_pattern, 3),
                "source_ip": self.safe_get(failed_pattern, 4),
            }

        elif success_pattern:
            parsed_event = {
                "event_type": "successful_login",
                "timestamp": self.safe_get(success_pattern, 1),
                "username": self.safe_get(success_pattern, 2),
                "source_ip": self.safe_get(success_pattern, 3),
            }

        elif invalid_pattern:
            parsed_event = {
                "event_type": "invalid_user",
                "timestamp": self.safe_get(invalid_pattern, 1),
                "username": self.safe_get(invalid_pattern, 2),
                "source_ip": self.safe_get(invalid_pattern, 3),
            }

        elif sudo_pattern:
            parsed_event = {
                "event_type": "sudo_command",
                "timestamp": self.safe_get(sudo_pattern, 1),
                "username": self.safe_get(sudo_pattern, 2),
                "source_ip": "unknown",
            }

        elif auth_fail_pattern:
            parsed_event = {
                "event_type": "authentication_failure",
                "timestamp": self.safe_get(auth_fail_pattern, 1),
                "source_ip": self.safe_get(auth_fail_pattern, 2),
                "username": self.safe_get(auth_fail_pattern, 3),
            }

        return parsed_event

    def parse_file(self, filepath):

        if not os.path.exists(filepath):
            print(f"[ERROR] File not found: {filepath}")
            return []

        with open(filepath, "r") as file:
            for line in file:
                parsed = self.parse_line(line)
                if parsed:
                    self.parsed_logs.append(parsed)

        return self.parsed_logs

    def save_parsed_logs(self, output_file):

        with open(output_file, "w") as file:
            json.dump(self.parsed_logs, file, indent=4)

        print(f"[INFO] Parsed logs saved: {output_file}")
