#!/usr/bin/env bash
set -euo pipefail

export RPC_URL="${RPC_URL:-http://127.0.0.1:8545}"

echo "==> build"
forge build

echo "==> deploy"
forge script script/DeployRail1.s.sol:DeployRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast \
  -vvv

echo "==> configure"
forge script script/ConfigureRail1.s.sol:ConfigureRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast \
  -vvv
