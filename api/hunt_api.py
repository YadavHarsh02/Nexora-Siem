from fastapi import APIRouter, Query

from database.db import ElasticsearchConnector
from hunt import ThreatHunter

router = APIRouter()

db = ElasticsearchConnector()

hunter = ThreatHunter()


# =========================
# RAW ELASTIC SEARCH ACCESS
# =========================

@router.get("/hunt/raw")
def raw_search(

    ip: str = None,
    user: str = None,
    severity: str = None

):

    query = {
        "bool": {
            "must": []
        }
    }

    if ip:

        query["bool"]["must"].append({
            "match": {
                "source_ip": ip
            }
        })

    if user:

        query["bool"]["must"].append({
            "match": {
                "username": user
            }
        })

    if severity:

        query["bool"]["must"].append({
            "match": {
                "severity": severity
            }
        })

    response = db.search_alerts(query)

    if not response:

        return {
            "error": "Elasticsearch unavailable"
        }

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "results": [
            h["_source"]
            for h in hits
        ]
    }


# =========================
# SMART THREAT HUNT ENGINE
# =========================

@router.get("/hunt/query")
def hunt_query(q: str = Query(...)):

    result = hunter.hunt_query(q)

    if not result:

        return {
            "query": q,
            "count": 0,
            "results": [],
            "message": "No results found"
        }

    hits = result.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "query": q,
        "count": len(hits),
        "results": [
            h["_source"]
            for h in hits
        ]
    }


# =========================
# PRESET SOC HUNTS
# =========================

@router.get("/hunt/bruteforce")
def bruteforce():

    response = db.search_by_alert_type(
        "brute_force_attack"
    )

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "results": [
            h["_source"]
            for h in hits
        ]
    }


@router.get("/hunt/sudo")
def sudo_activity():

    response = db.search_by_alert_type(
        "sudo_activity"
    )

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "results": [
            h["_source"]
            for h in hits
        ]
    }


@router.get("/hunt/invalid")
def invalid_users():

    response = db.search_by_alert_type(
        "invalid_user_attempt"
    )

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "results": [
            h["_source"]
            for h in hits
        ]
    }
