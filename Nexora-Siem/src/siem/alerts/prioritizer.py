class AlertPrioritizer:

    def calculate_risk_score(
        self,
        alert
    ):

        score = 0

        severity = alert.get(
            "severity",
            "LOW"
        )

        # BASE SEVERITY SCORE

        severity_scores = {

            "LOW": 20,

            "MEDIUM": 50,

            "HIGH": 80,

            "CRITICAL": 100
        }

        score += severity_scores.get(
            severity,
            0
        )

        # IOC BONUS

        if (
            alert.get("alert_type")
            == "known_malicious_ip"
        ):

            score += 30

        # BRUTE FORCE BONUS

        if (
            alert.get("alert_type")
            == "brute_force_attack"
        ):

            score += 20

        # BEHAVIOR ANOMALY BONUS

        if (
            alert.get("alert_type")
            == "behavior_anomaly"
        ):

            score += 25

        return min(score, 100)

    def assign_priority(
        self,
        risk_score
    ):

        if risk_score >= 90:
            return "CRITICAL"

        elif risk_score >= 70:
            return "HIGH"

        elif risk_score >= 40:
            return "MEDIUM"

        return "LOW"

    def prioritize_alerts(
        self,
        alerts
    ):

        prioritized = []

        for alert in alerts:

            risk_score = (
                self.calculate_risk_score(
                    alert
                )
            )

            alert["risk_score"] = (
                risk_score
            )

            alert["priority"] = (
                self.assign_priority(
                    risk_score
                )
            )

            prioritized.append(alert)

        return prioritized
