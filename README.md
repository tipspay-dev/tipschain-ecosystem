# Tipschain Ecosystem

Recovered workspace for the Tipschain production stack.

## Included surfaces
- `apps/wallet-web/` for the wallet web app
- `apps/dex-web/` for the DEX web app
- `extension/tipswallet-extension/` for the browser extension source snapshot
- `rail1-pack41/` for the Pack 4.1 rail contracts and services

## Root release commands
```bash
npm run wallet:lint
npm run wallet:build
npm run dex:lint
npm run dex:build
npm run release:4.1
```

## Notes
- The Git base was restored from `tipspay-dev/tipschain-ecosystem`.
- Wallet source was recovered from a newer local `TipsWallet` checkout.
- DEX source was recovered from `tipspay-dev/TipspayDEX`.
- Extension and `rail1-pack41` were recovered from local backup/download snapshots.
