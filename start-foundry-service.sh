#!/bin/bash

# Foundry Service Startup Script

echo "🔨 Starting Foundry Service"
echo "=================================================="

# Check if Foundry is installed
if ! command -v cast &> /dev/null; then
    echo "❌ Foundry not found. Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
    echo "✅ Foundry installed successfully"
else
    echo "✅ Foundry is already installed: $(cast --version)"
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Start backend service
echo ""
echo "🚀 Starting backend service..."
cd PoC/src/backend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if check_port 3001; then
    echo "✅ Starting backend on port 3001..."
    npm start &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
else
    echo "❌ Port 3001 is already in use. Please stop the existing service."
    exit 1
fi

# Wait a moment for backend to start
sleep 3

# Start frontend
echo ""
echo "🌐 Starting frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if check_port 3000; then
    echo "✅ Starting frontend on port 3000..."
    npm start &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
else
    echo "❌ Port 3000 is already in use. Please stop the existing service."
    kill $BACKEND_PID
    exit 1
fi

echo ""
echo "🎉 Services started successfully!"
echo "=================================================="
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "🔍 Health:   http://localhost:3001/api/health"
echo "🔨 Cast:     http://localhost:3001/api/cast-check"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for services to run
wait