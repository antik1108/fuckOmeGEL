from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.matchmaking import manager

router = APIRouter()

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Check if user has a partner
            if websocket in manager.matches:
                partner = manager.matches[websocket]
                try:
                    await partner.send_json({"type": "chat", "message": data})
                except Exception:
                    # If sending fails, assume partner is gone/broken.
                    manager.disconnect(partner)
                    # Notify the current user
                    await websocket.send_json({"type": "system", "message": "Stranger disconnected."})
            else:
                await websocket.send_json({"type": "system", "message": "No partner yet. Please wait."})
                
    except WebSocketDisconnect:
        # Handle notification logic here before full cleanup
        partner = manager.matches.get(websocket)
        if partner:
            try:
                await partner.send_json({"type": "system", "message": "Stranger disconnected. Click 'New' to find someone else."})
                del manager.matches[partner] 
            except:
                pass
        
        manager.disconnect(websocket)
