#!/bin/bash

# TipsWallet VM Deployment Script
# Run this on your VM at 209.74.86.12 to deploy the application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
check_docker() {
    print_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed"
    else
        DOCKER_VERSION=$(docker --version)
        print_success "$DOCKER_VERSION"
    fi
}

# Create environment file
setup_env() {
    print_header "Setting up Environment Variables"
    
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        cat > .env <<EOF
# TipsWallet Configuration
NODE_ENV=production
GEMINI_API_KEY=YOUR_API_KEY_HERE
DOCKER_PORT=3000
EOF
        print_info "Created .env file. Please edit it with your API keys:"
        print_info "  nano .env  (or use your preferred editor)"
        print_info "Setup paused. After editing .env, run: ./vm-deploy.sh deploy"
        exit 0
    else
        print_success ".env file already exists"
        source .env
    fi
}

# Build image
build_image() {
    print_header "Building Docker Image"
    
    if docker image inspect tipswallet:latest &> /dev/null; then
        print_info "Image already exists. Pulling latest changes..."
    fi
    
    docker build -t tipswallet:latest .
    print_success "Docker image built: tipswallet:latest"
}

# Deploy with docker-compose
deploy_compose() {
    print_header "Deploying with Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose down 2>/dev/null || true
        docker-compose up -d
        print_success "Application deployed with docker-compose"
    else
        print_error "docker-compose not found. Using docker run instead..."
        deploy_docker_run
    fi
}

# Deploy with docker run
deploy_docker_run() {
    print_header "Deploying with Docker"
    
    # Stop existing container
    docker stop tipswallet-app 2>/dev/null || true
    docker rm tipswallet-app 2>/dev/null || true
    
    # Run container
    docker run -d \
        --name tipswallet-app \
        --restart unless-stopped \
        -p ${DOCKER_PORT:-3000}:3000 \
        --env-file .env \
        tipswallet:latest
    
    print_success "Application deployed"
}

# Check health
check_health() {
    print_header "Checking Application Health"
    
    sleep 5
    
    if docker ps | grep -q tipswallet-app; then
        print_success "Container is running"
        docker ps | grep tipswallet-app
    else
        print_error "Container is not running!"
        docker logs $(docker ps -a | grep tipswallet-app | awk '{print $1}') | tail -20
        exit 1
    fi
}

# Show logs
show_logs() {
    print_header "Application Logs"
    docker logs -f tipswallet-app
}

# Stop container
stop_container() {
    print_header "Stopping Container"
    docker stop tipswallet-app
    print_success "Container stopped"
}

# Install docker-compose
install_compose() {
    print_header "Installing Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        print_success "docker-compose already installed"
        return
    fi
    
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/$DOCKER_COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "docker-compose installed: $(docker-compose --version)"
}

# Main menu
case "${1:-deploy}" in
    install-docker)
        check_docker
        ;;
    install-compose)
        install_compose
        ;;
    setup)
        check_docker
        setup_env
        ;;
    env)
        setup_env
        ;;
    build)
        build_image
        ;;
    deploy)
        check_docker
        setup_env
        build_image
        deploy_compose
        check_health
        print_info "Application started on port ${DOCKER_PORT:-3000}"
        print_info "Access it at: http://$(hostname -I | awk '{print $1}'):${DOCKER_PORT:-3000}"
        ;;
    logs)
        show_logs
        ;;
    stop)
        stop_container
        ;;
    restart)
        stop_container
        sleep 2
        deploy_compose
        print_success "Container restarted"
        ;;
    *)
        echo "TipsWallet Deployment Script"
        echo ""
        echo "Usage: $0 {install-docker|install-compose|setup|build|deploy|logs|stop|restart}"
        echo ""
        echo "Commands:"
        echo "  install-docker   - Install Docker (if not installed)"
        echo "  install-compose  - Install Docker Compose"
        echo "  setup            - Setup environment variables"
        echo "  build            - Build Docker image"
        echo "  deploy           - Full deployment (default)"
        echo "  logs             - View application logs"
        echo "  stop             - Stop container"
        echo "  restart          - Restart container"
        exit 1
        ;;
esac
