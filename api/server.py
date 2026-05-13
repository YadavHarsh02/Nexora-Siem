from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import ElasticsearchConnector

# HUNT API
from api.hunt_api import router as hunt_router

app = FastAPI(title="Mini SIEM API")

db = ElasticsearchConnector()

# =========================
# CORS (FOR FRONTEND)
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# REGISTER ROUTERS
# =========================

app.include_router(hunt_router)

# =========================
# ROOT
# =========================

@app.get("/")
def home():

    return {
        "status": "Mini SIEM API Running"
    }

# =========================
# RECENT ALERTS
# =========================

@app.get("/alerts/recent")
def recent_alerts():

    try:

        response = db.get_recent_alerts()

    except Exception as e:

        return {
            "count": 0,
            "alerts": [],
            "error": f"Elasticsearch unavailable: {str(e)}"
        }

    if not response:

        return {
            "count": 0,
            "alerts": [],
            "error": "No response from Elasticsearch"
        }

    hits = response.get("hits", {}).get("hits", [])

    return {
        "count": len(hits),
        "alerts": [
            h["_source"] for h in hits
        ]
    }

# =========================
# SEARCH BY IP
# =========================

@app.get("/alerts/ip/{ip}")
def alerts_by_ip(ip: str):

    try:

        response = db.search_by_ip(ip)

    except Exception as e:

        return {
            "count": 0,
            "alerts": [],
            "error": str(e)
        }

    if not response:

        return {
            "count": 0,
            "alerts": []
        }

    hits = response.get("hits", {}).get("hits", [])

    return {
        "count": len(hits),
        "alerts": [
            h["_source"] for h in hits
        ]
    }

# =========================
# SEARCH BY USERNAME
# =========================

@app.get("/alerts/user/{username}")
def alerts_by_user(username: str):

    try:

        response = db.search_by_username(username)

    except Exception as e:

        return {
            "count": 0,
            "alerts": [],
            "error": str(e)
        }

    if not response:

        return {
            "count": 0,
            "alerts": []
        }

    hits = response.get("hits", {}).get("hits", [])

    return {
        "count": len(hits),
        "alerts": [
            h["_source"] for h in hits
        ]
    }

# =========================
# SEARCH BY ALERT TYPE
# =========================

@app.get("/alerts/type/{alert_type}")
def alerts_by_type(alert_type: str):

    try:

        response = db.search_by_alert_type(alert_type)

    except Exception as e:

        return {
            "count": 0,
            "alerts": [],
            "error": str(e)
        }

    if not response:

        return {
            "count": 0,
            "alerts": []
        }

    hits = response.get("hits", {}).get("hits", [])

    return {
        "count": len(hits),
        "alerts": [
            h["_source"] for h in hits
        ]
    }

# =========================
# SEARCH BY SEVERITY
# =========================

@app.get("/alerts/severity/{severity}")
def alerts_by_severity(severity: str):

    try:

        response = db.search_by_severity(severity)

    except Exception as e:

        return {
            "count": 0,
            "alerts": [],
            "error": str(e)
        }

    if not response:

        return {
            "count": 0,
            "alerts": []
        }

    hits = response.get("hits", {}).get("hits", [])

    return {
        "count": len(hits),
        "alerts": [
            h["_source"] for h in hits
        ]
    }

# =========================
# HEALTH CHECK
# =========================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "Mini SIEM Backend"
    }
