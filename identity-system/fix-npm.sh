#!/bin/bash

# Fix npm cache permissions and install dependencies
echo "🔧 Fixing npm cache permissions and installing dependencies..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Fix npm cache permissions
print_info "Fixing npm cache permissions..."
if sudo chown -R $(whoami) ~/.npm; then
    print_status "npm cache permissions fixed"
else
    print_warning "Could not fix npm cache permissions automatically"
    print_info "Please run: sudo chown -R $(whoami) ~/.npm"
fi

# Clear npm cache
print_info "Clearing npm cache..."
npm cache clean --force
print_status "npm cache cleared"

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend

# Remove node_modules and package-lock.json if they exist
if [ -d "node_modules" ]; then
    print_info "Removing existing node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_info "Removing existing package-lock.json..."
    rm package-lock.json
fi

# Install dependencies
if npm install; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ..

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd frontend

# Remove node_modules and package-lock.json if they exist
if [ -d "node_modules" ]; then
    print_info "Removing existing node_modules..."
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    print_info "Removing existing package-lock.json..."
    rm package-lock.json
fi

# Install dependencies with legacy peer deps to handle React version conflicts
if npm install --legacy-peer-deps; then
    print_status "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

print_status "All dependencies installed successfully!"
echo ""
print_info "You can now run the application with:"
echo "  ./run.sh"
echo "  or"
echo "  ./setup-enhanced.sh"
