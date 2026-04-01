#!/bin/bash

################################################################################
# TipsChain Spaceship Blockchain VM Deployment Script
# 
# Usage: ./deploy-blockchain.sh [BLOCKCHAIN_VM_IP]
# Example: ./deploy-blockchain.sh 209.74.86.128
#
# This script automates the deployment of Besu blockchain on your Spaceship VM
################################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BLOCKCHAIN_IP="${1:-209.74.86.128}"
BESU_VERSION="23.10.0"
BESU_DIR="/opt/besu"
DATA_DIR="${BESU_DIR}/data"
CONFIG_DIR="${BESU_DIR}/config"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TipsChain Blockchain VM Deployment on Spaceship             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Blockchain VM IP: ${BLOCKCHAIN_IP}${NC}"
echo -e "${YELLOW}Besu Version: ${BESU_VERSION}${NC}"
echo ""

# Function to run commands on remote VM
run_on_vm() {
    local cmd=$1
    echo -e "${BLUE}→${NC} Running: ${cmd}"
    ssh -o StrictHostKeyChecking=no root@${BLOCKCHAIN_IP} "${cmd}"
}

# Function to copy files to VM
copy_to_vm() {
    local src=$1
    local dst=$2
    echo -e "${BLUE}→${NC} Copying: ${src} → ${dst}"
    scp -r -o StrictHostKeyChecking=no "${src}" root@${BLOCKCHAIN_IP}:"${dst}"
}

# Step 1: Verify SSH Connection
echo -e "${GREEN}Step 1: Verifying SSH Connection${NC}"
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@${BLOCKCHAIN_IP} "echo ok" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to ${BLOCKCHAIN_IP}${NC}"
    echo "Please verify:"
    echo "  1. The IP address is correct"
    echo "  2. Your SSH key is configured"
    echo "  3. The VM is running and network accessible"
    exit 1
fi

# Step 2: Create Directory Structure
echo ""
echo -e "${GREEN}Step 2: Creating Directory Structure${NC}"
run_on_vm "mkdir -p ${CONFIG_DIR} ${DATA_DIR}"
echo -e "${GREEN}✓ Directories created${NC}"

# Step 3: Copy Configuration Files
echo ""
echo -e "${GREEN}Step 3: Copying Configuration Files${NC}"
if [ ! -f "config/genesis.json" ]; then
    echo -e "${RED}✗ config/genesis.json not found${NC}"
    echo "Please ensure you're running this script from the repository root"
    exit 1
fi

copy_to_vm "config/genesis.json" "${CONFIG_DIR}/genesis.json"
copy_to_vm "config/besu.toml" "${CONFIG_DIR}/besu.toml"
echo -e "${GREEN}✓ Configuration files copied${NC}"

# Step 4: Stop Any Existing Besu Container
echo ""
echo -e "${GREEN}Step 4: Cleaning Up Existing Containers${NC}"
run_on_vm "docker stop tipschain-besu 2>/dev/null || true"
run_on_vm "docker rm tipschain-besu 2>/dev/null || true"
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Step 5: Pull Latest Besu Image
echo ""
echo -e "${GREEN}Step 5: Pulling Besu Docker Image${NC}"
run_on_vm "docker pull hyperledger/besu:${BESU_VERSION}"
echo -e "${GREEN}✓ Docker image pulled${NC}"

# Step 6: Start Besu Container
echo ""
echo -e "${GREEN}Step 6: Starting Besu Container${NC}"
run_on_vm "docker run -d \
  --name tipschain-besu \
  --restart unless-stopped \
  -p 8545:8545 \
  -p 8546:8546 \
  -p 30303:30303 \
  -p 30303:30303/udp \
  -v ${CONFIG_DIR}:/etc/besu \
  -v ${DATA_DIR}:/var/lib/besu \
  hyperledger/besu:${BESU_VERSION} \
  --config-file=/etc/besu/besu.toml \
  --data-path=/var/lib/besu"
echo -e "${GREEN}✓ Container started${NC}"

# Step 7: Wait for Startup
echo ""
echo -e "${YELLOW}Waiting for Besu to start (60 seconds)...${NC}"
sleep 60

# Step 8: Verify RPC is Working
echo ""
echo -e "${GREEN}Step 8: Verifying RPC Endpoint${NC}"
for i in {1..10}; do
    if run_on_vm "curl -s http://localhost:8545 -X POST \
        -H 'Content-Type: application/json' \
        -d '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' | grep -q '0x4afc1d'"; then
        echo -e "${GREEN}✓ RPC endpoint is working${NC}"
        echo -e "${GREEN}✓ Chain ID is correct (19251925)${NC}"
        break
    else
        if [ $i -lt 10 ]; then
            echo -e "${YELLOW}  Attempt $i/10: Still starting...${NC}"
            sleep 10
        else
            echo -e "${RED}✗ RPC endpoint not responding${NC}"
            echo "Checking logs..."
            run_on_vm "docker logs tipschain-besu | tail -20"
            exit 1
        fi
    fi
done

# Step 9: Show Network Configuration
echo ""
echo -e "${GREEN}Step 9: Network Configuration${NC}"
echo -e "${BLUE}Your Blockchain RPC is now accessible at:${NC}"
echo ""
echo -e "  ${YELLOW}External URL (from internet):${NC}"
echo -e "    http://${BLOCKCHAIN_IP}:8545"
echo ""
echo -e "  ${YELLOW}Internal URL (from other VMs on same VPC):${NC}"
run_on_vm "hostname -I | awk '{print $2}'" | while read PRIVATE_IP; do
    echo "    http://${PRIVATE_IP}:8545"
done
echo ""

# Step 10: Save Configuration
echo ""
echo -e "${GREEN}Step 10: Saving Configuration${NC}"
cat > SPACESHIP_BLOCKCHAIN_CONFIG.env << EOF
# TipsChain Blockchain Node Configuration
# Generated: $(date)

BLOCKCHAIN_PUBLIC_IP=${BLOCKCHAIN_IP}
BLOCKCHAIN_RPC_URL=http://${BLOCKCHAIN_IP}:8545
BLOCKCHAIN_CHAIN_ID=19251925
BLOCKCHAIN_VERSION=${BESU_VERSION}
BESU_DATA_DIR=${DATA_DIR}
BESU_CONFIG_DIR=${CONFIG_DIR}

# For .env.production on other VMs:
# - Use public URL above for frontend
# - When deploying other services on same Spaceship VPC,
#   contact blockchain using private IP (faster, no bandwidth costs)
EOF
echo -e "${GREEN}✓ Config saved to SPACESHIP_BLOCKCHAIN_CONFIG.env${NC}"

# Step 11: Show Deployment Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              DEPLOYMENT SUCCESSFUL! ✓                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your Besu blockchain is running!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Deploy smart contracts:"
echo -e "   ${BLUE}npm run compile${NC}"
echo -e "   ${BLUE}npm run deploy:mainnet${NC}"
echo ""
echo "2. Copy contract addresses to .env.production"
echo ""
echo "3. Deploy other services:"
echo -e "   ${BLUE}# Wallet, DEX, and Explorer VMs${NC}"
echo -e "   ${BLUE}# Update these IPs in your DNS:${NC}"
echo -e "   ${BLUE}tipschain.sbs → [WALLET_VM_IP]${NC}"
echo -e "   ${BLUE}dex.tipschain.sbs → [DEX_VM_IP]${NC}"
echo -e "   ${BLUE}scan.tipspay.org → [EXPLORER_VM_IP]${NC}"
echo ""
echo "4. Verify the deployment:"
echo -e "   ${BLUE}npm run test:rlp${NC}"
echo -e "   ${BLUE}npm run test:gassless-swap${NC}"
echo ""
echo -e "${YELLOW}Monitoring:${NC}"
echo -e "   ${BLUE}ssh root@${BLOCKCHAIN_IP} 'docker logs -f tipschain-besu'${NC}"
echo ""
echo -e "${YELLOW}Configuration saved to:${NC}"
echo -e "   ${BLUE}./SPACESHIP_BLOCKCHAIN_CONFIG.env${NC}"
echo ""
