# Tips Ecosystem L1

Decentralized Tipping Blockchain - A complete ecosystem for content creator tips and rewards.

## 🚀 Features

- **TipCoin (TPC)**: Native ERC20 token (1 Billion supply)
- **USDTC**: Stablecoin for USD-pegged tips
- **TrustedForwarder**: Gasless meta-transaction support
- **TipsNameService**: Human-readable address names

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/TheArchitect/tips-ecosystem.git
cd tips-ecosystem

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your private key and RPC URLs


---
Here’s a **CI/CD section in English** you can drop straight into your `README.md`. It explains the pipelines clearly for developers and contributors:

---

## ⚙️ CI/CD Pipelines

This repository uses **GitHub Actions** to automate testing, deployment, and release workflows. All pipelines are defined under `.github/workflows/`.

### 🔹 CI Pipeline (`ci.yml`)
- Trigger: every **push** and **pull request**  
- Tasks:
  - Lint (ESLint, Prettier)
  - Solidity lint (Solhint)
  - Compile contracts (Hardhat)
  - Run tests
  - Gas report
  - Contract size check

### 🔹 Staging Pipeline (`staging.yml`)
- Trigger: push to **develop** branch  
- Tasks:
  - Compile + Test
  - Deploy contracts → **Sepolia Testnet**
  - Verify contracts on Etherscan/Blockscout

### 🔹 Deploy Pipeline (`deploy.yml`)
- Trigger: merge into **main** branch  
- Tasks:
  - Build Explorer
  - Build Dashboard
  - Upload build artifacts

### 🔹 Release Pipeline (`release.yml`)
- Trigger: new **tag** (`vX.Y.Z`) pushed  
- Tasks:
  - Compile + Test
  - Coverage report
  - Gas report
  - Contract size check
  - Upload coverage artifacts

### 🔹 Production Pipeline (`production.yml`)
- Trigger: merge into **main** branch  
- Tasks:
  - Compile + Test
  - Deploy contracts → **Mainnet**
  - Verify contracts on Etherscan/Blockscout
  - Upload deployment logs

---

## 🚀 Workflow Summary
- **Development stage** → push to `develop` → automatic testnet deploy  
- **Production stage** → merge to `main` → automatic mainnet deploy  
- **Release stage** → push a tag (`v1.0.0`) → automatic audit reports  

---
