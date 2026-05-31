from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.routes import (
    alerts,
    connector,
    correlation,
    dashboard,
    health,
    hunt,
    live,
    user,
    websocket,
)
from siem.config import get_settings

settings = get_settings()

app = FastAPI(title="Nexora SIEM API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(connector.router)
app.include_router(live.router)
app.include_router(alerts.router)
app.include_router(hunt.router)
app.include_router(correlation.router)
app.include_router(dashboard.router)
app.include_router(user.router)
app.include_router(websocket.router)
