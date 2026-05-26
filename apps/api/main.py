from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.routes import alerts, correlation, dashboard, health, hunt, websocket
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
app.include_router(alerts.router)
app.include_router(hunt.router)
app.include_router(correlation.router)
app.include_router(dashboard.router)
app.include_router(websocket.router)
