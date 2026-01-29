#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on exit
cleanup() {
    echo -e "\n${RED}🛑 Stopping servers...${NC}"
    # Kill all background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}🚀 Starting OmeGAL...${NC}"

# ==========================================
# BACKEND SETUP & START
# ==========================================
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

# Ensure pip/setuptools/wheel are up-to-date, then install requirements
"$VENV_PYTHON" -m pip install --upgrade pip setuptools wheel || { echo -e "${RED}Failed to upgrade pip in venv${NC}"; exit 1; }
"$VENV_PYTHON" -m pip install -r requirements.txt || { echo -e "${RED}Failed to install backend dependencies${NC}"; exit 1; }

# 3. Start Server using the venv python module to ensure correct interpreter
echo "Starting Uvicorn..."
"$VENV_PYTHON" -m uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ../..

# ==========================================
# FRONTEND SETUP & START
# ==========================================
echo -e "${BLUE}⚛️ Configuring Frontend...${NC}"
cd apps/web || { echo -e "${RED}Failed to find apps/web${NC}"; exit 1; }

# Check node/npm presence
if ! command -v npm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}node or npm not found. Please install Node.js (brew install node) or use nvm.${NC}"
    exit 1
fi

# 1. Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies (first run may take a while)..."
    npm install || { echo -e "${RED}Failed to install frontend dependencies${NC}"; exit 1; }
else
    echo "node_modules found, skipping npm install (run manually if needed)"
fi

# 2. Start Server
echo "Starting Frontend Dev Server..."
npm run dev &
FRONTEND_PID=$!

# ==========================================
# WAIT
# ==========================================
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "Frontend: http://localhost:5173"
echo -e "Backend:  http://localhost:8000"
echo -e "Press Ctrl+C to stop."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
