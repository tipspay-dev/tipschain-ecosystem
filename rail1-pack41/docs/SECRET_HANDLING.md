# Secret handling for reserved root/admin identities

Do not place wallet, operator, or admin passwords in:
- Solidity contracts
- Foundry scripts
- `.env.example`
- shell history
- chat-export artifacts
- CI variables without a secret store

Use one of these instead:
- AWS Secrets Manager
- AWS KMS + envelope encryption
- HashiCorp Vault
- GCP Secret Manager

## Required action
If a root/admin password has already been shared in chat or copied into notes, rotate it before production use.

## Recommended binding model
- On-chain: reserve names only
- Off-chain auth: map the reserved identities to the app account `thearchitect`
- Secret storage: fetch the password from a secret manager at runtime only
