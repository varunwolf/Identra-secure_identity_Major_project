#!/bin/bash

# Identra Identity System - Enhanced Setup Script with Sudo Support
# This script will help you set up and run the Identra Identity System with proper sudo access

echo "🔐 Identra Identity System - Enhanced Setup"
echo "============================================="
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

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is not recommended for development."
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to check sudo access
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        print_info "This script requires sudo access for some operations."
        print_info "You may be prompted for your password."
        echo ""
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_status "Sudo access confirmed"
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18+
        NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version $NODE_VERSION is installed, but version 18+ is recommended."
            read -p "Do you want to continue anyway? (y/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Please install Node.js 18+ from https://nodejs.org/"
                exit 1
            fi
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        print_info "Installation options:"
        echo "  - Official installer: https://nodejs.org/"
        echo "  - macOS with Homebrew: brew install node"
        echo "  - Ubuntu/Debian: sudo apt-get install nodejs npm"
        echo "  - CentOS/RHEL: sudo yum install nodejs npm"
        exit 1
    fi
}

# Check and start MongoDB
check_mongodb() {
    if command -v mongod &> /dev/null; then
        if pgrep -x "mongod" > /dev/null; then
            print_status "MongoDB is running"
        else
            print_warning "MongoDB is not running. Attempting to start..."
            
            # Try different methods to start MongoDB
            if command -v brew &> /dev/null; then
                print_info "Starting MongoDB with brew..."
                brew services start mongodb-community
                sleep 3
            elif command -v systemctl &> /dev/null; then
                print_info "Starting MongoDB with systemctl (requires sudo)..."
                sudo systemctl start mongod
                sleep 3
            elif command -v service &> /dev/null; then
                print_info "Starting MongoDB with service (requires sudo)..."
                sudo service mongod start
                sleep 3
            else
                print_warning "Could not start MongoDB automatically."
                print_info "Please start MongoDB manually:"
                echo "  - macOS: brew services start mongodb-community"
                echo "  - Linux: sudo systemctl start mongod"
                echo "  - Or run: mongod --dbpath /data/db"
            fi
            
            # Check if MongoDB started successfully
            if pgrep -x "mongod" > /dev/null; then
                print_status "MongoDB started successfully"
            else
                print_warning "MongoDB is still not running. The application may not work properly."
                read -p "Do you want to continue anyway? (y/n): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    exit 1
                fi
            fi
        fi
    else
        print_warning "MongoDB is not installed."
        print_info "Installation options:"
        echo "  - macOS: brew install mongodb-community"
        echo "  - Ubuntu/Debian: sudo apt-get install mongodb"
        echo "  - CentOS/RHEL: sudo yum install mongodb-server"
        echo "  - Official installer: https://www.mongodb.com/try/download/community"
        echo ""
        read -p "Do you want to continue without MongoDB? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Setup backend with enhanced error handling
setup_backend() {
    print_info "Setting up backend..."
    cd backend
    
    # Fix npm cache permissions if needed
    print_info "Checking npm cache permissions..."
    if [ -d ~/.npm ] && [ ! -w ~/.npm ]; then
        print_warning "npm cache has permission issues. Fixing..."
        sudo chown -R $(whoami) ~/.npm 2>/dev/null || true
        npm cache clean --force
    fi
    
    # Remove existing node_modules and package-lock.json
    if [ -d "node_modules" ]; then
        print_info "Removing existing node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        print_info "Removing existing package-lock.json..."
        rm package-lock.json
    fi
    
    # Install dependencies with error handling
    print_info "Installing backend dependencies..."
    if npm install; then
        print_status "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        print_info "Trying with sudo access..."
        if sudo npm install; then
            print_status "Backend dependencies installed with sudo"
        else
            print_error "Failed to install backend dependencies even with sudo"
            cd ..
            exit 1
        fi
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file for backend..."
        cat > .env << EOF
# Database
MONGODB_URI=mongodb://localhost:27017/identra

# JWT
JWT_SECRET=your-super-secret-jwt-key-$(date +%s)

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

# Setup frontend with enhanced error handling
setup_frontend() {
    print_info "Setting up frontend..."
    cd frontend
    
    # Remove existing node_modules and package-lock.json
    if [ -d "node_modules" ]; then
        print_info "Removing existing node_modules..."
        rm -rf node_modules
    fi
    
    if [ -f "package-lock.json" ]; then
        print_info "Removing existing package-lock.json..."
        rm package-lock.json
    fi
    
    # Install dependencies with error handling
    print_info "Installing frontend dependencies..."
    if npm install --legacy-peer-deps; then
        print_status "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        print_info "Trying with sudo access..."
        if sudo npm install --legacy-peer-deps; then
            print_status "Frontend dependencies installed with sudo"
        else
            print_error "Failed to install frontend dependencies even with sudo"
            cd ..
            exit 1
        fi
    fi
    
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
    sleep 5
    
    # Check if backend is running
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
        print_status "Backend server started successfully on port 5000"
    else
        print_warning "Backend server may not have started properly"
    fi
    
    # Start frontend
    print_info "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a moment for frontend to start
    sleep 5
    
    # Check if frontend is running
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null; then
        print_status "Frontend server started successfully on port 5173"
    else
        print_warning "Frontend server may not have started properly"
    fi
    
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
    echo "Starting enhanced setup process..."
    echo ""
    
    # Check system requirements
    check_root
    check_sudo
    
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
        echo ""
        print_info "Or use the run script: ./run.sh"
    fi
}

# Run main function
main
