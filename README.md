# Omegal - Random Chat

A modern, Omegle-style random chat application built with a separate React frontend and FastAPI backend.

> [!NOTE] 
> 🚧 **Under Construction**: We are currently redesigning the application to be more polished and industry-standard. Stay tuned for exciting new features including video chat, advanced matching, and more!

## 📂 Project Structure

Verified production-grade monorepo structure:

```text
omegal/
├── apps/
│   ├── web/                     # React Frontend
│   │   ├── src/
│   │   │   ├── app/             # App Entry
│   │   │   ├── services/        # API/Socket Services
│   │   │   ├── features/        # Feature Modules
│   │   │   └── components/      # Shared Components
│   └── backend/                 # FastAPI Backend
│       ├── src/
│       │   ├── services/        # Business Logic
│       │   ├── sockets/         # WebSocket Handlers
│       │   └── routes/          # HTTP Routes
```

## 🚀 Getting Started

### 1. Start the Backend

Open a terminal and run:

```bash
cd apps/backend
# Create/Activate Virtual Environment (Optional but recommended)
# python -m venv venv && source venv/bin/activate

pip install -r requirements.txt
python src/main.py
```
The server will start at `http://localhost:8000`.

### 2. Start the Frontend

Open a new terminal and run:

```bash
cd apps/web
npm install
npm run dev
```
The app will open at `http://localhost:5173`.

## ✨ Features

- **Real-time Chat**: Instant messaging with random strangers.
- **WebSocket Powered**: Low latency connection.
- **Modern UI**: Clean, responsive interface built with React and CSS Modules.
- **Scalable Architecture**: Monorepo setup designed for growth.

## 🔜 Coming Soon

- Video Chat capabilities
- Interest-based matching
- Advanced moderation tools
- User accounts and profiles
