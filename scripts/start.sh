#!/bin/bash

# TipsChain Start Script for Development
# Starts all services: blockchain, frontend, relayer monitoring

set -e

echo "🚀 Starting TipsChain Ecosystem..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env not found. Creating from example..."
    cp .env.example .env
    echo "Please configure .env file and run again"
    exit 1
fi

echo -e "${BLUE}Starting services...${NC}"
echo ""

# Start local node in background if needed
if [ "$1" == "local" ]; then
    echo -e "${GREEN}1. Starting local blockchain...${NC}"
    npm run node > /tmp/blockchain.log 2>&1 &
    BLOCKCHAIN_PID=$!
    echo "   Process ID: $BLOCKCHAIN_PID"
    sleep 3
    echo ""
fi

# Start Next.js development server
echo -e "${GREEN}2. Starting Next.js application...${NC}"
npm run dev

# Cleanup on exit
trap "kill $BLOCKCHAIN_PID 2>/dev/null" EXIT

echo ""
echo "🎉 All services started!"
echo ""
echo "📍 Access points:"
echo "  - Main: http://localhost:3000"
echo "  - Wallet: http://localhost:3000/wallet"
echo "  - DEX: http://localhost:3000/dex"
echo "  - Explorer: http://localhost:3000/explorer"
echo ""
echo "💡 Tip: Run 'npm run deploy:localhost' in another terminal to deploy contracts"
echo ""
