import re
import json
import os


class AuthLogParser:

    def __init__(self):
        self.parsed_logs = []

    def parse_line(self, line):

        parsed_event = None

        # FAILED LOGIN
        failed_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*Failed password for (invalid user )?(\w+) from ([\d\.]+)",
            line
        )

        # SUCCESSFUL LOGIN
        success_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*Accepted password for (\w+) from ([\d\.]+)",
            line
        )

        # INVALID USER
        invalid_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*Invalid user (\w+) from ([\d\.]+)",
            line
        )

        # SUDO COMMAND
        sudo_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*sudo\[\d+\]:\s+(\w+)",
            line
        )

        # AUTHENTICATION FAILURE
        auth_fail_pattern = re.search(
            r"(\w+\s+\d+\s+\d+:\d+:\d+).*authentication failure",
            line
        )

        if failed_pattern:

            parsed_event = {
                "event_type": "failed_login",
                "timestamp": failed_pattern.group(1),
                "username": failed_pattern.group(3),
                "source_ip": failed_pattern.group(4)
            }

        elif success_pattern:

            parsed_event = {
                "event_type": "successful_login",
                "timestamp": success_pattern.group(1),
                "username": success_pattern.group(2),
                "source_ip": success_pattern.group(3)
            }

        elif invalid_pattern:

            parsed_event = {
                "event_type": "invalid_user",
                "timestamp": invalid_pattern.group(1),
                "username": invalid_pattern.group(2),
                "source_ip": invalid_pattern.group(3)
            }

        elif sudo_pattern:

            parsed_event = {
                "event_type": "sudo_command",
                "timestamp": sudo_pattern.group(1),
                "username": sudo_pattern.group(2)
            }

        elif auth_fail_pattern:

            parsed_event = {
                "event_type": "authentication_failure",
                "timestamp": auth_fail_pattern.group(1)
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
