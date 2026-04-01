/**
 * Relayer Service
 * Handles gasless transactions via meta-transactions
 */

import { ethers } from "ethers";
import blockchainProvider from "./blockchainProvider.js";

class RelayerService {
  constructor() {
    this.trustedForwarderAddress = process.env.TRUSTED_FORWARDER_ADDRESS;
    this.relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;
    this.relayerAddress = null;
    this.forwarderContract = null;
  }

  /**
   * Initialize relayer
   */
  async initialize() {
    try {
      if (!this.trustedForwarderAddress) {
        console.warn("⚠ TrustedForwarder address not configured");
        return false;
      }

      if (!this.relayerPrivateKey) {
        console.warn("⚠ Relayer private key not configured");
        return false;
      }

      // Setup relayer wallet
      const signer = blockchainProvider.getSigner();
      this.relayerAddress = await signer.getAddress();

      // Load forwarder contract
      const trustedForwarderABI = [
        "function executeMetaTransaction(address userAddress, bytes calldata functionSignature, address targetContract) external payable returns (bytes memory)",
        "function isTrustedForwarder(address forwarder) external view returns (bool)",
      ];

      this.forwarderContract = blockchainProvider.getContract(
        this.trustedForwarderAddress,
        trustedForwarderABI,
        true
      );

      console.log(`✓ Relayer initialized: ${this.relayerAddress}`);
      return true;
    } catch (error) {
      console.error("Relayer initialization failed:", error);
      return false;
    }
  }

  /**
   * Process gassless transaction
   */
  async relayTransaction(userAddress, functionSignature, targetContract) {
    try {
      if (!this.forwarderContract) {
        throw new Error("Relayer not initialized");
      }

      // Validate inputs
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }
      if (!ethers.isAddress(targetContract)) {
        throw new Error("Invalid target contract address");
      }

      if (!functionSignature || typeof functionSignature !== "string") {
        throw new Error("Invalid function signature");
      }

      // Get current gas price
      const provider = blockchainProvider.getProvider();
      const feeData = await provider.getFeeData();

      // Prepare transaction options with proper gas settings
      const transactionOptions = {
        gasLimit: 500000,
        maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("100", "gwei"),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei"),
      };

      // Execute meta-transaction
      const txResponse = await this.forwarderContract.executeMetaTransaction(
        userAddress,
        functionSignature,
        targetContract,
        transactionOptions
      );

      // Wait for transaction confirmation
      const receipt = await txResponse.wait(1);

      if (!receipt) {
        throw new Error("Transaction failed - no receipt");
      }

      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? "Success" : "Failed",
      };
    } catch (error) {
      console.error("Relay transaction failed:", error.message);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  /**
   * Get relayer address
   */
  getRelayerAddress() {
    return this.relayerAddress;
  }

  /**
   * Check if relayer is ready
   */
  isReady() {
    return !!this.forwarderContract && !!this.relayerAddress;
  }

  /**
   * Get relayer balance in TIPS
   */
  async getRelayerBalance() {
    try {
      const provider = blockchainProvider.getProvider();
      const balance = await provider.getBalance(this.relayerAddress);
      return blockchainProvider.formatTips(balance);
    } catch (error) {
      console.error("Failed to get relayer balance:", error);
      return null;
    }
  }
}

const relayerService = new RelayerService();

export default relayerService;
