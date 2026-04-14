# Tipschain Mainnet Launch Runbook — TipsWallet Rail 1

Purpose: operator-facing launch-day procedure for moving **Rail 1** live on Tipschain mainnet.

Rail 1 scope:
- `.tips` names
- TipsWallet-only gasless execution
- approved input assets
- TPC-only output
- exact-output enforcement
- sponsor-funded gas path

Primary chain parameters:
- Network: **Tipschain**
- Chain ID: **19251925**
- Primary RPC: **https://rpc.tipschain.org**

---

## 0. Roles during launch

Assign named operators before the window begins:
- **Launch Commander** — owns go/no-go decision
- **Deployer** — runs deployment / verification steps
- **Governance Operator** — signs governance actions
- **Security Operator** — validates configs, watches anomalies
- **Wallet/Ops Operator** — runs sponsor/forwarder services
- **Observer / Recorder** — records timestamps, tx hashes, incidents

No role should be implicit.

---

## 1. Inputs required before window opens

- exact git commit / release tag
- environment inventory completed
- deployment manifest template prepared
- production addresses for TPC and allowed stable inputs
- signer addresses for multisig/timelock
- KMS signer service reachable
- sponsor wallet funded
- treasury vault funding plan ready
- RPC fallback policy ready
- rollback criteria accepted by launch commander

---

## 2. Pre-launch freeze

At T-24h to T-1h:
- freeze code changes for launch branch
- freeze config changes except launch-approved values
- rotate any previously exposed secrets
- confirm all operators have access
- confirm monitoring and alerts are armed
- confirm support / escalation channel is staffed

---

## 3. T-30 minutes — final preflight

Run from clean environment:

```bash
forge --version
forge build
forge test --match-path "test/unit/*" -vvv
RPC_URL=https://rpc.tipschain.org forge test --match-path "test/fork/*" -vvv
```

Verify:
- local build succeeds
- fork tests succeed
- chain ID observed is `19251925`
- operator service health checks pass
- KMS signer service can produce a test signature

If any of these fail, do not proceed.

---

## 4. Mainnet deployment sequence

### Step 1 — Deploy governance layer

```bash
forge script script/DeployGovernance.s.sol:DeployGovernance \
  --rpc-url "$RPC_URL" \
  --broadcast -vvv
```

Record:
- multisig address
- timelock address
- tx hash

Verify on-chain:
- signer set
- threshold
- timelock delay

### Step 2 — Deploy Rail 1 core

```bash
forge script script/DeployRail1.s.sol:DeployRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast -vvv
```

Record all deployed addresses.

### Step 3 — Configure inter-contract wiring

```bash
forge script script/ConfigureRail1.s.sol:ConfigureRail1 \
  --rpc-url "$RPC_URL" \
  --broadcast -vvv
```

Verify:
- forwarder address in router
- registry address in router
- gateway address in router
- TPC token in gateway
- treasury vault wiring
- sponsor quota defaults

### Step 4 — Reserve core names

```bash
forge script script/ReserveCoreNames.s.sol:ReserveCoreNames \
  --rpc-url "$RPC_URL" \
  --broadcast -vvv
```

Verify all reserved names are marked as reserved/assigned according to policy.

### Step 5 — Transfer ownership to governance

```bash
forge script script/TransferOwnershipToGovernance.s.sol:TransferOwnershipToGovernance \
  --rpc-url "$RPC_URL" \
  --broadcast -vvv
```

Verify all production contracts now point to timelock/governance addresses.

---

## 5. Post-deploy validation checklist

### On-chain validation
- query owner/admin on every mutable contract
- query trusted forwarder from router
- query supported assets registry
- query TPC address from gateway
- query fee-on-transfer blocklist entries
- query sponsor limits
- query reserved names

### Functional validation
Perform these in order, using small amounts only:
1. resolve a reserved name
2. reverse-resolve an operational address if supported
3. execute a small direct TPC gasless send
4. execute one small approved stable → TPC conversion send
5. confirm recipient receives exact TPC amount expected by quote floor
6. confirm nonce cannot be replayed
7. confirm unsupported asset path reverts

### Service validation
- sponsor/forwarder service sees and submits traffic
- KMS signer signs live quotes/intents as expected
- metrics and logs visible in dashboards
- alerts remain green

---

## 6. Launch announcement gate

Do not announce “live” until all of the following are true:
- governance ownership transfer complete
- one successful direct TPC gasless send confirmed
- one successful supported-asset conversion send confirmed
- alerts healthy for at least one observation interval
- no unexplained treasury or sponsor deltas

The launch commander then marks status as `LIVE`.

---

## 7. First-hour monitoring focus

Watch continuously for:
- sponsor gas spend spike
- quote-sign failures
- unresolved name failures
- replay or nonce anomaly attempts
- unexpected TPC delivery deltas
- RPC latency and error spikes
- treasury vault depletion trend
- forwarder failure rate

If any critical anomaly appears, pause according to the emergency path.

---

## 8. Emergency response path

### Immediate pause criteria
Pause the system if:
- unauthorized forwarder execution occurs
- recipient receives less TPC than required floor
- replay protection fails
- asset blocklist bypass occurs
- quote signer integrity is in doubt
- sponsor treasury drain exceeds policy threshold

### Emergency actions
1. pause router and/or gateway
2. disable quote acceptance operationally
3. stop forwarder submissions
4. notify security + governance operators
5. preserve logs and tx hashes
6. start incident record

### Recovery conditions
Unpause only when:
- root cause identified
- fix validated
- governance-approved recovery path selected
- post-fix smoke tests pass

---

## 9. Rollback path

Launch rollback can mean one of two things:

### Soft rollback
- pause live transaction path
- keep contracts deployed
- disable services and quote issuance

### Hard rollback
- if still pre-acceptance and governance not finalized, revert ownership/config if safe
- otherwise maintain pause and remediate via governance

Do not attempt ad hoc emergency rewiring from a personal wallet after governance cutover.

---

## 10. Launch-day command set

Use the repo scripts as wrappers if preferred:

```bash
./scripts/governance-hardening.sh
./scripts/reserve-core-names.sh
./scripts/test-all.sh
./scripts/deploy-tipspay.sh
```

Or use the Foundry scripts directly for explicit control.

---

## 11. Required records after launch

Archive the following before closing the launch window:
- deployment manifest with final addresses
- all deploy/config/ownership tx hashes
- git commit SHA / tag
- fork test results snapshot
- live smoke-test evidence
- launch timeline
- any anomalies and disposition
- final go-live approval record

---

## 12. 24-hour post-launch tasks

- review sponsor spend against forecast
- review treasury delta against expected sends
- review failed tx reasons distribution
- review name-resolution usage patterns
- review SIEM anomaly flags
- confirm no hidden dependency on bootstrap EOA remains
- schedule first governance parameter review
