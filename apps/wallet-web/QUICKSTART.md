# TipsWallet - Docker Deployment Guide

## ✅ SETUP COMPLETE!

Your TipsWallet is ready for Docker deployment!

---

## 🚀 Quick Start: Deploy to VM

### Step 1: On Your Local Machine (Commit Changes)

```powershell
cd d:\GitHub\TipsWallet

# Stage all files
git add .

# Commit
git commit -m "Add Docker deployment with environment support"

# Push to GitHub
git push origin main
```

### Step 2: On Your VM (209.74.86.12:22022)

```bash
# SSH into VM
ssh -p 22022 root@209.74.86.12

# Create deployment directory
mkdir -p /opt/tipswallet && cd /opt/tipswallet

# Clone repository
git clone https://github.com/tipspay-dev/TipsWallet.git .

# Make scripts executable
chmod +x vm-deploy.sh deploy.sh

# Run deployment
./vm-deploy.sh deploy
```

### Step 3: Access Your App

Open browser:
```
http://209.74.86.12:3000
```

---

## 📋 Files Created/Updated

### New Files:
- ✅ `deploy.sh` - Local deployment helper
- ✅ `vm-deploy.sh` - VM deployment script (comprehensive)
- ✅ `docker-compose.yml` - Docker Compose configuration
- ✅ `.env.local` - Local environment template
- ✅ `.dockerignore` - Docker build exclusions

### Updated Files:
- ✅ `Dockerfile` - Enhanced with security & health checks
- ✅ `.dockerignore` - Fixed to include nginx.conf

---

## 🔐 Environment Setup (IMPORTANT!)

### Before Deployment - Add Your API Key:

1. **Get a new Gemini API key** (the old one was exposed!)
   - Visit: https://aistudio.google.com/apikey
   - Create a new API key

2. **Add to .env file on VM:**

```bash
# On VM: /opt/tipswallet/.env
NODE_ENV=production
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
DOCKER_PORT=3000
```

3. The app will load this automatically from `.env`

---

## 📦 Docker Image Details

**Image:** `tipswallet:latest`
**Size:** ~94MB
**Port:** 3000
**Base:** Alpine Linux (nginx)

### Image Features:
- ✅ Multi-stage build (optimized)
- ✅ Built-in health checks
- ✅ Non-root user security
- ✅ Automatic restart on failure
- ✅ Logging to 10MB files (max 3 files)

---

## 🎮 Common Commands

### On VM:

```bash
# Full deployment
./vm-deploy.sh deploy

# View logs
./vm-deploy.sh logs

# Restart container
./vm-deploy.sh restart

# Stop container
./vm-deploy.sh stop

# Check status
docker ps

# View detailed logs
docker logs -f tipswallet-app

# Container stats
docker stats tipswallet-app
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or use different port
DOCKER_PORT=8080 ./vm-deploy.sh deploy
```

### Container won't start
```bash
# Check logs
./vm-deploy.sh logs

# Restart
./vm-deploy.sh restart

# Rebuild image
docker rmi tipswallet:latest
./vm-deploy.sh build
```

### Missing API Key
```bash
# Edit .env
nano .env

# Then restart
./vm-deploy.sh restart
```

---

## 🌐 Access from Outside

### If you need to access from the internet:

```bash
# Option 1: Use SSH tunnel (secure)
ssh -p 22022 -L 3000:localhost:3000 root@209.74.86.12

# Then access: http://localhost:3000

# Option 2: Set up reverse proxy with nginx
# (See nginx-proxy.conf example below)
```

### Nginx Reverse Proxy (Optional)

```nginx
# /etc/nginx/sites-available/tipswallet

server {
    listen 80;
    server_name 209.74.86.12;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/tipswallet /etc/nginx/sites-enabled/
sudo nginx -s reload
```

---

## 📊 Monitoring

### Container Status
```bash
docker ps -a | grep tipswallet
```

### Resource Usage
```bash
docker stats tipswallet-app
```

### Image Info
```bash
docker image inspect tipswallet:latest
```

### Health Check Status
```bash
docker inspect --format='{{json .State.Health}}' tipswallet-app | python -m json.tool
```

---

## 🔄 Updates & Rollback

### Update to Latest Code
```bash
cd /opt/tipswallet
git pull origin main
./vm-deploy.sh deploy
```

### Rollback
```bash
# Stop current container
docker stop tipswallet-app

# Remove image
docker rmi tipswallet:latest

# Checkout previous version
git checkout <previous-commit>

# Redeploy
./vm-deploy.sh deploy
```

---

## 🛡️ Security Tips

1. **Never commit .env files** - Already in .gitignore ✅
2. **Use strong API keys** - Google Gemini keys are long
3. **Firewall rules** - Only expose port 3000 if needed
4. **Keep Docker updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## 📞 Support

### Quick Help
```bash
# View deployment script help
./vm-deploy.sh

# View deploy helper help
./deploy.sh

# Check Docker info
docker --version
docker-compose --version
```

### Manual Steps (If Scripts Fail)

```bash
# Build image manually
docker build -t tipswallet:latest .

# Run container manually
docker run -d \
  --name tipswallet-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  tipswallet:latest
```

---

## ✨ What's Next?

1. ✅ Generated deployment files
2. ⏭️ **Add your API key to .env**
3. ⏭️ Push code to GitHub
4. ⏭️ Clone on VM and run `./vm-deploy.sh deploy`
5. ⏭️ Access at `http://209.74.86.12:3000`

---

**Generated:** April 9, 2026
**Status:** Ready for Production Deployment ✅
