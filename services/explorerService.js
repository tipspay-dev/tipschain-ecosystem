/**
 * Explorer Service
 * Blockscout-compatible explorer service for block/transaction/address data
 */

import { ethers } from "ethers";
import blockchainProvider from "../services/blockchainProvider.js";

class ExplorerService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 60 * 1000; // 1 minute
  }

  /**
   * Get latest blocks
   */
  async getLatestBlocks(limit = 10) {
    try {
      const provider = blockchainProvider.getProvider();
      const latestBlockNumber = await provider.getBlockNumber();

      const blocks = [];
      for (let i = latestBlockNumber; i > latestBlockNumber - limit && i >= 0; i--) {
        const block = await provider.getBlock(i);
        if (block) {
          blocks.push(this._formatBlock(block));
        }
      }

      return {
        blocks,
        total: latestBlockNumber + 1,
      };
    } catch (error) {
      console.error("Failed to get latest blocks:", error);
      throw error;
    }
  }

  /**
   * Get block details
   */
  async getBlock(blockNumberOrHash) {
    try {
      const provider = blockchainProvider.getProvider();
      const block = await provider.getBlock(blockNumberOrHash);

      if (!block) {
        throw new Error("Block not found");
      }

      return this._formatBlock(block);
    } catch (error) {
      console.error("Failed to get block:", error);
      throw error;
    }
  }

  /**
   * Get transactions in a block
   */
  async getBlockTransactions(blockNumberOrHash, limit = 25) {
    try {
      const provider = blockchainProvider.getProvider();
      const block = await provider.getBlock(blockNumberOrHash);

      if (!block) {
        throw new Error("Block not found");
      }

      const transactions = [];
      for (let i = 0; i < Math.min(block.transactions.length, limit); i++) {
        const tx = await provider.getTransaction(block.transactions[i]);
        if (tx) {
          transactions.push(this._formatTransaction(tx));
        }
      }

      return {
        blockNumber: block.number,
        blockHash: block.hash,
        transactionCount: block.transactions.length,
        transactions,
      };
    } catch (error) {
      console.error("Failed to get block transactions:", error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash) {
    try {
      const provider = blockchainProvider.getProvider();
      const tx = await provider.getTransaction(txHash);

      if (!tx) {
        throw new Error("Transaction not found");
      }

      const receipt = await provider.getTransactionReceipt(txHash);

      return {
        ...this._formatTransaction(tx),
        status: receipt ? (receipt.status ? "Success" : "Failed") : "Pending",
        gasUsed: receipt ? receipt.gasUsed.toString() : null,
        cumulativeGasUsed: receipt ? receipt.cumulativeGasUsed.toString() : null,
        contractAddress: receipt ? receipt.contractAddress : null,
        logs: receipt ? receipt.logs.length : 0,
      };
    } catch (error) {
      console.error("Failed to get transaction:", error);
      throw error;
    }
  }

  /**
   * Get address balance and transactions
   */
  async getAddress(address) {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid address");
      }

      const provider = blockchainProvider.getProvider();
      const balance = await provider.getBalance(address);
      const txCount = await provider.getTransactionCount(address);
      const code = await provider.getCode(address);

      return {
        address,
        balance: blockchainProvider.formatUnits(balance),
        balanceWei: balance.toString(),
        transactionCount: txCount,
        isContract: code !== "0x",
        codeSize: code.length / 2 - 1,
      };
    } catch (error) {
      console.error("Failed to get address:", error);
      throw error;
    }
  }

  /**
   * Get address transactions
   */
  async getAddressTransactions(address, limit = 25, offset = 0) {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid address");
      }

      const provider = blockchainProvider.getProvider();
      const blockNumber = await provider.getBlockNumber();

      // Get logs for the address
      const logs = await provider.getLogs({
        fromBlock: Math.max(0, blockNumber - 10000),
        toBlock: blockNumber,
        address: address,
      });

      const transactions = logs.slice(offset, offset + limit).map((log) => ({
        hash: log.transactionHash,
        from: log.address,
        to: null,
        value: "0",
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
      }));

      return {
        address,
        transactions,
        total: logs.length,
      };
    } catch (error) {
      console.error("Failed to get address transactions:", error);
      throw error;
    }
  }

  /**
   * Get token transfers for an address
   */
  async getAddressTokenTransfers(address, limit = 25) {
    try {
      if (!ethers.isAddress(address)) {
        throw new Error("Invalid address");
      }

      const provider = blockchainProvider.getProvider();
      const blockNumber = await provider.getBlockNumber();

      // Filter for ERC20 Transfer events (0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef)
      const filter = {
        fromBlock: Math.max(0, blockNumber - 10000),
        toBlock: blockNumber,
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          null,
          ethers.zeroPadValue(address, 32),
        ],
      };

      const logs = await provider.getLogs(filter);

      return {
        address,
        transfers: logs.slice(0, limit).map((log) => ({
          token: log.address,
          from: ethers.getAddress("0x" + log.topics[1].slice(-40)),
          to: address,
          value: log.data,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        })),
        total: logs.length,
      };
    } catch (error) {
      console.error("Failed to get token transfers:", error);
      throw error;
    }
  }

  /**
   * Search (blocks, transactions, addresses)
   */
  async search(query) {
    try {
      const provider = blockchainProvider.getProvider();

      // Try as block number
      if (!isNaN(query)) {
        try {
          const block = await provider.getBlock(parseInt(query));
          if (block) {
            return {
              type: "block",
              result: this._formatBlock(block),
            };
          }
        } catch {
          // Continue to next search
        }
      }

      // Try as transaction hash
      if (query.match(/^0x[a-fA-F0-9]{64}$/)) {
        try {
          const tx = await provider.getTransaction(query);
          if (tx) {
            return {
              type: "transaction",
              result: this._formatTransaction(tx),
            };
          }
        } catch {
          // Continue to next search
        }
      }

      // Try as address
      if (ethers.isAddress(query)) {
        const address = await this.getAddress(query);
        return {
          type: "address",
          result: address,
        };
      }

      return {
        type: "not_found",
        result: null,
      };
    } catch (error) {
      console.error("Search failed:", error);
      throw error;
    }
  }

  /**
   * Get network stats
   */
  async getNetworkStats() {
    try {
      const cacheKey = "network_stats";
      const cached = this.cache.get(cacheKey);

      if (cached && cached.expiry > Date.now()) {
        return cached.data;
      }

      const provider = blockchainProvider.getProvider();
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      const gasPrice = await provider.getGasPrice();

      const stats = {
        chainId: network.chainId,
        chainName: network.name,
        blockNumber,
        blockTime: block.timestamp,
        gasPrice: blockchainProvider.formatUnits(gasPrice, "gwei"),
        gasPriceWei: gasPrice.toString(),
        difficulty: block.difficulty?.toString() || "0",
        miner: block.miner,
      };

      this.cache.set(cacheKey, {
        data: stats,
        expiry: Date.now() + this.cacheExpiry,
      });

      return stats;
    } catch (error) {
      console.error("Failed to get network stats:", error);
      throw error;
    }
  }

  // ============ Helper Methods ============

  _formatBlock(block) {
    return {
      number: block.number,
      hash: block.hash,
      parent: block.parentHash,
      timestamp: block.timestamp,
      miner: block.miner,
      difficulty: block.difficulty?.toString() || "0",
      gasLimit: block.gasLimit.toString(),
      gasUsed: block.gasUsed.toString(),
      transactionCount: block.transactions.length,
      reward: "0",
    };
  }

  _formatTransaction(tx) {
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: blockchainProvider.formatTips(tx.value),
      valueWei: tx.value.toString(),
      gasPrice: blockchainProvider.formatUnits(tx.gasPrice, "gwei"),
      gasPriceWei: tx.gasPrice.toString(),
      gas: tx.gasLimit.toString(),
      nonce: tx.nonce,
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      transactionIndex: tx.index,
      input: tx.data,
      currency: "TIPS",
    };
  }
}

const explorerService = new ExplorerService();

export default explorerService;
