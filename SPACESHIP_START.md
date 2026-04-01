# 🚀 TipsChain Spaceship Deployment - START HERE

**Your Network Configuration:**
- Blockchain VM IP: `209.74.86.128` ✅
- Chain ID: `19251925`
- Status: Ready to Deploy

---

## ⚡ 5-Minute Quick Start

### Step 1: Deploy Blockchain (5 min)

Run this command from the repository root on your local machine:

```bash
# This will automatically:
# 1. SSH to your Blockchain VM (209.74.86.128)
# 2. Install all dependencies
# 3. Start Besu docker container
# 4. Verify RPC endpoint is working
# 5. Save configuration to SPACESHIP_BLOCKCHAIN_CONFIG.env

bash scripts/deploy-blockchain-spaceship.sh 209.74.86.128
```

**That's it! Your blockchain is online.**

---

## ✅ What Just Happened

After running the script, your Besu blockchain is:
- ✅ Running in Docker on 209.74.86.128
- ✅ RPC endpoint accessible at `http://209.74.86.128:8545`
- ✅ Chain ID: `19251925`
- ✅ Ready to receive transactions
- ✅ Auto-restarting if it crashes

Check the output file:
```bash
cat SPACESHIP_BLOCKCHAIN_CONFIG.env
```

---

## 📋 Next Steps

### Step 2: Deploy Smart Contracts (10 min)

```bash
# 1. Get blockchain configuration
source SPACESHIP_BLOCKCHAIN_CONFIG.env

# 2. Create production environment
cat > .env.production << EOF
BLOCKCHAIN_RPC_URL=$BLOCKCHAIN_RPC_URL
BLOCKCHAIN_CHAIN_ID=$BLOCKCHAIN_CHAIN_ID
PRIVATE_KEY=0x[your_private_key_here]
RELAYER_PRIVATE_KEY=0x[your_relayer_key_here]
EOF

# 3. Compile contracts
npm run compile

# 4. Deploy to Spaceship
npm run deploy:mainnet

# You'll get output like:
# TipsCoin deployed to: 0xabc123...
# USDTC deployed to: 0xdef456...
# TrustedForwarder deployed to: 0xghi789...

# Copy the addresses above
```

### Step 3: Add Contract Addresses to .env.production

```bash
# Edit .env.production and add:
TIPSCOIN_ADDRESS=0x[from_deploy_output]
USDTC_ADDRESS=0x[from_deploy_output]
TRUSTED_FORWARDER_ADDRESS=0x[from_deploy_output]
DEX_ROUTER_ADDRESS=0x[your_dex_router]
DEX_FACTORY_ADDRESS=0x[your_dex_factory]
```

### Step 4: Get Your Other VM IPs

When you provision your Wallet, DEX, and Explorer VMs on Spaceship, SSH into each and run:

```bash
# On each VM
ip addr show eth0 | grep "inet " | awk '{print $2}'
```

Record these IPs and update:
- `SPACESHIP_NETWORK_CONFIG.md` - Update the "TODO" sections
- Your Spaceship network config file

### Step 5: Deploy Services to Other VMs

Once you have the other VM IPs, follow:

**📖 [SPACESHIP_QUICK_START.md](docs/SPACESHIP_QUICK_START.md)** - Steps 4, 5, and 6

Or use the detailed guide:

**📖 [SPACESHIP_DEPLOYMENT.md](docs/SPACESHIP_DEPLOYMENT.md)** - Complete reference

---

## 🔐 Verify Everything Works

Test your blockchain deployment:

```bash
# Test RLP encoding (verifies your setup)
npm run test:rlp

# Expected output:
# ✓ Connected to blockchain
# ✓ Gas Price: XX gwei
# ✓ Transaction serializes correctly
```

Test from a browser once you deploy the frontend:

```bash
# When wallet VM is ready:
curl https://tipschain.sbs/api/health

# When DEX VM is ready:
curl https://dex.tipschain.sbs/api/dex/tokens

# When explorer VM is ready:
curl https://scan.tipspay.org/api/explorer/blocks
```

---

## 📊 Your Deployment Architecture

```
Your Spaceship VPC (10.200.200.0/23)
│
├─ Blockchain VM: 209.74.86.128 ✅ DEPLOYED
│  └─ Besu RPC: http://209.74.86.128:8545
│
├─ Wallet VM: [IP TBD] (next)
│  ├─ Domain: tipschain.sbs
│  └─ Port: 443 (HTTPS)
│
├─ DEX VM: [IP TBD] (next)
│  ├─ Domain: dex.tipschain.sbs
│  └─ Port: 443 (HTTPS)
│
└─ Explorer VM: [IP TBD] (next)
   ├─ Domain: scan.tipspay.org
   └─ Port: 443 (HTTPS)
```

---

## 🔍 Monitor Your Blockchain

SSH into your Blockchain VM and check logs:

```bash
# SSH to blockchain
ssh root@209.74.86.128

# Watch blockchain logs
docker logs -f tipschain-besu

# Check if Besu is syncing
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":false,"id":1}
# (false = synced and ready)

# Check block number
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 📝 Configuration Files

These files contain important setup information:

| File | Purpose |
|------|---------|
| **SPACESHIP_BLOCKCHAIN_CONFIG.env** | Your blockchain RPC info (auto-generated) |
| **SPACESHIP_NETWORK_CONFIG.md** | Your network topology & IPs |
| **.env.production** | Contract addresses & API endpoints (you create) |
| **docs/SPACESHIP_QUICK_START.md** | 30-minute deployment guide |
| **docs/SPACESHIP_DEPLOYMENT.md** | Complete detailed reference |
| **SPACESHIP_DEPLOYMENT_CHECKLIST.md** | Step-by-step verification |

---

## ❓ Troubleshooting

### "SSH connection refused"
```bash
# Verify IP is correct
# Verify SSH key is configured
# Try:
ssh root@209.74.86.128
```

### "curl: Connection refused"
```bash
# Besu might still be starting
# Wait 2-3 minutes and try again
sleep 120
curl http://209.74.86.128:8545 -X POST ...
```

### "RLP encoding error"
See: **[docs/BESU_RLP_ERROR_FIX.md](docs/BESU_RLP_ERROR_FIX.md)**

```bash
npm run test:rlp
npm run diagnose
```

### Cannot deploy contracts
```bash
# Check RPC is working
npm run diagnose

# Verify .env.production has correct RPC URL
cat .env.production | grep BLOCKCHAIN_RPC_URL

# Try again
npm run deploy:mainnet
```

---

## 📚 Full Documentation

**Quick References:**
- [SPACESHIP_QUICK_START.md](docs/SPACESHIP_QUICK_START.md) - 30-min guide
- [SPACESHIP_NETWORK_CONFIG.md](SPACESHIP_NETWORK_CONFIG.md) - Your network topology
- [QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Command cheat sheet

**Detailed Guides:**
- [SPACESHIP_DEPLOYMENT.md](docs/SPACESHIP_DEPLOYMENT.md) - Complete reference
- [SPACESHIP_DEPLOYMENT_CHECKLIST.md](SPACESHIP_DEPLOYMENT_CHECKLIST.md) - Verification steps

**Troubleshooting:**
- [BESU_RLP_ERROR_FIX.md](docs/BESU_RLP_ERROR_FIX.md) - Blockchain errors
- [RLP_ENCODING_FIX.md](docs/RLP_ENCODING_FIX.md) - Application errors

---

## 🎯 Timeline

| Step | Time | Status |
|------|------|--------|
| Blockchain deployment | 5 min | ✅ Ready |
| Contract deployment | 10 min | ⏳ Next |
| Wallet VM setup | 10 min | ⏳ Then |
| DEX VM setup | 10 min | ⏳ Then |
| Explorer VM setup | 10 min | ⏳ Then |
| Verification & testing | 10 min | ⏳ Finally |
| **TOTAL** | **~55 min** | |

---

## ✨ You're Almost There!

Your Blockchain is deployed and ready. Next:

1. **Deploy smart contracts:**
   ```bash
   npm run compile
   npm run deploy:mainnet
   ```

2. **Get other VM IPs** from Spaceship

3. **Deploy to wallet, DEX, and explorer VMs**

4. **Point DNS to the new VMs**

5. **Users can start tipping!** 🎉

---

## 💬 Need Help?

1. Check **[SPACESHIP_QUICK_START.md](docs/SPACESHIP_QUICK_START.md)** for next steps
2. See **[SPACESHIP_DEPLOYMENT_CHECKLIST.md](SPACESHIP_DEPLOYMENT_CHECKLIST.md)** for verification
3. Review **[docs/BESU_RLP_ERROR_FIX.md](docs/BESU_RLP_ERROR_FIX.md)** for blockchain issues
4. Run `npm run diagnose` to test your setup

---

**Status: Blockchain Deployed ✅**

Your TipsChain blockchain is live and ready for business!
