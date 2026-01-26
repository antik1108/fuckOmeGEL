from typing import Dict, Optional
from fastapi import WebSocket
from ..config.settings import logger

class ConnectionManager:
    def __init__(self):
        # Waiting queue for users looking for a match
        self.waiting_user: Optional[WebSocket] = None
        # Store matches: websocket -> websocket
        self.matches: Dict[WebSocket, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        logger.info("New connection accepted")
        
        if self.waiting_user:
            # Match found!
            partner = self.waiting_user
            self.matches[websocket] = partner
            self.matches[partner] = websocket
            self.waiting_user = None
            
            # Notify both
            await partner.send_json({"type": "system", "message": "Stranger connected!"})
            await websocket.send_json({"type": "system", "message": "Stranger connected!"})
            logger.info("Matched two users")
        else:
            # No one waiting, add to queue
            self.waiting_user = websocket
            await websocket.send_json({"type": "system", "message": "Waiting for a partner..."})

    def disconnect(self, websocket: WebSocket):
        # If user was waiting, remove from queue
        if self.waiting_user == websocket:
            self.waiting_user = None
        
        # If user was matched, notify partner and clear match
        elif websocket in self.matches:
            partner = self.matches[websocket]
            del self.matches[websocket]
            if partner in self.matches:
                del self.matches[partner]
            
            # Notify partner (if they are still open)
            # Typically handled in the handling loop
            pass
        
        logger.info("User disconnected")

# Global instance
manager = ConnectionManager()
