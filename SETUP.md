# TipsChain Ecosystem - Complete Production Setup

## 🎯 Overview

TipsChain Ecosystem is a complete blockchain infrastructure with:
- **Native Gas Token**: TIPS (Tipscoin) - used for all blockchain transactions
- **Gassless Transactions**: Relayer system for meta-transactions
- **DEX Integration**: Decentralized exchange with token swaps
- **Web3 Wallet**: Multi-chain wallet integration
- **Block Explorer**: Blockscout-compatible explorer (scan.tipspay.org)

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Deployment

#### Deploy to Local Network
```bash
npm run node  # Terminal 1 - Start local blockchain
npm run deploy:localhost  # Terminal 2 - Deploy contracts
```

#### Deploy to Production
```bash
npm run deploy:production
```

#### Deploy Relayer
```bash
npm run deploy:relayer
```

### 4. Start Application
```bash
npm run dev
```

Access the application at:
- **Main App**: http://localhost:3000
- **Wallet**: http://localhost:3000/wallet
- **DEX**: http://localhost:3000/dex
- **Explorer**: http://localhost:3000/explorer

## 📋 API Endpoints

### Wallet APIs
- `GET /api/wallet/balance?address=0x...` - Get balance in TIPS
- `GET /api/wallet/token-balance?address=0x...&tokenAddress=0x...` - Get token balance
- `POST /api/wallet/verify` - Verify wallet ownership

### DEX APIs
- `GET /api/dex/tokens` - Get supported tokens
- `GET /api/dex/price?tokenAddress=0x...` - Get token price
- `POST /api/dex/swap-quote` - Get swap quote
- `POST /api/dex/gassless-swap` - Execute gassless swap via relayer

### Explorer APIs
- `GET /api/explorer/blocks?limit=10` - Latest blocks
- `GET /api/explorer/block?number=123` - Block details
- `GET /api/explorer/transaction?hash=0x...` - Transaction details
- `GET /api/explorer/address?address=0x...` - Address details
- `GET /api/explorer/search?q=0x...` - Search (address/tx/block)
- `GET /api/explorer/stats` - Network statistics

## ⚙️ Configuration

### Environment Variables

#### Blockchain
```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1
```

#### Tokens (TIPS is the native gas coin)
```env
TIPSCOIN_ADDRESS=0x...
TIPS_DECIMALS=18
TIPS_TOTAL_SUPPLY=1000000000
USDTC_ADDRESS=0x...
```

#### Relayer (Gassless Transactions)
```env
TRUSTED_FORWARDER_ADDRESS=0x...
RELAYER_PRIVATE_KEY=0x...
RELAYER_GAS_LIMIT=500000
RELAYER_GAS_PRICE=20
```

#### Services
```env
WALLET_DOMAIN=https://tipschain.sbs
DEX_DOMAIN=https://dex.tipschain.sbs
EXPLORER_DOMAIN=https://scan.tipspay.org
```

## 🔐 Smart Contracts

### Tipscoin (TIPS)
- **Type**: ERC20 Token
- **Role**: Native gas token for all transactions
- **Decimals**: 18
- **Total Supply**: 1,000,000,000 TIPS
- **Features**: Standard ERC20 with burn capabilities

### USDTC
- **Type**: ERC20 Stablecoin
- **Role**: Stable trading pair on DEX
- **Decimals**: 18

### TrustedForwarder
- **Type**: Meta-transaction forwarder
- **Role**: Enables gassless transactions
- **Features**: Rate limiting, cooldown periods, trusted consumer management

### Tipsnameserver
- **Type**: Name service contract
- **Role**: Address to name resolution
- **Features**: ENS-like functionality

## 💰 Gas Fees & Relayer

### Native Gas Token: TIPS
All transactions on TipsChain Ecosystem use TIPS as the gas token:
```javascript
// Transaction cost in TIPS
gasUsed = tx.gasUsed * tx.gasPrice  // Result in TIPS
```

### Gassless Transactions
Users can perform transactions without holding TIPS:
1. User signs transaction with their private key
2. Relayer receives signed transaction
3. Relayer broadcasts transaction (pays gas in TIPS)
4. User gets gassless experience

### Relayer Setup
```bash
# Deploy relayer contract
npm run deploy:relayer

# Configure relayer in .env
TRUSTED_FORWARDER_ADDRESS=<deployed_address>
RELAYER_PRIVATE_KEY=<relayer_account_key>

# Monitor relayer balance (must have TIPS)
npm run relayer:balance
```

## 🌐 Frontend Integration

### Wallet Connection
```javascript
// Connect MetaMask
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

// Get TIPS balance
const res = await fetch(`/api/wallet/balance?address=${accounts[0]}`);
const { balance } = await res.json();
console.log(`Balance: ${balance} TIPS`);
```

### DEX Swap (Gassless)
```javascript
// Get swap quote
const quoteRes = await fetch('/api/dex/swap-quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokenInAddress: '0x...',
    tokenOutAddress: '0x...',
    amountIn: '100'
  })
});

// Execute gassless swap (relayer pays gas)
const swapRes = await fetch('/api/dex/gassless-swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAddress: accounts[0],
    swapData: quote
  })
});
```

## 🔍 Explorer Integration

Access the block explorer at `/explorer`:
- View blocks and transactions
- Search by address, hash, or block number
- Check account balances
- Monitor network statistics

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- test/Tipscoin.test.js
```

## 📦 Deployment Checklist

### Pre-Deployment
- [ ] Configure `.env` with production values
- [ ] Ensure deployer account has enough TIPS
- [ ] Setup relayer account with TIPS balance
- [ ] Configure domain names for wallet/dex/explorer

### Deployment Steps
```bash
# 1. Deploy contracts
npm run deploy:mainnet

# 2. Deploy relayer
npm run deploy:relayer

# 3. Initialize services
node scripts/initialize.js

# 4. Verify deployment
npm run verify -- mainnet
```

### Post-Deployment
- [ ] Verify all contract addresses in config/deployed.json
- [ ] Test all API endpoints
- [ ] Verify wallet connectivity
- [ ] Test gassless transactions
- [ ] Monitor relayer balance
- [ ] Check explorer functionality

## 📊 Monitoring

### Health Check
```bash
# All services status
curl http://localhost:3000/api/health

# Get network stats
curl http://localhost:3000/api/explorer/stats
```

### Relayer Status
```bash
# Check relayer balance and status
node scripts/check-relayer.js
```

## 🐛 Troubleshooting

### Relayer Not Working
```
Issue: Gassless transactions failing
Solution:
1. Verify TRUSTED_FORWARDER_ADDRESS is set
2. Check relayer TIPS balance
3. Ensure relayer account is in trustedConsumers
```

### Low Gas Prices
```
Issue: Transactions stuck
Solution:
1. Increase RELAYER_GAS_PRICE in .env
2. Check current network gas prices
3. Adjust maxFeePerGas in transaction settings
```

### Balance Not Showing
```
Issue: Wallet balance shows 0
Solution:
1. Verify wallet address format
2. Check RPC endpoint connectivity
3. Ensure TIPS contract is deployed
```

## 🔗 Service Domains

- **Wallet**: https://tipschain.sbs
- **DEX**: https://dex.tipschain.sbs
- **Explorer**: https://scan.tipspay.org
- **API**: https://api.tipspay.org

## 📚 Additional Resources

- [Smart Contracts](./contracts/)
- [API Documentation](./docs/api.md)
- [Deployment Scripts](./scripts/)
- [Configuration Guide](./config/)
- [Frontend Components](./pages/)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues and questions:
1. Check documentation in `/docs`
2. Review API examples in `/pages/api`
3. Check logs in deployment output
4. Open an issue on GitHub

---

**TipsChain Ecosystem** - Built for fast, cheap, and accessible blockchain transactions with native TIPS gas token.
