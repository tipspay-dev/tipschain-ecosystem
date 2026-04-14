#!/bin/bash
# Enhanced deployment script with CI/CD integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="tipswallet-app"
IMAGE_NAME="tipswallet"
DOCKER_PORT=${DOCKER_PORT:-3000}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
NODE_ENV=${NODE_ENV:-"production"}

# Default to local image if no registry
if [ -z "$DOCKER_REGISTRY" ]; then
    IMAGE_TAG="${IMAGE_NAME}:latest"
else
    IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_NAME}:latest"
fi

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

build() {
    log_info "Building Docker image: $IMAGE_TAG"
    docker build -t "$IMAGE_TAG" \
        --build-arg NODE_ENV="$NODE_ENV" \
        .
    log_info "Build completed successfully"
}

deploy() {
    log_info "Starting deployment..."
    build
    
    log_info "Pulling latest dependencies..."
    docker compose pull || log_warn "Could not pull image (may be local build)"
    
    log_info "Starting container..."
    docker compose up -d
    
    log_info "Waiting for health check..."
    sleep 5
    
    if docker compose ps | grep -q "healthy"; then
        log_info "Container is healthy"
    else
        log_warn "Container not marked as healthy yet, continuing..."
    fi
    
    log_info "Deployment completed"
    status
}

status() {
    log_info "Container status:"
    docker compose ps
    log_info "Recent logs:"
    docker compose logs --tail=10
}

logs() {
    log_info "Showing real-time logs (Ctrl+C to exit)..."
    docker compose logs -f
}

stop() {
    log_info "Stopping container..."
    docker compose down
    log_info "Container stopped"
}

restart() {
    log_info "Restarting container..."
    docker compose restart
    status
}

clean() {
    log_warn "This will remove the container and image. Continue? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        log_info "Cancelled"
        return
    fi
    
    log_info "Stopping container..."
    docker compose down || true
    
    log_info "Removing image..."
    docker rmi "$IMAGE_TAG" || true
    
    log_info "Cleaned up"
}

push() {
    if [ -z "$DOCKER_REGISTRY" ]; then
        log_error "DOCKER_REGISTRY not set. Usage: DOCKER_REGISTRY=registry.example.com ./deploy.sh push"
        exit 1
    fi
    
    log_info "Building image for registry: $IMAGE_TAG"
    build
    
    log_info "Pushing to registry..."
    docker push "$IMAGE_TAG"
    log_info "Push completed"
}

health_check() {
    log_info "Running health check..."
    if docker compose ps | grep -q "$APP_NAME"; then
        if docker compose exec "$APP_NAME" wget --quiet --tries=1 --spider http://localhost:3000/ 2>/dev/null; then
            log_info "Health check passed"
            return 0
        else
            log_error "Health check failed"
            return 1
        fi
    else
        log_error "Container not running"
        return 1
    fi
}

validate() {
    log_info "Validating environment..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_info "All validations passed"
}

show_help() {
    cat << EOF
TipsWallet Deployment Script

Usage: ./deploy.sh [COMMAND]

Commands:
    build           Build Docker image
    deploy          Build and start container
    status          Show container status and logs
    logs            Show real-time logs
    stop            Stop container
    restart         Restart container
    clean           Remove container and image
    push            Build and push to registry
    health          Run health check
    validate        Validate environment
    help            Show this help message

Environment Variables:
    DOCKER_PORT     Port to expose (default: 3000)
    DOCKER_REGISTRY Docker registry URL (for push/deploy from registry)
    NODE_ENV        Node environment (default: production)
    GEMINI_API_KEY  Gemini API key for the app

Examples:
    ./deploy.sh deploy
    DOCKER_PORT=8080 ./deploy.sh deploy
    DOCKER_REGISTRY=ghcr.io/username ./deploy.sh push
    ./deploy.sh logs

EOF
}

# Main
case "${1:-help}" in
    build)
        validate
        build
        ;;
    deploy)
        validate
        deploy
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    stop)
        stop
        ;;
    restart)
        validate
        restart
        ;;
    clean)
        clean
        ;;
    push)
        validate
        push
        ;;
    health)
        health_check
        ;;
    validate)
        validate
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
