from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.matchmaking import manager

router = APIRouter()

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.handle_message(websocket, data)
                
    except WebSocketDisconnect:
        # Notify partner before cleanup
        await manager.notify_partner_disconnect(websocket)
        manager.disconnect(websocket)
