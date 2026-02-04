# 🎭 FuckOmegel

```
███████╗██╗   ██╗ ██████╗██╗  ██╗ ██████╗ ███╗   ███╗███████╗ ██████╗ ███████╗██╗     
██╔════╝██║   ██║██╔════╝██║ ██╔╝██╔═══██╗████╗ ████║██╔════╝██╔════╝ ██╔════╝██║     
█████╗  ██║   ██║██║     █████╔╝ ██║   ██║██╔████╔██║█████╗  ██║  ███╗█████╗  ██║     
██╔══╝  ██║   ██║██║     ██╔═██╗ ██║   ██║██║╚██╔╝██║██╔══╝  ██║   ██║██╔══╝  ██║     
██║     ╚██████╔╝╚██████╗██║  ██╗╚██████╔╝██║ ╚═╝ ██║███████╗╚██████╔╝███████╗███████╗
╚═╝      ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝
```

A **cyberpunk-themed random video chat** application — like Omegle, but with a noir terminal aesthetic. Connect with strangers, chat in real-time, and experience video calls with a retro-futuristic vibe.

> Built with React, FastAPI, WebSocket, and WebRTC — featuring black & white video filters, glitch effects, and a cyber-terminal UI.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎥 **Real-time Video Chat** | Peer-to-peer video calls using WebRTC |
| 💬 **Instant Messaging** | WebSocket-powered low-latency chat |
| 🎨 **Cyber Terminal UI** | Noir aesthetic with scanlines, glitch effects |
| 🖤 **Black & White Filter** | Both video feeds rendered in grayscale |
| 🎤 **Media Controls** | Toggle mic/camera like Google Meet |
| 📱 **Responsive Design** | Works on mobile, tablet, and desktop |
| 🔔 **Disconnect Notifications** | Know when your partner leaves |
| 🔄 **Quick Match** | Find new strangers instantly |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                           USERS                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    FRONTEND     │  │    BACKEND      │  │    WebRTC       │
│   (React/Vite)  │  │   (FastAPI)     │  │  (Peer-to-Peer) │
│                 │  │                 │  │                 │
│  Tailwind CSS   │◄─│  WebSocket      │  │  STUN Servers   │
│  Video Feeds    │  │  Matchmaking    │──│  ICE Candidates │
│  Chat Terminal  │  │  Signaling      │  │  SDP Exchange   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
    Port 5173           Port 8000          Google STUN
```

**Connection Flow:**
1. User connects via WebSocket to backend
2. Backend matches two users waiting in queue
3. WebRTC signaling (offer/answer/ICE) exchanged through backend
4. Direct peer-to-peer video connection established
5. Chat messages continue through WebSocket

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, Vite 7 | UI Framework, Build Tool |
| **Styling** | Tailwind CSS, Custom CSS | Cyber-terminal theme |
| **Backend** | FastAPI, Python 3.11+ | WebSocket server, API |
| **Real-time** | WebSocket, WebRTC | Chat & Video streaming |
| **Video** | getUserMedia, RTCPeerConnection | Camera/Mic access |
| **Icons** | Material Symbols | UI iconography |
| **Fonts** | JetBrains Mono | Monospace terminal look |

---

## 📁 Project Structure

```
FuckOmegel/
├── apps/
│   ├── web/                    # Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── app/            # Main App component
│   │   │   ├── components/     # UI Components
│   │   │   │   ├── VideoFeeds.jsx    # Video with B&W filter
│   │   │   │   ├── ChatTerminal.jsx  # Chat interface
│   │   │   │   └── layout/           # Header, Footer
│   │   │   ├── features/
│   │   │   │   └── chat/
│   │   │   │       └── hooks/
│   │   │   │           └── useChat.js  # Chat logic hook
│   │   │   └── services/
│   │   │       └── socket.js   # WebSocket + WebRTC
│   │   ├── index.html          # Tailwind config, styles
│   │   └── package.json
│   │
│   └── backend/                # Backend (FastAPI)
│       ├── src/
│       │   ├── server.py       # FastAPI app entry
│       │   ├── config/         # Settings, logging
│       │   ├── routes/         # HTTP routes
│       │   ├── services/
│       │   │   └── matchmaking.py  # User matching logic
│       │   └── sockets/
│       │       └── chat_socket.py  # WebSocket handlers
│       └── requirements.txt
│
├── start.sh                    # One-command startup script
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git**

### One-Command Start (Recommended)

```bash
# Clone the repository
git clone https://github.com/antik1108/fuckOmeGEL.git
cd fuckOmeGEL

# Make start script executable and run
chmod +x start.sh
./start.sh
```

This will:
1. ✅ Kill any existing processes on ports 8000/5173
2. ✅ Create Python virtual environment
3. ✅ Install Python dependencies
4. ✅ Install npm dependencies (if needed)
5. ✅ Start backend server
6. ✅ Start frontend dev server

### Manual Start

**Terminal 1 - Backend:**
```bash
cd apps/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

### Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| Health Check | http://localhost:8000/health |

---

## 🎮 How to Use

1. **Open the app** in your browser at `http://localhost:5173`
2. **Allow camera/microphone** access when prompted
3. **Wait for a match** — you'll see "Searching..." until someone connects
4. **Start chatting!** — Type messages and hit Enter to send
5. **Use media controls:**
   - 🎤 Click mic button to mute/unmute
   - 📹 Click video button to toggle camera
6. **Switch modes:**
   - **Long-press (800ms)** the "New" button to toggle text-only mode
7. **Find new partner:** Click "New" to disconnect and find someone else

---

## 🎨 UI Features

### Cyber Terminal Theme
- **Scanline effect** — Retro CRT monitor feel
- **Glitch borders** — Animated neon glow
- **Noise overlay** — Subtle grain texture
- **JetBrains Mono** — Monospace terminal font
- **Purple accent** — Primary color `#8B5CF6`

### Black & White Video
Both your video and the stranger's video are rendered in grayscale with contrast enhancement for that noir look:
```css
/* Your video */
grayscale brightness-75 contrast-125

/* Stranger's video */
grayscale brightness-90 contrast-110
```

### Responsive Breakpoints
- **Mobile**: `< 640px` — Stacked layout, smaller controls
- **Tablet**: `640px - 1024px` — Adjusted spacing
- **Desktop**: `> 1024px` — Side-by-side video + chat

---

## 🔧 Configuration

### Start Script Options

```bash
./start.sh              # Start both frontend and backend
./start.sh --debug      # Show debug info (Python/Node versions)
./start.sh --skip-frontend   # Only start backend
./start.sh --skip-backend    # Only start frontend
./start.sh --help       # Show usage
```

### Environment Variables

**Backend** (`apps/backend/.env`):
```env
# Optional - defaults shown
HOST=0.0.0.0
PORT=8000
DEBUG=true
```

**Frontend** (`apps/web/.env`):
```env
# WebSocket URL - change for production
VITE_WS_URL=ws://localhost:8000
```

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Core chat functionality | ✅ Complete |
| 2 | WebRTC video chat | ✅ Complete |
| 3 | Cyber terminal UI | ✅ Complete |
| 4 | Media controls (mic/video) | ✅ Complete |
| 5 | Disconnect notifications | ✅ Complete |
| 6 | B&W video filter | ✅ Complete |
| 7 | Responsive design | ✅ Complete |
| 8 | TURN server support | 🔜 Planned |
| 9 | Interest-based matching | 🔜 Planned |
| 10 | User reports/moderation | 📋 Future |
| 11 | Production deployment | 📋 Future |

---

## 🐛 Known Issues

- **Same network only**: Without TURN servers, video may not work across different networks/firewalls
- **Browser support**: Best experience on Chrome/Edge; Safari may have WebRTC limitations

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 🧑‍💻 Author

**Antik Mondal** — [@antik1108](https://github.com/antik1108)

Building cool stuff, one project at a time.

---

## 📄 License

MIT License — Use it, learn from it, make it better.

---

<div align="center">

**Built with 💜 and late-night coding sessions**

```
> STRANGER_CONNECTED
> echo "Start chatting..." && ./connect.sh
```

</div>
