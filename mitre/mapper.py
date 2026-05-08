class MitreMapper:

    def __init__(self):

        self.mappings = {

            "brute_force_attack": {
                "technique_id": "T1110",
                "technique": "Brute Force",
                "tactic": "Credential Access"
            },

            "invalid_user_attempt": {
                "technique_id": "T1589",
                "technique": "Gather Victim Identity Information",
                "tactic": "Reconnaissance"
            },

            "sudo_activity": {
                "technique_id": "T1548",
                "technique": "Abuse Elevation Control Mechanism",
                "tactic": "Privilege Escalation"
            },

            "authentication_failures": {
                "technique_id": "T1110",
                "technique": "Brute Force",
                "tactic": "Credential Access"
            },

            "possible_account_compromise": {
                "technique_id": "T1078",
                "technique": "Valid Accounts",
                "tactic": "Defense Evasion"
            },

            "possible_privilege_escalation": {
                "technique_id": "T1068",
                "technique": "Exploitation for Privilege Escalation",
                "tactic": "Privilege Escalation"
            }
        }

    def enrich_alert(self, alert):

        alert_name = (
            alert.get("alert_type")
            or alert.get("incident_type")
        )

        mitre_data = self.mappings.get(alert_name)

        if mitre_data:

            alert["mitre_attack"] = mitre_data

        return alert
