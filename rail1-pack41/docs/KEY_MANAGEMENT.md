# KMS / HSM Key Management

Recommended key split:

- **Deployer key**
  - used only during deployment / migration windows
- **RFQ signer key**
  - signs `Quote` typed data
- **Operator key**
  - submits gas-sponsored txs through the trusted forwarder
- **Governance signers**
  - multisig approvals only

## AWS KMS

Use `ECC_SECG_P256K1` keys and request signatures over **digest** bytes, not arbitrary UTF-8 strings.

The included `services/kms-signer` package shows a reference flow for:
- loading a key ID
- computing a digest off-chain
- requesting a DER signature from KMS
- normalizing DER -> `r,s,v`
- producing a 65-byte EVM signature

## Hard rules

- no plaintext key in repo
- no plaintext key in Docker image
- no long-lived shell history with private keys
- all signer roles separated
- monitor every signature request with correlation IDs
