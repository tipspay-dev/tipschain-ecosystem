#!/bin/bash

# TipsChain - RLP Encoding Error Diagnostic Script
# Helps diagnose and fix RLP encoding issues

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  TipsChain RLP Encoding Error Diagnostic Tool            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if .env is configured
echo "Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Run: cp .env.example .env"
    exit 1
fi

# Check required environment variables
required_vars=(
    "BLOCKCHAIN_RPC_URL"
    "PRIVATE_KEY"
    "BLOCKCHAIN_CHAIN_ID"
)

missing=0
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        echo "⚠️  Missing: $var"
        missing=$((missing + 1))
    fi
done

if [ $missing -gt 0 ]; then
    echo ""
    echo "❌ Missing $missing required environment variables"
    echo "   Edit .env and add all required variables from .env.example"
    exit 1
fi

echo "✓ Environment configured"
echo ""

# Check blockchain connection
echo "Testing blockchain connection..."
npx hardhat run <<'EOF' --network localhost
const hre = require("hardhat");
(async () => {
    try {
        const network = await hre.ethers.provider.getNetwork();
        console.log("✓ Connected to chain:", network.chainId);
        
        const [signer] = await hre.ethers.getSigners();
        const balance = await hre.ethers.provider.getBalance(signer.address);
        console.log("✓ Signer address:", signer.address);
        console.log("✓ Signer balance:", hre.ethers.formatEther(balance), "ETH");
        
        const feeData = await hre.ethers.provider.getFeeData();
        console.log("✓ Gas price:", hre.ethers.formatUnits(feeData.gasPrice, "gwei"), "Gwei");
    } catch (error) {
        console.error("❌ Connection error:", error.message);
        process.exit(1);
    }
})();
EOF

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Diagnostic Complete                                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "If you're still getting RLP encoding errors:"
echo ""
echo "1. Ensure blockchain node is running:"
echo "   npm run node"
echo ""
echo "2. Verify all transaction parameters are correct"
echo "3. Check gas limits are reasonable (100000-500000)"
echo "4. Ensure addresses are properly formatted (0x...)"
echo ""
echo "Common causes of RLP errors:"
echo "  • Missing transaction fields (gasLimit, gasPrice)"
echo "  • Invalid hex data format"
echo "  • Network configuration mismatch"
echo "  • Incomplete transaction structure"
echo ""
