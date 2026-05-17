from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket
from database.db import ElasticsearchConnector

# =========================
# API ROUTERS
# =========================

from api.hunt_api import router as hunt_router
from api.correlation_api import router as correlation_router

app = FastAPI(title="Mini SIEM API")

db = ElasticsearchConnector()

# =========================
# CORS
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
app.include_router(correlation_router)

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

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "alerts": [
            h["_source"]
            for h in hits
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

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "alerts": [
            h["_source"]
            for h in hits
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

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "alerts": [
            h["_source"]
            for h in hits
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

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "alerts": [
            h["_source"]
            for h in hits
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

    hits = response.get(
        "hits",
        {}
    ).get(
        "hits",
        []
    )

    return {
        "count": len(hits),
        "alerts": [
            h["_source"]
            for h in hits
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

# =========================
# WEBSOCKET CONNECTIONS
# =========================

active_connections = []


# =========================
# WEBSOCKET ENDPOINT
# =========================

@app.websocket("/ws/live-alerts")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    active_connections.append(websocket)

    print("[INFO] WebSocket client connected")

    try:

        while True:

            # keep socket alive
            await websocket.receive_text()

    except Exception:

        print("[INFO] WebSocket disconnected")

        active_connections.remove(websocket)


# =========================
# BROADCAST ALERTS
# =========================

async def broadcast_alert(alert_data):

    disconnected = []

    for connection in active_connections:

        try:

            await connection.send_json(alert_data)

        except Exception:

            disconnected.append(connection)

    for dead in disconnected:

        active_connections.remove(dead)
