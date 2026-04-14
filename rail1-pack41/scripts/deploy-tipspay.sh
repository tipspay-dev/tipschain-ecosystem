#!/usr/bin/env bash
set -euo pipefail

: "${RPC_URL:=https://rpc.tipschain.org}"
: "${CHAIN_ID:=19251925}"

echo "==> build"
forge build

echo "==> deploy to Tipschain (${CHAIN_ID})"
forge script script/DeployRail1.s.sol:DeployRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --slow \
  -vvv

echo "==> configure"
forge script script/ConfigureRail1.s.sol:ConfigureRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --slow \
  -vvv
