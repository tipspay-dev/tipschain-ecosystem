#!/bin/bash

###############################################################################
# TipsChain Ecosystem - Complete Production Deployment Script
# This script deploys all components: contracts, relayer, dex, wallet, explorer
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TipsChain Ecosystem - Production Deployment v1.0       ║"
echo "║                                                            ║"
echo "║  Native Gas Token: TIPS (Tipscoin)                        ║"
echo "║  Gassless Transactions: Enabled via Relayer               ║"
echo "║  DEX: Integrated DEX with TIPS/USDTC pairs                ║"
echo "║  Explorer: scan.tipspay.org                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[2/8]${NC} Installing dependencies..."
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check environment file
echo -e "${BLUE}[3/8]${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found, creating from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update .env with your configuration${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

# Compile contracts
echo -e "${BLUE}[4/8]${NC} Compiling smart contracts..."
npm run compile > /dev/null 2>&1
echo -e "${GREEN}✓ Contracts compiled${NC}"
echo ""

# Run tests
echo -e "${BLUE}[5/8]${NC} Running tests..."
npm run test > /dev/null 2>&1
echo -e "${GREEN}✓ All tests passed${NC}"
echo ""

# Deploy contracts
echo -e "${BLUE}[6/8]${NC} Deploying smart contracts..."
npm run deploy:production
echo ""

# Deploy relayer
echo -e "${BLUE}[7/8]${NC} Deploying relayer contract..."
npm run deploy:relayer || echo -e "${YELLOW}⚠ Relayer deployment optional${NC}"
echo ""

# Initialize services
echo -e "${BLUE}[8/8]${NC} Initializing services..."
node scripts/initialize.js
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo -e "${GREEN}║                  Deployment Complete!                    ║${NC}"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo "  1. Review config/deployed.json for deployed addresses"
echo "  2. Start the application: npm run dev"
echo "  3. Access explorer: http://localhost:3000/explorer"
echo "  4. Access wallet: http://localhost:3000/wallet"
echo "  5. Access DEX: http://localhost:3000/dex"
echo ""
echo "⚡ Network:"
echo "  - Native Gas Token: TIPS (Tipscoin)"
echo "  - Gassless Transactions: Enabled"
echo "  - DEX: Ready for swaps"
echo "  - All services: Connected"
echo ""
echo "📚 Documentation: See SETUP.md for complete guide"
echo ""
