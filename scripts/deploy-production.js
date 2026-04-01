/**
 * Production Deployment Script
 * Comprehensive deployment for production environment
 */

import fs from "fs";
import path from "path";
import hre from "hardhat";

async function main() {
  console.log("🚀 Starting Production Deployment\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log(`Network: ${network}`);
  console.log(`Deployer: ${deployer.address}`);

  try {
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);
  } catch (error) {
    console.error("Error getting balance:", error.message);
  }

  const deployments = {};
  const timestamp = new Date().toISOString();

  try {
    // Get current gas prices
    const feeData = await deployer.provider.getFeeData();
    console.log("Gas Settings:");
    console.log(
      `  Max Fee Per Gas: ${hre.ethers.formatUnits(feeData.maxFeePerGas || feeData.gasPrice, "gwei")} Gwei\n`
    );

    // 1. Deploy TipsCoin
    console.log("1️⃣  Deploying TipsCoin...");
    const TipsCoin = await hre.ethers.getContractFactory("Tipscoin");
    const tipsCoin = await TipsCoin.deploy(hre.ethers.parseEther("1000000000"));
    const tipsCoinReceipt = await tipsCoin.deploymentTransaction().wait(1);

    if (!tipsCoinReceipt) {
      throw new Error("TipsCoin deployment failed");
    }

    deployments.tipsCoin = {
      address: tipsCoin.target || tipsCoin.address,
      name: "Tipscoin",
      symbol: "TIPS",
      decimals: 18,
      isNative: true,
      isGasToken: true,
      txHash: tipsCoinReceipt.hash,
      blockNumber: tipsCoinReceipt.blockNumber,
    };
    console.log(`   ✓ TipsCoin: ${deployments.tipsCoin.address}\n`);

    // 2. Deploy USDTC
    console.log("2️⃣  Deploying USDTC...");
    const USDTC = await hre.ethers.getContractFactory("USDTC");
    const usdtc = await USDTC.deploy(hre.ethers.parseEther("1000000000"));
    const usdtcReceipt = await usdtc.deploymentTransaction().wait(1);

    if (!usdtcReceipt) {
      throw new Error("USDTC deployment failed");
    }

    deployments.usdtc = {
      address: usdtc.target || usdtc.address,
      name: "USDTC Stablecoin",
      symbol: "USDTC",
      decimals: 18,
      txHash: usdtcReceipt.hash,
      blockNumber: usdtcReceipt.blockNumber,
    };
    console.log(`   ✓ USDTC: ${deployments.usdtc.address}\n`);

    // 3. Deploy TrustedForwarder
    console.log("3️⃣  Deploying TrustedForwarder...");
    const TrustedForwarder = await hre.ethers.getContractFactory("TrustedForwarder");
    const forwarder = await TrustedForwarder.deploy();
    const forwarderReceipt = await forwarder.deploymentTransaction().wait(1);

    if (!forwarderReceipt) {
      throw new Error("TrustedForwarder deployment failed");
    }

    deployments.trustedForwarder = {
      address: forwarder.target || forwarder.address,
      name: "TrustedForwarder",
      txHash: forwarderReceipt.hash,
      blockNumber: forwarderReceipt.blockNumber,
    };
    console.log(`   ✓ TrustedForwarder: ${deployments.trustedForwarder.address}\n`);

    // 4. Deploy Tipsnameserver
    console.log("4️⃣  Deploying Tipsnameserver...");
    const Tipsnameserver = await hre.ethers.getContractFactory("Tipsnameserver");
    const nameserver = await Tipsnameserver.deploy();
    const nameserverReceipt = await nameserver.deploymentTransaction().wait(1);

    if (!nameserverReceipt) {
      throw new Error("Tipsnameserver deployment failed");
    }

    deployments.tipsnameserver = {
      address: nameserver.target || nameserver.address,
      name: "Tipsnameserver",
      txHash: nameserverReceipt.hash,
      blockNumber: nameserverReceipt.blockNumber,
    };
    console.log(`   ✓ Tipsnameserver: ${deployments.tipsnameserver.address}\n`);

    // Save deployments
    const deploymentPath = path.join(__dirname, "../config/deployed.json");
    const allDeployments = {
      timestamp,
      network,
      deployer: deployer.address,
      blockNumber: await deployer.provider.getBlockNumber(),
      contracts: deployments,
    };

    fs.writeFileSync(deploymentPath, JSON.stringify(allDeployments, null, 2));
    console.log("✓ Deployment info saved to config/deployed.json");

    // Generate environment variables
    const envContent = `
# Generated Environment Variables
# ${timestamp}
# Network: ${network}

TIPSCOIN_ADDRESS=${deployments.tipsCoin.address}
USDTC_ADDRESS=${deployments.usdtc.address}
TRUSTED_FORWARDER_ADDRESS=${deployments.trustedForwarder.address}
TIPSNAMESERVER_ADDRESS=${deployments.tipsnameserver.address}
`;

    console.log("\n📝 Add these to your .env file:");
    console.log(envContent);

    console.log("\n⚡ Gas Token: TIPS (Tipscoin)");
    console.log(`   Relayer Address: ${deployer.address}`);
    console.log("\n✅ Production Deployment Complete!");
    console.log(`All contracts deployed to ${network}`);

    return allDeployments;
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
