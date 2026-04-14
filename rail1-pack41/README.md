# TipsWallet Rail 1 — Pack 4.1 Audit Hardening

Production-oriented Foundry repo for **Rail 1** with an audit-hardening overlay:

- **TipsWallet-only** gasless send flow
- **`.tips` name resolution**
- **approved input asset** allowlist
- **TPC-only output**
- **exact-output enforcement**
- **EIP-712 user intent signatures**
- **RFQ / quote signer validation**
- **trusted forwarder**
- **sponsor quota policy**
- **Permit / Permit2 input approval path**
- **multisig / timelock governance**
- **KMS signer integration reference**
- **fee-on-transfer hard block list**
- **richer Tipschain fork tests**

## Core pack additions

### Permit paths
- `TipsGaslessTransferRouter.executeGaslessTransferWithPermit`
- `TipsGaslessTransferRouter.executeGaslessTransferWithPermit2`
- `TipsWalletForwarder.forwardTransferWithPermit`
- `TipsWalletForwarder.forwardTransferWithPermit2`

### Governance
- `contracts/governance/SimpleMultisig.sol`
- `contracts/governance/TimelockControllerLite.sol`
- `script/DeployGovernance.s.sol`
- `script/TransferOwnershipToGovernance.s.sol`

### KMS service
- `services/kms-signer/`

### Audit docs
- `docs/AUDIT_HARDENING.md`
- `docs/KEY_MANAGEMENT.md`

## Important implementation note

True gas sponsorship is still **operationally** performed by the trusted forwarder operator on-chain.  
The contract layer enforces that the flow is TipsWallet-routed and sponsor-quota controlled.

## Install

```bash
forge install
```

This repo still vendors a minimal local `forge-std` subset for convenience.

## Environment

```bash
cp .env.example .env
```

Key variables:
- `PRIVATE_KEY`
- `RPC_URL`
- `OWNER`
- `RFQ_SIGNER`
- `TRUSTED_OPERATOR`
- `TPC_TOKEN`
- `USDT_TOKEN`
- `TREASURY_VAULT_TPC_LIQUIDITY`
- governance vars in `.env.example`

## Build and test

```bash
forge build
forge test -vvv
```

Fork suite:

```bash
RPC_URL=https://rpc.tipschain.org forge test --match-path "test/fork/*" -vvv
```

## Governance deployment

```bash
forge script script/DeployGovernance.s.sol:DeployGovernance --rpc-url $RPC_URL --broadcast
forge script script/TransferOwnershipToGovernance.s.sol:TransferOwnershipToGovernance --rpc-url $RPC_URL --broadcast
```

## Reserved core names

This pack keeps the reserved-name overlay:

- root.tips
- murat.tips
- muratgunel.tips
- tipspay.tips
- admin.tips
- administrator.tips
- security.tips
- tpc.tips
- tipschain.tips
- wtpc.tips
- usdtc.tips

The secret mentioned earlier was **not embedded anywhere** in this pack and should be rotated before any live deployment.

## Production notes

- Move all admin ownership to governance before go-live.
- Keep RFQ and deploy signers in KMS / HSM.
- Only allow explicitly approved assets.
- Use the hard blocklist for fee-on-transfer tokens.
- Run the fork suite against real Tipschain contracts before launch.

## License

MIT

## Launch ops docs

Added launch-operation documents:
- `docs/FINAL_DEPLOY_CHECKLIST.md`
- `docs/GOVERNANCE_CUTOVER_PLAN.md`
- `docs/TIPSCHAIN_MAINNET_LAUNCH_RUNBOOK.md`
