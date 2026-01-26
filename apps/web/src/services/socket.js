// Socket service to handle WebSocket connections

class SocketService {
  constructor() {
    this.socket = null;
    this.username = null;
  }

  connect(username, onOpen, onMessage, onClose, onError) {
    if (this.socket) {
      this.socket.close();
    }

    this.username = username;
    // In production, this URL should be configurable
    const wsUrl = `ws://localhost:8000/ws/${username}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = onOpen;
    this.socket.onmessage = onMessage;
    this.socket.onclose = onClose;
    this.socket.onerror = onError;

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      return true;
    }
    return false;
  }
}

export const socketService = new SocketService();
