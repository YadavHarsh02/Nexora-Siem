from fastapi import APIRouter

from database.db import ElasticsearchConnector

router = APIRouter()

db = ElasticsearchConnector()


# =========================
# DASHBOARD STATS
# =========================
@router.get("/dashboard/stats")
def dashboard_stats():

    response = db.get_recent_alerts()

    if not response:
        return {
            "total_alerts": 0,
            "high_severity": 0,
            "medium_severity": 0,
            "low_severity": 0
        }

    hits = response.get("hits", {}).get("hits", [])

    alerts = [h["_source"] for h in hits]

    high = len([
        a for a in alerts
        if a.get("severity") == "HIGH"
    ])

    medium = len([
        a for a in alerts
        if a.get("severity") == "MEDIUM"
    ])

    low = len([
        a for a in alerts
        if a.get("severity") == "LOW"
    ])

    return {
        "total_alerts": len(alerts),
        "high_severity": high,
        "medium_severity": medium,
        "low_severity": low
    }


# =========================
# RECENT ALERTS
# =========================
@router.get("/dashboard/recent")
def dashboard_recent():

    response = db.get_recent_alerts()

    if not response:
        return []

    hits = response.get("hits", {}).get("hits", [])

    return [
        h["_source"]
        for h in hits
    ]


# =========================
# TOP ATTACKER IPS
# =========================
@router.get("/dashboard/top-ips")
def top_ips():

    response = db.get_recent_alerts()

    if not response:
        return {}

    hits = response.get("hits", {}).get("hits", [])

    alerts = [
        h["_source"]
        for h in hits
    ]

    ip_count = {}

    for alert in alerts:

        ip = alert.get(
            "source_ip",
            "unknown"
        )

        ip_count[ip] = (
            ip_count.get(ip, 0) + 1
        )

    return ip_count
