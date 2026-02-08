from typing import Dict, Optional, Set, List
from fastapi import WebSocket
from ..config.settings import logger
import json
import random

class ConnectionManager:
    def __init__(self):
        # Waiting queue for users looking for a match
        self.waiting_users: List[WebSocket] = []
        # Store matches: websocket -> websocket
        self.matches: Dict[WebSocket, WebSocket] = {}
        # All active connections
        self.active_connections: Set[WebSocket] = set()
        # Track usernames by websocket
        self.user_by_ws: Dict[WebSocket, str] = {}
        # Remember last partner by username to avoid immediate re-match
        self.last_partner_by_user: Dict[str, str] = {}

    async def _safe_send(self, websocket: WebSocket, payload: dict) -> bool:
        try:
            await websocket.send_json(payload)
            return True
        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            return False

    async def _notify_match(self, websocket: WebSocket, partner: WebSocket):
        if not await self._safe_send(partner, {
            "type": "system",
            "message": "Stranger connected!",
            "event": "partner_connected"
        }):
            # Partner is gone, undo match and requeue websocket
            self.matches.pop(websocket, None)
            self.matches.pop(partner, None)
            self.active_connections.discard(partner)
            await self._requeue_or_match(websocket)
            return

        if not await self._safe_send(websocket, {
            "type": "system",
            "message": "Stranger connected!",
            "event": "partner_connected",
            "initiator": True
        }):
            # New websocket is gone, undo match and requeue partner
            self.matches.pop(websocket, None)
            self.matches.pop(partner, None)
            self.active_connections.discard(websocket)
            await self._requeue_or_match(partner)
            return

        logger.info("Matched two users")

    def _clean_waiting_users(self):
        self.waiting_users = [ws for ws in self.waiting_users if ws in self.active_connections]

    def _select_partner(self, websocket: WebSocket) -> Optional[WebSocket]:
        self._clean_waiting_users()
        username = self.user_by_ws.get(websocket)
        last_partner = self.last_partner_by_user.get(username)

        eligible = [
            ws for ws in self.waiting_users
            if ws != websocket and self.user_by_ws.get(ws) != last_partner
        ]

        if not eligible:
            eligible = [ws for ws in self.waiting_users if ws != websocket]

        if not eligible:
            return None

        return random.choice(eligible)

    async def _requeue_or_match(self, websocket: WebSocket):
        partner = self._select_partner(websocket)
        if partner:
            self.waiting_users = [ws for ws in self.waiting_users if ws != partner]
            self.matches[websocket] = partner
            self.matches[partner] = websocket
            await self._notify_match(websocket, partner)
            return

        if websocket not in self.waiting_users:
            self.waiting_users.append(websocket)
        await self._safe_send(websocket, {
            "type": "system",
            "message": "Waiting for a partner...",
            "event": "waiting"
        })

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.add(websocket)
        self.user_by_ws[websocket] = username
        logger.info(f"New connection accepted. Total connections: {len(self.active_connections)}")

        await self._requeue_or_match(websocket)

    async def handle_message(self, websocket: WebSocket, data: str):
        """Handle incoming messages and route them appropriately"""
        try:
            message = json.loads(data)
            msg_type = message.get("type", "chat")
            
            # WebRTC signaling messages - forward to partner
            if msg_type in ["offer", "answer", "ice-candidate"]:
                if websocket in self.matches:
                    partner = self.matches[websocket]
                    if partner in self.active_connections:
                        try:
                            await partner.send_json(message)
                        except Exception as e:
                            logger.error(f"Failed to forward WebRTC signal: {e}")
                            # Partner is disconnected, clean up
                            await self.notify_disconnect_and_cleanup(websocket, partner)
                return
            
            # Regular chat message
            if websocket in self.matches:
                partner = self.matches[websocket]
                if partner in self.active_connections:
                    try:
                        await partner.send_json({
                            "type": "chat", 
                            "message": message.get("message", data) if isinstance(message, dict) else data
                        })
                    except Exception as e:
                        logger.error(f"Failed to send chat message: {e}")
                        # Partner is disconnected, clean up
                        await self.notify_disconnect_and_cleanup(websocket, partner)
            else:
                try:
                    await websocket.send_json({
                        "type": "system", 
                        "message": "No partner yet. Please wait."
                    })
                except Exception:
                    pass
                
        except json.JSONDecodeError:
            # Plain text message (backwards compatibility)
            if websocket in self.matches:
                partner = self.matches[websocket]
                if partner in self.active_connections:
                    try:
                        await partner.send_json({"type": "chat", "message": data})
                    except Exception as e:
                        logger.error(f"Failed to send plain text message: {e}")
                        # Partner is disconnected, clean up
                        await self.notify_disconnect_and_cleanup(websocket, partner)

    async def notify_disconnect_and_cleanup(self, websocket: WebSocket, partner: WebSocket):
        """Helper to notify websocket of partner disconnect and clean up"""
        self._set_last_partners(websocket, partner)
        self.disconnect(partner)
        try:
            await websocket.send_json({
                "type": "system", 
                "message": "Stranger disconnected.",
                "event": "partner_disconnected"
            })
        except Exception:
            pass

    def _set_last_partners(self, websocket: WebSocket, partner: WebSocket):
        user = self.user_by_ws.get(websocket)
        partner_user = self.user_by_ws.get(partner)
        if user and partner_user:
            self.last_partner_by_user[user] = partner_user
            self.last_partner_by_user[partner_user] = user

    def disconnect(self, websocket: WebSocket):
        # Remove from active connections
        self.active_connections.discard(websocket)

        # Remove from waiting queue
        self.waiting_users = [ws for ws in self.waiting_users if ws != websocket]
        
        # If user was matched, clean up match
        if websocket in self.matches:
            partner = self.matches.pop(websocket, None)
            if partner:
                self._set_last_partners(websocket, partner)
                self.matches.pop(partner, None)

        self.user_by_ws.pop(websocket, None)
        
        logger.info(f"User disconnected. Total connections: {len(self.active_connections)}")

    async def notify_partner_disconnect(self, websocket: WebSocket):
        """Notify partner that user has disconnected"""
        partner = self.matches.get(websocket)
        if partner:
            # Remove match and notify partner
            self._set_last_partners(websocket, partner)
            self.matches.pop(websocket, None)
            self.matches.pop(partner, None)
            await self._safe_send(partner, {
                "type": "system",
                "message": "Stranger disconnected. Searching for a new partner...",
                "event": "partner_disconnected"
            })

            if partner in self.active_connections:
                await self._requeue_or_match(partner)

# Global instance
manager = ConnectionManager()
