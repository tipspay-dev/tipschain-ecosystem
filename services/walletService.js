/**
 * Wallet Service
 * Manages wallet interactions and balance checks
 */

import { ethers } from "ethers";
import blockchainProvider from "./blockchainProvider.js";

class WalletService {
  /**
   * Get wallet balance in TIPS
   */
  async getBalance(walletAddress) {
    try {
      if (!ethers.isAddress(walletAddress)) {
        throw new Error("Invalid wallet address");
      }

      const provider = blockchainProvider.getProvider();
      const balance = await provider.getBalance(walletAddress);
      return {
        balance: blockchainProvider.formatTips(balance),
        balanceWei: balance.toString(),
        address: walletAddress,
        currency: "TIPS",
      };
    } catch (error) {
      console.error("Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get token balance for a specific token contract
   */
  async getTokenBalance(walletAddress, tokenAddress, tokenABI) {
    try {
      if (!ethers.isAddress(walletAddress)) {
        throw new Error("Invalid wallet address");
      }
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error("Invalid token address");
      }

      const contract = blockchainProvider.getContract(tokenAddress, tokenABI, false);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();

      return {
        balance: ethers.formatUnits(balance, decimals),
        balanceRaw: balance.toString(),
        decimals,
        address: walletAddress,
        token: tokenAddress,
      };
    } catch (error) {
      console.error("Failed to get token balance:", error);
      throw error;
    }
  }

  /**
   * Get wallet transactions history
   */
  async getTransactionHistory(walletAddress, limit = 10) {
    try {
      const provider = blockchainProvider.getProvider();
      const blockNumber = await provider.getBlockNumber();

      // Get logs for outgoing transactions
      const filter = {
        fromBlock: Math.max(0, blockNumber - 10000),
        toBlock: blockNumber,
        address: walletAddress,
      };

      const logs = await provider.getLogs(filter);

      return {
        transactions: logs.slice(0, limit),
        count: logs.length,
      };
    } catch (error) {
      console.error("Failed to get transaction history:", error);
      throw error;
    }
  }

  /**
   * Verify wallet ownership by message signing
   */
  async verifyWalletOwnership(walletAddress, signature, message) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      console.error("Failed to verify wallet ownership:", error);
      return false;
    }
  }

  /**
   * Check if wallet is valid (exists on network)
   */
  async isValidWallet(walletAddress) {
    try {
      if (!ethers.isAddress(walletAddress)) {
        return false;
      }

      const provider = blockchainProvider.getProvider();
      await provider.getCode(walletAddress);
      return true; // Even if code is empty, it's a valid address
    } catch {
      return false;
    }
  }
}

const walletService = new WalletService();

export default walletService;
