# Pack 4.1 — Audit Hardening Overlay

This overlay upgrades Rail 1 with five production hardening tracks:

1. **Permit / Permit2 path**
   - `executeGaslessTransferWithPermit`
   - `executeGaslessTransferWithPermit2`
   - `forwardTransferWithPermit`
   - `forwardTransferWithPermit2`

2. **Governance**
   - `SimpleMultisig.sol`
   - `TimelockControllerLite.sol`
   - ownership transfer script for all admin-owned contracts

3. **KMS / HSM signer wiring**
   - reference AWS KMS secp256k1 service
   - RFQ signer / deploy signer / governance operator split

4. **Fee-on-transfer hard blocklist**
   - explicit registry-level `hardBlocked`
   - exact input capture checks in `TipsAssetGateway`

5. **Richer Tipschain fork tests**
   - chain-id sanity
   - env-driven live deployment checks
   - guarded live asset tests when addresses are provided

## Security notes

- Do **not** store production private keys in `.env` on long-lived hosts.
- The secret shared earlier in chat was intentionally **not** written into any artifact. Rotate it before mainnet use.
- Move all admin ownership to governance before any public rollout.
- Keep `rfqSigner`, operator, and deployer identities isolated.

## Operational recommendation

Deploy in this order:

1. core Rail 1 contracts
2. governance layer
3. transfer ownership to timelock / multisig
4. KMS-based RFQ signer
5. fork tests against live Tipschain RPC
