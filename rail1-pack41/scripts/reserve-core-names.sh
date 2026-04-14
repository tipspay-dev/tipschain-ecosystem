#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v forge >/dev/null 2>&1; then
  echo "forge is required" >&2
  exit 1
fi

: "${RPC_URL:?set RPC_URL}"
: "${PRIVATE_KEY:?set PRIVATE_KEY}"
: "${NAME_SERVICE:?set NAME_SERVICE}"

forge script script/ReserveCoreNames.s.sol:ReserveCoreNames \
  --rpc-url "$RPC_URL" \
  --broadcast
