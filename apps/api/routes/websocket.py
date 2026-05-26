from fastapi import APIRouter, WebSocket

router = APIRouter(tags=["websocket"])

active_connections: list[WebSocket] = []


@router.websocket("/ws/live-alerts")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

    print("[INFO] WebSocket client connected")

    try:
        while True:
            await websocket.receive_text()
    except Exception:
        print("[INFO] WebSocket disconnected")
        if websocket in active_connections:
            active_connections.remove(websocket)


async def broadcast_alert(alert_data: dict):
    disconnected = []

    for connection in active_connections:
        try:
            await connection.send_json(alert_data)
        except Exception:
            disconnected.append(connection)

    for dead in disconnected:
        if dead in active_connections:
            active_connections.remove(dead)
