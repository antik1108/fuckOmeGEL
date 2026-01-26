from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .sockets import chat_socket
from .routes import health

def create_app() -> FastAPI:
    app = FastAPI(title="Omegle Clone Backend")
    
    # Configure CORS - Allow all for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health.router)
    app.include_router(chat_socket.router)
    
    return app

app = create_app()
