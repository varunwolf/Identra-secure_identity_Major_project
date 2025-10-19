#!/bin/bash

# Identra Identity System Setup Script
# This script will help you set up and run the Identra Identity System

echo "🔐 Identra Identity System Setup"
echo "================================"
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

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            print_status "MongoDB is running"
        else
            print_warning "MongoDB is not running. Starting MongoDB..."
            if command -v brew &> /dev/null; then
                print_info "Starting MongoDB with brew..."
                brew services start mongodb-community
            elif command -v systemctl &> /dev/null; then
                print_info "Starting MongoDB with systemctl (requires sudo)..."
                sudo systemctl start mongod
            else
                print_warning "Please start MongoDB manually"
            fi
        fi
    else
        print_warning "MongoDB is not installed. Please install MongoDB from https://www.mongodb.com/try/download/community"
        print_info "You can install MongoDB with:"
        echo "  - macOS: brew install mongodb-community"
        echo "  - Ubuntu/Debian: sudo apt-get install mongodb"
        echo "  - CentOS/RHEL: sudo yum install mongodb-server"
    fi
}

# Setup backend
setup_backend() {
    print_info "Setting up backend..."
    cd backend
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file for backend..."
        cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/identra

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-$(date +%s)

# Server
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here-$(date +%s)

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Biometric Auth
BIOMETRIC_ENABLED=true
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=Identra Identity System

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=http://localhost:5173
EOF
        print_status "Created .env file with default configuration"
    else
        print_status ".env file already exists"
    fi
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    cd frontend
    
    # Install dependencies
    print_info "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file for frontend..."
        cat > .env << EOF
VITE_API_BASE=http://localhost:5000/api
VITE_APP_NAME=Identra Identity System
VITE_APP_VERSION=1.0.0
VITE_WEBSOCKET_URL=ws://localhost:5000
EOF
        print_status "Created .env file for frontend"
    else
        print_status ".env file already exists"
    fi
    
    cd ..
}

# Start the application
start_application() {
    print_info "Starting the application..."
    
    # Start backend in background
    print_info "Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    print_info "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_status "Application started successfully!"
    echo ""
    print_info "🌐 Frontend: http://localhost:5173"
    print_info "🔗 Backend API: http://localhost:5000/api"
    print_info "📊 Health Check: http://localhost:5000/api/health"
    echo ""
    print_warning "Press Ctrl+C to stop the application"
    
    # Wait for user to stop
    wait
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    # Check prerequisites
    check_node
    check_mongodb
    
    echo ""
    print_info "Setting up the application..."
    echo ""
    
    # Setup backend and frontend
    setup_backend
    setup_frontend
    
    echo ""
    print_status "Setup completed successfully!"
    echo ""
    
    # Ask if user wants to start the application
    read -p "Do you want to start the application now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
    else
        print_info "To start the application manually:"
        echo "  Backend: cd backend && npm run dev"
        echo "  Frontend: cd frontend && npm run dev"
    fi
}

# Run main function
main
