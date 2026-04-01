# TipsChain Ecosystem - System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TipsChain Ecosystem                          │
│                                                                 │
│  Native Gas Token: TIPS (Tipscoin)                              │
│  All transactions measured in TIPS                              │
└─────────────────────────────────────────────────────────────────┘

                              
                    ┌──────────────────────┐
                    │  Blockchain Layer    │
                    │   (TipsChain Node)   │
                    │                      │
                    │ Gas Token: TIPS      │
                    │ RPC: localhost:8545  │
                    └──────────┬───────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
          ┌──────▼──┐   ┌─────▼────┐   ┌──▼─────┐
          │ Wallets │   │    DEX   │   │Explorer│
          └──────┬──┘   └─────┬────┘   └──┬─────┘
                 │            │            │
          ┌──────▼──────────────────────────▼──┐
          │                                    │
          │    Next.js Frontend Application   │
          │                                    │
          │ ┌──────────────────────────────┐ │
          │ │  Wallet Interface            │ │
          │ │  - Balance: TIPS             │ │
          │ │  - Send/Receive              │ │
          │ │  - Token management          │ │
          │ └──────────────────────────────┘ │
          │                                    │
          │ ┌──────────────────────────────┐ │
          │ │  DEX Interface               │ │
          │ │  - Swap TIPS/USDTC           │ │
          │ │  - Gassless swaps (Relayer)  │ │
          │ │  - Liquidity pools           │ │
          │ └──────────────────────────────┘ │
          │                                    │
          │ ┌──────────────────────────────┐ │
          │ │  Block Explorer              │ │
          │ │  - Blocks & Transactions     │ │
          │ │  - Address details           │ │
          │ │  - Gas prices in TIPS        │ │
          │ └──────────────────────────────┘ │
          │                                    │
          └──────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
     │ Wallet  │    │   DEX   │   │Explorer │  
     │ APIs    │    │  APIs   │   │ APIs    │
     │         │    │         │   │         │
     │ :3000   │    │ :3000   │   │ :3000   │
     └────┬────┘    └────┬────┘   └────┬────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
                ┌────────┴─────────┐
                │                  │
           ┌────▼────┐      ┌──────▼─┐
           │ Services│      │Relayer │
           │ Layer   │      │Service │
           └────┬────┘      └──┬─────┘
                │               │
        ┌───────┴───────┐      │
        │               │      │
   ┌────▼────┐   ┌──────▼──┐   │
   │Blockchain│  │TrustedFor│  │
   │Provider  │  │warder    │  │
   └──────────┘  └──────────┘  │
                                │
                        ┌───────▼────┐
                        │ Relayer    │
                        │ Wallet     │
                        │            │
                        │ Pays gas   │
                        │ in TIPS    │
                        └────────────┘
```

## 🔄 Service Interactions

### 1. Wallet Service
```
User Browser → MetaMask → Wallet API → Blockchain
      ↓
  /api/wallet/balance → blockchainProvider
      ↓
  Returns: Balance in TIPS
```

### 2. DEX Service
```
User → Swap Interface → /api/dex/swap-quote
      ↓
  blockchainProvider (price feeds)
      ↓
  Returns: Quote in TIPS
      ↓
User clicks "Swap" → /api/dex/gassless-swap
      ↓
  relayerService.relayTransaction()
      ↓
  TrustedForwarder executes swap
      ↓
  User receives tokens (Relayer paid gas!)
```

### 3. Explorer Service
```
User → Block Explorer → /api/explorer/blocks
      ↓
  explorerService → blockchainProvider
      ↓
  Returns: Latest blocks with TIPS gas info
      ↓
User can search → /api/explorer/search?q=0x...
      ↓
  Supports: Blocks, Transactions, Addresses
```

## 💾 Data Flow

### Transaction Processing
```
┌─ User initiates transaction
│
├─ Frontend signs with Web3
│
├─ API receives signed transaction
│
├─ Would use relayer? (gassless)
│  │
│  ├─ YES → relayerService → TrustedForwarder
│  │        ↓
│  │        Relayer broadcasts (pays gas in TIPS)
│  │
│  └─ NO → User signs normally
│
├─ blockchainProvider broadcasts to RPC
│
├─ Transaction in mempool
│
├─ Block miner includes transaction
│
├─ Block finalized
│
├─ Explorer indexes block
│
└─ User sees transaction in explorer
```

## 🔐 Security Layers

```
┌─ Input Validation
│  ├─ Address format validation
│  ├─ Amount validation
│  └─ Rate limiting
│
├─ Authentication
│  ├─ Message signing (EIP-191)
│  ├─ JWT tokens (if needed)
│  └─ API keys
│
├─ Contract Security
│  ├─ ERC20 standard compliance
│  ├─ Approved spending checks
│  └─ Reentrancy guards (in TrustedForwarder)
│
├─ Relayer Security
│  ├─ Whitelist/Blacklist
│  ├─ Rate limiting per user
│  ├─ Cooldown periods
│  └─ Transaction signature verification
│
└─ Network Security
   ├─ HTTPS/TLS
   ├─ CORS configuration
   ├─ DDoS protection
   └─ WAF rules
```

## 📊 Deployment Topology

```
┌─────────────────────────────────────────┐
│   Production Environment                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Wallet (tipschain.sbs)          │   │
│  │ - SSL Certificate               │   │
│  │ - Load Balancer                 │   │
│  │ - Auto Scaling                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ DEX (dex.tipschain.sbs)         │   │
│  │ - SSL Certificate               │   │
│  │ - Load Balancer                 │   │
│  │ - Redis Cache                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Explorer (scan.tipspay.org)     │   │
│  │ - SSL Certificate               │   │
│  │ - PostgreSQL Database           │   │
│  │ - Indexing Service              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Relayer Service                 │   │
│  │ - Hot Wallet (TIPS)             │   │
│  │ - Rate Limiting                 │   │
│  │ - Gas Price Monitoring          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Infrastructure                  │   │
│  │ - RPC Nodes (Redundancy)        │   │
│  │ - Database Replication          │   │
│  │ - Backup & Recovery             │   │
│  │ - Monitoring & Logging          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## 🎯 Component Responsibilities

### blockchainProvider.js
- RPC connection management
- Contract interactions
- Account balance queries
- Unit conversion (wei ↔ TIPS)

### relayerService.js
- Meta-transaction creation
- Relayer wallet management
- Gas payment handling
- Transaction status tracking

### walletService.js
- Balance checking
- Token balance queries
- Signature verification
- Wallet validation

### dexService.js
- Token price feeds
- Swap quotes
- Liquidity pool info
- Gassless swap coordination

### explorerService.js
- Block indexing
- Transaction tracking
- Address monitoring
- Network statistics

## 🔄 Request Flow Example: Gassless Swap

```
1. User clicks "Swap" on DEX
   └─ Frontend: POST /api/dex/gassless-swap
      ├─ userAddress: "0xabc..."
      ├─ tokenIn: "0xTIPS..."
      └─ amountIn: "100"

2. Backend receives request
   └─ dexService.executeGasslessSwap()
      └─ relayerService.relayTransaction()

3. Relayer prepares transaction
   └─ Creates function signature
   ├─ Calls TrustedForwarder contract
   └─ Includes gas payment parameters

4. TrustedForwarder checks
   ├─ Is caller trusted?
   ├─ Is user rate limited?
   └─ Is transaction valid?

5. If approved, execute
   └─ DEX contract executes swap
      ├─ Transfers tokenIn from user
      ├─ Transfers tokenOut to user
      └─ Gas paid by relayer in TIPS

6. Return result to frontend
   └─ Transaction hash
   ├─ Swap successful
   └─ No gas paid by user!
```

---

For detailed API documentation, see [API.md](./docs/api.md)
For deployment guide, see [SETUP.md](./SETUP.md)
