# Deployment Pipeline Setup Guide

## GitHub Actions Workflow

The `.github/workflows/deploy.yml` file provides a complete CI/CD pipeline:

### Pipeline Stages
1. **Lint** - TypeScript type checking on all branches
2. **Build** - Docker image build and push (main branch only)
3. **Deploy** - Automated deployment to VM (main branch only)
4. **Verify** - Health check validation
5. **Notify** - Slack notification on completion

### Required GitHub Secrets

Add these to your repository settings (Settings → Secrets and variables → Actions):

```
VM_HOST          = 209.74.86.12
VM_USER          = root
VM_PORT          = 22022
VM_SSH_KEY       = (private SSH key content)
GEMINI_API_KEY   = (your Gemini API key)
SLACK_WEBHOOK    = (optional, for notifications)
```

### How to Get SSH Key

```bash
# Generate SSH key on your local machine (if you don't have one)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_tipswallet -N ""

# Add public key to VM
ssh-copy-id -i ~/.ssh/id_rsa_tipswallet.pub -p 22022 root@209.74.86.12

# Get the private key content
cat ~/.ssh/id_rsa_tipswallet

# Copy output and paste into GitHub Secret VM_SSH_KEY
```

### Environment Files on VM

Ensure `/opt/tipswallet/.env` exists on your VM:

```bash
ssh -p 22022 root@209.74.86.12 "cat > /opt/tipswallet/.env" << 'EOF'
GEMINI_API_KEY=your_key_here
DOCKER_PORT=3000
EOF
```

## Local Deployment Script

Use `deploy-enhanced.sh` for local development or manual deployments:

```bash
# Make executable
chmod +x deploy-enhanced.sh

# Build image
./deploy-enhanced.sh build

# Deploy locally
./deploy-enhanced.sh deploy

# View logs
./deploy-enhanced.sh logs

# Stop container
./deploy-enhanced.sh stop

# Push to registry
DOCKER_REGISTRY=ghcr.io/username ./deploy-enhanced.sh push

# Health check
./deploy-enhanced.sh health
```

## Docker Compose Configuration

Updated `docker-compose.yml` with:
- Resource limits (1 CPU, 512MB RAM)
- Health checks
- Logging rotation
- Environment variable support
- Auto-restart policy

## Workflow Triggers

- **Push to main** → Full pipeline (lint, build, deploy)
- **Push to develop** → Lint and build only (no deploy)
- **Pull requests** → Lint only

## Monitoring Deployments

### View GitHub Actions
1. Go to repository → Actions tab
2. Click on workflow run to see detailed logs
3. Check individual job logs for troubleshooting

### Check Deployment on VM
```bash
ssh -p 22022 root@209.74.86.12
docker ps
docker logs tipswallet-app
docker stats tipswallet-app
```

### Slack Notifications
Optional: Set up Slack webhook to get deployment status updates automatically.

## Troubleshooting

### Pipeline Fails on Type Check
```bash
# Fix locally first
npm run lint
# Commit and push
```

### Deployment to VM Fails
- Verify VM is accessible: `ssh -p 22022 root@209.74.86.12`
- Check SSH key in GitHub Secrets is correct
- Review deployment logs in GitHub Actions
- Verify `.env` file exists on VM

### Image Push Fails
- Ensure GitHub token has `packages:write` permission
- Check container registry credentials
- View logs: `docker logs` after deployment

## Next Steps

1. Commit and push to main branch
2. Watch GitHub Actions run the pipeline
3. Monitor deployment in Actions tab
4. Access app at `http://209.74.86.12:3000`
