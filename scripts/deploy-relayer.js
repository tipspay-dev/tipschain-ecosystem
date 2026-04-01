/**
 * Relayer Deployment Script
 * Deploys and configures the TrustedForwarder contract
 */

import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying TrustedForwarder contract...");

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying from: ${deployer.address}`);

  // Get balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy TrustedForwarder
  const TrustedForwarder = await hre.ethers.getContractFactory("TrustedForwarder");
  const forwarder = await TrustedForwarder.deploy();
  await forwarder.deployed();

  console.log(`✓ TrustedForwarder deployed to: ${forwarder.address}`);

  // Save deployment info
  const deploymentInfo = {
    trustedForwarder: forwarder.address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    blockNumber: await deployer.provider.getBlockNumber(),
  };

  const deployedPath = path.join(__dirname, "../config/deployed.json");
  const deployed = fs.existsSync(deployedPath)
    ? JSON.parse(fs.readFileSync(deployedPath, "utf-8"))
    : {};

  deployed.relayer = deploymentInfo;
  fs.writeFileSync(deployedPath, JSON.stringify(deployed, null, 2));

  console.log("✓ Deployment info saved to config/deployed.json");

  // Print environment variables to set
  console.log("\n📝 Add these to your .env file:");
  console.log(`TRUSTED_FORWARDER_ADDRESS=${forwarder.address}`);
  console.log("RELAYER_PRIVATE_KEY=<your_relayer_private_key>");

  return forwarder.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
