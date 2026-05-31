from collections import Counter


class SIEMMetrics:

    def __init__(self, data):

        self.alerts = data.get("alerts", [])
        self.ml = data.get("ml_analysis", {})
        self.incidents = data.get("attack_chains", [])  # optional safety

    # =========================
    # BASIC STATS
    # =========================

    def total_alerts(self):
        return len(self.alerts)

    def severity_breakdown(self):

        counter = Counter()

        for a in self.alerts:
            counter[a.get("severity", "LOW")] += 1

        return dict(counter)

    def attack_type_breakdown(self):

        counter = Counter()

        for a in self.alerts:
            counter[a.get("alert_type", "unknown")] += 1

        return dict(counter)

    # =========================
    # RISK METRICS
    # =========================

    def high_risk_ratio(self):

        if not self.alerts:
            return 0

        high = sum(1 for a in self.alerts if a.get("severity") == "HIGH")

        return round(high / len(self.alerts) * 100, 2)

    def medium_risk_ratio(self):

        if not self.alerts:
            return 0

        med = sum(1 for a in self.alerts if a.get("severity") == "MEDIUM")

        return round(med / len(self.alerts) * 100, 2)

    # =========================
    # ML METRICS
    # =========================

    def ml_confidence(self):
        return self.ml.get("confidence", 0)

    def ml_prediction(self):
        return self.ml.get("prediction", "unknown")

    # =========================
    # SOC HEALTH SCORE (FIXED LOGIC)
    # =========================

    def soc_health_score(self):

        score = 100

        # 🔴 High severity alerts = major penalty
        score -= self.high_risk_ratio() * 0.8

        # 🟠 Medium severity alerts
        score -= self.medium_risk_ratio() * 0.4

        # 🔴 Attack chains (VERY important in SOC context)
        score -= len(self.incidents) * 15

        # 🔵 ML adjustment (soft signal, not dominant)
        ml_conf = self.ml_confidence()

        if ml_conf > 70:
            score -= 10
        elif ml_conf > 40:
            score -= 5

        # 🔴 malicious prediction penalty
        if str(self.ml_prediction()).lower() == "malicious":
            score -= 20

        # 🔴 overload penalty
        if self.total_alerts() > 10:
            score -= 10

        return max(0, round(score, 2))
