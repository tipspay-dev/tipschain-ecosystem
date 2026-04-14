#!/usr/bin/env bash
set -euo pipefail

: "${RPC_URL:?RPC_URL required}"
: "${PRIVATE_KEY:?PRIVATE_KEY required}"
: "${SIGNER_ONE:?SIGNER_ONE required}"
: "${SIGNER_TWO:?SIGNER_TWO required}"
: "${SIGNER_THREE:?SIGNER_THREE required}"
: "${MSIG_THRESHOLD:?MSIG_THRESHOLD required}"
: "${TIMELOCK_MIN_DELAY:?TIMELOCK_MIN_DELAY required}"

forge script script/DeployGovernance.s.sol:DeployGovernance --rpc-url "$RPC_URL" --broadcast
forge script script/TransferOwnershipToGovernance.s.sol:TransferOwnershipToGovernance --rpc-url "$RPC_URL" --broadcast
