# TipsChain Spaceship Deployment - Quick Start

**Status:** Production Ready ✅  
**Updated:** April 2026  
**Author:** GitHub Copilot

---

## 🚀 Executive Summary

Deploy a complete TipsChain ecosystem on Spaceship VMs in 30 minutes:
- ✅ Blockchain node (Besu) with RPC
- ✅ Wallet service (tipschain.sbs)
- ✅ DEX service (dex.tipschain.sbs)
- ✅ Block Explorer (scan.tipspay.org)

**All with gassless transactions and TIPS native gas token.**

---

## 📋 Prerequisites

Before starting, you need:

1. **4 Spaceship VMs** (or can use fewer with load balancing)
   - VM1: Besu blockchain (2+ GB RAM, 20GB disk)
   - VM2: Wallet service (2+ GB RAM)
   - VM3: DEX service (2+ GB RAM)
   - VM4: Explorer service (2+ GB RAM)

2. **Domain Names** (with DNS access)
   - `tipschain.sbs` → Wallet VM IP
   - `dex.tipschain.sbs` → DEX VM IP
   - `scan.tipspay.org` → Explorer VM IP

3. **Files from Repository**
   ```bash
   git clone https://github.com/tipspay-dev/tipschain-ecosystem.git
   cd tipschain-ecosystem
   ```

4. **Private Keys** (never share these!)
   - Deployer private key (for contracts)
   - Relayer private key (for gassless txs)

---

## ⚡ Quick Start (30 min)

### Step 1: Prepare .env Files (5 min)

Create `.env.production` in repository root:

```bash
# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://[BLOCKCHAIN_VM_IP]:8545
BLOCKCHAIN_CHAIN_ID=19251925
PRIVATE_KEY=0x[your_private_key_here]

# Relayer (Gassless Transactions)
RELAYER_PRIVATE_KEY=0x[relayer_key_here]
TRUSTED_FORWARDER_ADDRESS=0x0000000000000000000000000000000000000000  # Will be set after deploy

# Token Addresses (After first deployment)
TIPSCOIN_ADDRESS=0x0000000000000000000000000000000000000000
USDTC_ADDRESS=0x0000000000000000000000000000000000000000

# DEX Routing
DEX_ROUTER_ADDRESS=0x0000000000000000000000000000000000000000
DEX_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000

# Frontend URLs
NEXT_PUBLIC_WALLET_URL=https://tipschain.sbs
NEXT_PUBLIC_DEX_URL=https://dex.tipschain.sbs
NEXT_PUBLIC_EXPLORER_URL=https://scan.tipspay.org
```

### Step 2: Deploy Smart Contracts (10 min)

From your local development machine:

```bash
# 1. Compile contracts
npm run compile

# 2. Deploy to Spaceship Besu
npm run deploy:mainnet

# 3. Commands output contract addresses, copy them to .env.production
# Example output:
# TipsCoin deployed to: 0xabc123...
# USDTC deployed to: 0xdef456...
# TrustedForwarder deployed to: 0xghi789...
```

### Step 3: Setup Blockchain VM (5 min)

SSH into Blockchain VM:

```bash
# SSH to VM1
ssh root@[BLOCKCHAIN_VM_IP]

# 1. Create directories
mkdir -p /opt/besu/{config,data}
cd /opt/besu

# 2. Copy files from this repo
# (Copy config/genesis.json and config/besu.toml to /opt/besu/config/)

# 3. Start Besu with Docker
docker run -d \
  --name tipschain-besu \
  --restart unless-stopped \
  -p 8545:8545 \
  -p 30303:30303 \
  -p 30303:30303/udp \
  -v /opt/besu/config:/etc/besu \
  -v /opt/besu/data:/var/lib/besu \
  hyperledger/besu:23.10.0 \
  --config-file=/etc/besu/besu.toml \
  --data-path=/var/lib/besu

# 4. Wait 2-3 minutes for startup
sleep 120

# 5. Verify it's running
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x4afc1d","id":1}
```

### Step 4: Setup Wallet VM (5 min)

SSH into Wallet VM:

```bash
# SSH to VM2
ssh root@[WALLET_VM_IP]

# 1. Install dependencies
curl -fsSL https://deb.nodesource.com/setup_20.x | bash
apt-get install -y nodejs nginx certbot python3-certbot-nginx

# 2. Clone and setup
git clone https://github.com/tipspay-dev/tipschain-ecosystem.git
cd tipschain-ecosystem

# 3. Copy .env.production from step 1
# (Add API configs specific to wallet)

# 4. Install and build
npm install --production
npm run build

# 5. Start with PM2
npm install -g pm2
pm2 start "npm start" --name wallet
pm2 startup
pm2 save

# 6. Setup Nginx (see SPACESHIP_DEPLOYMENT.md)
# Copy config/nginx-wallet.conf to /etc/nginx/sites-available/tipschain.sbs
# Enable it: ln -s /etc/nginx/sites-available/tipschain.sbs /etc/nginx/sites-enabled/
# Restart: systemctl restart nginx

# 7. Get SSL certificate
certbot certonly --nginx -d tipschain.sbs
```

### Step 5: Setup DEX VM (5 min)

Repeat Step 4 but for DEX service:
- Domain: `dex.tipschain.sbs`
- Config: `config/nginx-dex.conf`

### Step 6: Setup Explorer VM (5 min)

Repeat Step 4 but for Explorer service:
- Domain: `scan.tipspay.org`
- Config: `config/nginx-explorer.conf`

---

## ✅ Verification Checklist

After deployment, verify everything works:

```bash
# 1. Test RPC endpoint
curl http://[BLOCKCHAIN_VM_IP]:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# 2. Test Wallet
curl -k https://tipschain.sbs/api/health

# 3. Test DEX
curl -k https://dex.tipschain.sbs/api/dex/tokens

# 4. Test Explorer
curl -k https://scan.tipspay.org/api/explorer/blocks

# 5. Test gassless swap
npm run test:gassless-swap
```

Expected results: ✅ All endpoints respond with JSON data

---

## 📊 Architecture

```
                        Internet
                           ↓
        ┌──────────────────────────────────────┐
        │   Nginx Load Balancer / SSL Proxy    │
        └──────┬──────────────┬──────┬─────────┘
               │              │      │
       ┌───────↓──┐   ┌──────↓──┐   └→ scan.tipspay.org
       │ Wallet   │   │   DEX   │       (Explorer)
       │ VM2:3000 │   │ VM3:3000│
       └────┬──────┘   └────┬────┘
            │              │
            └──────────────┴──────────┬──────────┐
                                     ↓          ↓
                          ┌──────────────────────────┐
                          │  Besu Blockchain (VM1)   │
                          │      Port 8545 RPC       │
                          │   Chain ID: 19251925     │
                          └──────────────────────────┘
```

---

## 🔧 Configuration Files

All config files are in the `config/` directory:

| File | Purpose |
|------|---------|
| `config/genesis.json` | Blockchain genesis block |
| `config/besu.toml` | Besu node configuration |
| `config/nginx.conf` | Nginx master config |
| `config/nginx-wallet.conf` | Wallet domain config |
| `config/nginx-dex.conf` | DEX domain config |
| `config/nginx-explorer.conf` | Explorer domain config |
| `docker-compose.spaceship.yml` | Docker Compose for all services |

---

## 🚨 Troubleshooting

### "Connection refused" on blockchain RPC
```bash
# Check if Besu is running
docker ps | grep besu

# Check logs
docker logs tipschain-besu

# Verify port is open
netstat -tlnp | grep 8545
```

### "SSL certificate not found"
```bash
# Regenerate certificate
certbot certonly --nginx -d tipschain.sbs

# Check certificate validity
openssl s_client -connect tipschain.sbs:443 -servername tipschain.sbs
```

### "RLP encoding error"
See: [docs/BESU_RLP_ERROR_FIX.md](../docs/BESU_RLP_ERROR_FIX.md)

```bash
# Diagnose
npm run diagnose
npm run test:rlp
```

### "Gassless swap failing"
```bash
# Test the flow
npm run test:gassless-swap

# Check relayer balance
npm run test:rlp | grep "Relayer balance"

# Fund relayer if needed!
```

---

## 📚 Documentation

For detailed information, see:

| Document | Use Case |
|----------|----------|
| **SPACESHIP_DEPLOYMENT.md** | Complete step-by-step guide (this file) |
| **docs/BESU_RLP_ERROR_FIX.md** | Blockchain RLP encoding issues |
| **docs/RLP_ENCODING_FIX.md** | Application RLP encoding issues |
| **docs/QUICK_REFERENCE.md** | Developer commands cheat sheet |
| **docs/ARCHITECTURE.md** | System design details |

---

## 🔐 Security Checklist

- [ ] Private keys stored only in .env (never in code)
- [ ] Database backups stored securely
- [ ] SSL certificates auto-renewing
- [ ] Firewall configured (only needed ports open)
- [ ] SSH keys configured (no password auth)
- [ ] Rate limiting configured
- [ ] Regular security updates applied
- [ ] Monitoring and alerting enabled

---

## 💰 Cost Optimization

**Combine VMs for cost savings:**

```
Option 1: Separate VMs (Recommended for production)
├── VM1: Besu (8GB RAM, 100GB disk) - $100/mo
├── VM2: Wallet (4GB RAM, 20GB disk) - $40/mo
├── VM3: DEX (4GB RAM, 20GB disk) - $40/mo
└── VM4: Explorer (4GB RAM, 20GB disk) - $40/mo
Total: ~$220/month

Option 2: Combined VMs (For testing)
├── VM1: Besu + Wallet (8GB RAM, 50GB disk)
├── VM2: DEX (4GB RAM, 20GB disk)
└── VM3: Explorer (4GB RAM, 20GB disk)
Total: ~$100/month

Option 3: Single VM (Development only)
└── VM1: Everything (16GB RAM, 100GB disk)
Total: ~$80/month
```

**Scaling for mainnet:**
- Add load balancer (Spaceship or Cloudflare)
- Add replica nodes for redundancy
- Add caching layer (Redis)
- Use CDN for static assets

---

## 📞 Support

- **Issues during setup?** Check the troubleshooting section above
- **RLP encoding errors?** See BESU_RLP_ERROR_FIX.md
- **API not responding?** Check PM2 logs: `pm2 logs`
- **Need more help?** Review detailed guide: SPACESHIP_DEPLOYMENT.md

---

## 🎯 Next Steps After Deployment

1. **Monitor the services:**
   ```bash
   pm2 logs       # Application logs
   docker logs tipschain-besu  # Blockchain logs
   ```

2. **Fund the relayer:**
   ```bash
   # Send ETH/TIPS to relayer address so it can pay gas
   npm run test:rlp
   ```

3. **Test end-to-end:**
   ```bash
   npm run test:gassless-swap
   ```

4. **Configure backups:**
   ```bash
   # Backup blockchain data weekly
   tar -czf besu-backup.tar.gz /opt/besu/data
   ```

5. **Enable monitoring:**
   - Setup uptime monitoring (UptimeRobot, Statuspage)
   - Setup error alerts (Sentry, LogRocket)
   - Setup metrics (Prometheus, Grafana)

---

## ✨ You're Done!

Your TipsChain ecosystem is now live on Spaceship! 

- **Wallet:** https://tipschain.sbs
- **DEX:** https://dex.tipschain.sbs
- **Explorer:** https://scan.tipspay.org
- **RPC Endpoint:** http://[BLOCKCHAIN_VM_IP]:8545

Users can now:
- ✅ Connect their Web3 wallet
- ✅ Perform gassless swaps (relayer pays gas)
- ✅ View transactions on the block explorer
- ✅ Tip content creators with TIPS tokens

**Celebration time!** 🎉

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** PRODUCTION READY ✅
