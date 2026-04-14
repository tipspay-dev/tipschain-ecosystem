# Reviewer Notes

TipsWallet is a non-custodial browser wallet for TipsChain.

## Main user flows
1. Create or import a wallet.
2. Unlock the wallet with a local password.
3. View TipsChain balances for TPC, USDTC, USDT, and WTPC.
4. Connect to dApps through the injected Ethereum provider.
5. Review and approve connection, signature, and transaction requests.
6. Launch the Tipspay DEX from the built-in Swap tab.

## Notes for reviewers
- The wallet uses a local encrypted vault in browser extension storage.
- The extension injects `window.ethereum` using a content script + inpage provider pattern.
- DEX auto-connect only trusts the Tipspay DEX origin launched from inside the extension.
- No remote code loading is intended.
