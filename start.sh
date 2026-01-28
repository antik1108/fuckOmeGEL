#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    # Kill all background jobs
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

echo "🚀 Starting OmeGAL..."

# Start Backend
echo "🐍 Starting Backend..."
cd apps/backend || exit
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install dependencies if needed (simple check)
if ! pip freeze | grep -q fastapi; then
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
fi

# Run uvicorn in the background
uvicorn src.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ../..

# Start Frontend
echo "⚛️ Starting Frontend..."
cd apps/web || exit
# Run npm in the foreground so we can see its output and Ctrl+C it
npm run dev

# Wait for background processes (this part is reached if npm stops)
wait $BACKEND_PID
