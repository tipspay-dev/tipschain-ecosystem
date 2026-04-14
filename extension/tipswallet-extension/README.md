# TipsWallet

TipsWallet is a polished Manifest V3 browser extension wallet for Chrome and Edge, branded for Tipspay.org and TipsChain.

## Included in this release

- Manifest V3 extension architecture for Chrome and Edge
- React + TypeScript + Vite + Tailwind polished UI
- Local encrypted vault using AES
- Create wallet / import mnemonic / unlock / lock flow
- TipsChain preset network
- Native TPC, USDTC, USDT, and WTPC balance loading
- Native TPC send flow
- ERC-20 send flow for tracked tokens
- Injected `window.ethereum` provider bridge
- Approval queue and full signing approval UI for:
  - dApp connection requests
  - personal sign requests
  - transaction send requests
- Basic transaction preview with native value and ERC-20 transfer decoding
- Connected-site tracking
- DEX auto-connect launch flow for Tipspay DEX
- Store submission package templates for Chrome Web Store and Microsoft Edge Add-ons

## Ecosystem presets

- RPC: `https://rpc.tipschain.org`
- Fallback RPC: `https://rpc2.tipschain.org`
- Chain ID: `19251925`
- Native coin: `TPC`
- Stablecoin: `USDTips (USDTC)`
- USDT: `Tether USD (USDT)`
- Wrapped token: `Wrapped TPC (WTPC)`
- Explorer: `https://scan.tipschain.online`
- Landing: `https://www.tipspay.org`
- Wallet landing: `https://wallet.tipspay.org`
- DEX: `https://dex.tipspay.org`
- Docs: `https://tipspay.wiki`
- Helpdesk: `https://tipspay.help`

## Token contracts

- USDTips (USDTC): `0x1F8a034434a50EB4e291B36EBE91f10bBfba1127`
- Tether USD (USDT): `0x9D41ed4Fc218Dd877365Be5C36c6Bb5Ec40eDa99`
- Wrapped TPC (WTPC): `0xd2E9DFeB41428f0F6f719A74551AE20A431FA365`

## Run locally

```bash
npm install
npm run build
```

Then load the `dist` folder as an unpacked extension in Chrome or Edge.

## Release notes for this build

### Approval center
This release adds an approval-center flow inside the popup that behaves more like MetaMask or Rabby:
- connection approval
- signature review and confirmation
- transaction confirmation
- decoded ERC-20 transfer preview where possible

### DEX experience
This release adds:
- a dedicated Swap tab in the wallet UI
- auto-connect for the Tipspay DEX origin
- prefilled DEX launch links from inside the extension

> Final in-wallet on-chain routing and quoting were not implemented because router contracts, quote APIs, and swap ABIs were not supplied in the brief. The extension instead launches the Tipspay DEX with wallet context and token pair prefilled.

## Store package
See the `/store` folder for:
- Chrome Web Store listing draft
- Edge Add-ons listing draft
- privacy policy draft
- permissions justification
- reviewer notes
- release checklist

## Security note
This is a significantly stronger release than the initial scaffold, but it still needs:
- phishing detection and allow/block lists
- test coverage
- formal security review
- stronger key management hardening
- simulation/risk engine depth comparable to mature wallets


## Security hardening added in this release

- auto-lock session timer with persisted expiry
- built-in trusted origin list for Tipspay surfaces
- contract target bytecode check
- ERC-20 `transfer`, `approve`, and `transferFrom` decoding
- unlimited approval detection
- risk severity scoring: low / medium / high / critical
- critical-risk blocking for malformed transactions
- activity log hooks for security-relevant events
- branded wallet and token logos integrated into the UI
