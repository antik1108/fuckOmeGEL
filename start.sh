#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on exit
cleanup() {
    echo -e "\n${RED}🛑 Stopping servers...${NC}"
    # Kill only the processes we started
    if [ -n "${WAIT_PIDS:-}" ]; then
        kill $WAIT_PIDS 2>/dev/null
    fi
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

# ------------------
# Parse CLI flags
# ------------------
DEBUG=0
SKIP_FRONTEND=0
SKIP_BACKEND=0

while [ "$#" -gt 0 ]; do
    case "$1" in
        --debug)
            DEBUG=1
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=1
            shift
            ;;
        --skip-backend)
            SKIP_BACKEND=1
            shift
            ;;
        -h|--help)
            echo "Usage: ./start.sh [--debug] [--skip-frontend] [--skip-backend]"
            echo
            echo "  --debug           Print resolved binary paths and versions for debugging"
            echo "  --skip-frontend   Don't start the frontend dev server"
            echo "  --skip-backend    Don't start the backend server"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            exit 1
            ;;
    esac
done

if [ "$SKIP_FRONTEND" -eq 1 ] && [ "$SKIP_BACKEND" -eq 1 ]; then
    echo -e "${RED}Both frontend and backend are skipped. Nothing to do.${NC}"
    exit 1
fi

if [ "$DEBUG" -eq 1 ]; then
    echo -e "${BLUE}🔍 Debug info (system before venv):${NC}"
    command -v python3 >/dev/null 2>&1 && { echo "which python3: $(command -v python3)"; python3 --version 2>&1; } || echo "python3: not found"
    command -v node >/dev/null 2>&1 && { echo "which node: $(command -v node)"; node --version 2>&1; } || echo "node: not found"
    command -v npm >/dev/null 2>&1 && { echo "which npm: $(command -v npm)"; npm --version 2>&1; } || echo "npm: not found"
    command -v uvicorn >/dev/null 2>&1 && echo "which uvicorn: $(command -v uvicorn)" || echo "uvicorn: not found in PATH"
    echo
fi

echo -e "${GREEN}🚀 Starting FuckOmeGAL...${NC}"

# Kill any existing processes on our ports
echo -e "${BLUE}🔄 Checking for existing processes on ports 8000 and 5173...${NC}"
kill_port() {
    local port="$1"
    local pids
    pids=$(lsof -ti:"$port" 2>/dev/null)
    if [ -n "$pids" ]; then
        kill -9 $pids 2>/dev/null && echo "Killed existing process on port $port"
    fi
}

kill_port 8000
kill_port 5173

WAIT_PIDS=""

# ==========================================
# BACKEND SETUP & START
# ==========================================
if [ "$SKIP_BACKEND" -ne 1 ]; then
    echo -e "${BLUE}🐍 Configuring Backend...${NC}"
    cd apps/backend || { echo -e "${RED}Failed to find apps/backend${NC}"; exit 1; }

    # Ensure python3 exists
    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}python3 not found. Please install Python 3 (brew install python) or use pyenv.${NC}"
        exit 1
    fi

    # 1. Create/Check venv
    VENV_DIR="$(pwd)/venv"
    if [ ! -d "$VENV_DIR" ]; then
        echo "Creating virtual environment..."
        python3 -m venv "$VENV_DIR" || { echo -e "${RED}Failed to create venv${NC}"; exit 1; }
    fi

    # Activate venv (so npm/spawned processes inherit PATH if needed)
    if [ -f "$VENV_DIR/bin/activate" ]; then
        # shellcheck disable=SC1090
        source "$VENV_DIR/bin/activate"
    else
        echo -e "${RED}venv activate script not found${NC}"
        exit 1
    fi

    # 2. Install dependencies (use venv's python to avoid relying on a pip shim)
    echo "Checking python dependencies..."
    VENV_PYTHON="$VENV_DIR/bin/python"
    if [ ! -x "$VENV_PYTHON" ]; then
        echo -e "${RED}Python in venv not found or not executable${NC}"
        exit 1
    fi

    echo "Using Python: $($VENV_PYTHON --version 2>&1)"

    # If debug requested, show venv-specific binaries
    if [ "$DEBUG" -eq 1 ]; then
        echo -e "${BLUE}🔍 Debug info (venv):${NC}"
        echo "venv python: $VENV_PYTHON"
        command -v uvicorn >/dev/null 2>&1 && echo "uvicorn in PATH: $(command -v uvicorn)" || echo "uvicorn not in PATH (will use python -m uvicorn)"
        echo
    fi

    # Ensure pip/setuptools/wheel are up-to-date, then install requirements
    "$VENV_PYTHON" -m pip install --upgrade pip setuptools wheel || { echo -e "${RED}Failed to upgrade pip in venv${NC}"; exit 1; }
    "$VENV_PYTHON" -m pip install -r requirements.txt || { echo -e "${RED}Failed to install backend dependencies${NC}"; exit 1; }

    # 3. Start Server using the venv python module to ensure correct interpreter
    echo "Starting Uvicorn..."
    PYTHONPATH="$(pwd)" "$VENV_PYTHON" -m uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    WAIT_PIDS="$BACKEND_PID"
    cd ../..
else
    echo -e "${BLUE}🐍 Skipping Backend start (flag set)${NC}"
fi

# ==========================================
# FRONTEND SETUP & START
# ==========================================
if [ "$SKIP_FRONTEND" -ne 1 ]; then
    echo -e "${BLUE}⚛️ Configuring Frontend...${NC}"
    cd apps/web || { echo -e "${RED}Failed to find apps/web${NC}"; exit 1; }

    # Check node/npm presence
    if ! command -v npm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}node or npm not found. Please install Node.js (brew install node) or use nvm.${NC}"
        exit 1
    fi

    # 1. Install dependencies if node_modules missing or package.json changed
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install || { echo -e "${RED}Failed to install frontend dependencies${NC}"; exit 1; }
    else
        echo "node_modules up to date, skipping npm install"
    fi

    # 2. Start Server
    echo "Starting Frontend Dev Server..."
    npm run dev &
    FRONTEND_PID=$!
    if [ -n "$FRONTEND_PID" ]; then
        if [ -n "$WAIT_PIDS" ]; then
            WAIT_PIDS="$WAIT_PIDS $FRONTEND_PID"
        else
            WAIT_PIDS="$FRONTEND_PID"
        fi
    fi
else
    echo -e "${BLUE}⚛️ Skipping Frontend start (flag set)${NC}"
fi

# ==========================================
# WAIT
# ==========================================
echo -e "${GREEN}✅ Servers status:${NC}"
if [ "$SKIP_FRONTEND" -ne 1 ]; then
    echo -e "Frontend: http://localhost:5173"
fi
if [ "$SKIP_BACKEND" -ne 1 ]; then
    echo -e "Backend:  http://localhost:8000"
fi
echo -e "Press Ctrl+C to stop."

# Wait for started processes only
if [ -n "$WAIT_PIDS" ]; then
    wait $WAIT_PIDS
else
    echo -e "${RED}No processes were started.${NC}"
fi
