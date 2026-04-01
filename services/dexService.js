/**
 * DEX Service
 * Handles interactions with decentralized exchange
 */

import { ethers } from "ethers";
import blockchainProvider from "./blockchainProvider.js";
import { validateTransactionData } from "./transactionUtils.js";

class DEXService {
  constructor() {
    this.dexRouterAddress = process.env.DEX_ROUTER_ADDRESS;
    this.dexFactoryAddress = process.env.DEX_FACTORY_ADDRESS;
    this.swapFeePercent = 0.3; // Default 0.3% DEX fee
  }

  /**
   * Get token price from DEX
   */
  async getTokenPrice(tokenAddress, baseTokenAddress = null) {
    try {
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error("Invalid token address");
      }

      // Use default base token if not provided
      baseTokenAddress = baseTokenAddress || process.env.BASE_TOKEN_ADDRESS || tokenAddress;

      // This would connect to the actual DEX router contract
      // For now, returning placeholder structure
      return {
        token: tokenAddress,
        baseToken: baseTokenAddress,
        price: "0",
        liquidity: "0",
        volume24h: "0",
      };
    } catch (error) {
      console.error("Failed to get token price:", error);
      throw error;
    }
  }

  /**
   * Get liquidity pool info
   */
  async getPoolInfo(tokenA, tokenB) {
    try {
      if (!ethers.isAddress(tokenA) || !ethers.isAddress(tokenB)) {
        throw new Error("Invalid token addresses");
      }

      // Connect to DEX factory to get pool information
      return {
        tokenA,
        tokenB,
        liquidity: "0",
        reserveA: "0",
        reserveB: "0",
        fee: "0.3",
      };
    } catch (error) {
      console.error("Failed to get pool info:", error);
      throw error;
    }
  }

  /**
   * Get swap quote with fee calculation
   */
  async getSwapQuote(tokenInAddress, tokenOutAddress, amountIn) {
    try {
      const provider = blockchainProvider.getProvider();

      // Validate inputs
      if (!ethers.isAddress(tokenInAddress) || !ethers.isAddress(tokenOutAddress)) {
        throw new Error("Invalid token addresses");
      }

      if (!amountIn || amountIn <= 0) {
        throw new Error("Invalid amount");
      }

      // Get current gas prices for fee estimation
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits("1", "gwei");

      // Estimate swap gas cost (typical swap: 200k-300k gas)
      const swapGasEstimate = ethers.toBigInt(250000); // Average swap
      const gasCostInWei = swapGasEstimate * gasPrice;
      const gasCostInTips = blockchainProvider.formatTips(gasCostInWei);

      // Calculate DEX fee (0.3% of input amount)
      const amountInBigInt = ethers.toBigInt(amountIn);
      const dexFeeWei = (amountInBigInt * ethers.toBigInt(3)) / ethers.toBigInt(1000); // 0.3%

      // This would call the actual DEX router for quote
      // For now, returning placeholder structure with actual fee estimates
      return {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: amountIn.toString(),
        amountOut: "0", // Would be calculated from pool reserves
        dexFee: {
          percentage: this.swapFeePercent,
          amount: blockchainProvider.formatTips(dexFeeWei),
        },
        gasEstimate: {
          amount: swapGasEstimate.toString(),
          costInTips: gasCostInTips,
          pricePerUnit: ethers.formatUnits(gasPrice, "gwei") + " gwei",
        },
        priceImpact: "0",
        route: [tokenInAddress, tokenOutAddress],
      };
    } catch (error) {
      console.error("Failed to get swap quote:", error);
      throw error;
    }
  }

  /**
   * Execute swap via relayer (gassless)
   */
  async executeGasslessSwap(userAddress, swapData) {
    try {
      const provider = blockchainProvider.getProvider();
      const { default: relayerService } = await import("./relayerService.js");

      // Validate user address
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Invalid user address");
      }

      if (!relayerService.isReady()) {
        throw new Error("Relayer not ready - please try again later");
      }

      // Extract swap parameters
      const { tokenIn, tokenOut, amountIn, minAmountOut, recipient = userAddress } = swapData;

      // Validate swap parameters
      if (!ethers.isAddress(tokenIn) || !ethers.isAddress(tokenOut)) {
        throw new Error("Invalid token addresses in swap data");
      }

      if (!amountIn || amountIn <= 0) {
        throw new Error("Invalid swap amount");
      }

      // Build swap function data (would encode swap function call)
      // This is a placeholder - actual implementation depends on DEX router ABI
      const dexRouterABI = [
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)",
      ];

      const iface = new ethers.Interface(dexRouterABI);
      const path = [tokenIn, tokenOut];
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minute deadline

      const functionData = iface.encodeFunctionData("swapExactTokensForTokens", [
        ethers.toBigInt(amountIn),
        ethers.toBigInt(minAmountOut || 0),
        path,
        recipient,
        deadline,
      ]);

      console.log("DEX: Preparing gassless swap", {
        userAddress,
        tokenIn,
        tokenOut,
        amountIn: amountIn.toString(),
        recipient,
      });

      // Build transaction data for validation
      const txData = {
        to: this.dexRouterAddress,
        from: userAddress,
        data: functionData,
        value: 0,
        gasLimit: 300000, // Swap typically requires more gas
      };

      // Validate transaction data before relaying
      const { valid, errors } = validateTransactionData(txData);
      if (!valid) {
        throw new Error(`Invalid swap transaction: ${errors.join(", ")}`);
      }

      // Get current gas prices for transaction
      const feeData = await provider.getFeeData();
      const txData2 = {
        ...txData,
        maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("100", "gwei"),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei"),
      };

      // Relay the swap through the relayer service
      // The relayer will pay gas in TIPS on behalf of the user
      const relayResult = await relayerService.relayTransaction(
        userAddress,
        functionData,
        this.dexRouterAddress,
        txData2
      );

      if (!relayResult.success) {
        throw new Error("Swap relay failed: " + relayResult.error);
      }

      console.log("DEX: Gassless swap executed", {
        txHash: relayResult.txHash,
        userAddress,
        amountIn: amountIn.toString(),
      });

      return {
        success: true,
        txHash: relayResult.txHash,
        message: "Swap relayed successfully - relayer paid gas in TIPS",
        estimatedGasCost: relayResult.gasCostTips,
        userPaysZeroGas: true,
      };
    } catch (error) {
      console.error("Failed to execute gassless swap:", error);
      throw error;
    }
  }

  /**
   * Get supported tokens
   */
  async getSupportedTokens() {
    return {
      tokens: [
        {
          symbol: "TIPS",
          address: process.env.TIPSCOIN_ADDRESS,
          decimals: 18,
        },
        {
          symbol: "USDTC",
          address: process.env.USDTC_ADDRESS,
          decimals: 18,
        },
      ],
    };
  }
}

const dexService = new DEXService();

export default dexService;
