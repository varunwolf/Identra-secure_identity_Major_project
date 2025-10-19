#!/bin/bash

# Identra Identity System - Run Script
# This script will start both backend and frontend servers

echo "🚀 Starting Identra Identity System"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        print_warning "Port $1 is already in use. Attempting to free it..."
        # Try to kill without sudo first
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # If still in use, try with sudo
        if check_port $1; then
            print_info "Trying with sudo access..."
            sudo lsof -ti:$1 | xargs sudo kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Attempting to start MongoDB..."
    
    # Try to start MongoDB automatically
    if command -v brew &> /dev/null; then
        print_info "Starting MongoDB with brew..."
        brew services start mongodb-community
        sleep 3
    elif command -v systemctl &> /dev/null; then
        print_info "Starting MongoDB with systemctl (requires sudo)..."
        sudo systemctl start mongod
        sleep 3
    fi
    
    # Check again if MongoDB is now running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is still not running. Please start MongoDB manually:"
        echo "  - macOS: brew services start mongodb-community"
        echo "  - Linux: sudo systemctl start mongod"
        echo "  - Windows: net start MongoDB"
        echo ""
        read -p "Do you want to continue anyway? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_status "MongoDB started successfully"
    fi
else
    print_status "MongoDB is running"
fi

# Kill any existing processes on our ports
kill_port 5000
kill_port 5173

# Check if dependencies are installed
print_info "Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd frontend
    npm install
    cd ..
fi

print_status "Dependencies are ready"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    print_info "Creating backend .env file..."
    cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/identra
JWT_SECRET=your-super-secret-jwt-key-$(date +%s)
PORT=5000
NODE_ENV=development
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
EOF
fi

if [ ! -f "frontend/.env" ]; then
    print_info "Creating frontend .env file..."
    cat > frontend/.env << EOF
VITE_API_BASE=http://localhost:5000/api
VITE_APP_NAME=Identra Identity System
VITE_APP_VERSION=1.0.0
VITE_WEBSOCKET_URL=ws://localhost:5000
EOF
fi

# Function to start backend
start_backend() {
    print_info "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Check if backend is running
    if check_port 5000; then
        print_status "Backend server started successfully on port 5000"
    else
        print_error "Failed to start backend server"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_info "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    # Check if frontend is running
    if check_port 5173; then
        print_status "Frontend server started successfully on port 5173"
    else
        print_error "Failed to start frontend server"
        exit 1
    fi
}

# Start the servers
start_backend
start_frontend

echo ""
print_status "🎉 Identra Identity System is now running!"
echo ""
print_info "🌐 Frontend: http://localhost:5173"
print_info "🔗 Backend API: http://localhost:5000/api"
print_info "📊 Health Check: http://localhost:5000/api/health"
echo ""
print_info "📱 Features available:"
echo "  • User registration and authentication"
echo "  • Document upload and management"
echo "  • Digital ID generation"
echo "  • Admin dashboard"
echo "  • Real-time notifications"
echo "  • Secure file encryption"
echo ""
print_warning "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_info "Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    print_status "Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
