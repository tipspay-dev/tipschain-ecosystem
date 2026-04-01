# TipsChain Spaceship Deployment Configuration
## Your Specific Network Setup

**Date Created:** April 1, 2026  
**Status:** Ready for Deployment

---

## 🌐 Network Configuration

### Blockchain VM (IDENTIFIED) ✅
```
Service: Besu Blockchain (RCP Endpoint)
Public IP: 209.74.86.128
Private IP: 10.200.200.10
Subnet: 255.255.255.0
VPC: default-vpc (10.200.200.0/23)
Port: 8545 (JSON-RPC HTTP)
Port: 30303 (P2P networking)
```

**Access URLs:**
```
Internal RPC (from other VMs): http://10.200.200.10:8545
External RPC (if needed):      http://209.74.86.128:8545
```

### Wallet VM (TODO)
```
Service: Web3 Wallet Interface
Domain: tipschain.sbs → [WALLET_VM_IP]
Public IP: _____________________
Private IP: _____________________
Port: 443 (HTTPS)
Port: 80 (HTTP redirect)
```

### DEX VM (TODO)
```
Service: Decentralized Exchange
Domain: dex.tipschain.sbs → [DEX_VM_IP]
Public IP: _____________________
Private IP: _____________________
Port: 443 (HTTPS)
Port: 80 (HTTP redirect)
```

### Explorer VM (TODO)
```
Service: Block Explorer
Domain: scan.tipspay.org → [EXPLORER_VM_IP]
Public IP: _____________________
Private IP: _____________________
Port: 443 (HTTPS)
Port: 80 (HTTP redirect)
```

---

## 📝 Next Steps

### Step 1: Get Other VM IPs
SSH into each of your other 3 VMs and run:

```bash
# Get public and private IPs
ip addr show
# or
ifconfig

# For Spaceship VMs specifically, also check:
cat /var/lib/dhcp/dhclient*.leases | grep -i "fixed-address"
```

Record the IPs in the sections above.

### Step 2: Update Your .env Configuration

```bash
# Create .env.production with these values:

# BLOCKCHAIN VM (You have this one!)
BLOCKCHAIN_RPC_URL=http://10.200.200.10:8545
BLOCKCHAIN_CHAIN_ID=19251925
BLOCKCHAIN_PUBLIC_RPC=http://209.74.86.128:8545  # Optional, for public access

# Your deployer account
PRIVATE_KEY=0x[your_private_key]
RELAYER_PRIVATE_KEY=0x[your_relayer_key]

# URLs for frontend configuration
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://209.74.86.128:8545
NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=19251925
NEXT_PUBLIC_WALLET_URL=https://tipschain.sbs
NEXT_PUBLIC_DEX_URL=https://dex.tipschain.sbs
NEXT_PUBLIC_EXPLORER_URL=https://scan.tipspay.org
```

### Step 3: Configure Internal VPC Communication

Since your services are on the same VPC (10.200.200.0/23), they can communicate via private IPs for better performance:

**Wallet VM → Blockchain VM:**
```javascript
// Use private IP for internal communication (faster, free bandwidth)
const provider = new ethers.JsonRpcProvider('http://10.200.200.10:8545');
// Frontend users use: http://209.74.86.128:8545
```

### Step 4: Deploy to Blockchain VM First

```bash
# 1. On your local machine, deploy contracts
npm run compile
npm run deploy:mainnet  # Uses BLOCKCHAIN_RPC_URL

# 2. SSH to Blockchain VM
ssh root@209.74.86.128

# 3. Start Besu (as documented in SPACESHIP_QUICK_START.md)
mkdir -p /opt/besu/{config,data}
cd /opt/besu

# Copy genesis.json and besu.toml, then:
docker run -d --name tipschain-besu \
  --restart unless-stopped \
  -p 8545:8545 \
  -p 30303:30303 \
  -p 30303:30303/udp \
  -v /opt/besu/config:/etc/besu \
  -v /opt/besu/data:/var/lib/besu \
  hyperledger/besu:23.10.0 \
  --config-file=/etc/besu/besu.toml \
  --data-path=/var/lib/besu

# 4. Verify it's running
sleep 120
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":"0x4afc1d","id":1}
```

### Step 5: Configure Other VMs

Once you have the IPs of the other 3 VMs, update this file with them and follow [SPACESHIP_QUICK_START.md](SPACESHIP_QUICK_START.md) for each.

---

## 🔐 Security Configuration

### Firewall Rules by VM

**Blockchain VM (209.74.86.128)**
```bash
ssh root@209.74.86.128

# Enable firewall
ufw enable

# Allow SSH from your IP only (more secure)
ufw allow from [YOUR_IP]/32 to any port 22

# Allow port 8545 from other VMs (internal network)
ufw allow from 10.200.200.0/23 to any port 8545

# Allow P2P networking if you want it public
ufw allow 30303/tcp
ufw allow 30303/udp

# Check rules
ufw status
```

**Wallet/DEX/Explorer VMs**
```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH
ufw allow 22/tcp

# Block everything else by default
ufw default deny incoming
```

### Internal Communication Network

Your VMs can communicate securely via private IPs without going through the internet:

```
Wallet VM (10.200.200.x) 
    ↓ (private network - free)*
Blockchain VM (10.200.200.10)
    ↑ (private network)
DEX VM (10.200.200.x)

Explorer VM (10.200.200.x)
    ↓ (private network - free)
Blockchain RPC
```

*Private network communication doesn't count against bandwidth limits on most cloud providers.

---

## 📊 Network Diagram

```
INTERNET
    │
    ├─ Domain DNS ─────────────────────────────────────┐
    │             ├─ tipschain.sbs → [WALLET_IP]      │
    │             ├─ dex.tipschain.sbs → [DEX_IP]     │
    │             └─ scan.tipspay.org → [EXPLORER_IP] │
    │
    ├── Public IPs (External Access) ──────────────┐
    │                                               │
    │   Wallet VM (209.74.86.x)                    │
    │       ↓ HTTPS:443 ←←←← Users               │
    │   Nginx Proxy ──→ Next.js:3000              │
    │       │                                      │
    │   DEX VM (209.74.86.x)                      │
    │       ↓ HTTPS:443 ←←←← Users               │
    │   Nginx Proxy ──→ Next.js:3000              │
    │       │                                      │
    │   Explorer VM (209.74.86.x)                 │
    │       ↓ HTTPS:443 ←←←← Users               │
    │   Nginx Proxy ──→ Next.js:3000              │
    │                                              │
    └──────────────────────┬──────────────────────┘
                           │
            ┌──────────────┘
            │
        [VPC Network: 10.200.200.0/23]
            │ Private network (FREE!)
            │
        Blockchain VM (10.200.200.10)
        Besu RPC:8545
        P2P:30303

    All internal VM-to-blockchain communication
    uses private IPs (10.200.200.x) for speed & cost
```

---

## 🚀 Deployment Sequence

1. **First: Deploy Blockchain VM** ✅ (You're here)
   - Copy files to 209.74.86.128
   - Start Besu
   - Verify RPC works

2. **Second: Deploy Contracts**
   - From local machine: `npm run deploy:mainnet`
   - Records contract addresses

3. **Third: Get Other VM IPs**
   - Provision wallet, DEX, explorer VMs
   - Record their public/private IPs
   - Update this config file

4. **Fourth: Deploy Wallet VM**
   - Clone repo
   - Install dependencies
   - Configure Nginx for tipschain.sbs
   - Start Next.js

5. **Fifth: Deploy DEX VM**
   - Same as Wallet but for dex.tipschain.sbs

6. **Sixth: Deploy Explorer VM**
   - Same as Wallet but for scan.tipspay.org

7. **Seventh: Verify & Monitor**
   - Test all endpoints
   - Monitor logs
   - Fund relayer account

---

## 🔗 Quick Reference URLs

Once deployed, your services will be at:

```
RPC Endpoint (Blockchain VM):
  Private (fast, from your VMs): http://10.200.200.10:8545
  Public:  http://209.74.86.128:8545

User-Facing URLs:
  Wallet:  https://tipschain.sbs
  DEX:     https://dex.tipschain.sbs
  Explorer: https://scan.tipspay.org
```

---

## 💾 Configuration Files to Use

Copy these files from the repository to the appropriate VMs:

**Blockchain VM (209.74.86.128):**
```
config/genesis.json          → /opt/besu/config/
config/besu.toml              → /opt/besu/config/
docker-compose.spaceship.yml  → /opt/besu/
```

**Wallet VM ([IP TBD]):**
```
config/nginx-wallet.conf      → /etc/nginx/sites-available/tipschain.sbs
entire repository             → /opt/tipschain-wallet/
```

**DEX VM ([IP TBD]):**
```
config/nginx-dex.conf         → /etc/nginx/sites-available/dex.tipschain.sbs
entire repository             → /opt/tipschain-dex/
```

**Explorer VM ([IP TBD]):**
```
config/nginx-explorer.conf    → /etc/nginx/sites-available/scan.tipspay.org
entire repository             → /opt/tipschain-explorer/
```

---

## ✅ Verification Commands

Test your Blockchain VM is working:

```bash
# From your local machine
curl http://209.74.86.128:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# From other VMs on same network
curl http://10.200.200.10:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Both should return a block number
```

---

## 🎯 Next Action Items

- [ ] Collect IPs from other 3 VMs
- [ ] Update the VM IP sections above with actual IPs
- [ ] SSH to Blockchain VM (209.74.86.128)
- [ ] Deploy Besu as documented
- [ ] Verify RPC endpoint is accessible
- [ ] Deploy contracts from local machine
- [ ] Deploy services to other 3 VMs

---

## 📖 Complete Documentation

- **Quick Start Guide:** [SPACESHIP_QUICK_START.md](docs/SPACESHIP_QUICK_START.md)
- **Detailed Deployment:** [SPACESHIP_DEPLOYMENT.md](docs/SPACESHIP_DEPLOYMENT.md)
- **Deployment Checklist:** [SPACESHIP_DEPLOYMENT_CHECKLIST.md](SPACESHIP_DEPLOYMENT_CHECKLIST.md)
- **RLP Error Fixes:** [docs/BESU_RLP_ERROR_FIX.md](docs/BESU_RLP_ERROR_FIX.md)

---

**Configuration Status:** Ready for Deployment ✅
**Blockchain VM:** 209.74.86.128 (Configured)
**Other VMs:** Awaiting IP addresses
