import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .sockets import chat_socket
from .routes import health
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def create_app() -> FastAPI:
    app = FastAPI(title="Omegle Clone Backend")
    
    # Get CORS origins from environment variable
    cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(health.router)
    app.include_router(chat_socket.router)
    
    return app

app = create_app()
