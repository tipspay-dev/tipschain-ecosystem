# TipsChain Spaceship Deployment Guide

Complete deployment guide for TipsChain ecosystem on Spaceship VMs with multi-domain setup.

## Architecture Overview

```
Spaceship Infrastructure
├── VM 1: Blockchain (Besu)
│   └── Port 8545 (RPC endpoint)
│
├── VM 2: Wallet Service  
│   └── tipschain.sbs (Next.js frontend + wallet APIs)
│
├── VM 3: DEX Service
│   └── dex.tipschain.sbs (DEX interface + swap APIs)
│
└── VM 4: Block Explorer
    └── scan.tipspay.org (Blockscout-compatible explorer)
```

---

## Pre-Deployment Checklist

- [ ] All 4 VMs provisioned on Spaceship
- [ ] Domain DNS configured:
  - [ ] tipschain.sbs → Wallet VM IP
  - [ ] dex.tipschain.sbs → DEX VM IP
  - [ ] scan.tipspay.org → Explorer VM IP
- [ ] RPC endpoint accessible from all services
- [ ] SSL certificates ready (Let's Encrypt recommended)
- [ ] Firewall rules configured
- [ ] Environment variables prepared

---

## Step 1: Blockchain Node Deployment (VM 1)

### 1.1 SSH into Blockchain VM

```bash
ssh root@[BLOCKCHAIN_VM_IP]
```

### 1.2 Install Dependencies

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker root

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### 1.3 Create Besu Directory Structure

```bash
mkdir -p /opt/besu/{data,config}
cd /opt/besu

# Create genesis file
cat > config/genesis.json << 'EOF'
{
  "config": {
    "chainId": 19251925,
    "homesteadBlock": 0,
    "eip150Block": 0,
    "eip155Block": 0,
    "eip158Block": 0,
    "byzantiumBlock": 0,
    "constantinopleBlock": 0,
    "petersburgBlock": 0,
    "istanbulBlock": 0,
    "londonBlock": 0,
    "berlinBlock": 0,
    "engine": "CLIQUE"
  },
  "difficulty": "0x1",
  "extraData": "0x00000000000000000000000000000000000000000000000000000000000000007cffaa0e4485c3886c60a090d8d75fb3344bc87c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  "gasLimit": "0xffffffffffffff",
  "nonce": "0x0",
  "number": "0x0",
  "timestamp": "0x0",
  "coinbase": "0x0000000000000000000000000000000000000000",
  "alloc": {
    "0x7cffaa0e4485c3886c60a090d8d75fb3344bc87c": {
      "balance": "0x56bc75e2d630eb20000000"
    }
  }
}
EOF

# Create Besu configuration
cat > config/besu.toml << 'EOF'
[Node]
p2p-port = 30303
rpc-http-enabled = true
rpc-http-host = "0.0.0.0"
rpc-http-port = 8545
rpc-http-api = ["ETH", "NET", "WEB3"]
rpc-http-allow-host = "*"
data-path = "/var/lib/besu"
genesis-file = "/etc/besu/genesis.json"
logging = "INFO"

[Network]
network-id = 19251925

[RPC]
rpc-http-max-active-connections = 100
EOF

chmod 644 config/genesis.json config/besu.toml
```

### 1.4 Deploy Besu with Docker Compose

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  besu:
    image: hyperledger/besu:23.10.0
    container_name: tipschain-besu
    ports:
      - "8545:8545"
      - "30303:30303"
      - "30303:30303/udp"
    volumes:
      - ./config/besu.toml:/etc/besu/besu.toml:ro
      - ./config/genesis.json:/etc/besu/genesis.json:ro
      - ./data:/var/lib/besu
    command:
      - --config-file=/etc/besu/besu.toml
      - --genesis-file=/etc/besu/genesis.json
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:8545 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"net_version\",\"params\":[],\"id\":1}' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  besu-data:
    driver: local
EOF

# Start Besu
docker compose up -d

# Wait for startup (3-5 minutes) and check logs
sleep 30
docker compose logs -f besu
```

### 1.5 Verify Blockchain Node

```bash
# Test RPC endpoint
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Expected response:
# {"jsonrpc":"2.0","result":"0x4afc1d","id":1}

# Check if synced
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","result":false,"id":1}
```

---

## Step 2: Deploy Smart Contracts

### 2.1 On Development Machine (Local)

```bash
# Clone and setup
git clone https://github.com/tipspay-dev/tipschain-ecosystem.git
cd tipschain-ecosystem

# Create production .env
cat > .env.production << 'EOF'
# Blockchain
BLOCKCHAIN_RPC_URL=http://[BLOCKCHAIN_VM_IP]:8545
BLOCKCHAIN_CHAIN_ID=19251925
PRIVATE_KEY=0x[YOUR_PRIVATE_KEY]

# Token Addresses (will be filled after deployment)
TIPSCOIN_ADDRESS=0x
USDTC_ADDRESS=0x

# Relayer
RELAYER_PRIVATE_KEY=0x[RELAYER_KEY]
TRUSTED_FORWARDER_ADDRESS=0x

# DEX
DEX_ROUTER_ADDRESS=0x
DEX_FACTORY_ADDRESS=0x

# Domains
WALLET_URL=https://tipschain.sbs
DEX_URL=https://dex.tipschain.sbs
EXPLORER_URL=https://scan.tipspay.org
EOF

# Deploy contracts
npm run compile
npm run deploy:mainnet  # Deploys to BLOCKCHAIN_RPC_URL

# Save contract addresses to .env.production
# Update TIPSCOIN_ADDRESS, USDTC_ADDRESS, etc.
```

### 2.2 Verify Deployment

```bash
# Test blockchain connection
npm run test:rlp

# Verify all contracts are correctly deployed
npm run diagnose
```

---

## Step 3: Wallet Service Deployment (VM 2)

### 3.1 SSH into Wallet VM

```bash
ssh root@[WALLET_VM_IP]
cd /opt/wallet
```

### 3.2 Setup Application

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs nginx certbot python3-certbot-nginx

# Clone repository
git clone https://github.com/tipspay-dev/tipschain-ecosystem.git tipschain
cd tipschain

# Install dependencies
npm install --production

# Setup environment
cat > .env.production << 'EOF'
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://[BLOCKCHAIN_VM_IP]:8545
NEXT_PUBLIC_BLOCKCHAIN_CHAIN_ID=19251925
NEXT_PUBLIC_TIPSCOIN_ADDRESS=[FROM_DEPLOYMENT]
NEXT_PUBLIC_USDTC_ADDRESS=[FROM_DEPLOYMENT]
NEXT_PUBLIC_WALLET_URL=https://tipschain.sbs
NEXT_PUBLIC_DEX_URL=https://dex.tipschain.sbs
NEXT_PUBLIC_EXPLORER_URL=https://scan.tipspay.org
API_BASE_URL=https://tipschain.sbs
EOF

# Build application
npm run build

# Create PM2 configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tipschain-wallet',
    script: './node_modules/.bin/next',
    args: 'start -p 3000',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Install PM2
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3.3 Setup Nginx Reverse Proxy

```bash
# Create Nginx config
cat > /etc/nginx/sites-available/wallet << 'EOF'
upstream wallet_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name tipschain.sbs;

    location / {
        proxy_pass http://wallet_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/wallet /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3.4 Setup SSL Certificate (Let's Encrypt)

```bash
certbot certonly --nginx -d tipschain.sbs

# Update Nginx config for HTTPS
cat > /etc/nginx/sites-available/wallet << 'EOF'
upstream wallet_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name tipschain.sbs;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tipschain.sbs;

    ssl_certificate /etc/letsencrypt/live/tipschain.sbs/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tipschain.sbs/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://wallet_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

systemctl restart nginx

# Setup auto-renewal
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## Step 4: DEX Service Deployment (VM 3)

### 4.1 SSH into DEX VM

```bash
ssh root@[DEX_VM_IP]
cd /opt/dex
```

### 4.2 Same as Wallet but with DEX domain

```bash
# Similar setup to VM 2, but:
# - Use dex.tipschain.sbs instead of tipschain.sbs
# - Different Next.js configuration for DEX UI

cat > /etc/nginx/sites-available/dex << 'EOF'
upstream dex_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name dex.tipschain.sbs;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dex.tipschain.sbs;

    ssl_certificate /etc/letsencrypt/live/dex.tipschain.sbs/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dex.tipschain.sbs/privkey.pem;
    
    location / {
        proxy_pass http://dex_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
EOF
```

---

## Step 5: Block Explorer Deployment (VM 4)

### 5.1 SSH into Explorer VM

```bash
ssh root@[EXPLORER_VM_IP]
cd /opt/explorer
```

### 5.2 Deploy Block Explorer

```bash
# Same Next.js application but with explorer pages

cat > /etc/nginx/sites-available/explorer << 'EOF'
upstream explorer_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name scan.tipspay.org;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name scan.tipspay.org;

    ssl_certificate /etc/letsencrypt/live/scan.tipspay.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/scan.tipspay.org/privkey.pem;
    
    location / {
        proxy_pass http://explorer_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF
```

---

## Step 6: Configure Relayer Service

The relayer needs access to:
1. Private key for signing transactions
2. RPC endpoint for gas price queries
3. TrustedForwarder contract address

```bash
# On any service VM where relayer runs:

cat >> .env.production << 'EOF'
RELAYER_PRIVATE_KEY=0x[YOUR_RELAYER_KEY]
TRUSTED_FORWARDER_ADDRESS=0x[FROM_DEPLOYMENT]
BLOCKCHAIN_RPC_URL=http://[BLOCKCHAIN_VM_IP]:8545
EOF

# Restart services
pm2 restart all
```

---

## Step 7: Domain DNS Configuration

Update your DNS records to point to the VM IPs:

```bash
# In your DNS provider (Cloudflare, Route53, etc.)

tipschain.sbs              A  [WALLET_VM_IP]
dex.tipschain.sbs         A  [DEX_VM_IP]
scan.tipspay.org          A  [EXPLORER_VM_IP]
```

Wait for DNS propagation (5-15 minutes).

---

## Step 8: Testing & Verification

### 8.1 Verify All Services

```bash
# From any machine:

# Test Wallet
curl -1 https://tipschain.sbs/api/health

# Test DEX  
curl -1 https://dex.tipschain.sbs/api/health

# Test Explorer
curl -1 https://scan.tipspay.org/api/health

# Test Blockchain RPC
curl http://[BLOCKCHAIN_VM_IP]:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### 8.2 Test Gassless Swaps

```bash
# On wallet VM:
npm run test:gassless-swap

# On DEX VM:
npm run test:gassless-swap

# Should show:
# ✓ API server is running
# ✓ Supported tokens listed
# ✓ Swap quote received
# ✓ Transaction serializes correctly
```

### 8.3 Production Verification

```bash
# On each VM:
bash scripts/production-verification.sh

# Should show all checks passing
```

---

## Monitoring & Maintenance

### 8.1 Monitor Services

```bash
# Watch application logs
pm2 logs

# Monitor system resources
htop

# Check Besu logs
docker compose logs -f besu

# Check database size
du -sh /opt/besu/data
du -sh /opt/wallet/node_modules
```

### 8.2 Regular Maintenance

```bash
# Update system packages (monthly)
apt-get update && apt-get upgrade -y

# Renew SSL certificates (automatic with certbot timer)
certbot renew --dry-run

# Backup database (weekly)
tar -czf besu-backup-$(date +%Y%m%d).tar.gz /opt/besu/data

# Check disk space (weekly)
df -h

# Monitor relayer balance
npm run test:rlp | grep "Relayer balance"
```

---

## Troubleshooting

### RLP Encoding Errors

See: [BESU_RLP_ERROR_FIX.md](BESU_RLP_ERROR_FIX.md)

```bash
# Diagnose
npm run diagnose

# Test
npm run test:rlp
npm run test:gassless-swap
```

### Service Not Responding

```bash
# Check if process is running
pm2 list

# Restart if needed
pm2 restart all

# Check logs for errors
pm2 logs | grep ERROR
```

### Blockchain RPC Not Accessible

```bash
# Check Docker container
docker ps | grep besu

# Check port binding
netstat -tlnp | grep 8545

# Verify firewall
ufw status

# Allow port
ufw allow 8545/tcp
```

### SSL Certificate Issues

```bash
# Force renewal
certbot renew --force-renewal

# Check certificate
openssl s_client -connect tipschain.sbs:443 -servername tipschain.sbs
```

---

## Rollback Procedures

### Revert to Previous Version

```bash
# On affected VM
git log --oneline
git checkout [PREVIOUS_COMMIT]
npm run build
pm2 restart all
```

### Restore Database Backup

```bash
# On blockchain VM
docker compose down
tar -xzf besu-backup-[DATE].tar.gz
docker compose up -d
```

---

## Security Checklist

- [ ] SSH keys secured (disable password auth)
- [ ] Firewall configured (only necessary ports open)
- [ ] SSL certificates installed and auto-renewing
- [ ] Private keys in environment variables (not in code)
- [ ] Regular security updates applied
- [ ] Database backups stored securely
- [ ] Rate limiting configured on APIs
- [ ] DDoS protection enabled (Cloudflare recommended)
- [ ] Regular security audits performed

---

## Final Verification

Once everything is deployed:

```bash
# From your local machine:
curl -1 https://tipschain.sbs           # Should load wallet
curl -1 https://dex.tipschain.sbs       # Should load DEX
curl -1 https://scan.tipspay.org        # Should load explorer

# Test API endpoints:
curl https://tipschain.sbs/api/wallet/balance?address=0x...
curl https://dex.tipschain.sbs/api/dex/tokens
curl https://scan.tipspay.org/api/explorer/blocks

# All should respond with JSON data ✓
```

---

## Support

- **RLP Errors:** See docs/BESU_RLP_ERROR_FIX.md
- **Application Issues:** See docs/RLP_ENCODING_FIX.md  
- **Quick Reference:** See docs/QUICK_REFERENCE.md
- **Architecture Details:** See docs/ARCHITECTURE.md

**Status: PRODUCTION DEPLOYMENT READY** ✅
