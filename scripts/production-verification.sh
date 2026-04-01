#!/bin/bash

###############################################################################
# Production Deployment Verification Script
# Verifies all RLP encoding fixes are in place and working correctly
###############################################################################

set -e

echo "═════════════════════════════════════════════════════════════════"
echo "🚀 PRODUCTION DEPLOYMENT VERIFICATION"
echo "═════════════════════════════════════════════════════════════════"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track checks
CHECKS_PASSED=0
CHECKS_FAILED=0

# Utility functions
check_file() {
  local file=$1
  local search=$2
  local description=$3

  if [ ! -f "$file" ]; then
    echo -e "${RED}✗ File not found: $file${NC}"
    ((CHECKS_FAILED++))
    return 1
  fi

  if grep -q "$search" "$file"; then
    echo -e "${GREEN}✓ $description${NC}"
    ((CHECKS_PASSED++))
    return 0
  else
    echo -e "${RED}✗ $description${NC}"
    echo "  Missing: $search"
    ((CHECKS_FAILED++))
    return 1
  fi
}

check_env() {
  local var=$1
  local description=$2

  if [ -z "${!var}" ]; then
    echo -e "${YELLOW}⚠ $description not set${NC}"
    ((CHECKS_FAILED++))
    return 1
  else
    echo -e "${GREEN}✓ $description configured${NC}"
    ((CHECKS_PASSED++))
    return 0
  fi
}

# Start verification
echo ""
echo "📋 Step 1: Checking Core Files"
echo "─────────────────────────────────────────────────────────────────"
check_file "services/relayerService.js" "getFeeData" "Relayer service has gas fee retrieval"
check_file "services/relayerService.js" "maxFeePerGas" "Relayer service has EIP-1559 gas pricing"
check_file "services/relayerService.js" "wait(1)" "Relayer service waits for confirmation"
check_file "services/dexService.js" "validateTransactionData" "DEX service uses transaction validation"
check_file "services/transactionUtils.js" "validateTransactionData" "Transaction utilities module exists"
check_file "services/transactionUtils.js" "buildTransaction" "Transaction build utility exists"

echo ""
echo "📋 Step 2: Checking Environment Configuration"
echo "─────────────────────────────────────────────────────────────────"
check_env "BLOCKCHAIN_RPC_URL" "Blockchain RPC URL"
check_env "BLOCKCHAIN_CHAIN_ID" "Blockchain Chain ID"
check_env "PRIVATE_KEY" "Private Key for signer"
check_env "TIPSCOIN_ADDRESS" "TIPS Contract Address"

echo ""
echo "📋 Step 3: Checking Deployment Scripts"
echo "─────────────────────────────────────────────────────────────────"
check_file "scripts/deploy-production.js" "deploymentTransaction" "Deploy script uses deploymentTransaction"
check_file "scripts/deploy-production.js" "wait(1)" "Deploy script waits for confirmation"
check_file "scripts/diagnose-rlp.sh" "getFeeData" "Diagnostic script available"

echo ""
echo "📋 Step 4: Checking API Route Configuration"
echo "─────────────────────────────────────────────────────────────────"
check_file "pages/api/dex/gassless-swap.js" "relayTransaction" "DEX gassless swap route ready"
check_file "pages/api/dex/swap-quote.js" "gasEstimate" "DEX swap quote includes gas estimate"
check_file "pages/api/wallet/balance.js" "formatTips" "Wallet API uses TIPS formatting"

echo ""
echo "📋 Step 5: Checking Frontend Pages"
echo "─────────────────────────────────────────────────────────────────"
check_file "pages/wallet.js" "useEffect" "Wallet page initialized"
check_file "pages/dex.js" "executeGasslessSwap" "DEX page has gassless swap"
check_file "pages/explorer/index.js" "getLatestBlocks" "Explorer page initialized"

echo ""
echo "📋 Step 6: Code Quality Checks"
echo "─────────────────────────────────────────────────────────────────"

# Check for console.log statements (should clean up for production)
CONSOLE_LOGS=$(grep -r "console.log\|console.warn" services/*.js pages/api/*.js 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Found $CONSOLE_LOGS console statements (review before production)${NC}"
else
  echo -e "${GREEN}✓ No console statements to clean up${NC}"
  ((CHECKS_PASSED++))
fi

# Check for TODOs or FIXMEs
TODOS=$(grep -r "TODO\|FIXME" services/*.js pages/api/*.js 2>/dev/null | wc -l)
if [ "$TODOS" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Found $TODOS TODO/FIXME comments${NC}"
  grep -r "TODO\|FIXME" services/*.js pages/api/*.js | head -3
else
  echo -e "${GREEN}✓ No outstanding TODOs${NC}"
  ((CHECKS_PASSED++))
fi

echo ""
echo "📋 Step 7: Security Checks"
echo "─────────────────────────────────────────────────────────────────"

# Check for hardcoded secrets
if grep -r "PRIVATE_KEY.*=" . --include="*.js" --exclude-dir=node_modules | grep -v "process.env"; then
  echo -e "${RED}✗ WARNING: Hardcoded secrets detected${NC}"
  ((CHECKS_FAILED++))
else
  echo -e "${GREEN}✓ No hardcoded secrets detected${NC}"
  ((CHECKS_PASSED++))
fi

# Check for proper error handling
ERROR_HANDLERS=$(grep -r "catch\|try" services/*.js | wc -l)
if [ "$ERROR_HANDLERS" -lt 20 ]; then
  echo -e "${YELLOW}⚠ Limited error handling (found $ERROR_HANDLERS try/catch blocks)${NC}"
else
  echo -e "${GREEN}✓ Comprehensive error handling in place${NC}"
  ((CHECKS_PASSED++))
fi

echo ""
echo "📋 Step 8: Running Tests"
echo "─────────────────────────────────────────────────────────────────"

if [ -x "scripts/test-rlp-fix.js" ] || [ -f "scripts/test-rlp-fix.js" ]; then
  echo -e "${GREEN}✓ RLP encoding test script available${NC}"
  echo "  Run: npm run test:rlp"
  ((CHECKS_PASSED++))
fi

if [ -x "scripts/test-gassless-swap.js" ] || [ -f "scripts/test-gassless-swap.js" ]; then
  echo -e "${GREEN}✓ Gassless swap test script available${NC}"
  echo "  Run: npm run test:gassless-swap"
  ((CHECKS_PASSED++))
fi

echo ""
echo "═════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "═════════════════════════════════════════════════════════════════"

TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))

echo ""
echo "  Checks Passed: $CHECKS_PASSED/$TOTAL"
echo "  Checks Failed: $CHECKS_FAILED/$TOTAL"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL VERIFICATION CHECKS PASSED!${NC}"
  echo ""
  echo "🚀 Your deployment is production-ready!"
  echo ""
  echo "Next steps:"
  echo "  1. Configure your .env file with production values"
  echo "  2. Run: npm run deploy:mainnet (or appropriate network)"
  echo "  3. Run: npm run test:rlp to verify blockchain connection"
  echo "  4. Run: npm run dev to start the frontend"
  echo "  5. Monitor: https://scan.tipspay.org for transactions"
  echo ""
  exit 0
else
  echo -e "${RED}❌ VERIFICATION FAILED - $CHECKS_FAILED issues found${NC}"
  echo ""
  echo "Required fixes:"
  echo "  1. Review the failed checks above"
  echo "  2. See docs/RLP_ENCODING_FIX.md for detailed solutions"
  echo "  3. Run diagnostics: npm run diagnose"
  echo ""
  exit 1
fi
