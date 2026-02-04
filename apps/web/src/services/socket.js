// Socket service to handle WebSocket connections and WebRTC signaling

class SocketService {
  constructor() {
    this.socket = null;
    this.username = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    
    // STUN servers for NAT traversal (free public servers)
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    };
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
    this.socket.onmessage = (event) => {
      this.handleSignalingMessage(event);
      onMessage(event);
    };
    this.socket.onclose = () => {
      this.closePeerConnection();
      onClose();
    };
    this.socket.onerror = onError;

    return this.socket;
  }

  disconnect() {
    this.closePeerConnection();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Send as JSON for consistency
      this.socket.send(JSON.stringify({ type: 'chat', message }));
      return true;
    }
    return false;
  }

  // WebRTC Methods
  async handleSignalingMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'system':
          // If partner connected and we're the initiator, start the call
          if (data.event === 'partner_connected' && data.initiator) {
            await this.createOffer();
          }
          if (data.event === 'partner_disconnected') {
            this.closePeerConnection();
          }
          break;
          
        case 'offer':
          await this.handleOffer(data);
          break;
          
        case 'answer':
          await this.handleAnswer(data);
          break;
          
        case 'ice-candidate':
          await this.handleIceCandidate(data);
          break;
      }
    } catch {
      // Not JSON or not a signaling message, ignore
    }
  }

  setLocalStream(stream) {
    this.localStream = stream;
  }

  setRemoteStreamCallback(callback) {
    this.onRemoteStream = callback;
  }

  createPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Add local tracks to connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Handle incoming remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track');
      if (this.onRemoteStream && event.streams[0]) {
        this.onRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          candidate: event.candidate
        });
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    return this.peerConnection;
  }

  async createOffer() {
    try {
      this.createPeerConnection();
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.peerConnection.setLocalDescription(offer);
      
      this.sendSignalingMessage({
        type: 'offer',
        sdp: offer
      });
      console.log('Created and sent offer');
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(data) {
    try {
      this.createPeerConnection();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.sendSignalingMessage({
        type: 'answer',
        sdp: answer
      });
      console.log('Handled offer and sent answer');
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(data) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log('Handled answer');
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(data) {
    try {
      if (this.peerConnection && data.candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('Added ICE candidate');
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  sendSignalingMessage(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  closePeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    // Notify that remote stream is gone
    if (this.onRemoteStream) {
      this.onRemoteStream(null);
    }
  }
}

export const socketService = new SocketService();
