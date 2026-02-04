from typing import Dict, Optional, Set
from fastapi import WebSocket
from ..config.settings import logger
import json

class ConnectionManager:
    def __init__(self):
        # Waiting queue for users looking for a match
        self.waiting_user: Optional[WebSocket] = None
        # Store matches: websocket -> websocket
        self.matches: Dict[WebSocket, WebSocket] = {}
        # All active connections
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"New connection accepted. Total connections: {len(self.active_connections)}")
        
        if self.waiting_user and self.waiting_user in self.active_connections:
            # Match found!
            partner = self.waiting_user
            self.matches[websocket] = partner
            self.matches[partner] = websocket
            self.waiting_user = None
            
            # Notify both parties that they're connected
            await partner.send_json({
                "type": "system", 
                "message": "Stranger connected!",
                "event": "partner_connected"
            })
            await websocket.send_json({
                "type": "system", 
                "message": "Stranger connected!",
                "event": "partner_connected",
                "initiator": True  # This user should initiate the WebRTC connection
            })
            logger.info("Matched two users")
        else:
            # No one waiting, add to queue
            self.waiting_user = websocket
            await websocket.send_json({
                "type": "system", 
                "message": "Waiting for a partner...",
                "event": "waiting"
            })

    async def handle_message(self, websocket: WebSocket, data: str):
        """Handle incoming messages and route them appropriately"""
        try:
            message = json.loads(data)
            msg_type = message.get("type", "chat")
            
            # WebRTC signaling messages - forward to partner
            if msg_type in ["offer", "answer", "ice-candidate"]:
                if websocket in self.matches:
                    partner = self.matches[websocket]
                    try:
                        await partner.send_json(message)
                    except Exception as e:
                        logger.error(f"Failed to forward WebRTC signal: {e}")
                return
            
            # Regular chat message
            if websocket in self.matches:
                partner = self.matches[websocket]
                try:
                    await partner.send_json({
                        "type": "chat", 
                        "message": message.get("message", data) if isinstance(message, dict) else data
                    })
                except Exception:
                    self.disconnect(partner)
                    await websocket.send_json({
                        "type": "system", 
                        "message": "Stranger disconnected.",
                        "event": "partner_disconnected"
                    })
            else:
                await websocket.send_json({
                    "type": "system", 
                    "message": "No partner yet. Please wait."
                })
                
        except json.JSONDecodeError:
            # Plain text message (backwards compatibility)
            if websocket in self.matches:
                partner = self.matches[websocket]
                try:
                    await partner.send_json({"type": "chat", "message": data})
                except Exception:
                    self.disconnect(partner)
                    await websocket.send_json({
                        "type": "system", 
                        "message": "Stranger disconnected.",
                        "event": "partner_disconnected"
                    })

    def disconnect(self, websocket: WebSocket):
        # Remove from active connections
        self.active_connections.discard(websocket)
        
        # If user was waiting, remove from queue
        if self.waiting_user == websocket:
            self.waiting_user = None
        
        # If user was matched, clean up match
        if websocket in self.matches:
            partner = self.matches.pop(websocket, None)
            if partner:
                self.matches.pop(partner, None)
        
        logger.info(f"User disconnected. Total connections: {len(self.active_connections)}")

    async def notify_partner_disconnect(self, websocket: WebSocket):
        """Notify partner that user has disconnected"""
        partner = self.matches.get(websocket)
        if partner:
            try:
                await partner.send_json({
                    "type": "system", 
                    "message": "Stranger disconnected. Click 'New' to find someone else.",
                    "event": "partner_disconnected"
                })
            except:
                pass

# Global instance
manager = ConnectionManager()
