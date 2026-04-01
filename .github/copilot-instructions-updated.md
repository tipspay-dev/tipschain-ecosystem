# Workspace instructions for tipschain-ecosystem

This repo is **TipsChain Ecosystem** - a complete blockchain platform combining a Next.js frontend with Hardhat contracts, integrated DEX, wallet, explorer, and gassless transaction relayer.

## 🎯 System Overview

**TipsChain** is a production-ready blockchain ecosystem featuring:

- **Native Gas Token**: TIPS (Tipscoin) - used for all blockchain fees (18 decimals)
- **Gassless Transactions**: Relayer system for user-friendly transactions via TrustedForwarder
- **Integrated DEX**: Decentralized exchange for swapping TIPS and tokens without gas fees
- **Web3 Wallet**: Multi-chain wallet integration with TIPS balance management
- **Block Explorer**: Full blockchain explorer at scan.tipspay.org with TIPS gas display

## 📁 What this workspace is

- `pages/` - React/Next.js frontend (wallet, DEX, explorer UI)
- `pages/api/` - API routes (wallet, DEx, explorer endpoints)
- `services/` - Backend business logic (blockchain, relayer, DEX, explorer)
- `contracts/` - Solidity smart contracts (Tipscoin, USDTC, TrustedForwarder, Tipsnameserver)
- `scripts/` - Deployment, initialization, and production scripts
- `config/` - Configuration files (production settings, relayer config, deployed addresses)
- `styles/` - CSS modules (wallet, DEX, explorer styling)
- `test/` - Hardhat unit tests
- `hardhat.config.js` - Blockchain development environment
- `SETUP.md` - Complete setup and deployment guide
- `ARCHITECTURE.md` - System architecture and data flow diagrams

## ⚡ TIPS - Native Gas Token

### Critical: Tipscoin (TIPS) is the native gas token

- All transaction fees paid in TIPS (not ETH)
- 18 decimals (same as ETH)
- 1,000,000,000 total supply
- Displayed in wallet/explorer as "TIPS"
- Relayer uses TIPS to pay for user transactions
- Use `blockchainProvider.formatTips()` for all balance displays

## 🚀 Common Tasks

### Development

```bash
npm install                # Install dependencies
npm run dev               # Run Next.js frontend locally
npm run build            # Build Next.js app
npm run node             # Start local blockchain
```

### Smart Contracts

```bash
npm run compile          # Compile Solidity contracts
npm run test            # Run Hardhat tests
npm run test:coverage   # Run with coverage report
npm run lint            # Run ESLint
npm run format          # Run Prettier
npm run clean           # Clean artifacts
```

### Deployment

```bash
npm run deploy:localhost      # Deploy to local blockchain
npm run deploy:testnet        # Deploy to Sepolia testnet
npm run deploy:mainnet        # Deploy to mainnet
npm run deploy:production     # Full production deployment
npm run deploy:relayer        # Deploy relayer contract
npm run verify -- mainnet    # Verify contracts on explorer
```

### Production Scripts

```bash
bash scripts/deploy-all.sh              # Complete deployment
bash scripts/start.sh                   # Start all services
bash scripts/production-checklist.sh    # Review production readiness
node scripts/initialize.js              # Initialize all services
node scripts/deploy-production.js       # Production contracts
node scripts/deploy-relayer.js         # Deploy relayer
```

## 🔧 Key Components

### Smart Contracts

| Contract | Role | Notes |
|----------|------|-------|
| **Tipscoin.sol** | ERC20 token | Native gas coin (TPS), 18 decimals |
| **USDTC.sol** | ERC20 stablecoin | Trading pair with TPS on DEX |
| **TrustedForwarder.sol** | Meta-tx forwarder | Enables gassless transactions |
| **Tipsnameserver.sol** | Name registry | ENS-like address resolution |

### Backend Services

| File | Purpose |
| ------ | ------- |
| `blockchainProvider.js` | RPC connection, contract interactions, unit conversions |
| `relayerService.js` | Gassless transactions, relayer wallet management |
| `walletService.js` | Balance checks, token queries, signature verification |
| `dexService.js` | Token prices, swap quotes, liquidity info |
| `explorerService.js` | Block indexing, transaction tracking, stats |

### Frontend Pages

| Page | Purpose |
| ------ | ------- |
| `/wallet` | Balance display, send/receive, token management |
| `/dex` | Swap interface, gassless swaps via relayer |
| `/explorer` | Block explorer, transaction search, address details |

### API Endpoints

```
Wallet:
  GET  /api/wallet/balance
  GET  /api/wallet/token-balance
  POST /api/wallet/verify

DEX:
  GET  /api/dex/tokens
  GET  /api/dex/price
  POST /api/dex/swap-quote
  POST /api/dex/gassless-swap

Explorer:
  GET  /api/explorer/blocks
  GET  /api/explorer/block
  GET  /api/explorer/transaction
  GET  /api/explorer/address
  GET  /api/explorer/search
  GET  /api/explorer/stats
```

## 💡 Gassless Transaction Flow

```
1. User initiates transaction (e.g., swap on DEX)
2. Frontend sends request to /api/dex/gassless-swap
3. Backend relayerService creates meta-transaction
4. relayerService calls TrustedForwarder contract
5. TrustedForwarder validates (trusted consumer, rate limits, etc.)
6. Relayer broadcasts transaction (pays gas in TIPS)
7. Smart contract executes (e.g., DEX swap)
8. User sees tokens received, no gas paid by user!
```

## 🌐 Service Domains

```
Domain                      | Service
----------------------------|-------------------
https://tipschain.sbs      | Web3 Wallet
https://dex.tipschain.sbs  | Decentralized Exchange
https://scan.tipspay.org   | Block Explorer
https://api.tipspay.org    | API Gateway
```

## ⚙️ Environment Configuration

```bash
# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1

# Contracts
TIPSCOIN_ADDRESS=0x...
USDTC_ADDRESS=0x...
TIPS_DECIMALS=18

# Relayer (Gassless Transactions)
TRUSTED_FORWARDER_ADDRESS=0x...
RELAYER_PRIVATE_KEY=0x...
RELAYER_GAS_LIMIT=500000

# Service Domains
WALLET_DOMAIN=https://tipschain.sbs
DEX_DOMAIN=https://dex.tipschain.sbs
EXPLORER_DOMAIN=https://scan.tipspay.org
```

See `.env.example` for complete list.

## 👨‍💻 Developer Guidance

### Code Organization

- Contract logic → `contracts/`
- Frontend UI → `pages/` and `styles/`
- Business logic → `services/`
- API routes → `pages/api/`
- Deployment logic → `scripts/`
- Configuration → `config/`

### Key Rules

1. **Always use TIPS, not ETH** - Use `blockchainProvider.formatTips()` for displays
2. **Keep relayer funded** - Needs >100 TIPS to operate
3. **Test gassless flow** - Core functionality is meta-transactions
4. **Verify contract changes** - Run `npm run compile && npm run test`
5. **Use environment variables** - Never hardcode addresses
6. **Never commit .env** - Use `.env.example` template

### Code Examples

```javascript
// Get TIPS balance
const balance = blockchainProvider.formatTips(balanceWei);

// Parse TIPS to wei
const weiValue = blockchainProvider.parseTips("100");

// Format for display
const displayValue = `${parseFloat(balance).toFixed(4)} TIPS`;

// Gassless swap
const result = await dexService.executeGasslessSwap(userAddress, swapData);
```

## 📚 Important Files

| File | Purpose |
|------|---------|
| `SETUP.md` | Complete setup and deployment guide |
| `ARCHITECTURE.md` | System architecture, data flow, security |
| `package.json` | Scripts and dependencies |
| `.env.example` | Environment template with all variables |
| `hardhat.config.js` | Blockchain configuration |
| `config/production.js` | Production environment settings |

## ⚠️ What to Avoid

- ❌ Don't hardcode contract addresses - use environment variables
- ❌ Don't display balances in ETH - use TIPS (18 decimals)
- ❌ Don't let relayer balance get too low - needs TIPS to pay for users
- ❌ Don't skip relayer tests - gassless transactions are core
- ❌ Don't commit `.env` file - it contains secrets
- ❌ Don't modify `artifacts/`, `cache/`, `.next/` - build outputs
- ❌ Don't assume fixed gas prices - TIPS prices vary
- ❌ Don't forget explorer indexing - transactions need to be searchable

## 📋 Example Development Tasks

- "Add a new ERC20 token and integrate into DEX"
- "Create endpoint to show current relayer balance"
- "Write test for gassless swap via TrustedForwarder"
- "Implement rate limiting on relayer"
- "Add token whitelist for DEX swaps"
- "Monitor and alert when relayer balance is low"
- "Update explorer to show TIPS gas fees"
- "Create cron job for relayer maintenance"

## 🚢 Production Deployment

1. Review `SETUP.md` for complete deployment guide
2. Run `bash scripts/production-checklist.sh` to verify readiness
3. Run `bash scripts/deploy-all.sh` for production deployment
4. Configure production domains (tipschain.sbs, dex.tipschain.sbs, scan.tipspay.org)
5. Enable SSL/TLS on all domains
6. Verify all API endpoints responding correctly
7. Test gassless transactions end-to-end
8. Monitor relayer balance and key metrics

## 📞 Support

- See `SETUP.md` for deployment walkthrough
- See `ARCHITECTURE.md` for system design
- Check `docs/api.md` for API documentation
- Review `scripts/` for deployment examples

---

**TipsChain Ecosystem** - Fast, cheap, accessible blockchain with native TIPS gas token and gassless transactions.
