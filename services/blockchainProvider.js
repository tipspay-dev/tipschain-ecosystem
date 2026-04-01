/**
 * Blockchain Provider Service
 * Central service for interacting with the blockchain
 */

import { ethers } from "ethers";

class BlockchainProvider {
  constructor() {
    this.providers = {};
    this.signers = {};
    this.initialized = false;
  }

  /**
   * Initialize blockchain connections
   */
  async initialize() {
    try {
      // Main network provider
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "http://localhost:8545";
      this.providers.main = new ethers.JsonRpcProvider(rpcUrl);

      // Setup signer if private key is available
      if (process.env.PRIVATE_KEY) {
        this.signers.main = new ethers.Wallet(process.env.PRIVATE_KEY, this.providers.main);
      }

      // Verify connection
      const network = await this.providers.main.getNetwork();
      console.log(`✓ Connected to blockchain at chain ID: ${network.chainId}`);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize blockchain provider:", error);
      return false;
    }
  }

  /**
   * Get provider instance
   */
  getProvider(network = "main") {
    if (!this.initialized) {
      throw new Error("BlockchainProvider not initialized");
    }
    return this.providers[network];
  }

  /**
   * Get signer instance
   */
  getSigner(network = "main") {
    if (!this.initialized) {
      throw new Error("BlockchainProvider not initialized");
    }
    if (!this.signers[network]) {
      throw new Error(`No signer available for network: ${network}`);
    }
    return this.signers[network];
  }

  /**
   * Get contract instance
   */
  getContract(contractAddress, abi, useSigner = false) {
    const provider = useSigner ? this.getSigner() : this.getProvider();
    return new ethers.Contract(contractAddress, abi, provider);
  }

  /**
   * Get network info
   */
  async getNetworkInfo() {
    const network = await this.getProvider().getNetwork();
    return {
      chainId: network.chainId,
      name: network.name,
    };
  }

  /**
   * Verify address format
   */
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Parse units (wei to tips, etc.)
   * Default is wei to TIPS (18 decimals)
   */
  parseUnits(value, units = 18) {
    if (typeof units === "string") {
      return ethers.parseUnits(value, units);
    }
    return ethers.parseUnits(value, units);
  }

  /**
   * Format units (wei to tips, etc.)
   * Default is wei to TIPS (18 decimals)
   */
  formatUnits(value, units = 18) {
    if (typeof units === "string") {
      return ethers.formatUnits(value, units);
    }
    return ethers.formatUnits(value, units);
  }

  /**
   * Format value as TIPS (native gas token)
   */
  formatTips(value) {
    return ethers.formatUnits(value, 18);
  }

  /**
   * Parse TIPS to wei
   */
  parseTips(value) {
    return ethers.parseUnits(value, 18);
  }
}

// Create singleton instance
const blockchainProvider = new BlockchainProvider();

export default blockchainProvider;
