# Final Deploy Checklist — TipsWallet Rail 1

Scope: **Rail 1** on Tipschain mainnet (`chainId = 19251925`) for:
- TipsWallet-only execution
- `.tips` nameservice
- gasless sponsored sends
- TPC-only output
- exact-output enforcement
- approved-asset intake

Status legend:
- `REQUIRED` — must be complete before mainnet launch
- `RECOMMENDED` — strongly advised before launch
- `POST-LAUNCH` — acceptable immediately after launch if explicitly tracked

---

## 1. Governance and admin readiness

### REQUIRED
- [ ] `SimpleMultisig` deployed
- [ ] `TimelockControllerLite` deployed
- [ ] All mutable admin rights transferred off EOA to governance stack:
  - [ ] `TipsNameService.owner()`
  - [ ] `TipsSupportedAssetsRegistry.owner()`
  - [ ] `TipsAssetGateway.owner()`
  - [ ] `TipsSponsorPaymaster.owner()`
  - [ ] `TipsTreasuryVault.owner()`
  - [ ] `TipsGaslessTransferRouter.owner()` if ownable/admin-enabled
- [ ] Timelock delay set and verified on-chain
- [ ] Multisig signer set audited internally
- [ ] Emergency pause authority explicitly assigned

### RECOMMENDED
- [ ] Separate emergency-pause authority from routine config authority
- [ ] Distinct governance proposal templates prepared for:
  - [ ] asset allowlist update
  - [ ] RFQ signer rotation
  - [ ] operator rotation
  - [ ] sponsor quota update
  - [ ] name reservation/admin assignment

---

## 2. Secrets, keys, and signing controls

### REQUIRED
- [ ] No deployer/admin/reporter secrets stored in repo
- [ ] No plaintext production secrets in `.env`
- [ ] KMS/HSM path defined for:
  - [ ] deployer key
  - [ ] RFQ signer
  - [ ] sponsor / forwarder operator
  - [ ] treasury admin actions if operationally signed
- [ ] Secret rotation plan documented
- [ ] Previously exposed secrets rotated before launch
- [ ] Cloud IAM scoped to least privilege
- [ ] Signing logs enabled

### RECOMMENDED
- [ ] Break-glass procedure documented
- [ ] Secondary RFQ signer prepared but inactive
- [ ] Dual-control for production key policy changes

---

## 3. Contract deployment verification

### REQUIRED
- [ ] Deployments performed against `https://rpc.tipschain.org`
- [ ] Deployed addresses recorded in a canonical manifest
- [ ] Bytecode verified against local build artifacts
- [ ] Constructor params independently checked
- [ ] Ownership/admin state queried after deploy
- [ ] Contract interlinks verified:
  - [ ] router → name service
  - [ ] router → supported assets registry
  - [ ] router → asset gateway
  - [ ] router → paymaster / sponsor policy dependency if used
  - [ ] gateway → TPC token
  - [ ] gateway → treasury vault
  - [ ] forwarder → router
- [ ] `chainid()` observed as `19251925`

### REQUIRED — Asset policy
- [ ] Output asset hard-locked to TPC
- [ ] Supported input asset list reviewed and approved
- [ ] Fee-on-transfer blocklist configured
- [ ] Any asset with hooks/rebasing/reflection behavior excluded

### REQUIRED — Names
- [ ] Core names reserved:
  - [ ] `root.tips`
  - [ ] `murat.tips`
  - [ ] `muratgunel.tips`
  - [ ] `tipspay.tips`
  - [ ] `admin.tips`
  - [ ] `administrator.tips`
  - [ ] `security.tips`
  - [ ] `tpc.tips`
  - [ ] `tipschain.tips`
  - [ ] `wtpc.tips`
  - [ ] `usdtc.tips`
- [ ] Reverse resolution checked for operational wallets
- [ ] Reserved-name collision test passed

---

## 4. Functional test gate

### REQUIRED
- [ ] `forge build` passes from clean checkout
- [ ] unit tests pass
- [ ] fuzz tests pass
- [ ] invariant tests pass
- [ ] fork smoke tests pass against Tipschain RPC
- [ ] signature validation test passes for:
  - [ ] direct intent
  - [ ] permit path
  - [ ] permit2 path
- [ ] nonce replay rejection verified
- [ ] expired-intent rejection verified
- [ ] unsupported-asset rejection verified
- [ ] exact-output TPC enforcement verified
- [ ] fee-on-transfer token rejection verified
- [ ] sponsor quota exhaustion behavior verified
- [ ] trusted-forwarder-only path verified

### RECOMMENDED
- [ ] run repeated-fork test suite during different RPC load windows
- [ ] dry-run deploy on staging chain / isolated environment
- [ ] simulate signer rotation in test environment

---

## 5. Liquidity and treasury readiness

### REQUIRED
- [ ] Treasury vault funded with TPC for delivery obligations
- [ ] Sponsor wallet funded with TPC for gas operations
- [ ] RFQ quoting boundaries configured:
  - [ ] min size
  - [ ] max size
  - [ ] per-wallet daily cap
  - [ ] slippage floor / quote TTL
- [ ] Stable input assets and rates reviewed
- [ ] Route IDs documented for approved paths

### RECOMMENDED
- [ ] circuit breaker threshold for daily sponsor burn configured
- [ ] treasury depletion alert thresholds configured
- [ ] manual quote-disable switch tested

---

## 6. Backend and ops readiness

### REQUIRED
- [ ] `kms-signer` service deployed
- [ ] sponsor/forwarder operator deployed
- [ ] metrics endpoint enabled
- [ ] logs centralized
- [ ] alerting configured for:
  - [ ] failed sends spike
  - [ ] quote-sign failure
  - [ ] nonce mismatch spike
  - [ ] unresolved names spike
  - [ ] sponsor balance low
  - [ ] treasury TPC low
  - [ ] RPC latency / error surge
- [ ] rollback contact list prepared

### RECOMMENDED
- [ ] OpenTelemetry traces enabled end-to-end
- [ ] SIEM anomaly feed active
- [ ] operator runbook rehearsed once

---

## 7. Launch-day go/no-go gate

### REQUIRED
- [ ] final config diff reviewed
- [ ] addresses re-confirmed by second operator
- [ ] multisig signers available during launch window
- [ ] rollback path approved
- [ ] public comms draft prepared
- [ ] support/escalation channel staffed
- [ ] launch record template prepared

### Go condition
Proceed only if all `REQUIRED` items are complete and signed off by:
- technical owner
- governance owner
- ops owner

---

## 8. Immediate post-launch checks

### REQUIRED
- [ ] resolve and reverse-resolve at least 3 production names
- [ ] execute one small sponsored TPC send
- [ ] execute one supported-stable → TPC send
- [ ] confirm exact TPC output on recipient side
- [ ] inspect emitted events
- [ ] inspect sponsor gas spend
- [ ] inspect treasury delta
- [ ] verify dashboards and alerts receive live data

---

## 9. Stop-launch conditions

Abort launch or immediately pause if any of the following occurs:
- incorrect chain ID
- wrong contract wiring
- unauthorized forwarder can execute
- replay succeeds
- recipient receives less TPC than quoted
- fee-on-transfer asset bypasses controls
- sponsor spend grows outside configured bounds
- treasury accounting mismatch cannot be explained
- critical signer/key ambiguity exists

---

## 10. Mandatory artifacts to archive

- deployment manifest
- git commit SHA
- build hash / bytecode hash set
- signed governance actions
- launch approvals
- dry-run logs
- final environment variable inventory (non-secret names only)
- incident contact sheet
