# TipsChain Spaceship Deployment Checklist

Complete this checklist as you deploy to Spaceship VMs.

**Start Time:** ___________  
**Expected Duration:** ~30-45 minutes  
**Status:** ☐ In Progress ☐ Completed ☐ Failed

---

## 📋 Pre-Deployment Phase (5 min)

- [ ] **Domain Names Ready**
  - [ ] `tipschain.sbs` domain acquired
  - [ ] `dex.tipschain.sbs` domain acquired
  - [ ] `scan.tipspay.org` domain acquired
  - [ ] DNS provider access available

- [ ] **Spaceship VMs Provisioned**
  - [ ] VM1 (Blockchain): IP _________________ Ubuntu 22.04, 2GB RAM, 20GB disk
  - [ ] VM2 (Wallet): IP _________________ Ubuntu 22.04, 2GB RAM, 20GB disk
  - [ ] VM3 (DEX): IP _________________ Ubuntu 22.04, 2GB RAM, 20GB disk
  - [ ] VM4 (Explorer): IP _________________ Ubuntu 22.04, 2GB RAM, 20GB disk

- [ ] **Private Keys Prepared** (Write somewhere safe, NOT in version control)
  - [ ] Deployer Private Key: `0x...` (first 6 chars visible)
  - [ ] Relayer Private Key: `0x...` (first 6 chars visible)
  - [ ] Stored securely in secure location or password manager

- [ ] **Repository Ready**
  - [ ] Code cloned locally: `git clone https://github.com/tipspay-dev/tipschain-ecosystem.git`
  - [ ] All config files available in `config/` directory
  - [ ] Docker files available in `docker-compose.spaceship.yml`

---

## 🔧 Environment Configuration Phase (5 min)

- [ ] **.env.production File Created**

  ```bash
  BLOCKCHAIN_RPC_URL=http://[BLOCKCHAIN_VM_IP]:8545
  BLOCKCHAIN_CHAIN_ID=19251925
  PRIVATE_KEY=0x[deployer_key]
  RELAYER_PRIVATE_KEY=0x[relayer_key]
  
  # After contract deployment (Step 2):
  TIPSCOIN_ADDRESS=0x
  USDTC_ADDRESS=0x
  TRUSTED_FORWARDER_ADDRESS=0x
  DEX_ROUTER_ADDRESS=0x
  DEX_FACTORY_ADDRESS=0x
  ```

  - [ ] File created at project root
  - [ ] All values filled in (or marked for later)
  - [ ] NEVER committed to git (check .gitignore)

- [ ] **Verified .env Format**
  - [ ] No quotes around values (except comments)
  - [ ] No trailing spaces
  - [ ] All RPC URLs valid and tested locally
  - [ ] Private keys start with `0x`

---

## 🚀 Smart Contract Deployment (10 min)

- [ ] **Local Compilation & Deployment**

  ```bash
  npm run compile
  npm run deploy:mainnet
  ```

  - [ ] No compilation errors
  - [ ] Deployment connects to BLOCKCHAIN_RPC_URL
  - [ ] Deployment completes successfully

- [ ] **Contract Addresses Captured**
  - [ ] TipsCoin address: `0x`
  - [ ] USDTC address: `0x`
  - [ ] TrustedForwarder address: `0x`
  - [ ] Tipsnameserver address: `0x`
  - [ ] All addresses added to .env.production

- [ ] **Deployment Verified**
  ```bash
  npm run test:rlp
  npm run diagnose
  ```
  - [ ] RLP test passes
  - [ ] Blockchain connection confirmed
  - [ ] All contract addresses valid

---

## 🔗 Blockchain VM Setup (5-10 min)

**SSH into Blockchain VM (VM1)**

- [ ] **SSH Connection Successful**
  ```bash
  ssh root@[BLOCKCHAIN_VM_IP]
  ```
  - [ ] Connected as root
  - [ ] Can run commands

- [ ] **Directory Structure Created**
  ```bash
  mkdir -p /opt/besu/{config,data}
  ```
  - [ ] `/opt/besu/` directory exists
  - [ ] `config` subdirectory exists
  - [ ] `data` subdirectory exists

- [ ] **Configuration Files Copied**
  - [ ] `/opt/besu/config/genesis.json` ← from `config/genesis.json`
  - [ ] `/opt/besu/config/besu.toml` ← from `config/besu.toml`
  - [ ] File permissions are readable

- [ ] **Docker Installed**
  ```bash
  docker --version
  ```
  - [ ] Docker version output shown
  - [ ] No "command not found" error

- [ ] **Besu Container Started**
  ```bash
  docker run -d --name tipschain-besu ... (see docs)
  ```
  - [ ] Container running (check: `docker ps`)
  - [ ] No error messages
  - [ ] Waiting 3-5 minutes for startup

- [ ] **Blockchain RPC Verified**
  ```bash
  curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```
  - [ ] Response includes `"result":"0x4afc1d"`
  - [ ] No connection refused errors
  - [ ] Blockchain is running and accessible

---

## 🌐 Domain DNS Configuration (5 min)

**In your DNS provider (Cloudflare, Route53, GoDaddy, etc.)**

- [ ] **DNS A Records Created**
  - [ ] `tipschain.sbs` → `[WALLET_VM_IP]` (VM2 IP)
  - [ ] `dex.tipschain.sbs` → `[DEX_VM_IP]` (VM3 IP)
  - [ ] `scan.tipspay.org` → `[EXPLORER_VM_IP]` (VM4 IP)

- [ ] **DNS Propagation Verified**
  - [ ] Wait 5-15 minutes after DNS update
  - [ ] Verify with: `nslookup tipschain.sbs`
  - [ ] Should show correct VM IP

---

## 💿 Wallet Service VM Setup (10 min)

**SSH into Wallet VM (VM2)**

- [ ] **SSH Connected**
  ```bash
  ssh root@[WALLET_VM_IP]
  ```

- [ ] **Node.js & Dependencies Installed**
  ```bash
  apt-get update && apt-get install -y nodejs nginx certbot python3-certbot-nginx
  ```
  - [ ] No errors
  - [ ] All packages installed

- [ ] **Repository Cloned**
  ```bash
  git clone https://github.com/tipspay-dev/tipschain-ecosystem.git
  cd tipschain-ecosystem
  ```
  - [ ] Directory created
  - [ ] All files present

- [ ] **Dependencies Installed**
  ```bash
  npm install --production
  ```
  - [ ] No critical errors
  - [ ] node_modules directory created

- [ ] **Application Built**
  ```bash
  npm run build
  ```
  - [ ] Build completes successfully
  - [ ] `.next` directory created

- [ ] **Application Started with PM2**
  ```bash
  npm install -g pm2
  pm2 start "npm start" --name wallet
  ```
  - [ ] Process shows as online: `pm2 list`
  - [ ] No error messages

- [ ] **Nginx Reverse Proxy Configured**
  - [ ] Copy `config/nginx-wallet.conf` to `/etc/nginx/sites-available/tipschain.sbs`
  - [ ] Enable: `ln -s /etc/nginx/sites-available/tipschain.sbs /etc/nginx/sites-enabled/`
  - [ ] Test: `nginx -t` (should say "successful")
  - [ ] Restart: `systemctl restart nginx`

- [ ] **SSL Certificate Obtained**
  ```bash
  certbot certonly --nginx -d tipschain.sbs
  ```
  - [ ] Certificate acquired successfully
  - [ ] File paths shown in output

- [ ] **HTTPS Verified**
  ```bash
  curl -k https://tipschain.sbs
  ```
  - [ ] Receives 200 response (or redirect)
  - [ ] No SSL errors (the `-k` flag allows self-signed for testing)

---

## 🔄 DEX Service VM Setup (5 min)

**SSH into DEX VM (VM3) - Repeat Wallet Setup**

- [ ] **SSH Connected**
  ```bash
  ssh root@[DEX_VM_IP]
  ```

- [ ] **Dependencies Installed** (same as wallet)
  - [ ] Node.js, npm, Nginx, Certbot

- [ ] **Repository Cloned & Built**
  - [ ] Code cloned
  - [ ] npm install done
  - [ ] npm run build done
  - [ ] PM2 running

- [ ] **Nginx for DEX Configured**
  - [ ] Use `config/nginx-dex.conf` instead
  - [ ] Domain: `dex.tipschain.sbs`
  - [ ] SSL certificate for `dex.tipschain.sbs`
  - [ ] HTTPS accessible

- [ ] **DEX Verified Accessible**
  ```bash
  curl -k https://dex.tipschain.sbs
  ```
  - [ ] 200 response received

---

## 📊 Explorer Service VM Setup (5 min)

**SSH into Explorer VM (VM4) - Repeat Wallet Setup**

- [ ] **SSH Connected**
  ```bash
  ssh root@[EXPLORER_VM_IP]
  ```

- [ ] **Dependencies Installed** (same as wallet)
  - [ ] Node.js, npm, Nginx, Certbot

- [ ] **Repository Cloned & Built**
  - [ ] Code cloned
  - [ ] npm install done
  - [ ] npm run build done
  - [ ] PM2 running

- [ ] **Nginx for Explorer Configured**
  - [ ] Use `config/nginx-explorer.conf`
  - [ ] Domain: `scan.tipspay.org`
  - [ ] SSL certificate for `scan.tipspay.org`
  - [ ] HTTPS accessible

- [ ] **Explorer Verified Accessible**
  ```bash
  curl -k https://scan.tipspay.org
  ```
  - [ ] 200 response received

---

## ✅ Post-Deployment Verification (10 min)

From your local machine:

- [ ] **RPC Endpoint Test**
  ```bash
  curl http://[BLOCKCHAIN_VM_IP]:8545 -X POST \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
  ```
  - [ ] Returns valid block number

- [ ] **All Three Frontends Accessible**
  - [ ] https://tipschain.sbs - loads ✅
  - [ ] https://dex.tipschain.sbs - loads ✅
  - [ ] https://scan.tipspay.org - loads ✅

- [ ] **API Endpoints Responding**
  ```bash
  curl https://tipschain.sbs/api/health
  curl https://dex.tipschain.sbs/api/dex/tokens
  curl https://scan.tipspay.org/api/explorer/blocks
  ```
  - [ ] All return JSON responses
  - [ ] No errors

- [ ] **RLP Encoding Verified**
  ```bash
  npm run test:rlp
  npm run test:gassless-swap
  ```
  - [ ] RLP test all checks pass ✅
  - [ ] Gassless swap flow works ✅

- [ ] **Relayer Balance Checked**
  ```bash
  npm run test:rlp | grep "Relayer balance"
  ```
  - [ ] Relayer has balance (or noted to fund later)
  - If 0 balance:
    - [ ] Plan to send ETH/TIPS to relayer address
    - [ ] Document relayer address: `0x`

---

## 🔒 Security Hardening (5 min)

- [ ] **Firewall Configured on Each VM**
  ```bash
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw allow 8545/tcp  # RPC (Blockchain VM only)
  ufw enable
  ```
  - [ ] Rules added to each VM
  - [ ] Firewall enabled

- [ ] **SSH Key-Based Access Only**
  - [ ] Password SSH authentication disabled
  - [ ] Only key-based access allowed
  - [ ] Private keys stored securely

- [ ] **Automatic SSL Renewal**
  ```bash
  systemctl enable certbot.timer
  systemctl start certbot.timer
  ```
  - [ ] Timer enabled on all 4 VMs
  - [ ] Certificates will auto-renew

- [ ] **Monitoring Set Up** (Optional)
  - [ ] Log monitoring configured
  - [ ] Metrics collection started
  - [ ] Alert system enabled

---

## 📝 Final Documentation

- [ ] **Deployment Record**
  - [ ] Blockchain RPC URL: `http://`:8545
  - [ ] Wallet URL: `https://tipschain.sbs`
  - [ ] DEX URL: `https://dex.tipschain.sbs`
  - [ ] Explorer URL: `https://scan.tipspay.org`
  - [ ] Chain ID: `19251925`

- [ ] **Contract Addresses Documented**
  - [ ] TipsCoin: `0x`
  - [ ] USDTC: `0x`
  - [ ] TrustedForwarder: `0x`
  - [ ] Tipsnameserver: `0x`

- [ ] **VM IPs Documented**
  - [ ] Blockchain: `[IP]`
  - [ ] Wallet: `[IP]`
  - [ ] DEX: `[IP]`
  - [ ] Explorer: `[IP]`

- [ ] **Access Methods Documented**
  - [ ] SSH keys stored securely
  - [ ] Spaceship console access URL noted
  - [ ] Emergency contacts listed

---

## 🎉 Deployment Complete!

- [ ] **All checks above completed**
- [ ] **All services online and accessible**
- [ ] **All tests passing**

**Deployment Time:** ______ (Total elapsed time)  
**Completed By:** ____________________  
**Date:** ____________________  
**Notes:** ___________________________________________________

---

## ⚠️ Troubleshooting Notes

If any step failed, document below:

**Failed Steps:**
1. Step: __________ Error: __________ Solution: __________
2. Step: __________ Error: __________ Solution: __________

**Issues Encountered:**
- Issue: __________ Status: ☐ Resolved ☐ Pending

**Follow-up Actions:**
- [ ] Action 1: __________
- [ ] Action 2: __________

---

## 🔄 Post-Deployment Tasks

- [ ] **Monitor Services for 24 Hours**
  - [ ] Check logs regularly
  - [ ] Verify uptime
  - [ ] Monitor CPU/Memory usage

- [ ] **Fund Relayer** (if not done already)
  - [ ] Send ETH/TIPS to relayer address
  - [ ] Verify new balance: `npm run test:rlp`

- [ ] **Set Up Backups**
  - [ ] Blockchain data backup scheduled
  - [ ] Database backups automated
  - [ ] Backup location documented

- [ ] **Configure Monitoring & Alerts**
  - [ ] Uptime monitoring enabled (UptimeRobot, etc.)
  - [ ] Error alerts configured
  - [ ] Performance metrics tracked

---

**Status:** ✅ PRODUCTION DEPLOYMENT COMPLETE

Your TipsChain ecosystem is now live and ready for users!

🚀 **Next: Share the URLs with users and monitor!**
