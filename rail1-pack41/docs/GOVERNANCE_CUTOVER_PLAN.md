# Governance Cutover Plan — TipsWallet Rail 1

Goal: move Rail 1 from EOA/bootstrap administration to a controlled governance model with:
- multisig execution
- timelocked changes
- explicit emergency powers
- auditable parameter management

This plan assumes the following governance primitives exist:
- `SimpleMultisig`
- `TimelockControllerLite`

---

## 1. Governance target model

### Final target
- **Multisig** controls the **Timelock**
- **Timelock** becomes owner/admin of mutable production contracts
- **Emergency pause** may be held by either:
  - multisig directly, or
  - dedicated emergency role controlled by governance policy

### Why this split
Routine changes should be delayed and reviewable. Emergency actions should be faster but narrower.

---

## 2. Contracts entering governance

The cutover should cover all contracts with mutable config or privileged functions:
- `TipsNameService`
- `TipsSupportedAssetsRegistry`
- `TipsAssetGateway`
- `TipsSponsorPaymaster`
- `TipsTreasuryVault`
- `TipsGaslessTransferRouter` if admin-configurable
- any role manager / pause controller deployed alongside the pack

---

## 3. Preconditions

Before starting cutover:
- production addresses finalized
- multisig signer list finalized
- timelock delay finalized
- governance deployment tested in non-production or dry-run
- all signers reachable during the cutover window
- rollback owner defined until final acceptance checkpoint

---

## 4. Signer policy

Recommended signer structure:
- one infrastructure operator
- one protocol owner
- one security operator
- one treasury/finance operator
- one backup independent signer

Recommended approval threshold:
- **3-of-5** for routine governance

Emergency model:
- either same 3-of-5, or
- tightly scoped emergency role with immediate pause only

Do not use a single-person admin after cutover.

---

## 5. Timelock policy

Recommended baseline:
- **24h to 48h** for routine production changes
- shorter only for low-impact operational updates if formally justified

Typical changes that should be timelocked:
- supported asset list changes
- RFQ signer changes
- forwarder/operator changes
- quota policy changes
- treasury routing changes
- name reservation admin policy changes

Emergency pause should not require the full routine delay if there is a critical exploit scenario.

---

## 6. Cutover sequence

### Phase A — Deploy governance layer
1. Deploy `SimpleMultisig`
2. Deploy `TimelockControllerLite`
3. Configure proposer/executor roles according to policy
4. Record addresses in deployment manifest
5. Verify deployment state on-chain

Checkpoint A:
- multisig operational
- timelock operational
- signers confirm address set and threshold

### Phase B — Dry-run governance actions
1. Queue a harmless timelocked no-op or low-impact test action
2. Execute through multisig + timelock path
3. Confirm event emission and role behavior

Checkpoint B:
- governance path works end to end

### Phase C — Transfer ownership/admin
Transfer ownership/admin of each production contract to timelock, in this order:
1. `TipsSupportedAssetsRegistry`
2. `TipsNameService`
3. `TipsAssetGateway`
4. `TipsSponsorPaymaster`
5. `TipsTreasuryVault`
6. `TipsGaslessTransferRouter` if applicable

After each transfer:
- query new owner/admin
- record tx hash
- confirm old EOA no longer has privileges

Checkpoint C:
- all mutable production contracts governed by timelock

### Phase D — Emergency powers validation
1. Verify emergency pause role location
2. Test emergency action in dry-run or lower environment if not already done
3. Confirm unpause/recovery path is documented

Checkpoint D:
- emergency controls validated

### Phase E — Final acceptance
1. Freeze bootstrap EOA use for admin tasks
2. Archive bootstrap owner procedures
3. Announce governance cutover internally
4. Require all future changes through governance flow

---

## 7. Rollback plan during cutover

Rollback is only valid **before final acceptance** and only if the old bootstrap admin still retains authority.

Rollback triggers:
- timelock misconfigured
- multisig threshold incorrect
- owner transferred to wrong address
- proposer/executor permissions broken
- emergency role misassigned

Rollback method:
- stop further ownership transfers
- if possible, transfer already-moved contracts back to bootstrap admin
- document partial state immediately
- do not proceed to launch until governance path is corrected and revalidated

Once final acceptance occurs, rollback should not rely on EOA restoration; it should use governance itself.

---

## 8. Post-cutover allowed actions

After cutover, all operational changes should be categorized:

### Timelocked governance actions
- add/remove supported asset
- rotate RFQ signer
- rotate forwarder operator
- update sponsor quotas
- reserve or reassign protected names
- treasury routing changes

### Emergency-only actions
- pause router
- pause gateway
- disable quote acceptance
- disable specific asset route

### Not allowed outside governance
- direct owner EOA mutation
- ad hoc hotfix via personal wallet
- signer rotation without audit trail

---

## 9. Governance artifacts to maintain

- signer list and threshold record
- timelock parameters
- contract ownership map
- governance proposal templates
- emergency procedure
- tx hash ledger for all governance actions
- signer rotation policy

---

## 10. Success criteria

Cutover is complete only when all are true:
- every mutable production contract is owned/administered by governance
- no bootstrap EOA can mutate production state
- emergency path is documented and tested
- governance flow has at least one successful end-to-end execution record
- ops and security teams sign off on the new control plane
