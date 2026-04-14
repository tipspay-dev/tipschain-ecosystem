#!/usr/bin/env bash
set -euo pipefail

forge test -vvv
forge test --match-path "test/fuzz/*" -vvv
forge test --match-path "test/invariant/*" -vvv

if [[ -n "${RPC_URL:-}" ]]; then
  forge test --match-path "test/fork/*" -vvv
fi
