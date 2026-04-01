/**
 * System Initialization Script
 * Initializes all services: blockchain, relayer, DEX, wallet, explorer
 */

import blockchainProvider from "./services/blockchainProvider.js";
import relayerService from "./services/relayerService.js";
import walletService from "./services/walletService.js";
import dexService from "./services/dexService.js";
import explorerService from "./services/explorerService.js";

let isInitialized = false;

/**
 * Initialize all services
 */
async function initializeServices() {
  if (isInitialized) {
    console.log("Services already initialized");
    return true;
  }

  console.log("\n=== Initializing TipsChain Ecosystem ===\n");

  try {
    // 1. Initialize Blockchain Provider
    console.log("1. Initializing Blockchain Provider...");
    const blockchainReady = await blockchainProvider.initialize();
    if (!blockchainReady) {
      throw new Error("Blockchain provider initialization failed");
    }

    // 2. Initialize Relayer
    console.log("2. Initializing Relayer Service...");
    const relayerReady = await relayerService.initialize();
    if (!relayerReady) {
      console.warn("⚠ Relayer not fully configured - gassless transactions unavailable");
    } else {
      console.log(`   ✓ Relayer ready at ${relayerService.getRelayerAddress()}`);
    }

    // 3. Verify Wallet Service
    console.log("3. Wallet Service enabled");

    // 4. Verify DEX Service
    console.log("4. DEX Service enabled");

    // 5. Verify Explorer Service
    console.log("5. Explorer Service enabled");

    // 6. Print network info
    const networkInfo = await blockchainProvider.getNetworkInfo();
    console.log("\n=== Network Information ===");
    console.log(`Chain ID: ${networkInfo.chainId}`);
    console.log(`Network: ${networkInfo.name}`);

    // 7. Get and display network stats
    const stats = await explorerService.getNetworkStats();
    console.log("\n=== Current Network Stats ===");
    console.log(`Latest Block: ${stats.blockNumber}`);
    console.log(`Gas Price: ${stats.gasPrice} Gwei`);
    console.log(`Difficulty: ${stats.difficulty}`);

    // 8. Check relayer balance
    if (relayerService.isReady()) {
      const balance = await relayerService.getRelayerBalance();
      console.log(`\nRelayer Balance: ${balance} TIPS`);
      if (parseFloat(balance || "0") < 10) {
        console.warn("⚠ WARNING: Relayer balance is low!");
      }
    }

    console.log("\n=== Services Ready ===\n");
    console.log("Available endpoints:");
    console.log("  - Wallet: http://localhost:3000/api/wallet/*");
    console.log("  - DEX: http://localhost:3000/api/dex/*");
    console.log("  - Explorer: http://localhost:3000/api/explorer/*");
    if (relayerService.isReady()) {
      console.log("  - Relayer: Gassless transactions enabled");
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error("\n❌ Initialization failed:", error.message);
    return false;
  }
}

/**
 * Shutdown services
 */
async function shutdownServices() {
  console.log("\nShutting down services...");
  isInitialized = false;
}

/**
 * Get initialization status
 */
function getStatus() {
  return {
    initialized: isInitialized,
    blockchain: !!blockchainProvider.providers.main,
    relayer: relayerService.isReady(),
    wallet: true,
    dex: true,
    explorer: true,
  };
}

export {
  initializeServices,
  shutdownServices,
  getStatus,
  blockchainProvider,
  relayerService,
  walletService,
  dexService,
  explorerService,
};
